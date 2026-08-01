"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Film, Tv, Settings, Sun, Moon, Menu, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, debounce } from "@/lib/utils";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSearch } from "@/hooks/useStremio";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults } = useSearch(searchQuery, searchQuery.length >= 2);

  const handleSearch = debounce((value: any) => setSearchQuery(String(value)), SEARCH_DEBOUNCE_MS);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setIsSearchOpen(false); }
  };

  const toggleTheme = () => {
    const themes: Array<"dark" | "light" | "system"> = ["dark", "light", "system"];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length] ?? "dark");
  };

  return (
    <header className={cn("sticky top-0 z-40 w-full transition-all duration-300", isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent")}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-hdhub-500 to-hdhub-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-hdhub-300 to-hdhub-100 bg-clip-text text-transparent">HDHub</span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => router.push("/catalog/movie")} className="gap-2"><Film className="h-4 w-4" />Movies</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/catalog/series")} className="gap-2"><Tv className="h-4 w-4" />Series</Button>
          </nav>
          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative">
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.form initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleSearchSubmit}>
                    <Input autoFocus placeholder="Search movies & series..." leftIcon={<Search className="h-4 w-4" />} showClearButton onClear={() => { setSearchQuery(""); setIsSearchOpen(false); }} onChange={(e) => handleSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setIsSearchOpen(false); }} className="w-full" />
                    {searchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-2 w-full rounded-lg border border-border bg-popover shadow-xl overflow-hidden z-50">
                        <div className="max-h-80 overflow-y-auto">
                          {searchResults.slice(0, 8).map((item) => (
                            <button key={item.id} onClick={() => { router.push(`/meta/${item.type}/${item.id}`); setIsSearchOpen(false); setSearchQuery(""); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors">
                              {item.poster ? <img src={item.poster} alt="" className="h-10 w-7 rounded object-cover" /> : <div className="h-10 w-7 rounded bg-muted flex items-center justify-center"><Film className="h-4 w-4 text-muted-foreground" /></div>}
                              <div className="flex-1 text-left">
                                <p className="font-medium text-foreground truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.type === "movie" ? "Movie" : "Series"}{item.year && ` • ${item.year}`}</p>
                              </div>
                            </button>
                          ))}
                          {searchResults.length > 8 && (
                            <button onClick={() => { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setIsSearchOpen(false); }} className="w-full px-4 py-3 text-sm text-hdhub-400 hover:bg-accent transition-colors border-t border-border">
                              View all {searchResults.length} results
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.form>
                ) : null}
              </AnimatePresence>
              {!isSearchOpen && <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} aria-label="Open search"><Search className="h-5 w-5" /></Button>}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Theme: ${theme}`}>
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/settings")} aria-label="Settings"><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border/50">
              <div className="py-3 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/catalog/movie")}><Film className="h-4 w-4" />Movies</Button>
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/catalog/series")}><Tv className="h-4 w-4" />Series</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
