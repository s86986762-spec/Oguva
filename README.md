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
- Google Analytics tag in every page (`G-5T7Y8QN2Y7`)

## Backend (Cloudflare Pages Functions)
- `functions/api/chat.js` — website AI assistant, `POST /api/chat`
  - Secret required: `ANTHROPIC_API_KEY`
  - KV binding required for rate limiting: `RATE_KV`
  - Limits: 8 msgs / 10s, 15 / hour, 30 / day per visitor

## Cloudflare Pages settings
- Build command: (none) · Build output directory: `/`
- Production branch: `main`
