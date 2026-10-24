# Oguva Digital Marketing - website

Static website for **oguva.com**, deployed on Cloudflare Pages (auto-deploys from this repo).

## Pages
- `index.html` - home
- `about.html`, `services.html`, `contact.html`, `faq.html`

## Assets
- `hero.webp` / `hero.jpg`, `og-image.png`, favicon
- `oguva-ai-mascot.svg` - the AI assistant mascot icon

## SEO
- `robots.txt`, `sitemap.xml`, Google Analytics in every page

## Backend (Cloudflare Pages Functions)
- `functions/api/chat.js` - the website AI assistant (`POST /api/chat`)
- `functions/api/lead.js` - contact-form leads (`POST /api/lead`)
- `functions/api/pay.js`  - Razorpay checkout (`POST /api/pay`)

### Secrets / bindings (Cloudflare > project > Settings)
- `ANTHROPIC_API_KEY`   (secret) - the AI chat
- `GOOGLE_MAPS_API_KEY` (secret) - the Maps lookup tool
- `LEAD_WEBHOOK_URL`    (secret) - forwards leads to Zoho Flow (automation)
- `RAZORPAY_KEY_ID`     (secret) - Razorpay key id
- `RAZORPAY_KEY_SECRET` (secret) - Razorpay key secret
- `RATE_KV`             (KV binding) - rate limiting + saved leads

## Cloudflare Pages settings
- Build command: (none) · Build output directory: `/`
- Production branch: `main`

## Deploy note
After adding or changing a secret or binding, trigger a new deployment (push a commit, or Deployments > Retry).
