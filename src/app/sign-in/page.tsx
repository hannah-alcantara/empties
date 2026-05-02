import { SignInForm } from "@/components/sign-in-form";
import Link from "next/link";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex justify-center pt-12 px-4">

<div className="relative z-10 w-full max-w-sm space-y-6">

        {/* Logo mark + heading */}
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="flex -space-x-1.5 hover:opacity-80 transition-opacity">
            <span className="h-4 w-4 rounded-full bg-brand-coral ring-2 ring-background" />
            <span className="h-4 w-4 rounded-full bg-brand-sun   ring-2 ring-background" />
            <span className="h-4 w-4 rounded-full bg-brand-mint  ring-2 ring-background" />
            <span className="h-4 w-4 rounded-full bg-brand-sky   ring-2 ring-background" />
            <span className="h-4 w-4 rounded-full bg-brand-violet ring-2 ring-background" />
          </Link>
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your shelf
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
