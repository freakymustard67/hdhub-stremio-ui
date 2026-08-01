import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get("url");
  if (!streamUrl) return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });

  try {
    new URL(streamUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);
    const response = await fetch(streamUrl, { headers, signal: AbortSignal.timeout(30000) });
    if (!response.ok && response.status !== 206) return NextResponse.json({ error: `HTTP ${response.status}` }, { status: response.status });

    const proxyHeaders = new Headers();
    const ct = response.headers.get("content-type");
    if (ct) proxyHeaders.set("Content-Type", ct);
    const cl = response.headers.get("content-length");
    if (cl) proxyHeaders.set("Content-Length", cl);
    const cr = response.headers.get("content-range");
    if (cr) proxyHeaders.set("Content-Range", cr);
    const ar = response.headers.get("accept-ranges");
    if (ar) proxyHeaders.set("Accept-Ranges", ar);
    proxyHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(response.body, { status: response.status, statusText: response.statusText, headers: proxyHeaders });
  } catch (error) {
    return NextResponse.json({ error: `Proxy failed: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS", "Access-Control-Allow-Headers": "Range, Content-Type" } });
}
