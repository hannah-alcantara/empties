"use client";

import { Plus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProductForm } from "./product-form-provider";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "My Shelf",    href: "/dashboard" },
  { label: "Project Pan", href: "/project-pan" },
  { label: "Empties",     href: "/empties" },
] as const;

export const MainNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { openAdd } = useProductForm();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Derive initials from email
  const initials = user?.email ? user.email[0].toUpperCase() : null;

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex -space-x-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-brand-coral ring-2 ring-background transition-transform duration-200 group-hover:scale-110" />
            <span className="h-3.5 w-3.5 rounded-full bg-brand-sun  ring-2 ring-background transition-transform duration-200 group-hover:scale-110 delay-[25ms]" />
            <span className="h-3.5 w-3.5 rounded-full bg-brand-mint ring-2 ring-background transition-transform duration-200 group-hover:scale-110 delay-[50ms]" />
            <span className="h-3.5 w-3.5 rounded-full bg-brand-sky  ring-2 ring-background transition-transform duration-200 group-hover:scale-110 delay-[75ms]" />
            <span className="h-3.5 w-3.5 rounded-full bg-brand-violet ring-2 ring-background transition-transform duration-200 group-hover:scale-110 delay-[100ms]" />
          </div>
          <span className="font-bold text-lg tracking-tight">Empties</span>
        </Link>

        {/* Nav links — desktop only */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                pathname === href && "text-foreground bg-accent"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button onClick={openAdd} size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Button>

              {/* Avatar + sign-out */}
              <div className="flex items-center gap-1.5">
                <div
                  className="h-8 w-8 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-xs font-bold text-brand-violet"
                  title={user.email}
                >
                  {initials}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {!user && (
            <Button asChild size="sm" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
