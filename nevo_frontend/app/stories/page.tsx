'use client';

import React from 'react';

type Story = {
  id: string;
  poolId: string;
  title: string;
  summary: string;
  metrics: { peopleHelped?: number; fundsRaised?: number; itemsDistributed?: number };
  testimonial?: { author: string; quote: string };
  images?: string[];
  videoUrl?: string | null;
};

const MOCK_STORIES: Story[] = [
  {
    id: 's1',
    poolId: '1',
    title: 'Clean Water Initiative — Village Wells',
    summary:
      'Built 12 new wells across three villages, providing clean water to families and improving community health.',
    metrics: { peopleHelped: 4200, fundsRaised: 6800 },
    testimonial: {
      author: 'Amina, Community Organizer',
      quote:
        'Access to clean water changed our daily life — children miss school less and illness dropped significantly.',
    },
    images: ['/images/stories/well-before.jpg', '/images/stories/well-after.jpg'],
  },
  {
    id: 's2',
    poolId: '3',
    title: 'Community Garden Project — Urban Renewal',
    summary:
      'Converted vacant lots into community gardens, creating food sources and educational programs for youth.',
    metrics: { peopleHelped: 1200, itemsDistributed: 3500 },
    testimonial: { author: 'Marcus, Volunteer', quote: 'The garden brought our neighborhood together.' },
    videoUrl: null,
    images: ['/images/stories/garden-1.jpg'],
  },
];

export default function StoriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Success Stories</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Real-world impact from completed pools — metrics, testimonials, and
          curated stories from the community.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        {MOCK_STORIES.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </section>

      <footer className="mt-12 text-sm text-[var(--color-text-muted)]">
        <p>
          Want to share a story? Reach out to the team to have your impact
          featured — submissions are moderated for quality and safety.
        </p>
      </footer>
    </main>
  );
}

function StoryCard({ story }: { story: Story }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/pools/${story.poolId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: story.summary, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      // fallback: copied
      // eslint-disable-next-line no-alert
      alert('Link copied to clipboard');
    }
  };

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{story.title}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{story.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={handleShare} className="rounded-full border px-3 py-1 text-sm">
            Share
          </button>
          <a href={`/pools/${story.poolId}`} className="text-xs text-[var(--color-text-muted)] underline">View Pool</a>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {story.metrics.peopleHelped != null && (
          <Metric label="People helped" value={story.metrics.peopleHelped} />
        )}
        {story.metrics.fundsRaised != null && (
          <Metric label="Funds raised (XLM)" value={story.metrics.fundsRaised} />
        )}
        {story.metrics.itemsDistributed != null && (
          <Metric label="Items distributed" value={story.metrics.itemsDistributed} />
        )}
      </div>

      {story.testimonial && (
        <blockquote className="mb-4 rounded-lg border-l-4 border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm">
          <p className="italic">“{story.testimonial.quote}”</p>
          <footer className="mt-2 text-xs text-[var(--color-text-muted)]">— {story.testimonial.author}</footer>
        </blockquote>
      )}

      {story.images && story.images.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {story.images.map((src) => (
            <img key={src} src={src} alt={story.title} className="h-36 w-full rounded object-cover" />
          ))}
        </div>
      )}

      {story.videoUrl && (
        <div className="mt-4">
          <iframe title={story.title} src={story.videoUrl} className="w-full h-48 rounded" />
        </div>
      )}
    </article>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  if (value == null) return null;
  return (
    <div className="rounded-lg bg-[var(--color-surface-raised)] px-3 py-2 text-sm">
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
