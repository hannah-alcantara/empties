"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

import { getProductById, updateProduct } from "@/services/productService";
import { Product, SHELF_LIFE_SUGGESTIONS } from "@/utils/supabase/types";
import { useProductForm } from "@/components/product-form-provider";
import { getExpirationStatus, getEffectiveExpiration, daysUntil } from "@/types/product";
import { getTheme, TINT_BG, BRAND_BG, ThemeColor } from "@/lib/category-theme";
import { formatDate } from "@/lib/date-utils";
import { fireConfetti } from "@/lib/confetti";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Pencil,
  PlusCircle,
  Sparkles,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  fresh: {
    label: "Fresh",
    className: "bg-tint-mint text-foreground border-brand-mint/30",
    icon: CheckCircle2,
  },
  soon: {
    label: "Use soon",
    className: "bg-tint-sun text-foreground border-brand-sun/40",
    icon: Clock,
  },
  expiring: {
    label: "Expiring",
    className: "bg-tint-coral text-foreground border-brand-coral/40",
    icon: AlertTriangle,
  },
  expired: {
    label: "Expired",
    className: "bg-destructive text-destructive-foreground border-transparent",
    icon: AlertTriangle,
  },
};

const BRAND_TEXT: Record<ThemeColor, string> = {
  coral: "text-brand-coral",
  sun: "text-brand-sun",
  mint: "text-brand-mint",
  sky: "text-brand-sky",
  violet: "text-brand-violet",
};

const TIMELINE_BAR: Record<string, string> = {
  expired: "bg-brand-coral",
  expiring: "bg-brand-coral",
  soon: "bg-brand-sun",
  fresh: "bg-brand-mint",
};

// ─── Liquid bottle visualization ─────────────────────────────────────────────

function LiquidBottle({ percent, color }: { percent: number; color: ThemeColor }) {
  return (
    <div className="relative w-28 h-44 mx-auto select-none" aria-hidden>
      {/* Cap */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-5 ${BRAND_BG[color]} opacity-50 rounded-t-sm`}
      />
      {/* Body */}
      <div className="absolute top-4 left-0 right-0 bottom-0 rounded-[2rem] border border-border bg-background/50 overflow-hidden shadow-inner">
        {/* Liquid fill rising from the bottom */}
        <div
          className={`${BRAND_BG[color]} absolute bottom-0 left-0 right-0 opacity-65 transition-all duration-700 ease-out`}
          style={{ height: `${percent}%` }}
        />
        {/* Shine highlight */}
        <div className="absolute inset-y-6 left-4 w-1.5 rounded-full bg-white/45 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-4">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-64" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { openEdit } = useProductForm();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [fillLevel, setFillLevel] = useState<number>(100);
  const [savingFill, setSavingFill] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevFillRef = useRef<number>(100);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const p = await getProductById(id);
        setProduct(p);
        const pct = p.percent_remaining ?? 100;
        setFillLevel(pct);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Product not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id, refreshTrigger]);

  // Debounced fill level save
  const saveFillLevel = (value: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSavingFill(true);
      try {
        const updated = await updateProduct(id, { percent_remaining: value });
        setProduct(updated);
      } catch {
        toast.error("Failed to update fill level");
      } finally {
        setSavingFill(false);
      }
    }, 600);
  };

  const handleLogUse = () => {
    if (fillLevel <= 5) {
      setConfirmFinishOpen(true);
    } else {
      void doLogUse(fillLevel - 5);
    }
  };

  const doLogUse = async (newPct: number) => {
    setFillLevel(newPct);
    setSavingFill(true);
    try {
      const updated = await updateProduct(id, { percent_remaining: newPct });
      setProduct(updated);
      if (newPct === 0) {
        fireConfetti();
        toast.success("Product emptied! You panned it!");
      } else {
        toast.success(`Logged use — ${newPct}% remaining`);
      }
    } catch {
      setFillLevel(fillLevel);
      toast.error("Failed to log use");
    } finally {
      setSavingFill(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error ?? "Product not found"}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const status = getExpirationStatus(product);
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const effExp = getEffectiveExpiration(product);
  const daysLeft = effExp ? daysUntil(effExp) : null;
  const theme = getTheme(product.type);
  const pct = fillLevel;
  const used = 100 - pct;

  const shelfLifeMonths =
    SHELF_LIFE_SUGGESTIONS[product.type as keyof typeof SHELF_LIFE_SUGGESTIONS] ?? 12;

  const dateOpened = product.date_opened ? new Date(product.date_opened) : null;
  const dateExpires = effExp;

  // Timeline bar: percentage of time elapsed between opened → expires
  const timelinePercent = (() => {
    if (dateOpened && dateExpires) {
      const total = differenceInDays(dateExpires, dateOpened);
      if (total <= 0) return 100;
      const elapsed = differenceInDays(new Date(), dateOpened);
      return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    }
    if (dateExpires) {
      // Estimate start from PAO shelf life
      const estimatedStart = new Date(
        dateExpires.getTime() - shelfLifeMonths * 30 * 86400000
      );
      const total = differenceInDays(dateExpires, estimatedStart);
      const elapsed = differenceInDays(new Date(), estimatedStart);
      return total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0;
    }
    return 0;
  })();

  // Friendly "lasts" label
  const lastsLabel = (() => {
    if (daysLeft === null) return "—";
    if (daysLeft <= 0) return "Expired";
    if (daysLeft < 14) return `${daysLeft}d`;
    if (daysLeft < 60) return `${Math.round(daysLeft / 7)}wk`;
    return `${Math.round(daysLeft / 30)}mo`;
  })();

  const daysLeftLabel = (() => {
    if (daysLeft === null) return null;
    if (status === "expired") return `${Math.abs(daysLeft)}d ago`;
    return `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
  })();

  const daysLeftColor =
    status === "expired"
      ? "text-destructive"
      : status === "expiring"
        ? "text-brand-coral"
        : status === "soon"
          ? "text-brand-sun"
          : "text-muted-foreground";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Row 1: Product header ── */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 mt-1 cursor-pointer"
            onClick={() => openEdit(product, () => setRefreshTrigger((n) => n + 1))}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="rounded-full font-medium">
            {product.type}
          </Badge>
          {product.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full font-medium text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {product.notes && (
          <p className="mt-3 text-sm text-muted-foreground italic">
            &ldquo;{product.notes}&rdquo;
          </p>
        )}
      </div>

      {/* ── Row 2: Bottle + Fill level ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Bottle visualization */}
        <div className={`${TINT_BG[theme.color]} rounded-2xl border border-border p-6 relative flex flex-col items-center justify-center min-h-72`}>
          <Badge className={`${cfg.className} absolute top-4 left-4 gap-1 font-semibold rounded-full border text-[11px]`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </Badge>
          {product.is_project_pan && (
            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-foreground">
              <Droplets className="h-3 w-3" />
              Pan
            </div>
          )}
          <LiquidBottle percent={pct} color={theme.color} />
          <div className="mt-5 text-center">
            <p className="text-4xl font-bold text-foreground tabular-nums">{pct}%</p>
            <p className="text-sm text-muted-foreground mt-1">{used}% used</p>
          </div>
        </div>

        {/* Fill level */}
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${BRAND_TEXT[theme.color]}`} />
              <span className="font-semibold">Fill level</span>
            </div>
            {savingFill && (
              <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={100 - fillLevel}
              onChange={(e) => {
                const v = 100 - Number(e.target.value);
                if (v === 0) {
                  prevFillRef.current = fillLevel;
                  setFillLevel(0);
                  setTimeout(() => setConfirmFinishOpen(true), 0);
                } else {
                  setFillLevel(v);
                  saveFillLevel(v);
                }
              }}
              className="w-full cursor-pointer accent-foreground"
              aria-label="Adjust fill level"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Full</span>
              <span>Empty</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-1 border-t border-border">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-3">Remaining</p>
              <p className="text-2xl font-bold leading-tight mt-1 tabular-nums">{pct}%</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-3">Used</p>
              <p className="text-2xl font-bold leading-tight mt-1 tabular-nums">{used}%</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-3">Lasts ~</p>
              <p className="text-2xl font-bold leading-tight mt-1">{lastsLabel}</p>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full rounded-full h-14 text-base font-semibold gap-2 mt-auto"
            title="Logs -5% usage"
            onClick={handleLogUse}
            disabled={savingFill || fillLevel === 0}
          >
            <PlusCircle className="h-5 w-5" />
            {savingFill ? "Saving…" : "Log Use"}
          </Button>
        </div>
      </div>

      {/* ── Expiration card ── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Expiration</span>
          </div>
          {daysLeftLabel && (
            <span className={`text-sm font-semibold ${daysLeftColor}`}>{daysLeftLabel}</span>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`${TIMELINE_BAR[status]} h-full rounded-full transition-all duration-700`}
              style={{ width: `${timelinePercent}%` }}
              role="progressbar"
              aria-valuenow={timelinePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Time elapsed"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{dateOpened ? formatDate(dateOpened) : "—"}</span>
            <span>{dateExpires ? formatDate(dateExpires) : "—"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm border-t border-border pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Opened</p>
            <p className="font-medium mt-0.5">{dateOpened ? formatDate(dateOpened) : "Not recorded"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Expires</p>
            <p className="font-medium mt-0.5">{dateExpires ? formatDate(dateExpires) : "Not set"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">PAO</p>
            <p className="font-medium mt-0.5">{shelfLifeMonths} months after opening</p>
          </div>
          {product.price != null && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Price</p>
              <p className="font-medium mt-0.5">${product.price.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expired warning */}
      {status === "expired" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-brand-sun/40 bg-tint-sun px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-brand-sun shrink-0" />
          <span>This product is past its expiry date. Use with caution.</span>
        </div>
      )}

      {/* Finish confirmation dialog */}
      <Dialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Almost empty!</DialogTitle>
            <DialogDescription>
              This will bring <span className="font-semibold text-foreground">{product.name}</span> to 0%. Are you done with it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmFinishOpen(false); setFillLevel(prevFillRef.current); }}>
              Not yet
            </Button>
            <Button
              onClick={() => {
                setConfirmFinishOpen(false);
                void doLogUse(0);
              }}
            >
              Yes, I&apos;m done!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
