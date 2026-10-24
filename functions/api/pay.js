// Cloudflare Pages Function: POST /api/pay   —   Razorpay integration
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET  (Cloudflare > project > Settings > Variables and Secrets)
//
// actions:
//   { action: "plans" }   -> list the payment options
//   { action: "create", plan: "advance" }  -> create a Razorpay order (amount comes from here, never from the browser)
//   { action: "verify", razorpay_order_id, razorpay_payment_id, razorpay_signature } -> verify the signature

// ---- payment options (EDIT THESE — amounts are in paise: 100000 = Rs 1000) ----
const PLANS = {
  starter: { label: 'Starter plan', amount: 1599900 },   // Rs 15,999
  growth:  { label: 'Growth plan',  amount: 2999900 },   // Rs 29,999
};

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  const json = (o, s = 200) =>
    new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

  try {
    const host = new URL(request.headers.get('Origin') || 'https://oguva.com').hostname;
    if (!(host === 'oguva.com' || host.endsWith('.oguva.com') || host.endsWith('.pages.dev') || host.endsWith('.workers.dev'))) {
      return json({ error: 'forbidden' }, 403);
    }

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return json({ error: 'not configured' }, 500);

    let body = {};
    try { body = await request.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
    const action = String(body.action || '');

    if (action === 'plans') {
      return json({
        key_id: keyId,
        plans: Object.keys(PLANS).map(k => ({ id: k, label: PLANS[k].label, amount: PLANS[k].amount })),
      });
    }

    if (action === 'create') {
      const plan = PLANS[String(body.plan || '')];
      if (!plan) return json({ error: 'unknown plan' }, 400);
      const auth = 'Basic ' + btoa(keyId + ':' + keySecret);
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ amount: plan.amount, currency: 'INR', receipt: 'of_' + Date.now(), notes: { plan: body.plan } }),
      });
      if (!r.ok) return json({ error: 'razorpay' }, 502);
      const o = await r.json();
      return json({ key_id: keyId, order_id: o.id, amount: o.amount, currency: o.currency, label: plan.label, name: 'Oguva Digital Marketing' });
    }

    if (action === 'verify') {
      const orderId = String(body.razorpay_order_id || '');
      const paymentId = String(body.razorpay_payment_id || '');
      const signature = String(body.razorpay_signature || '');
      if (!orderId || !paymentId || !signature) return json({ error: 'bad request' }, 400);
      const expected = await hmacHex(keySecret, orderId + '|' + paymentId);
      return json({ verified: expected === signature });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e) {
    return json({ error: 'error' }, 500);
  }
}
