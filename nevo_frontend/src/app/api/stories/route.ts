import { NextResponse } from 'next/server';

type StorySubmission = {
  id: string;
  poolId: string;
  title: string;
  summary: string;
  metrics?: { peopleHelped?: number; fundsRaised?: number; itemsDistributed?: number };
  testimonial?: { author: string; quote: string };
  images?: string[];
  videoUrl?: string | null;
  createdAt: string;
};

const STORE: StorySubmission[] = [];
const RATE_LIMIT_MAP: Record<string, { count: number; firstTs: number }> = {};
const RATE_LIMIT_MAX = 5;

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
    const { poolId, title, summary } = body || {};
    if (!poolId || !title || !summary) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const s: StorySubmission = {
      id: Math.random().toString(36).slice(2, 10),
      poolId,
      title,
      summary,
      metrics: body.metrics || undefined,
      testimonial: body.testimonial || undefined,
      images: body.images || undefined,
      videoUrl: body.videoUrl || null,
      createdAt: new Date().toISOString(),
    };

    STORE.push(s);
    rl.count += 1;
    RATE_LIMIT_MAP[ip] = rl;

    // eslint-disable-next-line no-console
    console.log('[stories] New submission:', s);

    return NextResponse.json({ ok: true, id: s.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  // For dev/admin only
  return NextResponse.json({ stories: STORE });
}
