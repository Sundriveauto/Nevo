'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [autoReply, setAutoReply] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validateEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!subject || subject.trim().length < 3) return setError('Please enter a subject (3+ chars).');
    if (!message || message.trim().length < 10) return setError('Please enter a message (10+ chars).');

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, autoReply }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Submission failed');
      setSuccess('Thanks — your message was sent. We will respond shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setAutoReply(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Contact Support</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">Have a question, found an issue, or want to give feedback? Send us a message and we&apos;ll get back to you.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-error">{error}</div>}
        {success && <div className="text-sm text-success">{success}</div>}

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-3 py-2 bg-[var(--color-surface)]" />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border px-3 py-2 bg-[var(--color-surface)]" type="email" />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full rounded-xl border px-3 py-2 bg-[var(--color-surface)]" />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} className="w-full rounded-xl border px-3 py-2 bg-[var(--color-surface)]" />
        </div>

        <div className="flex items-center gap-3">
          <input id="autoReply" type="checkbox" checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} />
          <label htmlFor="autoReply" className="text-sm text-[var(--color-text-muted)]">Send me an auto-reply confirmation</label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button type="submit" disabled={loading} className="rounded-xl bg-brand-600 text-white px-4 py-2 disabled:opacity-50">
            {loading ? 'Sending…' : 'Send Message'}
          </button>
          <p className="text-xs text-[var(--color-text-muted)]">We aim to reply within 48 hours.</p>
        </div>
      </form>
    </main>
  );
}
