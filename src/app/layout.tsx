import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "HDHub Stream — Premium Movie & Series Streaming", template: "%s | HDHub Stream" },
  description: "Browse, search, and stream high-quality movies and series powered by the HDHub Stremio addon.",
  openGraph: { type: "website", siteName: "HDHub Stream", title: "HDHub Stream", description: "Browse, search, and stream high-quality movies and series powered by the HDHub Stremio addon." },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0f0f1a" }, { media: "(prefers-color-scheme: light)", color: "#ffffff" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('hdhub-settings-storage');if(t){var p=JSON.parse(t).state;if(p.theme==='dark'||(!p.theme&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');}else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark');}catch(e){}})();`,
        }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ReactQueryProvider><ThemeProvider>{children}</ThemeProvider></ReactQueryProvider>
      </body>
    </html>
  );
}
