// Cloudflare Pages Function: GET /api/chat-health
// Tells you what the chat is configured with, and (with ?ping=1) tests both providers.
// Never returns any key value - only whether each one is set.

export async function onRequestGet({ request, env }) {
  const out = {
    config: {
      AI_binding: !!env.AI,
      XAI_API_KEY: !!env.XAI_API_KEY,
      AI_MODEL: env.AI_MODEL || '@cf/openai/gpt-oss-120b',
      XAI_MODEL: env.XAI_MODEL || 'grok-4.3',
      GOOGLE_MAPS_API_KEY: !!env.GOOGLE_MAPS_API_KEY,
      LEAD_WEBHOOK_URL: !!env.LEAD_WEBHOOK_URL,
      RATE_KV: !!env.RATE_KV,
      RAZORPAY_KEY_ID: !!env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: !!env.RAZORPAY_KEY_SECRET,
    },
  };

  if (new URL(request.url).searchParams.get('ping')) {
    const msgs = [{ role: 'user', content: 'Reply with the single word: ok' }];

    // 1) Cloudflare Workers AI (free tier)
    try {
      if (!env.AI) throw new Error('no AI binding');
      const r = await env.AI.run(out.config.AI_MODEL, { messages: msgs, max_tokens: 12 });
      out.workers_ai = { ok: true, shape: JSON.stringify(r).slice(0, 400) };
    } catch (e) {
      out.workers_ai = { ok: false, error: String((e && e.message) || e).slice(0, 400) };
    }

    // 2) xAI (Grok) - raw response so the real error is visible
    try {
      if (!env.XAI_API_KEY) throw new Error('no XAI_API_KEY');
      const r = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.XAI_API_KEY },
        body: JSON.stringify({ model: out.config.XAI_MODEL, messages: msgs, max_tokens: 12 }),
      });
      const body = await r.text();
      out.xai = { ok: r.ok, status: r.status, body: body.slice(0, 600) };
    } catch (e) {
      out.xai = { ok: false, error: String((e && e.message) || e).slice(0, 400) };
    }
  } else {
    out.hint = 'Add ?ping=1 to this URL to test both providers.';
  }

  return new Response(JSON.stringify(out, null, 1), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
