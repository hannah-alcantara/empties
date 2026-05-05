"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Package,
  Sparkles,
  Clock,
  AlertTriangle,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Droplets,
} from "lucide-react";
import { Product, ProductTypes } from "@/utils/supabase/types";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/services/productService";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import ProductCard from "@/components/product-card";
import {
  getProductStatus,
  isProductFinished,
  sortProductsByExpiration,
} from "@/lib/date-utils";
import {
  getExpirationStatus,
  daysUntil,
  getEffectiveExpiration,
} from "@/types/product";
import { getTheme, TINT_BG, BRAND_BG } from "@/lib/category-theme";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { useProductForm } from "@/components/product-form-provider";

type FilterTab = "all" | "active" | "expiring-soon" | "expired" | "finished";
type ViewMode  = "grid" | "list";

const STATUS_CONFIG = {
  fresh:    { label: "Fresh",    className: "bg-tint-mint  text-foreground border-brand-mint/30" },
  soon:     { label: "Use soon", className: "bg-tint-sun   text-foreground border-brand-sun/40" },
  expiring: { label: "Expiring", className: "bg-tint-coral text-foreground border-brand-coral/40" },
  expired:  { label: "Expired",  className: "bg-destructive text-destructive-foreground border-transparent" },
};

export default function DashboardPage() {
  const { openAdd } = useProductForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterType, setFilterType] = useState("all");
  const [tab, setTab]   = useState<FilterTab>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const active = products.filter(
      (p) => !isProductFinished(p) && getProductStatus(p) === "active",
    ).length;
    const expiringSoon = products.filter(
      (p) => !isProductFinished(p) && getProductStatus(p) === "expiring-soon",
    ).length;
    const expired = products.filter(
      (p) => !isProductFinished(p) && getProductStatus(p) === "expired",
    ).length;
    return { total: products.length, active, expiringSoon, expired };
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (tab === "finished") {
      result = result.filter((p) => isProductFinished(p));
    } else if (tab !== "all") {
      result = result.filter(
        (p) => !isProductFinished(p) && getProductStatus(p) === tab,
      );
    }
    if (filterType !== "all") {
      result = result.filter((p) => p.type === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      );
    }
    return sortProductsByExpiration(result);
  }, [products, tab, filterType, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product removed");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleLogUsage = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const current = product.percent_remaining ?? 100;
    const newPct = Math.max(0, current - 5);
    try {
      await updateProduct(id, { percent_remaining: newPct });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, percent_remaining: newPct } : p))
      );
      if (newPct === 0) {
        toast.success("Product emptied! You panned it!");
      } else {
        toast.success(`Logged use — ${newPct}% remaining`);
      }
    } catch {
      toast.error("Failed to log use");
    }
  };

  const handleLoadDemoData = async () => {
    setLoadingDemo(true);
    try {
      const created = await Promise.all(DEMO_PRODUCTS.map((p) => createProduct(p)));
      setProducts((prev) => [...prev, ...created]);
      toast.success(`${created.length} demo products loaded!`);
    } catch {
      toast.error("Failed to load demo data. Please try again.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleToggleProjectPan = async (id: string, value: boolean) => {
    try {
      await updateProduct(id, { is_project_pan: value });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_project_pan: value } : p))
      );
      toast.success(value ? "Added to Project Pan" : "Removed from Project Pan");
    } catch {
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Collection", value: stats.total,       icon: Package,       iconBg: "bg-brand-violet", blob: "bg-tint-violet" },
          { label: "Fresh",      value: stats.active,      icon: Sparkles,      iconBg: "bg-brand-mint",   blob: "bg-tint-mint" },
          { label: "Use soon",   value: stats.expiringSoon, icon: Clock,         iconBg: "bg-brand-sun",    blob: "bg-tint-sun" },
          { label: "Expired",    value: stats.expired,     icon: AlertTriangle, iconBg: "bg-brand-coral",  blob: "bg-tint-coral" },
        ].map(({ label, value, icon: Icon, iconBg, blob }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl border-2 border-border bg-card p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`${iconBg} rounded-xl h-11 w-11 flex items-center justify-center shrink-0`}>
              <Icon className="h-5 w-5 text-background" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {label}
              </p>
              <p className="text-3xl font-bold leading-none mt-0.5">{value}</p>
            </div>
            <div
              className={`${blob} pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-70`}
              aria-hidden
            />
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        {/* Pill tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList className="rounded-full h-10 p-1 gap-0.5">
            <TabsTrigger value="all"           className="rounded-full px-4 text-sm">All</TabsTrigger>
            <TabsTrigger value="active"        className="rounded-full px-4 text-sm">Fresh</TabsTrigger>
            <TabsTrigger value="expiring-soon" className="rounded-full px-4 text-sm">Use soon</TabsTrigger>
            <TabsTrigger value="expired"       className="rounded-full px-4 text-sm">Expired</TabsTrigger>
            <TabsTrigger value="finished"      className="rounded-full px-4 text-sm">Finished</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + type filter + view toggle */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or brand…"
              className="pl-9 sm:w-64 rounded-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="sm:w-44 rounded-full">
              <SlidersHorizontal className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ProductTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-full border-2 border-border bg-card p-0.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`rounded-full p-2 transition-colors duration-150 cursor-pointer ${
                view === "grid"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-full p-2 transition-colors duration-150 cursor-pointer ${
                view === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Product area ── */}
      {loading ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-border bg-muted/40 h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[68px] rounded-xl border-2 border-border bg-muted/40 animate-pulse" />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-card/40">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-tint-violet text-brand-violet mb-4">
            <Plus className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-2xl mb-2">Nothing here yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            {products.length === 0
              ? "Add your first product to start building your shelf."
              : "No products match these filters. Try adjusting your search."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add a product
            </Button>
            {products.length === 0 && (
              <Button
                variant="outline"
                onClick={handleLoadDemoData}
                disabled={loadingDemo}
              >
                <Sparkles className="h-4 w-4" />
                {loadingDemo ? "Loading…" : "Load demo data"}
              </Button>
            )}
          </div>
        </div>
      ) : view === "grid" ? (

        /* ── Grid view ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onDelete={handleDelete} onLogUsage={handleLogUsage} onToggleProjectPan={handleToggleProjectPan} />
          ))}
        </div>

      ) : (

        /* ── List view ── */
        <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-border bg-muted/30">
            <span className="w-10" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Product</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-28 text-right">Expiry</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-20 text-center hidden lg:block">Status</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-16 text-right hidden xl:block">Fill</span>
            <span className="w-16" />
          </div>

          {filtered.map((p, i) => {
            const status = getExpirationStatus(p);
            const cfg    = STATUS_CONFIG[status];
            const effExp = getEffectiveExpiration(p);
            const days   = effExp ? daysUntil(effExp) : null;
            const theme  = getTheme(p.type);
            const pct    = p.percent_remaining;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-accent/50 ${
                  i !== 0 ? "border-t border-border" : ""
                }`}
              >
                {/* Color swatch */}
                <div className={`${TINT_BG[theme.color]} h-10 w-10 rounded-xl shrink-0 flex items-center justify-center`}>
                  {p.is_project_pan && <Droplets className="h-4 w-4 text-foreground/50" />}
                </div>

                {/* Name / brand / type */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.brand}
                    <span className="mx-1 opacity-40">·</span>
                    {p.type}
                  </p>
                </div>

                {/* Expiry */}
                <div className="hidden md:block text-right shrink-0 w-28">
                  {days === null ? (
                    <span className="text-xs text-muted-foreground">No expiry</span>
                  ) : status === "expired" ? (
                    <span className="text-xs text-destructive font-medium">{Math.abs(days)}d ago</span>
                  ) : (
                    <span className="text-xs font-medium text-foreground">{days}d left</span>
                  )}
                  {effExp && (
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{format(effExp, "MMM d, yyyy")}</p>
                  )}
                </div>

                {/* Status badge */}
                <Badge
                  className={`${cfg.className} hidden lg:flex rounded-full border text-[11px] font-semibold shrink-0 w-20 justify-center`}
                >
                  {cfg.label}
                </Badge>

                {/* Progress bar */}
                <div className="hidden xl:block w-16 shrink-0">
                  {pct != null ? (
                    <>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`${BRAND_BG[theme.color]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right mt-0.5 tabular-nums">{pct}%</p>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button size="sm" variant="ghost" aria-label="Edit" asChild className="h-8 w-8 p-0">
                    <Link href={`/products/${p.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={p.is_project_pan ? "Remove from Project Pan" : "Add to Project Pan"}
                    title={p.is_project_pan ? "Remove from Project Pan" : "Add to Project Pan"}
                    className={`h-8 w-8 p-0 ${p.is_project_pan ? "text-brand-sky" : "text-muted-foreground hover:text-brand-sky"}`}
                    onClick={() => handleToggleProjectPan(p.id, !p.is_project_pan)}
                  >
                    <Droplets className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete product"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog (list view) */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deleteTarget?.brand} &mdash; {deleteTarget?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteTarget) {
                  await handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Row count (list view only) */}
      {!loading && filtered.length > 0 && view === "list" && (
        <p className="text-xs text-muted-foreground text-right tabular-nums">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
