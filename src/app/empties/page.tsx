"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/productService";
import { Product } from "@/utils/supabase/types";
import { getTheme, TINT_BG } from "@/lib/category-theme";
import { differenceInDays, differenceInMonths, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Droplets,
  Flame,
  FlaskConical,
  Leaf,
  Lightbulb,
  Medal,
  PartyPopper,
  Recycle,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d as string);
}

function formatDuration(
  dateOpened: Date | string | null | undefined,
  dateFinished: Date | string,
): string | null {
  const start = toDate(dateOpened);
  const end = toDate(dateFinished);
  if (!start || !end) return null;
  const days = differenceInDays(end, start);
  if (days <= 0) return "< 1 day";
  if (days < 30) return `${days}d`;
  const months = differenceInMonths(end, start);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years}yr`;
  return `${years}yr ${remMonths}mo`;
}

const TIPS: Array<{
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  body: string;
}> = [
  {
    icon: FlaskConical,
    color: "text-background",
    bg: "bg-brand-sky",
    title: "Reuse the bottle",
    body: "Rinse empty bottles and repurpose them as travel containers or for DIY skincare mixes.",
  },
  {
    icon: Recycle,
    color: "text-background",
    bg: "bg-brand-mint",
    title: "Recycle responsibly",
    body: "Brands like Kiehl's, Origins, and Lush offer in-store recycling programs for empty packaging.",
  },
  {
    icon: RotateCcw,
    color: "text-background",
    bg: "bg-brand-violet",
    title: "Look for refills",
    body: "Many premium serums and moisturizers now offer eco-friendly refill pouches at a lower price.",
  },
  {
    icon: Leaf,
    color: "text-background",
    bg: "bg-brand-coral",
    title: "Go zero-waste",
    body: "Swap to solid cleansers, bars, or glass-packaged products to reduce single-use plastic over time.",
  },
];

const MILESTONES: Array<{
  count: number;
  label: string;
  icon: React.ElementType;
}> = [
  { count: 1, label: "First Empty", icon: Star },
  { count: 5, label: "Dedicated", icon: Flame },
  { count: 10, label: "Collector", icon: Trophy },
  { count: 25, label: "Pan Master", icon: Medal },
  { count: 50, label: "Legend", icon: PartyPopper },
];

function EmptyCard({ product }: { product: Product }) {
  const theme = getTheme(product.type);
  const finishedDate = toDate(product.date_finished);
  const duration = formatDuration(product.date_opened, product.date_finished!);

  return (
    <div className='group rounded-2xl border-2 border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col'>
      {/* Color panel */}
      <div
        className={`${TINT_BG[theme.color]} relative h-28 flex items-center justify-center overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div className='absolute -top-4 -right-4 h-16 w-16 rounded-full bg-background/20' />
        <div className='absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-background/20' />

        {/* Done icon */}
        <div className='relative h-11 w-11 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center ring-2 ring-background'>
          <CheckCircle2 className='h-5 w-5 text-foreground' />
        </div>

        {/* Project pan badge */}
        {product.is_project_pan && (
          <Badge className='absolute top-3 left-3 bg-tint-sky text-foreground border border-brand-sky/30 rounded-full text-[10px] font-semibold gap-1'>
            <Droplets className='h-2.5 w-2.5' />
            Panned
          </Badge>
        )}

        {/* Duration pill */}
        {duration && (
          <div className='absolute bottom-2 right-2 rounded-full bg-background/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-foreground flex items-center gap-1'>
            <Clock className='h-2.5 w-2.5' />
            {duration}
          </div>
        )}
      </div>

      {/* Body */}
      <div className='p-4 flex-1 flex flex-col gap-2'>
        <div>
          <p className='text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5'>
            {product.brand}
          </p>
          <h3 className='font-semibold text-sm leading-snug line-clamp-2 text-foreground'>
            {product.name}
          </h3>
        </div>

        <Badge
          variant='secondary'
          className='w-fit rounded-full text-xs font-medium'
        >
          {product.type}
        </Badge>

        {product.tags && product.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 2 && (
              <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                +{product.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className='mt-auto pt-2.5 border-t border-border flex items-center justify-between'>
          <span className='text-xs text-muted-foreground flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            {finishedDate ? format(finishedDate, "MMM d, yyyy") : "—"}
          </span>
          {product.price != null && (
            <span className='text-xs text-muted-foreground font-medium tabular-nums'>
              ${Number(product.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmptiesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const empties = useMemo(
    () =>
      products
        .filter((p) => !!p.date_finished)
        .sort((a, b) => {
          const aDate = toDate(a.date_finished)?.getTime() ?? 0;
          const bDate = toDate(b.date_finished)?.getTime() ?? 0;
          return bDate - aDate;
        }),
    [products],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of empties) {
      const d = toDate(p.date_finished);
      if (!d) continue;
      const key = format(d, "MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [empties]);

  const stats = useMemo(() => {
    const total = empties.length;
    const pricedEmpties = empties.filter((p) => p.price != null);
    const totalValue = pricedEmpties.reduce(
      (sum, p) => sum + Number(p.price),
      0,
    );
    const withDuration = empties.filter(
      (p) => p.date_opened && p.date_finished,
    );
    const avgDays =
      withDuration.length > 0
        ? Math.round(
            withDuration.reduce((sum, p) => {
              const start = toDate(p.date_opened);
              const end = toDate(p.date_finished);
              return sum + (start && end ? differenceInDays(end, start) : 0);
            }, 0) / withDuration.length,
          )
        : null;
    const projectPanWins = empties.filter((p) => p.is_project_pan).length;

    return {
      total,
      totalValue: pricedEmpties.length > 0 ? totalValue : null,
      avgDays,
      projectPanWins,
    };
  }, [empties]);

  const avgLabel = stats.avgDays
    ? stats.avgDays < 30
      ? `${stats.avgDays}d`
      : stats.avgDays < 365
        ? `${Math.round(stats.avgDays / 30)}mo`
        : `${(stats.avgDays / 365).toFixed(1)}yr`
    : null;

  return (
    <div className='space-y-8'>
      {/* ── Hero ── */}
      <header className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-tint-violet via-tint-mint to-tint-sky p-8 md:p-12 border border-border'>
        <div className='absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-violet/30 blur-2xl' />
        <div className='absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-mint/30 blur-2xl' />
        <div className='relative max-w-2xl'>
          <div className='flex items-center gap-4 mb-4'>
            <h1 className='font-bold text-3xl sm:text-4xl md:text-6xl tracking-tight leading-[1.05] tabular-nums'>
              {loading ? (
                <span className='inline-block h-14 w-56 rounded-xl bg-foreground/10 animate-pulse' />
              ) : (
                <>
                  {stats.total} product{stats.total === 1 ? "" : "s"} emptied
                </>
              )}
            </h1>
            {!loading && (
              <PartyPopper className='h-10 w-10 md:h-12 md:w-12 shrink-0' />
            )}
          </div>
          <p className='text-base md:text-lg text-foreground/80 max-w-lg leading-relaxed'>
            Every empty bottle is a product well-loved. Keep going!
          </p>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[
          {
            label: "Empties",
            displayValue: String(stats.total),
            icon: Trophy,
            iconBg: "bg-brand-violet",
            blob: "bg-tint-violet",
          },
          {
            label: "Total value",
            displayValue:
              stats.totalValue != null
                ? `$${stats.totalValue.toFixed(0)}`
                : "—",
            icon: DollarSign,
            iconBg: "bg-brand-mint",
            blob: "bg-tint-mint",
          },
          {
            label: "Avg. use time",
            displayValue: avgLabel ?? "—",
            icon: Clock,
            iconBg: "bg-brand-sun",
            blob: "bg-tint-sun",
          },
          {
            label: "Project Pan wins",
            displayValue: String(stats.projectPanWins),
            icon: Droplets,
            iconBg: "bg-brand-sky",
            blob: "bg-tint-sky",
          },
        ].map(({ label, displayValue, icon: Icon, iconBg, blob }) => (
          <div
            key={label}
            className='relative overflow-hidden rounded-2xl border-2 border-border bg-card p-5 flex items-center gap-4 shadow-sm'
          >
            <div
              className={`${iconBg} rounded-xl h-11 w-11 flex items-center justify-center shrink-0`}
            >
              <Icon className='h-5 w-5 text-background' />
            </div>
            <div>
              <p className='text-[11px] uppercase tracking-wider font-semibold text-muted-foreground'>
                {label}
              </p>
              {loading ? (
                <div className='h-8 w-14 rounded-lg bg-muted/40 animate-pulse mt-1' />
              ) : (
                <p className='text-3xl font-bold leading-none mt-0.5 tabular-nums'>
                  {displayValue}
                </p>
              )}
            </div>
            <div
              className={`${blob} pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-70`}
              aria-hidden
            />
          </div>
        ))}
      </div>

      {/* ── Milestones ── */}
      {!loading && (
        <div className='rounded-2xl border-2 border-border bg-card p-5 md:p-6'>
          <div className='flex items-center gap-2 mb-5'>
            <div className='h-8 w-8 rounded-lg bg-brand-sun flex items-center justify-center shrink-0'>
              <Star className='h-4 w-4 text-background' />
            </div>
            <h2 className='font-semibold text-base'>Milestones</h2>
          </div>
          <div className='flex gap-3 overflow-x-auto pb-1 -mx-1 px-1'>
            {MILESTONES.map(({ count, label, icon: Icon }) => {
              const unlocked = stats.total >= count;
              return (
                <div
                  key={count}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 min-w-[104px] transition-all duration-200 shrink-0 ${
                    unlocked
                      ? "border-brand-sun/40 bg-tint-sun"
                      : "border-border bg-muted/20 opacity-50"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      unlocked ? "bg-brand-sun" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${unlocked ? "text-background" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className='text-center'>
                    <p
                      className={`text-xs font-bold tabular-nums ${unlocked ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {count} {count === 1 ? "empty" : "empties"}
                    </p>
                    <p
                      className={`text-[10px] leading-tight mt-0.5 ${unlocked ? "text-foreground/70" : "text-muted-foreground"}`}
                    >
                      {label}
                    </p>
                  </div>
                  {unlocked && (
                    <CheckCircle2 className='h-3.5 w-3.5 text-brand-sun shrink-0' />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tips ── */}
      <div className='rounded-2xl border-2 border-border bg-card p-5 md:p-6'>
        <div className='flex items-center gap-2 mb-5'>
          <div className='h-8 w-8 rounded-lg bg-brand-coral flex items-center justify-center shrink-0'>
            <Lightbulb className='h-4 w-4 text-background' />
          </div>
          <h2 className='font-semibold text-base'>Tips &amp; Ideas</h2>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {TIPS.map(({ icon: Icon, bg, color, title, body }) => (
            <div
              key={title}
              className='rounded-xl border border-border bg-background p-4 flex flex-col gap-3'
            >
              <div
                className={`${bg} h-9 w-9 rounded-lg flex items-center justify-center shrink-0`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className='font-semibold text-sm leading-snug mb-1'>
                  {title}
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      {loading ? (
        <div className='space-y-8'>
          {Array.from({ length: 2 }).map((_, g) => (
            <div key={g} className='space-y-3'>
              <div className='h-4 w-28 rounded-md bg-muted/40 animate-pulse mb-3' />
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                {Array.from({ length: 4 - g }).map((_, i) => (
                  <div
                    key={i}
                    className='h-56 rounded-2xl bg-muted/40 animate-pulse'
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : empties.length === 0 ? (
        <div className='text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/40'>
          <div className='inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-tint-mint text-brand-mint mb-4'>
            <Trophy className='h-7 w-7' />
          </div>
          <h3 className='font-semibold text-2xl mb-2'>No empties yet</h3>
          <p className='text-muted-foreground max-w-sm mx-auto'>
            When you finish a product, set its finish date on the shelf.
            It&apos;ll show up here as a badge of honour.
          </p>
        </div>
      ) : (
        <div className='space-y-10'>
          {grouped.map(([month, items]) => (
            <div key={month}>
              {/* Month header */}
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-sm font-semibold text-muted-foreground whitespace-nowrap'>
                  {month}
                </span>
                <div className='flex-1 h-px bg-border' />
                <span className='text-xs text-muted-foreground tabular-nums whitespace-nowrap'>
                  {items.length} {items.length === 1 ? "empty" : "empties"}
                </span>
              </div>

              {/* Card grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                {items.map((p) => (
                  <EmptyCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && empties.length > 0 && (
        <p className='text-xs text-muted-foreground text-right tabular-nums'>
          {empties.length} {empties.length === 1 ? "empty" : "empties"} total
        </p>
      )}
    </div>
  );
}
