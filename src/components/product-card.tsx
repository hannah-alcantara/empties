"use client";

import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Product } from "@/utils/supabase/types";
import {
  getExpirationStatus,
  getEffectiveExpiration,
  daysUntil,
} from "@/types/product";
import { getTheme, TINT_BG, BRAND_BG } from "@/lib/category-theme";
import {
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Props {
  product: Product;
  onDelete: (productId: string) => Promise<void>;
  onLogUsage?: (id: string) => void;
  onToggleProjectPan?: (id: string, value: boolean) => void;
}

const STATUS_CONFIG = {
  fresh: {
    label: "Fresh",
    className: "bg-tint-mint   text-foreground border-brand-mint/30",
    icon: CheckCircle2,
  },
  soon: {
    label: "Use soon",
    className: "bg-tint-sun    text-foreground border-brand-sun/40",
    icon: Clock,
  },
  expiring: {
    label: "Expiring",
    className: "bg-tint-coral  text-foreground border-brand-coral/40",
    icon: AlertTriangle,
  },
  expired: {
    label: "Expired",
    className: "bg-destructive text-destructive-foreground border-transparent",
    icon: AlertTriangle,
  },
};

import { useState } from "react";

export default function ProductCard({
  product,
  onDelete,
  onLogUsage,
  onToggleProjectPan,
}: Props) {
  const status = getExpirationStatus(product);
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;
  const effExp = getEffectiveExpiration(product);
  const days = effExp ? daysUntil(effExp) : null;
  const theme = getTheme(product.type);
  const pct = product.percent_remaining;
  const [finishOpen, setFinishOpen] = useState(false);

  return (
    <Card className='group relative overflow-hidden bg-card border-2 border-border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 rounded-2xl flex flex-col gap-0 p-0'>
      {/* ── Color panel ── */}
      <div className={`${TINT_BG[theme.color]} relative h-28 overflow-hidden`}>
        {/* Status badge */}
        <Badge
          className={`${cfg.className} absolute top-3 right-3 gap-1 font-semibold rounded-full border text-[11px]`}
        >
          <StatusIcon className='h-3 w-3' />
          {cfg.label}
        </Badge>

        {/* Project pan indicator */}
        {product.is_project_pan && (
          <div className='absolute top-3 left-3 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-foreground'>
            <Droplets className='h-3 w-3' />
            Pan
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className='p-5 space-y-3.5 flex-1 flex flex-col'>
        {/* Brand + name */}
        <div>
          <p className='text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5'>
            {product.brand}
          </p>
          <Link href={`/products/${product.id}`}>
            <h3 className='font-semibold text-base leading-snug text-foreground line-clamp-2 hover:underline decoration-muted-foreground underline-offset-2'>
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Type chip */}
        <Badge
          variant='secondary'
          className='font-medium rounded-full w-fit text-xs'
        >
          {product.type}
        </Badge>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground'>
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Expiry info */}
        <div className='space-y-1 text-sm border-t border-border pt-3'>
          <div className='flex items-center justify-between'>
            <span className='flex items-center gap-1.5 text-foreground font-medium text-sm'>
              <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
              {days === null
                ? "No expiry set"
                : status === "expired"
                  ? `Expired ${Math.abs(days)}d ago`
                  : `${days} day${days === 1 ? "" : "s"} left`}
            </span>
            {effExp && (
              <span className='text-xs text-muted-foreground'>
                {format(effExp, "MMM d")}
              </span>
            )}
          </div>
          {product.notes && (
            <p className='text-xs text-muted-foreground italic line-clamp-1 pt-0.5'>
              &ldquo;{product.notes}&rdquo;
            </p>
          )}
        </div>

        {/* Percent remaining progress bar */}
        {pct != null && (
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span className='font-medium'>Remaining</span>
              <span className='font-semibold tabular-nums'>{pct}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className={`${BRAND_BG[theme.color]} h-full rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
                role='progressbar'
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-2 pt-1 mt-auto'>
          <Button
            size='sm'
            className='flex-1'
            title='Logs -5% usage'
            onClick={() => {
              if (pct != null && pct <= 5) {
                setFinishOpen(true);
              } else {
                onLogUsage?.(product.id);
              }
            }}
            disabled={status === "expired"}
          >
            <CheckCircle2 className='h-4 w-4' />
            Log Use
          </Button>

          <Button
            size='sm'
            variant={product.is_project_pan ? "ghost" : "outline"}
            aria-label={
              product.is_project_pan
                ? "Remove from Project Pan"
                : "Add to Project Pan"
            }
            title={
              product.is_project_pan
                ? "Remove from Project Pan"
                : "Add to Project Pan"
            }
            className={
              product.is_project_pan
                ? "text-brand-sky"
                : "text-muted-foreground hover:text-brand-sky"
            }
            onClick={() =>
              onToggleProjectPan?.(product.id, !product.is_project_pan)
            }
          >
            <Droplets className='h-4 w-4' />
            Pan
          </Button>

          <Button size='sm' variant='ghost' aria-label='Edit' asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className='h-4 w-4' />
            </Link>
          </Button>

          <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Almost empty!</DialogTitle>
                <DialogDescription>
                  This will bring{" "}
                  <span className='font-semibold text-foreground'>
                    {product.name}
                  </span>{" "}
                  to 0%. Are you done with it?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Not yet</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    setFinishOpen(false);
                    onLogUsage?.(product.id);
                  }}
                >
                  Yes, I&apos;m done!
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                aria-label='Delete'
                className='text-muted-foreground hover:text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete &quot;{product.brand} &mdash;{" "}
                  {product.name}&quot;.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button
                  variant='destructive'
                  onClick={() => onDelete(product.id)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
