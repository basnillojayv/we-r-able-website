'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import { enquiryTopics, site } from '@/content/site';

/*
  Posts to our own route handler, which delivers to the WE R ABLE inbox
  server-side. The destination address is deliberately not in this file — it
  lives in src/app/api/enquiry/route.ts, out of reach of address harvesters.

  If the request fails, the form says so and offers the phone number, rather
  than swallowing the error and leaving someone believing they got through.
*/
const ENQUIRY_ENDPOINT = '/api/enquiry';

type Field = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required?: boolean;
  autoComplete?: string;
  error: string;
  full?: boolean;
};

const fields: Field[] = [
  { name: 'firstName', label: 'First name', type: 'text', required: true, autoComplete: 'given-name', error: 'Please enter your first name.' },
  { name: 'lastName', label: 'Last name', type: 'text', required: true, autoComplete: 'family-name', error: 'Please enter your last name.' },
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email', error: 'Please enter a valid email address.' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', error: 'Please enter a valid phone number.' },
  { name: 'topic', label: 'How can we help?', type: 'select', required: true, error: 'Please choose an option.', full: true },
  { name: 'message', label: 'Message', type: 'textarea', required: true, error: 'Please tell us a little about what you need.', full: true },
];

type Status = { state: 'ok' | 'error'; text: string } | null;

const control =
  'w-full min-h-[50px] rounded-tight border-[1.5px] bg-white px-3.5 py-2.5 text-base ' +
  'transition-[border-color,box-shadow] duration-200 ease-(--ease-out-strong) ' +
  'hover:border-muted focus:outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgb(37_118_180/0.22)] ' +
  'focus-visible:outline-3 focus-visible:outline-blue focus-visible:outline-offset-2 focus-visible:shadow-none';

export function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const check = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    const value = el.value.trim();
    let ok = true;
    if (el.required && !value) ok = false;
    else if (el.getAttribute('type') === 'email' && value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    else if (el.getAttribute('type') === 'tel' && value) ok = /^[+\d][\d\s()\-]{6,}$/.test(value);
    setInvalid((prev) => ({ ...prev, [el.name]: !ok }));
    return ok;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    const els = Array.from(
      form.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea',
      ) ?? [],
    );
    const bad = els.filter((el) => !check(el));

    if (bad.length) {
      setStatus({ state: 'error', text: 'Please check the highlighted fields and try again.' });
      bad[0].focus();
      return;
    }

    const data = Object.fromEntries(els.map((el) => [el.name, el.value.trim()]));

    setSending(true);
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const out = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        pendingActivation?: boolean;
      };
      if (!res.ok || !out.ok) throw new Error(String(res.status));

      form.current?.reset();
      setInvalid({});
      setStatus({
        state: 'ok',
        text: out.pendingActivation
          ? 'Thanks — your enquiry has been submitted. Delivery to our inbox is still being ' +
            `set up, so if you need us today please call ${site.phone.display}.`
          : 'Thanks — your enquiry has been sent. Our team will be in touch shortly.',
      });
    } catch {
      setStatus({
        state: 'error',
        text:
          'Sorry, your enquiry could not be sent just now. Please email ' +
          `${site.email} or call ${site.phone.display}.`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      ref={form}
      onSubmit={onSubmit}
      noValidate
      className="fold fold-tall rounded-panel border border-line bg-cream p-[clamp(1.5rem,3vw,2.5rem)]"
    >
      {/* Honeypot. Hidden from sight and from assistive tech, and skipped by
          the keyboard, so only a script ever fills it in. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-[1.1rem] sm:grid-cols-2">
        {fields.map((f) => {
          const isBad = invalid[f.name];
          const border = isBad ? 'border-[#b3235a]' : 'border-line-strong';
          const shared = {
            id: f.name,
            name: f.name,
            required: f.required,
            'aria-invalid': isBad || undefined,
            'aria-describedby': `${f.name}-error`,
            autoComplete: f.autoComplete,
            onBlur: (e: { currentTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }) => {
              if (e.currentTarget.value.trim() || f.required) check(e.currentTarget);
            },
            onInput: (e: { currentTarget: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }) => {
              if (invalid[f.name]) check(e.currentTarget);
            },
          };

          return (
            <div key={f.name} className={`grid gap-1.5 ${f.full ? 'sm:col-span-2' : ''}`}>
              <label htmlFor={f.name} className="text-[0.8125rem] font-semibold tracking-[0.02em]">
                {f.label}{' '}
                {f.required && (
                  <span aria-hidden className="text-magenta">
                    *
                  </span>
                )}
              </label>

              {f.type === 'select' ? (
                <select
                  {...shared}
                  defaultValue=""
                  className={`${control} ${border} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234C6383%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.9rem_center] bg-no-repeat bg-[length:17px] pr-10`}
                >
                  <option value="">Please choose…</option>
                  {enquiryTopics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea {...shared} className={`${control} ${border} min-h-[132px] resize-y leading-[1.55]`} />
              ) : (
                <input
                  {...shared}
                  type={f.type}
                  inputMode={f.type === 'tel' ? 'tel' : undefined}
                  className={`${control} ${border}`}
                />
              )}

              <p
                id={`${f.name}-error`}
                className={`items-center gap-1.5 text-[0.8125rem] font-medium text-[#b3235a] ${
                  isBad ? 'flex' : 'hidden'
                }`}
              >
                <Icon name="alert" className="size-[15px] shrink-0" />
                {f.error}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3.5">
        <p
          role="status"
          aria-live="polite"
          className={`gap-3 rounded-tight px-[1.15rem] py-4 text-small leading-[1.55] ${
            status ? 'flex' : 'hidden'
          } ${
            status?.state === 'error'
              ? 'bg-magenta-soft text-[#8e1b47]'
              : 'bg-blue-soft text-[#10456f]'
          }`}
        >
          {status && <Icon name="info" className="mt-0.5 size-5 shrink-0" />}
          <span>{status?.text}</span>
        </p>

        <button
          type="submit"
          disabled={sending}
          className="group inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5
            justify-self-start rounded-full border-[1.5px] border-ink bg-ink px-6 text-[0.9688rem]
            font-semibold text-white transition-[transform,background-color,box-shadow]
            duration-200 ease-(--ease-out-strong) hover:-translate-y-0.5 hover:bg-ink-mid
            hover:shadow-card active:scale-[0.97] active:duration-100
            disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
            motion-reduce:hover:translate-y-0 max-sm:w-full max-sm:justify-self-stretch"
        >
          {sending ? 'Sending…' : 'Send Enquiry'}
          <Icon
            name="arrowRight"
            className="size-[17px] shrink-0 transition-transform duration-200
              ease-(--ease-out-strong) group-hover:translate-x-[3px]"
          />
        </button>

        <p className="text-[0.8125rem] leading-[1.55] text-muted">
          Fields marked <span aria-hidden>*</span>
          <span className="sr-only">with an asterisk</span> are required. Prefer to talk? Call{' '}
          <a href={site.phone.href} className="font-bold text-ink underline underline-offset-2">
            {site.phone.display}
          </a>
          .
        </p>
      </div>
    </form>
  );
}
