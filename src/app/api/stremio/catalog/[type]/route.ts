import { NextRequest, NextResponse } from "next/server";
import { HDHUB_DEFAULT_URL } from "@/lib/constants";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const sp = new URL(request.url).searchParams;

  // Fetch the manifest to discover the correct catalog ID for this type
  let catalogId = `hdhub-${type}`;
  try {
    const manifestRes = await fetch(`${HDHUB_DEFAULT_URL}/manifest.json`, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (manifestRes.ok) {
      const manifest = await manifestRes.json();
      if (manifest.catalogs && Array.isArray(manifest.catalogs)) {
        const matched = manifest.catalogs.find((c: { type: string }) => c.type === type);
        if (matched?.id) catalogId = matched.id;
      }
    }
  } catch {
    // Fall back to hdhub-{type}
  }

  const extra: string[] = [];
  const search = sp.get("search");
  const genre = sp.get("genre");
  const skip = sp.get("skip");
  if (search) extra.push(`search=${encodeURIComponent(search)}`);
  if (genre) extra.push(`genre=${encodeURIComponent(genre)}`);
  if (skip) extra.push(`skip=${skip}`);
  const extraPath = extra.length > 0 ? `/${extra.join("/")}` : "";
  const catalogUrl = `${HDHUB_DEFAULT_URL}/catalog/${type}/${catalogId}${extraPath}.json`;

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    const response = await fetch(catalogUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: search ? "no-store" : "force-cache",
    });
    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": search ? "no-cache" : "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 502 },
    );
  }
}
