# Empties — Claude Code Instructions

## Project

**Empties** is a skincare product tracker with gamified "project pan" mechanics. Users build a shelf of products, track expiry dates, log usage, and work toward emptying (panning) products.

- **Deployed:** https://skincare-tracker-olive.vercel.app/
- **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (auth + DB) · Zod v4 · react-hook-form · date-fns · lucide-react · sonner

---

## Directory Structure

```
src/
  app/            # Next.js App Router pages (server components by default)
  components/     # Shared UI components
    ui/           # shadcn/ui primitives (never edit unless necessary)
  lib/            # Pure utilities: category-theme.ts, date-utils.ts, utils.ts
  services/       # Data-access layer (productService.ts)
  types/          # Shared TypeScript types (product.ts)
  utils/
    supabase/     # Supabase client/server helpers + generated types
  middleware.ts   # Auth middleware (protects routes)
```

---

## Current Routes

| Path | Description |
|---|---|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Main dashboard — stats, filters, product grid (client component) |
| `/products/add` | Add product form |
| `/products/[id]` | _(planned)_ Product detail page |
| `/products/[id]/edit` | _(planned)_ Edit product form |

---

## Design System

### Tokens & Theme

Defined in `src/app/globals.css` using Tailwind v4 `@theme inline`.

**Base radius:** `--radius: 1rem` → utilities `rounded-sm/md/lg/xl` map to `calc(radius ± 4px)`.

**Backgrounds:**
- Light: warm off-white `hsl(40, 30%, 97%)`
- Dark: blue-gray `hsl(230, 22%, 10%)`

**Semantic tokens (adapt to dark mode):** `background`, `foreground`, `card`, `muted`, `muted-foreground`, `border`, `input`, `ring`, `destructive`, `primary`, `secondary`, `accent`.

### Brand Palette (fixed, no dark-mode shift)

| Token | Color |
|---|---|
| `brand-coral` | `hsl(4, 78%, 65%)` — warm red |
| `brand-sun` | `hsl(42, 95%, 62%)` — amber |
| `brand-mint` | `hsl(158, 55%, 60%)` — green |
| `brand-sky` | `hsl(210, 80%, 65%)` — blue |
| `brand-violet` | `hsl(260, 55%, 68%)` — purple |

### Tints (light pastel / dark muted — adapt to mode)

Each brand color has a tint variant (`tint-coral`, `tint-sun`, etc.) used for card header panels, stat card blobs, and status badge backgrounds. Access via `bg-tint-{color}`.

| Token | Light | Dark |
|---|---|---|
| `tint-coral` | `hsl(4, 80%, 94%)` | `hsl(4, 50%, 22%)` |
| `tint-sun` | `hsl(42, 95%, 92%)` | `hsl(42, 50%, 22%)` |
| `tint-mint` | `hsl(158, 55%, 92%)` | `hsl(158, 40%, 20%)` |
| `tint-sky` | `hsl(210, 80%, 93%)` | `hsl(210, 50%, 22%)` |
| `tint-violet` | `hsl(260, 55%, 94%)` | `hsl(260, 40%, 24%)` |

### Category → Color Mapping

`src/lib/category-theme.ts` maps product types to a `ThemeColor`. `TINT_BG` maps those to `bg-tint-{color}` classes. Use `getTheme(type)` to resolve a color, then `TINT_BG[theme.color]` for the class.

| Type | Color |
|---|---|
| Cleanser, Eye Cream | sky |
| Moisturizer, Treatment | mint |
| Serum, Exfoliant, Ampoule | coral |
| Toner, Mask, Essence | violet |
| Sunscreen, Oil | sun |

### Expiration Status

Defined in `src/types/product.ts`. Status badges use tint backgrounds:

| Status | Color | Badge classes |
|---|---|---|
| fresh | mint | `bg-tint-mint border-brand-mint/30` |
| soon | sun | `bg-tint-sun border-brand-sun/40` |
| expiring | coral | `bg-tint-coral border-brand-coral/40` |
| expired | destructive | `bg-destructive text-destructive-foreground` |

### Typography

- Sans: Geist Sans (`--font-geist-sans`)
- Mono: Geist Mono (`--font-geist-mono`)
- Brand labels: `text-[11px] uppercase tracking-wider font-semibold text-muted-foreground`
- Card titles: `font-semibold text-lg leading-snug`
- Stat values: `text-3xl font-bold leading-none`

### Component Patterns

- **Cards:** `rounded-2xl border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`
- **Stat cards:** `rounded-2xl border bg-card p-5` with a decorative `absolute` tint blob (`h-20 w-20 rounded-full -top-5 -right-5`)
- **Color panels** (card headers): tint background `h-32 overflow-hidden` with absolute status badge `top-3 right-3`
- **Status badges:** `rounded-full border gap-1 font-semibold` with icon + label
- **Search / filter inputs:** `rounded-full`
- **Nav:** `sticky top-0 z-40 border-b bg-background/80 backdrop-blur`
- **Logo mark:** Five overlapping brand-color dots (`-space-x-1.5`, `ring-2 ring-background`)
- **Empty states:** `border border-dashed rounded-2xl bg-card/40 py-20 text-center` with tint icon block
- **Loading skeletons:** `rounded-xl bg-muted/40 animate-pulse`
- **Product grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5`

---

## Feature: Project Pan

"Project pan" is a skincare community term for intentionally using a product until it is completely empty. In Empties:

- Users flag products as project pan targets using an `is_project_pan` boolean
- `percent_remaining` (0–100) tracks how full the product is, updated manually by the user
- The dashboard surfaces all project pan products sorted by closest to empty
- When `percent_remaining` reaches 0, the user sets `date_finished` — the product becomes an "empty"
- Finished products are archived but still counted toward the user's total empties

---

## Supabase Tables

### `products`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users`, RLS enforced |
| `brand` | `text` | Required |
| `name` | `text` | Required |
| `type` | `text` | One of `ProductTypes` enum |
| `date_opened` | `date` | Optional |
| `expiration_date` | `date` | Required on create |
| `date_finished` | `date` | Set when product is panned |
| `price` | `numeric` | Optional |
| `tags` | `text[]` | Optional |
| `notes` | `text` | Optional |
| `percent_remaining` | `integer` | 0–100, defaults to 100 on create |
| `is_project_pan` | `boolean` | defaults to false |

> All queries in `src/services/productService.ts` filter by `user_id` to enforce row-level access on the client side. RLS is also enabled on the table.

> **Note:** `percent_remaining` and `is_project_pan` are planned columns. Run the schema migration before implementing any features that reference them.

### `usage_logs`

> **Note:** Planned table — run the schema migration before implementing any features that reference it.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `product_id` | `uuid` | FK → `products.id`, cascade delete |
| `user_id` | `uuid` | FK → `auth.users`, RLS enforced |
| `logged_at` | `timestamptz` | defaults to `now()` |
| `percent_remaining` | `integer` | Snapshot of fill level at time of log |
| `notes` | `text` | Optional |

---

## Coding Conventions

### General

- **No inline styles** — Tailwind utility classes only.
- **No custom components** when a shadcn/ui primitive exists — compose from primitives.
- Icons exclusively from `lucide-react`.
- Toasts via `sonner` (`toast.success`, `toast.error`).
- Dates handled with `date-fns`; date formatting helpers live in `src/lib/date-utils.ts`.

### Forms

- Every form uses a **Zod schema** for validation.
- Wire schemas to `react-hook-form` via `zodResolver`.
- Inline field errors: `<p className="text-xs text-red-600">{error.message}</p>`.
- Date fields use `<Controller>` wrapping the `DatePicker` sub-component in `product-form.tsx`.

### Data Access

- All Supabase queries go through `src/services/productService.ts`.
- Every service function calls `getAuthenticatedUser()` first and throws if unauthenticated.
- Use `src/utils/supabase/client.ts` (browser) and `src/utils/supabase/server.ts` (server/middleware).

### Client vs Server

- Pages are **server components** by default.
- Add `"use client"` only when the component needs state, effects, or browser APIs.
- Interactive dashboard logic lives in `src/app/dashboard/page.tsx` (client component).

### File Naming

- `kebab-case` for all files and directories.
- Page segments follow Next.js App Router conventions (`page.tsx`, `loading.tsx`, `error.tsx`).

### Product Types

Canonical list in `src/utils/supabase/types.ts` → `ProductTypes` array and `SHELF_LIFE_SUGGESTIONS` map. Always import from there; do not duplicate.
