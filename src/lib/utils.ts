import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatRuntime(minutes: number | string | undefined): string {
  if (minutes === undefined || minutes === null) return "";
  const mins = typeof minutes === "string" ? parseInt(minutes, 10) : minutes;
  if (isNaN(mins)) return "";
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function formatDate(dateStr: string | number | undefined): string {
  if (!dateStr) return "";
  const str = String(dateStr);
  if (/^\d{4}$/.test(str)) return str;
  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return str; }
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T, delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { fn(...args); timeoutId = null; }, delay);
  };
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 70%, 45%)`;
}
