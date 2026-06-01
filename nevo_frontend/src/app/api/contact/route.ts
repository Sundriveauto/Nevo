import { NextResponse } from 'next/server';

type Submission = {
  id: string;
  name?: string;
  email: string;
  subject: string;
  message: string;
  autoReply?: boolean;
  createdAt: string;
};

// In-memory store (mock DB) and simple rate-limit map
const STORE: Submission[] = [];
const RATE_LIMIT_MAP: Record<string, { count: number; firstTs: number }> = {};
const RATE_LIMIT_MAX = 5; // per hour per IP (mock)

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
    const now = Date.now();
    const rl = RATE_LIMIT_MAP[ip] || { count: 0, firstTs: now };
    if (now - rl.firstTs > 1000 * 60 * 60) {
      rl.count = 0;
      rl.firstTs = now;
    }
    if (rl.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, subject, message, autoReply } = body || {};

    if (!email || !validateEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!subject || String(subject).trim().length < 3) return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    if (!message || String(message).trim().length < 10) return NextResponse.json({ error: 'Invalid message' }, { status: 400 });

    // store
    const submission: Submission = {
      id: Math.random().toString(36).slice(2, 10),
      name: name || undefined,
      email,
      subject,
      message,
      autoReply: !!autoReply,
      createdAt: new Date().toISOString(),
    };
    STORE.push(submission);

    // increment rate limit
    rl.count += 1;
    RATE_LIMIT_MAP[ip] = rl;

    // Mock send email: log to console (replace with real provider in production)
    // Note: In this dev environment we can't actually send email.
    // Keep logic minimal and safe.
    // Support team email: support@nevo.example (placeholder)
    // eslint-disable-next-line no-console
    console.log('[contact] New submission:', submission);

    if (submission.autoReply) {
      // eslint-disable-next-line no-console
      console.log(`[contact] Sending auto-reply to ${submission.email}`);
    }

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  // For admin/dev debugging only: return stored submissions (in real app protect this)
  return NextResponse.json({ submissions: STORE });
}
