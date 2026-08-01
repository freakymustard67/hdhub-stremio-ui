# HDHub Stremio UI 🎬

A modern web interface for browsing and streaming content via the HDHub Stremio addon. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Browse Catalogs** — Movies and series organized by genre
- **Search** — Find content across the HDHub catalog
- **Stream Player** — Built-in video player with quality selection
- **Subtitle Overlay** — Custom subtitle support
- **Responsive Design** — Works on desktop and mobile

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **React Query** for data fetching
- **Zustand** for state management

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment

Copy `.env.example` to `.env.local` and configure:

```
NEXT_PUBLIC_HDHUB_URL=https://your-hdhub-addon-url
```

## Build

```bash
npm run build
npm start
```
