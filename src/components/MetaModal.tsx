"use client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GENRE_COLORS } from "@/lib/constants";
import type { StremioMetaPreview, StremioMetaDetail } from "@/types/stremio";

interface MetaModalProps {
  item: StremioMetaPreview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MetaModal({ item, open, onOpenChange }: MetaModalProps) {
  // Simple implementation — full version is on the detail page
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => onOpenChange(false)}>
      <div className="bg-card rounded-xl border border-border p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-2">{item.name}</h2>
        <p className="text-sm text-muted-foreground mb-4">{item.description || "No description available."}</p>
        <div className="flex gap-2">
          <Badge variant="quality">{item.type}</Badge>
          {item.year && <Badge variant="outline">{item.year}</Badge>}
          {item.imdbRating && <Badge variant="rating">{item.imdbRating}</Badge>}
        </div>
      </div>
    </div>
  );
}
