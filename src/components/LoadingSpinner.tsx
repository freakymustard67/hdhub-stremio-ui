"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = "md", label, fullPage = false, className }: {
  size?: "sm" | "md" | "lg" | "xl"; label?: string; fullPage?: boolean; className?: string;
}) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12" };
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-hdhub-500", sizeMap[size])} />
      {label && <p className="text-sm text-muted-foreground animate-pulse">{label}</p>}
    </div>
  );
  if (fullPage) return <div className="flex min-h-[50vh] items-center justify-center">{content}</div>;
  return content;
}
