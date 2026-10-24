// Cloudflare Pages Function: POST /api/lead
// Receives website form submissions and forwards them to LEAD_WEBHOOK_URL (e.g. a Zoho Flow webhook).
// Bindings: RATE_KV (optional) for rate limiting + a local copy of leads.
// Secret:   LEAD_WEBHOOK_URL (optional) - where leads are forwarded.

export async function onRequestPost({ request, env }) {
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  try {
    const host = new URL(request.headers.get('Origin') || 'https://oguva.com').hostname;
    if (!(host === 'oguva.com' || host.endsWith('.oguva.com') || host.endsWith('.pages.dev') || host.endsWith('.workers.dev'))) {
      return json({ error: 'forbidden' }, 403);
    }

    let body = {};
    try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

    const lead = {
      name: String(body.name || '').slice(0, 120).trim(),
      phone: String(body.phone || '').slice(0, 40).trim(),
      email: String(body.email || '').slice(0, 160).trim(),
      need: String(body.need || '').slice(0, 500).trim(),
      source: String(body.source || 'contact-form').slice(0, 40),
      at: new Date().toISOString(),
    };
    if (!lead.name && !lead.phone) return json({ error: 'empty' }, 400);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const KV = env.RATE_KV;
    if (KV && ip) {
      try {
        const key = 'rl2:' + ip;
        const n = Number(await KV.get(key)) || 0;
        if (n >= 20) return json({ error: 'rate_limited' }, 429);
        await KV.put(key, String(n + 1), { expirationTtl: 3600 });
      } catch (e) {}
    }

    let forwarded = false;
    if (env.LEAD_WEBHOOK_URL) {
      try {
        const r = await fetch(env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        forwarded = r.ok;
      } catch (e) { forwarded = false; }
    }

    if (KV) {
      try {
        await KV.put('lead:' + Date.now() + ':' + Math.random().toString(36).slice(2, 8), JSON.stringify(lead),
          { expirationTtl: 60 * 60 * 24 * 180 });
      } catch (e) {}
    }

    return json({ ok: true, forwarded: forwarded });
  } catch (e) {
    return json({ error: 'error' }, 500);
  }
}
