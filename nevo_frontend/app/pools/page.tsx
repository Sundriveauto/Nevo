'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { usePoolsStore, type Pool } from '@/src/store/poolsStore';
import {
  usePoolsStore,
  type Pool,
  type PoolStatus,
  type SortOption,
} from '@/src/store/poolsStore';
import { useRouter, useSearchParams } from 'next/navigation';

// We extract categories from MOCK_POOLS dynamically or define them statically
const CATEGORIES = [
  'Humanitarian',
  'Technology',
  'Environment',
  'Animal Welfare',
  'Education',
  'Art & Culture',
];

const POOL_STATUSES: PoolStatus[] = ['Active', 'Completed'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_raised', label: 'Most raised' },
  { value: 'goal_low', label: 'Goal: low to high' },
];

export default function BrowsePoolsPage() {
  const {
    filteredPools,
    filters,
    setSearch,
    toggleCategory,
    toggleStatus,
    clearFilters,
    setPriceRange,
    setDateRange,
    sortBy,
    setSortBy,
  } = usePoolsStore();
  const [searchInput, setSearchInput] = useState(filters.search);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.categories.length +
    filters.statuses.length;

  const selectedFilters = [
    ...(filters.search
      ? [{ key: 'search', label: `Search: ${filters.search}` }]
      : []),
    ...filters.statuses.map((status) => ({
      key: `status-${status}`,
      label: status,
    })),
    ...filters.categories.map((category) => ({
      key: `category-${category}`,
      label: category,
    })),
    ...(filters.minTarget != null || filters.maxTarget != null
      ? [
          {
            key: 'price',
            label: `Target: ${filters.minTarget ?? '0'}–${filters.maxTarget ?? '∞'}`,
          },
        ]
      : []),
    ...(filters.dateFrom || filters.dateTo
      ? [
          {
            key: 'date',
            label: `Date: ${filters.dateFrom ?? 'Any'}–${filters.dateTo ?? 'Any'}`,
          },
        ]
      : []),
  ];

  const handleClearFilters = () => {
    setSearchInput('');
    clearFilters();
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, setSearch]);

  // URL sync: read initial params and push updates
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const q = searchParams.get('q') || '';
    const min = searchParams.get('min') || '';
    const max = searchParams.get('max') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    if (q) setSearch(q);
    if (min || max) setPriceRange(min ? Number(min) : null, max ? Number(max) : null);
    if (from || to) setDateRange(from || null, to || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.minTarget != null) params.set('min', String(filters.minTarget));
    if (filters.maxTarget != null) params.set('max', String(filters.maxTarget));
    if (filters.dateFrom) params.set('from', filters.dateFrom);
    if (filters.dateTo) params.set('to', filters.dateTo);
    router.replace(`/pools?${params.toString()}`, { scroll: false });
  }, [filters.search, filters.minTarget, filters.maxTarget, filters.dateFrom, filters.dateTo, router]);

  const allPools = usePoolsStore((s) => s.pools);

  function countForCategory(cat: string) {
    return allPools.filter((p) => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch =
        !filters.search ||
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower);
      const matchStatus = filters.statuses.length === 0 || filters.statuses.includes(p.status);
      const matchPriceMin = filters.minTarget == null || p.target >= (filters.minTarget ?? 0);
      const matchPriceMax = filters.maxTarget == null || p.target <= (filters.maxTarget ?? Infinity);
      return matchSearch && matchStatus && matchPriceMin && matchPriceMax && p.category === cat;
    }).length;
  }

  function countForStatus(status: PoolStatus) {
    return allPools.filter((p) => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch = !filters.search || p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower);
      const matchCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
      const matchPriceMin = filters.minTarget == null || p.target >= (filters.minTarget ?? 0);
      const matchPriceMax = filters.maxTarget == null || p.target <= (filters.maxTarget ?? Infinity);
      return matchSearch && matchCategory && matchPriceMin && matchPriceMax && p.status === status;
    }).length;
  }

  const displayedPools = filteredPools();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Pools</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Discover and contribute to transparent, on-chain fundraising
            campaigns.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar / Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <label htmlFor="search-pools" className="sr-only">
                Search pools
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  id="search-pools"
                  className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="Search by name, description, category, or creator..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Statuses</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {POOL_STATUSES.map((status) => {
                  const isActive = filters.statuses.includes(status);
                  return (
                    <button
                      key={`status-${status}`}
                      onClick={() => toggleStatus(status)}
                      className={`rounded-full lg:rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium'
                          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{status}</span>
                        <span className="text-[var(--color-text-muted)]">{countForStatus(status)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {CATEGORIES.map((cat) => {
                  const isActive = filters.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full lg:rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium'
                          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{cat}</span>
                        <span className="text-[var(--color-text-muted)]">{countForCategory(cat)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Target range (XLM)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minTarget ?? ''}
                  onChange={(e) => setPriceRange(e.target.value ? Number(e.target.value) : null, filters.maxTarget ?? null)}
                  className="w-24 rounded-xl border px-3 py-2 text-sm bg-[var(--color-surface)]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxTarget ?? ''}
                  onChange={(e) => setPriceRange(filters.minTarget ?? null, e.target.value ? Number(e.target.value) : null)}
                  className="w-24 rounded-xl border px-3 py-2 text-sm bg-[var(--color-surface)]"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Created date</h3>
              <div className="flex gap-2">
                <input type="date" value={filters.dateFrom ?? ''} onChange={(e) => setDateRange(e.target.value || null, filters.dateTo ?? null)} className="rounded-xl border px-3 py-2 text-sm bg-[var(--color-surface)]" />
                <input type="date" value={filters.dateTo ?? ''} onChange={(e) => setDateRange(filters.dateFrom ?? null, e.target.value || null)} className="rounded-xl border px-3 py-2 text-sm bg-[var(--color-surface)]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--color-text-muted)]">
              Showing {displayedPools.length} pool
              {displayedPools.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="sort-pools">
                Sort pools
              </label>
              <select
                id="sort-pools"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleClearFilters}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                Clear filters
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Applied filters:
              </span>
              {selectedFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text)]"
                >
                  {filter.label}
                </span>
              ))}
            </div>
          )}

          {displayedPools.length === 0 ? (
            <EmptyState
              variant="bordered"
              icon="search"
              iconTone="muted"
              title="No results found"
              description="We couldn't find any pools matching your search criteria. Try adjusting your filters or search term."
              action={{
                label: 'Clear search',
                onClick: () => {
                  setSearchInput('');
                  setSearch('');
                },
                variant: 'link',
              }}
              secondaryAction={{
                label: 'Create a Pool',
                href: '/pools/new',
                variant: 'primary',
              }}
            />
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)] py-24 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)] mb-4">
                <SearchIcon />
              </div>
              <h3 className="text-base font-semibold">No results found</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
                We couldn&apos;t find any pools matching your search criteria.
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {displayedPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function PoolCard({ pool }: { pool: Pool }) {
  const pct = Math.min(100, Math.round((pool.raised / pool.target) * 100));

  return (
    <Link
      href={`/pools/${pool.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div
        className="h-24 w-full"
        style={{ backgroundColor: pool.imageColor || '#e5e7eb' }}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
            {pool.category}
          </span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              pool.status === 'Active'
                ? 'bg-success-light text-success-dark'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {pool.status}
          </span>
        </div>
        <h3 className="font-bold text-lg leading-tight group-hover:text-brand-600 transition-colors line-clamp-1">
          {pool.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2 flex-1">
          {pool.description}
        </p>

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
            <span className="text-[var(--color-text)]">
              {pool.raised.toLocaleString()} XLM raised
            </span>
            <span className="text-[var(--color-text-muted)]">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-[var(--color-text-muted)]">
            Goal: {pool.target.toLocaleString()} XLM
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
