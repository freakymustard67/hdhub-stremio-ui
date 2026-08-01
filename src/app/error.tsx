"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">An unexpected error occurred. Please try again or return home.</p>
        {process.env.NODE_ENV === "development" && (
          <details className="rounded-lg border border-border bg-card p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">Error Details</summary>
            <pre className="mt-2 overflow-auto text-xs text-destructive whitespace-pre-wrap">{error.message}</pre>
          </details>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => (window.location.href = "/")}><Home className="mr-2 h-4 w-4" />Go Home</Button>
          <Button variant="gradient" onClick={reset}><RefreshCw className="mr-2 h-4 w-4" />Try Again</Button>
        </div>
      </div>
    </div>
  );
}
