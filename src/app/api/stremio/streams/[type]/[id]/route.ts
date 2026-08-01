import { NextResponse } from "next/server";
import { HDHUB_DEFAULT_URL } from "@/lib/constants";

export async function GET(_request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!type || !id) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  try {
    const url = `${HDHUB_DEFAULT_URL}/stream/${type}/${encodeURIComponent(id)}.json`;
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-cache, max-age=300" } });
  } catch (error) {
    return NextResponse.json({ error: `Failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 502 });
  }
}
