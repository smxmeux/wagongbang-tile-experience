const allowedIds = new Set(["cloth", "stitch", "knife", "seal", "outer", "finger", "fingerprint"]);

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing");
  return { url, key };
}

export async function GET() {
  try {
    const { url, key } = supabaseConfig();
    const response = await fetch(`${url}/rest/v1/trace_points?select=id,u,v`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; u?: number; v?: number };
    if (!body.id || !allowedIds.has(body.id) || !Number.isFinite(body.u) || !Number.isFinite(body.v) || body.u! < 0 || body.u! > 1 || body.v! < 0 || body.v! > 1) {
      return Response.json({ error: "Invalid trace point" }, { status: 400 });
    }
    const { url, key } = supabaseConfig();
    const response = await fetch(`${url}/rest/v1/trace_points?id=eq.${encodeURIComponent(body.id)}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ u: body.u, v: body.v, updated_at: new Date().toISOString() }),
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
