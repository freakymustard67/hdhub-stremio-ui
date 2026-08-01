"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HERO_CAROUSEL_MAX } from "@/lib/constants";
import type { StremioMetaPreview } from "@/types/stremio";

export function HeroCarousel({ items }: { items: StremioMetaPreview[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const visibleItems = items.slice(0, HERO_CAROUSEL_MAX);

  const goTo = useCallback((index: number, dir: number) => { setDirection(dir); setCurrentIndex(index); }, []);
  const goNext = useCallback(() => goTo((currentIndex + 1) % visibleItems.length, 1), [currentIndex, visibleItems.length, goTo]);
  const goPrev = useCallback(() => goTo((currentIndex - 1 + visibleItems.length) % visibleItems.length, -1), [currentIndex, visibleItems.length, goTo]);

  useEffect(() => {
    if (isPaused || visibleItems.length <= 1) return;
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [goNext, isPaused, visibleItems.length]);

  const item = visibleItems[currentIndex];
  if (!item || visibleItems.length === 0) return null;

  return (
    <div className="relative h-[55vh] min-h-[400px] md:min-h-[500px] w-full overflow-hidden rounded-xl" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={item.id} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.7 }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hdhub-950 via-background to-hdhub-900" />
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: item.background ? `url(${item.background})` : item.poster ? `url(${item.poster})` : undefined }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-6 pb-12 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div key={item.id + "-content"} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-2xl space-y-4">
              <Badge variant="quality" className="text-xs">{item.type === "movie" ? "Movie" : "Series"}</Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-shadow-lg leading-tight">{item.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                {item.year && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{item.year}</span>}
                {item.imdbRating && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" />{item.imdbRating}</span>}
              </div>
              {item.description && <p className="text-sm md:text-base text-white/70 line-clamp-3 max-w-xl text-shadow">{item.description}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="gradient" size="lg" className="gap-2" onClick={() => router.push(`/meta/${item.type}/${item.id}`)}><Play className="h-5 w-5 fill-current" />Play Now</Button>
                <Button variant="secondary" size="lg" className="gap-2" onClick={() => router.push(`/meta/${item.type}/${item.id}`)}><Info className="h-5 w-5" />More Info</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {visibleItems.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all" aria-label="Previous"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all" aria-label="Next"><ChevronRight className="h-6 w-6" /></button>
        </>
      )}
      {visibleItems.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
          {visibleItems.map((v, i) => (
            <button key={v.id} onClick={() => goTo(i, i > currentIndex ? 1 : -1)}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-hdhub-500" : "w-2 bg-white/40 hover:bg-white/60"}`}
              aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
