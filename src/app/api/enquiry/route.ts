import { NextResponse } from 'next/server';

/*
  Server-side delivery for the contact form.

  The destination inbox lives here, not in the client bundle, so it is never
  handed to address-harvesting crawlers.

  Providers are attempted in order until one accepts.

  1. RESEND_API_KEY set -> Resend. In production this is the only one that
     works, so treat it as required rather than preferred. Needs a sender on a
     domain verified at resend.com/domains: the sandbox onboarding@resend.dev
     address only ever delivers to the account owner, never to a client inbox.

  2. FormSubmit -> a relay needing no signup, kept for local development only.
     Verified against production on 2026-08-12: it sits behind Cloudflare and
     answers a serverless function with a 403 bot interstitial, so it CANNOT
     deliver from Vercel however it is called. It also needs a one-time
     activation link clicked in the destination inbox before it sends anything.
     Do not rely on it as the live fallback.
*/

/* Values pasted into a hosting dashboard pick up stray whitespace, a trailing
   newline, or wrapping quotes far more often than anyone expects. A newline in
   a header value makes fetch() throw *synchronously* — no request is sent, no
   status code comes back, and the only symptom is a generic delivery failure
   in well under the time an upstream call would take. Normalise at the edge. */
const clean_env = (v: string | undefined) =>
  v?.trim().replace(/^["']|["']$/g, '').replace(/[\r\n]/g, '') || undefined;

const TO = clean_env(process.env.ENQUIRY_TO) ?? 'werable.disability@gmail.com';
const FROM = clean_env(process.env.ENQUIRY_FROM) ?? 'WE R ABLE <onboarding@resend.dev>';
const RESEND_KEY = clean_env(process.env.RESEND_API_KEY);

type Attempt = { provider: 'resend' | 'formsubmit'; ok: boolean; pending?: boolean; detail: string };

/* Upstream failures sometimes answer with a whole HTML page — Cloudflare's
   interstitial being the one that actually happens here. Collapse that to a
   readable token so the log stays scannable and the response carries a status
   rather than a document. */
const summarise = (status: number, body: string) => {
  const t = body.trim();
  if (t.startsWith('<')) {
    const challenge = /just a moment|cf-browser-verification|attention required/i.test(t);
    return `${status} ${challenge ? 'blocked by upstream bot protection' : 'HTML error page'}`;
  }
  return `${status} ${t.slice(0, 200)}`;
};

async function viaResend(subject: string, text: string, replyTo: string): Promise<Attempt> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: replyTo, subject, text }),
    });
    const body = await res.text();
    // 403 here is nearly always the sandbox sender: onboarding@resend.dev only
    // delivers to the address that owns the Resend account, never to the client
    // inbox. Say so plainly in the log rather than leaving a bare status code.
    return {
      provider: 'resend',
      ok: res.ok,
      detail: res.ok ? 'accepted' : summarise(res.status, body),
    };
  } catch (err) {
    return { provider: 'resend', ok: false, detail: `threw: ${(err as Error).message}` };
  }
}

async function viaFormSubmit(origin: string, fields: Record<string, string>): Promise<Attempt> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${TO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        /* Without a Referer, FormSubmit answers 200 with
           "Make sure you open this page through a web server" and delivers
           nothing. A server-side fetch sends none by default, so this fallback
           had never actually worked — it only looked like it had, because the
           200 meant `res.ok` was true. */
        Referer: `${origin}/`,
        Origin: origin,
      },
      body: JSON.stringify(fields),
    });
    const body = await res.text();
    let parsed: { success?: string | boolean; message?: string } = {};
    try {
      parsed = JSON.parse(body);
    } catch {
      /* keep the raw body in `detail` */
    }
    const accepted = String(parsed.success ?? '').toLowerCase() === 'true';
    const needsActivation = /activat/i.test(parsed.message ?? '');
    return {
      provider: 'formsubmit',
      ok: res.ok && (accepted || needsActivation),
      pending: needsActivation,
      detail: parsed.message ? `${res.status} ${parsed.message}` : summarise(res.status, body),
    };
  } catch (err) {
    return { provider: 'formsubmit', ok: false, detail: `threw: ${(err as Error).message}` };
  }
}

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  topic?: string;
  message?: string;
  /* honeypot — real people never fill this in */
  company?: string;
};

const clean = (v: unknown, max = 2000) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/* `host` is read off the incoming request rather than written in. The domain is
   mid-migration and will change again when it moves off Wix, and a hard-coded
   werable.com.au would quietly start lying the day it does. */
function render(d: Required<Omit<Payload, 'company'>>, host: string) {
  return [
    `Name:     ${d.firstName} ${d.lastName}`,
    `Email:    ${d.email}`,
    `Phone:    ${d.phone || 'Not provided'}`,
    `About:    ${d.topic}`,
    '',
    d.message,
    '',
    `— Sent from the enquiry form on ${host}`,
  ].join('\n');
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  // Silently accept bots so they get no signal to retry with.
  if (clean(body.company)) return NextResponse.json({ ok: true });

  const d = {
    firstName: clean(body.firstName, 100),
    lastName: clean(body.lastName, 100),
    email: clean(body.email, 200),
    phone: clean(body.phone, 60),
    topic: clean(body.topic, 200),
    message: clean(body.message, 5000),
  };

  if (!d.firstName || !d.lastName || !d.message || !d.topic || !isEmail(d.email)) {
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields and try again.' },
      { status: 422 },
    );
  }

  /* Prefer the forwarded host: behind Vercel, request.url is the internal
     deployment URL, so the visitor-facing domain only appears in the headers.
     That way the footer names the site the enquirer actually used. */
  const origin =
    request.headers.get('origin') ??
    (request.headers.get('x-forwarded-host')
      ? `https://${request.headers.get('x-forwarded-host')}`
      : new URL(request.url).origin);
  const host = new URL(origin).host;

  const subject = `Enquiry — ${d.firstName} ${d.lastName} (${d.topic})`;
  const text = render(d, host);

  /* Try every configured provider rather than committing to the first one. A
     misconfigured Resend key used to abort the whole request; now it falls
     through to the relay, so one broken setting cannot take the form offline. */
  const attempts: Attempt[] = [];

  if (RESEND_KEY) attempts.push(await viaResend(subject, text, d.email));

  if (!attempts.some((a) => a.ok)) {
    attempts.push(
      await viaFormSubmit(origin, {
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Name: `${d.firstName} ${d.lastName}`,
        Email: d.email,
        Phone: d.phone || 'Not provided',
        'Enquiry about': d.topic,
        Message: d.message,
      }),
    );
  }

  const won = attempts.find((a) => a.ok);
  const trail = attempts.map((a) => `${a.provider}=${a.ok ? 'ok' : 'FAIL'} (${a.detail})`).join(' | ');

  if (won) {
    console.info('[enquiry] delivered:', trail);
    return NextResponse.json({ ok: true, pendingActivation: won.pending ?? false });
  }

  /* Nothing got through. Write the enquiry to the log so it is recoverable from
     the hosting dashboard instead of lost — a missed enquiry is the expensive
     failure here, and a generic error message is what made this hard to
     diagnose in the first place. `code` is provider status only: no key, no
     personal data, safe to show a visitor and quote in a bug report. */
  console.error('[enquiry] ALL PROVIDERS FAILED:', trail);
  console.error('[enquiry] undelivered enquiry follows so it is not lost:\n' + text);

  return NextResponse.json(
    { ok: false, error: 'Delivery failed.', code: attempts.map((a) => `${a.provider}:${a.detail.slice(0, 60)}`).join('; ') },
    { status: 502 },
  );
}
