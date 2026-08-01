"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Monitor, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PlayerStreamQuality } from "@/types/stremio";

export function QualitySelector({ qualities, currentQuality, onQualityChange, isOpen, onToggle, className }: {
  qualities: PlayerStreamQuality[]; currentQuality: string; onQualityChange: (q: string) => void;
  isOpen: boolean; onToggle: () => void; className?: string;
}) {
  if (qualities.length <= 1) return null;
  return (
    <div className={cn("relative", className)}>
      <Button variant="ghost" size="icon-sm" onClick={onToggle} className="text-white/70 hover:text-white hover:bg-white/10 gap-1">
        <Monitor className="h-4 w-4" /><span className="text-xs">{currentQuality}</span><ChevronDown className="h-3 w-3" />
      </Button>
      <AnimatePresence>{isOpen && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full right-0 mb-2 min-w-[140px] rounded-lg border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-1">{qualities.map((q) => {
            const isActive = q.label === currentQuality;
            return (
              <button key={q.label} onClick={() => { onQualityChange(q.label); onToggle(); }}
                className={cn("flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-hdhub-600/20 text-hdhub-300" : "text-foreground hover:bg-accent")}>
                <span>{q.label}</span>
                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}</div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
