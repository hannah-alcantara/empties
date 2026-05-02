"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <AlertTriangle className='h-12 w-12 text-destructive' />
          </div>
          <CardTitle className='text-2xl'>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            An unexpected error occurred. Please try again or return home.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Button onClick={reset}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Button variant='outline' asChild>
              <Link href='/'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
