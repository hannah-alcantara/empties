"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Calendar,
  CheckCircle2,
  Crown,
  Droplets,
  Flame,
  Pencil,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getProducts, updateProduct } from "@/services/productService";
import { Product } from "@/utils/supabase/types";
import { getTheme, TINT_BG, BRAND_BG } from "@/lib/category-theme";

import {
  daysUntil,
  getEffectiveExpiration,
  getExpirationStatus,
} from "@/types/product";
import { formatDate } from "@/lib/date-utils";
import { toast } from "sonner";

export default function ProjectPanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishTarget, setFinishTarget] = useState<Product | null>(null);
  const [finishDate, setFinishDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const activePans = useMemo(
    () =>
      products
        .filter((p) => p.is_project_pan && !p.date_finished)
        .sort(
          (a, b) => (a.percent_remaining ?? 100) - (b.percent_remaining ?? 100),
        ),
    [products],
  );

  const almostThere = useMemo(
    () => activePans.filter((p) => (p.percent_remaining ?? 100) <= 25),
    [activePans],
  );

  const inProgress = useMemo(
    () => activePans.filter((p) => (p.percent_remaining ?? 100) > 25),
    [activePans],
  );

  const empties = useMemo(
    () =>
      products
        .filter((p) => !!p.date_finished)
        .sort((a, b) => {
          const aTime = a.date_finished
            ? new Date(a.date_finished as unknown as string).getTime()
            : 0;
          const bTime = b.date_finished
            ? new Date(b.date_finished as unknown as string).getTime()
            : 0;
          return bTime - aTime;
        }),
    [products],
  );

  const avgRemaining = useMemo(() => {
    const withPct = activePans.filter((p) => p.percent_remaining != null);
    if (!withPct.length) return null;
    return Math.round(
      withPct.reduce((sum, p) => sum + (p.percent_remaining ?? 0), 0) /
        withPct.length,
    );
  }, [activePans]);

  const pannedPct = useMemo(() => {
    if (!products.length) return null;
    return Math.round((activePans.length / products.length) * 100);
  }, [activePans.length, products.length]);

  const avgUsed = avgRemaining != null ? 100 - avgRemaining : null;

  const activeProducts = useMemo(
    () => products.filter((p) => !p.date_finished).length,
    [products],
  );

  const emptiesByType = useMemo(() => {
    const map = new Map<string, number>();
    empties.forEach((p) => map.set(p.type, (map.get(p.type) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [empties]);

  const openFinishDialog = (product: Product) => {
    setFinishTarget(product);
    setFinishDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleRemoveFromPan = async (id: string) => {
    try {
      await updateProduct(id, { is_project_pan: false });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_project_pan: false } : p)),
      );
      toast.success("Removed from Project Pan");
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleMarkFinished = async () => {
    if (!finishTarget || !finishDate) return;
    setFinishing(true);
    try {
      const date = new Date(finishDate);
      await updateProduct(finishTarget.id, {
        date_finished: date,
        percent_remaining: 0,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === finishTarget.id
            ? { ...p, date_finished: date, percent_remaining: 0 }
            : p,
        ),
      );
      toast.success("Congrats on finishing the product!");
      setFinishTarget(null);
    } catch {
      toast.error("Failed to mark as finished");
    } finally {
      setFinishing(false);
    }
  };

  const nextToFinish = almostThere[0] ?? null;

  return (
    <div className='space-y-10'>
      {/* ── Hero ── */}
      <header className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-tint-sun via-tint-coral to-tint-violet p-8 md:p-12 border border-border'>
        <div className='absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-sun/30 blur-2xl' />
        <div className='absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-coral/30 blur-2xl' />
        <div className='relative max-w-2xl'>
          <h1 className='font-bold text-3xl sm:text-4xl md:text-6xl tracking-tight leading-[1.05] mb-4'>
            Project Pan
          </h1>
          <p className='text-base md:text-lg text-foreground/80 max-w-lg leading-relaxed'>
            Finish what you started. Track every product you&rsquo;re working
            through, celebrate the empties, and make every drop count.
          </p>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
        {[
          {
            label: "Panned",
            value: loading ? "—" : activePans.length,
            subtitle: loading
              ? ""
              : pannedPct != null
                ? `${pannedPct}% of collection`
                : "—",
            icon: Crown,
            iconBg: "bg-brand-sun",
            blob: "bg-tint-sun",
          },
          {
            label: "Almost gone",
            value: loading ? "—" : almostThere.length,
            subtitle: "≤25% remaining",
            icon: Flame,
            iconBg: "bg-brand-coral",
            blob: "bg-tint-coral",
          },
          {
            label: "Avg used",
            value: loading ? "—" : avgUsed != null ? `${avgUsed}%` : "—",
            subtitle: "across the shelf",
            icon: Target,
            iconBg: "bg-brand-mint",
            blob: "bg-tint-mint",
          },
          {
            label: "Active products",
            value: loading ? "—" : activeProducts,
            subtitle: "on your shelf",
            icon: Zap,
            iconBg: "bg-brand-violet",
            blob: "bg-tint-violet",
          },
        ].map(({ label, value, subtitle, icon: Icon, iconBg, blob }) => (
          <Card
            key={label}
            className='p-5 rounded-2xl relative overflow-hidden border-2 border-border shadow-sm'
          >
            <div
              className={`${blob} absolute -top-6 -right-6 h-20 w-20 rounded-full`}
            />
            <div className='relative'>
              <div
                className={`${iconBg} text-background h-11 w-11 rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon className='h-5 w-5' />
              </div>
              <p className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
                {label}
              </p>
              <p className='text-3xl font-bold leading-none mt-1 tabular-nums'>
                {value}
              </p>
              {subtitle && (
                <p className='text-xs text-muted-foreground mt-1'>{subtitle}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Next likely empty ── */}
      {!loading && nextToFinish && (
        <Card className='p-6 rounded-2xl border-2 border-dashed border-brand-coral/40 bg-tint-coral/40'>
          <div className='flex items-start gap-4 flex-wrap'>
            <div className='bg-brand-coral text-background h-14 w-14 rounded-2xl flex items-center justify-center shrink-0'>
              <Target className='h-6 w-6' />
            </div>
            <div className='flex-1 min-w-[160px]'>
              <p className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1'>
                Next likely empty
              </p>
              <h3 className='font-bold text-2xl leading-tight'>
                {nextToFinish.name}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {nextToFinish.brand}
              </p>
            </div>
            <div className='flex gap-2 shrink-0 items-center'>
              <Button size='sm' onClick={() => openFinishDialog(nextToFinish)}>
                <CheckCircle2 className='h-4 w-4' />
                Mark Finished
              </Button>
              <Button size='sm' variant='outline' asChild>
                <Link href={`/products/${nextToFinish.id}`}>
                  <Pencil className='h-3.5 w-3.5' />
                  Edit Fill
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Hall of Fame ── */}
      <section className='space-y-5'>
        <div className='flex items-end justify-between flex-wrap gap-3'>
          <div>
            <h2 className='font-bold text-3xl flex items-center gap-3'>
              <Trophy className='h-7 w-7 text-brand-sun' />
              Hall of Fame
            </h2>
            <p className='text-muted-foreground mt-1'>
              Bottles you actually finished. Legendary.
            </p>
          </div>
          {empties.length > 0 && (
            <Badge className='bg-brand-sun text-background rounded-full text-sm px-4 py-1.5'>
              {empties.length} {empties.length === 1 ? "trophy" : "trophies"}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='rounded-2xl border-2 border-border bg-muted/40 h-40 animate-pulse'
              />
            ))}
          </div>
        ) : empties.length === 0 ? (
          <Card className='p-12 rounded-3xl border-2 border-dashed text-center bg-muted/30'>
            <div className='inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-tint-sun text-brand-sun mb-4'>
              <Trophy className='h-10 w-10' />
            </div>
            <h3 className='font-bold text-2xl mb-2'>No empties yet</h3>
            <p className='text-muted-foreground max-w-md mx-auto'>
              {almostThere.length > 0
                ? `The closest contender is just ${almostThere[0].percent_remaining ?? "?"}% away!`
                : "Use up your first product to claim a spot in the Hall of Fame."}
            </p>
          </Card>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {empties.map((p, i) => {
              const theme = getTheme(p.type);
              return (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <Card
                    className={`relative overflow-hidden p-6 rounded-2xl ${TINT_BG[theme.color]} border-2 border-transparent hover:border-border hover:-translate-y-1 transition-all cursor-pointer h-full`}
                  >
                    <div className='absolute top-3 right-3 flex items-center gap-1 bg-foreground text-background rounded-full px-2.5 py-1 text-xs font-bold'>
                      <Crown className='h-3 w-3' />#{i + 1}
                    </div>
                    <div className='relative'>
                      <Badge
                        variant='secondary'
                        className='rounded-full mb-3 text-xs'
                      >
                        {p.type}
                      </Badge>
                      <p className='text-xs text-muted-foreground font-semibold uppercase tracking-wide'>
                        {p.brand}
                      </p>
                      <h3 className='font-bold text-lg leading-tight mt-1 mb-4'>
                        {p.name}
                      </h3>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='h-3.5 w-3.5' />
                        <span>Finished {formatDate(p.date_finished)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Almost there (≤25%) ── */}
      {!loading && almostThere.length > 0 && (
        <section className='space-y-5'>
          <div>
            <h2 className='font-bold text-3xl flex items-center gap-3'>
              <Flame className='h-7 w-7 text-brand-coral' />
              Almost there
            </h2>
            <p className='text-muted-foreground mt-1'>
              One last push and these join the Hall of Fame.
            </p>
          </div>
          <div className='space-y-3'>
            {almostThere.map((p) => {
              const theme = getTheme(p.type);
              const pct = p.percent_remaining ?? 0;
              const effExp = getEffectiveExpiration(p);
              const days = effExp ? daysUntil(effExp) : null;
              const status = getExpirationStatus(p);
              return (
                <Card
                  key={p.id}
                  className='p-4 md:p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5'
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${BRAND_BG[theme.color]} text-background flex items-center justify-center shrink-0 font-bold text-lg tabular-nums`}
                  >
                    {pct}%
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='text-xs text-muted-foreground font-semibold uppercase tracking-wide'>
                        {p.brand}
                      </p>
                      <Badge
                        variant='secondary'
                        className='rounded-full text-[10px] py-0'
                      >
                        {p.type}
                      </Badge>
                    </div>
                    <h3 className='font-semibold text-base truncate'>
                      {p.name}
                    </h3>
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted mt-2'>
                      <div
                        className='bg-brand-coral h-full rounded-full transition-all duration-500'
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                  </div>
                  <div className='text-right shrink-0 hidden sm:block'>
                    <div className='flex items-center gap-1 text-xs text-muted-foreground justify-end mb-0.5'>
                      <Calendar className='h-3 w-3' />
                      <span>
                        {status === "expired" ? "Expired" : "Expires"}
                      </span>
                    </div>
                    <p className='font-bold text-sm tabular-nums'>
                      {days === null
                        ? "—"
                        : status === "expired"
                          ? `${Math.abs(days)}d ago`
                          : `${days}d`}
                    </p>
                  </div>
                  <div className='flex gap-1 shrink-0'>
                    <Button size='sm' onClick={() => openFinishDialog(p)}>
                      <CheckCircle2 className='h-3.5 w-3.5' />
                      <span className='hidden sm:inline'>Finish</span>
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='text-muted-foreground hover:text-destructive'
                      onClick={() => handleRemoveFromPan(p.id)}
                      title='Remove from Project Pan'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── In progress (>25%) ── */}
      {!loading && inProgress.length > 0 && (
        <section className='space-y-5'>
          <div>
            <h2 className='font-bold text-3xl flex items-center gap-3'>
              <Sparkles className='h-7 w-7 text-brand-sky' />
              In progress
            </h2>
            <p className='text-muted-foreground mt-1'>
              Working on these. Stay focused, no new buys.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {inProgress.map((p) => {
              const theme = getTheme(p.type);
              const pct = p.percent_remaining ?? 100;
              return (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <Card className='p-4 rounded-2xl flex flex-row items-center gap-3 hover:shadow-md transition-all cursor-pointer'>
                    <div
                      className={`h-2 w-2 rounded-full ${BRAND_BG[theme.color]} shrink-0`}
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-sm truncate'>{p.name}</p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {p.brand} &middot; {p.type}
                      </p>
                    </div>
                    <div className='w-24 shrink-0 h-1.5 overflow-hidden rounded-full bg-muted'>
                      <div
                        className={`${BRAND_BG[theme.color]} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                    <span className='text-xs font-bold tabular-nums w-10 text-right shrink-0'>
                      {pct}%
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Empty state (no pans at all) ── */}
      {!loading && activePans.length === 0 && (
        <div className='text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/40'>
          <div className='inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-tint-sky text-brand-sky mb-4'>
            <Droplets className='h-7 w-7' />
          </div>
          <h3 className='font-semibold text-2xl mb-2'>No pans in progress</h3>
          <p className='text-muted-foreground max-w-sm mx-auto mb-6'>
            Flag products as Project Pan from your shelf to track them here.
          </p>
          <Button asChild variant='outline'>
            <Link href='/dashboard'>Go to My Shelf</Link>
          </Button>
        </div>
      )}

      {/* ── Insights ── */}
      {!loading && (
        <section className='grid md:grid-cols-2 gap-5 pb-4'>
          {/* Hall of Fame by category */}
          <Card className='p-6 rounded-2xl'>
            <h3 className='font-bold text-xl mb-4 flex items-center gap-2'>
              <Award className='h-5 w-5 text-brand-violet' />
              Products by category
            </h3>
            {emptiesByType.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                Finish your first product to see your strengths.
              </p>
            ) : (
              <ul className='space-y-3'>
                {emptiesByType.map(([type, count]) => {
                  const theme = getTheme(type);
                  const max = emptiesByType[0][1];
                  return (
                    <li key={type} className='flex items-center gap-3'>
                      <span className='text-sm font-medium w-28 shrink-0 truncate'>
                        {type}
                      </span>
                      <div className='flex-1 h-3 rounded-full bg-muted overflow-hidden'>
                        <div
                          className={`h-full ${BRAND_BG[theme.color]} rounded-full transition-all`}
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className='text-sm font-bold tabular-nums w-6 text-right'>
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Pan tips */}
          <Card className='p-6 rounded-2xl bg-gradient-to-br from-tint-mint to-tint-sky'>
            <h3 className='font-bold text-xl mb-4 flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-brand-mint' />
              Pan tips
            </h3>
            <ul className='space-y-3 text-sm'>
              {[
                "Pair an almost-empty with a favorite to use it up faster.",
                "Decant the last bits into a smaller jar — easier to scoop.",
                "Cut open tubes when you think they're empty. Usually 2 weeks left in there.",
                "No new purchases until you've panned 3 products. Promise.",
              ].map((tip) => (
                <li key={tip} className='flex gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-brand-mint shrink-0 mt-0.5' />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* ── Mark as Finished dialog ── */}
      <Dialog
        open={!!finishTarget}
        onOpenChange={(open) => {
          if (!open) setFinishTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Finished</DialogTitle>
            <DialogDescription>
              {finishTarget &&
                `When did you finish "${finishTarget.brand} — ${finishTarget.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2 py-2'>
            <label className='text-xs uppercase tracking-wider font-semibold text-muted-foreground'>
              Date finished
            </label>
            <input
              type='date'
              value={finishDate}
              max={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setFinishDate(e.target.value)}
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setFinishTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkFinished}
              disabled={finishing || !finishDate}
            >
              {finishing ? "Saving…" : "Mark as Empty!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
