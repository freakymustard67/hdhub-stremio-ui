"use client";
import { useSettingsStore, type Theme, type SubtitleSize, type SubtitleFont } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SettingsContent() {
  const router = useRouter();
  const { theme, setTheme, subtitleSize, setSubtitleSize, subtitleOpacity, setSubtitleOpacity, streaming, setStreamingPreference, ui, setUIPreference, resetSettings } = useSettingsStore();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  const subtitleSizes: SubtitleSize[] = ["small", "medium", "large", "xlarge"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your streaming experience</p>
        </div>
      </div>

      {/* Theme */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {themes.map((t) => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm", theme === t.value ? "border-hdhub-500 bg-hdhub-600/20 text-hdhub-300" : "border-border hover:border-hdhub-500/30")}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Subtitles */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Subtitles</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Size</label>
            <div className="flex gap-2">
              {subtitleSizes.map((s) => (
                <button key={s} onClick={() => setSubtitleSize(s)}
                  className={cn("px-3 py-1.5 rounded-lg border text-sm capitalize transition-all", subtitleSize === s ? "border-hdhub-500 bg-hdhub-600/20 text-hdhub-300" : "border-border")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Opacity: {Math.round(subtitleOpacity * 100)}%</label>
            <input type="range" min={0} max={1} step={0.05} value={subtitleOpacity} onChange={(e) => setSubtitleOpacity(parseFloat(e.target.value))}
              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hdhub-500" />
          </div>
        </div>
      </section>

      {/* Streaming */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Streaming</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm">Auto-play next episode</span>
            <input type="checkbox" checked={streaming.autoPlayNext} onChange={(e) => setStreamingPreference("autoPlayNext", e.target.checked)}
              className="rounded border-border accent-hdhub-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Hardware acceleration</span>
            <input type="checkbox" checked={streaming.hardwareAcceleration} onChange={(e) => setStreamingPreference("hardwareAcceleration", e.target.checked)}
              className="rounded border-border accent-hdhub-500" />
          </label>
        </div>
      </section>

      {/* Reset */}
      <div className="pt-4 border-t border-border">
        <Button variant="outline" onClick={resetSettings}>Reset all settings</Button>
      </div>
    </div>
  );
}
