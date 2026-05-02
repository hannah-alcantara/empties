"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/productService";
import { Product } from "@/utils/supabase/types";
import { getTheme, TINT_BG } from "@/lib/category-theme";
import { differenceInDays, differenceInMonths, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Droplets, PartyPopper, Trophy } from "lucide-react";
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
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = differenceInMonths(end, start);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}yr ${remMonths}mo`;
}

function EmptyRow({ product }: { product: Product }) {
  const theme = getTheme(product.type);
  const finishedDate = toDate(product.date_finished);
  const duration = formatDuration(product.date_opened, product.date_finished!);

  return (
    <div className='flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-card'>
      {/* Color swatch */}
      <div
        className={`${TINT_BG[theme.color]} h-9 w-9 rounded-lg shrink-0 flex items-center justify-center`}
      >
        {product.is_project_pan && (
          <Droplets className='h-3.5 w-3.5 text-foreground/40' />
        )}
      </div>

      {/* Name + brand · type */}
      <div className='flex-1 min-w-0'>
        <p className='font-semibold text-sm leading-tight truncate'>
          {product.name}
        </p>
        <p className='text-xs text-muted-foreground truncate'>
          {product.brand}
          <span className='mx-1 opacity-40'>·</span>
          {product.type}
        </p>
      </div>

      {/* Panned badge — desktop */}
      {product.is_project_pan && (
        <Badge className='hidden sm:flex bg-tint-sky text-foreground border border-brand-sky/30 rounded-full text-[10px] font-semibold gap-1 shrink-0'>
          <Droplets className='h-2.5 w-2.5' />
          Panned
        </Badge>
      )}

      {/* Duration — tablet+ */}
      {duration && (
        <span className='hidden md:block text-xs font-medium text-foreground tabular-nums shrink-0 w-20 text-right'>
          {duration}
        </span>
      )}

      {/* Price — desktop */}
      {product.price != null && (
        <span className='hidden lg:block text-xs text-muted-foreground tabular-nums shrink-0 w-16 text-right'>
          ${Number(product.price).toFixed(2)}
        </span>
      )}

      {/* Finished date */}
      <div className='text-right shrink-0'>
        <span className='text-xs text-muted-foreground tabular-nums'>
          {finishedDate ? (
            <>
              <span className='hidden sm:inline'>
                {format(finishedDate, "MMM d, yyyy")}
              </span>
              <span className='sm:hidden'>{format(finishedDate, "MMM d")}</span>
            </>
          ) : (
            "—"
          )}
        </span>
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

      {/* ── Timeline ── */}
      {loading ? (
        <div className='space-y-6'>
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className='space-y-2'>
              <div className='h-4 w-28 rounded-md bg-muted/40 animate-pulse mb-3' />
              {Array.from({ length: 3 - g }).map((_, i) => (
                <div
                  key={i}
                  className='h-[60px] rounded-xl border-2 border-border bg-muted/40 animate-pulse'
                />
              ))}
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
        <div className='space-y-8'>
          {grouped.map(([month, items]) => (
            <div key={month}>
              {/* Month header */}
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-sm font-semibold text-muted-foreground whitespace-nowrap'>
                  {month}
                </span>
                <div className='flex-1 h-px bg-border' />
                <span className='text-xs text-muted-foreground tabular-nums whitespace-nowrap'>
                  {items.length} {items.length === 1 ? "empty" : "empties"}
                </span>
              </div>

              {/* Rows */}
              <div className='space-y-2'>
                {items.map((p) => (
                  <EmptyRow key={p.id} product={p} />
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
