import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { baseUrl, apiKey, mode } = await req.json();

    if (!baseUrl) {
      return new Response(JSON.stringify({ ok: false, message: "缺少接口地址" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const cleanBase = baseUrl.replace(/\/+$/, "");
    let url: string;
    let method = "GET";
    let headers: Record<string, string> = {};

    if (mode === "chat" || mode === "image") {
      // Try /models endpoint first (OpenAI compatible)
      url = `${cleanBase}/models`;
      headers["Authorization"] = `Bearer ${apiKey || ""}`;
    } else if (mode === "voice") {
      // For voice, just check if the base URL is reachable
      url = cleanBase;
      method = "HEAD";
    } else {
      url = `${cleanBase}/models`;
      headers["Authorization"] = `Bearer ${apiKey || ""}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, { method, headers, signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      return new Response(JSON.stringify({ ok: true, message: "连接成功" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: false, message: `HTTP ${res.status}` }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return new Response(JSON.stringify({ ok: false, message: msg.includes("abort") ? "请求超时" : msg }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
