"use client";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-bold bg-gradient-to-r from-hdhub-400 to-hdhub-600 bg-clip-text text-transparent">404</div>
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => (window.location.href = "/search")}><Search className="mr-2 h-4 w-4" />Search</Button>
          <Button variant="gradient" onClick={() => (window.location.href = "/")}><Home className="mr-2 h-4 w-4" />Go Home</Button>
        </div>
      </div>
    </div>
  );
}
