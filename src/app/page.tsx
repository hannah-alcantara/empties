"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  LogIn,
  Layers,
  CalendarClock,
  Flame,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Layers,
    iconColor: "text-brand-sky",
    bgColor: "bg-tint-sky",
    borderColor: "border-brand-sky/30",
    label: "Shelf tracking",
  },
  {
    icon: CalendarClock,
    iconColor: "text-brand-coral",
    bgColor: "bg-tint-coral",
    borderColor: "border-brand-coral/30",
    label: "Expiry alerts",
  },
  {
    icon: Flame,
    iconColor: "text-brand-mint",
    bgColor: "bg-tint-mint",
    borderColor: "border-brand-mint/30",
    label: "Project Pan",
  },
] as const;

const LEGEND = [
  { color: "bg-brand-coral", label: "Serum" },
  { color: "bg-brand-sun", label: "Sunscreen" },
  { color: "bg-brand-mint", label: "Moisturizer" },
  { color: "bg-brand-sky", label: "Cleanser" },
  { color: "bg-brand-violet", label: "Toner" },
];

export default function Home() {
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-center min-h-[calc(100vh-8rem)]">

      {/* Left: copy */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="font-bold text-5xl md:text-6xl leading-[1.05] tracking-tight">
            Your shelf,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">organized.</span>
              <span
                className="absolute bottom-1.5 left-0 right-0 h-3 bg-brand-sun/40 -z-0 rounded"
                aria-hidden
              />
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Track every cleanser, serum, and SPF. Know what to use, what&apos;s
            expiring, and when to restock.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {FEATURES.map(({ icon: Icon, iconColor, bgColor, borderColor, label }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${bgColor} ${borderColor}`}
            >
              <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              {label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              <Plus className="h-5 w-5" />
              Get started free
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">
              <LogIn className="h-5 w-5" />
              Sign in
            </Link>
          </Button>
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {LEGEND.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Right: overlapping brand circles — logo mark, scaled up */}
      <div className="hidden lg:flex items-center justify-center overflow-hidden">
        <div className="flex -space-x-14">
          <span className="h-36 w-36 rounded-full bg-brand-coral ring-4 ring-background" />
          <span className="h-36 w-36 rounded-full bg-brand-sun   ring-4 ring-background" />
          <span className="h-36 w-36 rounded-full bg-brand-mint  ring-4 ring-background" />
          <span className="h-36 w-36 rounded-full bg-brand-sky   ring-4 ring-background" />
          <span className="h-36 w-36 rounded-full bg-brand-violet ring-4 ring-background" />
        </div>
      </div>

    </div>
  );
}
