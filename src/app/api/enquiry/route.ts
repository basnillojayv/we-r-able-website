import { NextResponse } from 'next/server';

/*
  Server-side delivery for the contact form.

  The destination inbox lives here, not in the client bundle, so it is never
  handed to address-harvesting crawlers.

  Two providers, chosen by what is configured:

  1. RESEND_API_KEY set  -> sent through Resend. Preferred: real deliverability,
     a proper From address, no third party sitting between the visitor and the
     inbox. Needs a verified sender domain.
  2. Nothing set         -> forwarded through FormSubmit, which needs no signup
     and no key. The first submission triggers a one-time activation email to
     the destination address; until someone clicks that link, nothing is
     delivered. The response says so rather than pretending it sent.
*/

const TO = process.env.ENQUIRY_TO ?? 'werable.disability@gmail.com';
const FROM = process.env.ENQUIRY_FROM ?? 'WE R ABLE website <onboarding@resend.dev>';

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

function render(d: Required<Omit<Payload, 'company'>>) {
  return [
    `Name:     ${d.firstName} ${d.lastName}`,
    `Email:    ${d.email}`,
    `Phone:    ${d.phone || 'Not provided'}`,
    `About:    ${d.topic}`,
    '',
    d.message,
    '',
    '— Sent from the enquiry form on werable.com.au',
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

  const subject = `Website enquiry — ${d.firstName} ${d.lastName} (${d.topic})`;
  const text = render(d);

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: [TO], reply_to: d.email, subject, text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      return NextResponse.json({ ok: true });
    }

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Name: `${d.firstName} ${d.lastName}`,
        Email: d.email,
        Phone: d.phone || 'Not provided',
        'Enquiry about': d.topic,
        Message: d.message,
      }),
    });

    const out = (await res.json().catch(() => ({}))) as { success?: string | boolean };
    if (!res.ok) throw new Error(`FormSubmit ${res.status}`);

    // FormSubmit returns success on the activation send too. Flag it so the
    // form can tell the visitor the truth instead of a false confirmation.
    const activating = String(out?.success ?? '').toLowerCase() === 'false';
    return NextResponse.json({ ok: true, pendingActivation: activating });
  } catch (err) {
    console.error('[enquiry] delivery failed:', err);
    return NextResponse.json(
      { ok: false, error: 'Delivery failed.' },
      { status: 502 },
    );
  }
}
