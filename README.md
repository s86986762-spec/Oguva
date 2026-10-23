# Oguva Digital Marketing — website

Static website for **oguva.com**, deployed on Cloudflare Pages (auto-deploys from this repo).

## Pages
- `index.html` — home
- `about.html`, `services.html`, `contact.html`, `faq.html`

## Assets
- `hero.webp` / `hero.jpg` — home hero image
- `og-image.png` — social share image (1200x630)
- `oguva-video.mp4` / `oguva-video-poster.jpg` — home video

## SEO
- `robots.txt`, `sitemap.xml`
- Google Analytics tag in every page (G-5T7Y8QN2Y7)

## Backend (Cloudflare Pages Functions)
`functions/api/chat.js` — the website AI assistant, `POST /api/chat`

Secrets and bindings required (Cloudflare > project > Settings):
- `ANTHROPIC_API_KEY` (secret) — required for the chat
- `GOOGLE_MAPS_API_KEY` (secret) — for the Google Maps lookup tool
- `RATE_KV` (KV namespace binding) — per-visitor rate limiting + saved leads

Tools the assistant can use: `check_website`, `check_google_maps`, `save_lead`.
Rate limits: 8 msgs / 10s, 15 / hour, 30 / day per visitor.

## Cloudflare Pages settings
- Build command: (none) · Build output directory: `/`
- Production branch: `main`
