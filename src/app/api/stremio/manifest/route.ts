import { NextResponse } from "next/server";
import { HDHUB_DEFAULT_URL, DEFAULT_CACHE_TTL } from "@/lib/constants";

export async function GET() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${HDHUB_DEFAULT_URL}/manifest.json`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });
    return NextResponse.json(await response.json(), {
      headers: { "Cache-Control": `public, max-age=${DEFAULT_CACHE_TTL}` },
    });
  } catch (error) {
    return NextResponse.json({ error: `Failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 502 });
  }
}
