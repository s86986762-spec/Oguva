# Oguva Digital Marketing - website

Static website for **oguva.com**, deployed on Cloudflare Pages (auto-deploys from this repo).

## Pages
- `index.html` - home
- `about.html`, `services.html`, `contact.html`, `faq.html`, `pricing.html`
- `sw.js` - service worker (offline + instant repeat visits)

## Assets
- `hero.webp` / `hero.jpg`, `og-image.png`, favicon
- `oguva-ai-mascot.svg` - the AI assistant mascot icon
- `styles.css` - all CSS + the web font (one cached file)

## SEO
- `robots.txt`, `sitemap.xml`, Google Analytics in every page
- `_headers` (caching + security), `_redirects` (/pricing)

## Backend (Cloudflare Pages Functions)
- `functions/api/chat.js` - the website AI assistant (`POST /api/chat`)
- `functions/api/lead.js` - contact-form leads (`POST /api/lead`)
- `functions/api/pay.js`  - Razorpay checkout (`POST /api/pay`)

## The AI chat uses a free-first model chain
1. **Cloudflare Workers AI** (free tier, 10,000 Neurons/day) - needs the `AI` binding
2. **xAI (Grok)** - paid fallback when the free tier is exhausted

### Secrets / bindings (Cloudflare > project > Settings)
Type **Secret** unless noted, with a value, for the **Production** environment:
- `ANTHROPIC_API_KEY`    - (no longer used; can be deleted)
- `GOOGLE_MAPS_API_KEY`  - the Maps lookup tool
- `LEAD_WEBHOOK_URL`     - forwards leads to Zoho Flow (automation)
- `RAZORPAY_KEY_ID`      - Razorpay key id
- `RAZORPAY_KEY_SECRET`  - Razorpay key secret
- `XAI_API_KEY`          - xAI (Grok) fallback key
- `XAI_MODEL` (optional) - defaults to `grok-4.3`
- `AI_MODEL` (optional)  - defaults to `@cf/openai/gpt-oss-120b`
- `AI` (Workers AI **binding**, not a secret) - the free model tier
- `RATE_KV` (KV binding) - rate limiting + saved leads

## Cloudflare Pages settings
- Build command: (none) - Build output directory: `/`
- Production branch: `main`

## Deploy note
After adding or changing a secret or binding, trigger a new deployment (push a commit, or Deployments > Retry).
