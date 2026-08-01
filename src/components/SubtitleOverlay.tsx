"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SubtitleOverlay({ subtitleUrl }: { subtitleUrl: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!subtitleUrl) return;
    let cancelled = false;
    fetch(subtitleUrl).then((r) => r.text()).then((content) => {
      if (cancelled) return;
      const lines = content.split("\n").filter((l) => l.trim() && !l.includes("-->") && !/^\d+$/.test(l.trim()) && !l.startsWith("WEBVTT"));
      const textLines = lines.slice(0, 3).join(" ");
      setText(textLines || "Subtitles loaded");
    }).catch(() => { if (!cancelled) setText(null); });
    return () => { cancelled = true; };
  }, [subtitleUrl]);

  if (!text) return null;
  return (
    <div className="absolute bottom-20 left-0 right-0 z-20 flex items-center justify-center px-4 pointer-events-none">
      <div className="inline-block max-w-[80%] text-center rounded-lg bg-black/60 px-4 py-2 text-white text-base drop-shadow-lg">
        {text}
      </div>
    </div>
  );
}
