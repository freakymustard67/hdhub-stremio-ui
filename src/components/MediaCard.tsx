"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Star, Calendar, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StremioMetaPreview } from "@/types/stremio";

export function MediaCard({ item, index = 0, type }: { item: StremioMetaPreview; index?: number; type?: string }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const posterUrl = item.poster;
  const hasValidImage = posterUrl && !imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/meta/${item.type || type}/${item.id}`)}
    >
      <div className={cn("relative overflow-hidden rounded-lg bg-card border border-border/50 transition-all duration-300 card-hover shadow-lg shadow-black/10 aspect-[2/3]")}>
        {hasValidImage ? (
          <img src={posterUrl} alt={item.name} loading="lazy" onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
            <Film className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <h3 className="text-sm font-semibold text-white text-shadow line-clamp-2 leading-tight">{item.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70">
            {item.year && <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{item.year}</span>}
            {item.imdbRating && <span className="flex items-center gap-0.5 text-yellow-400"><Star className="h-3 w-3 fill-current" />{item.imdbRating}</span>}
            <Badge variant="quality" className="text-[10px] px-1.5 py-0">{item.type || type === "movie" ? "Movie" : "Series"}</Badge>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-hdhub-600/90 shadow-lg shadow-hdhub-600/30"
          >
            <Play className="ml-0.5 h-6 w-6 text-white fill-current" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
