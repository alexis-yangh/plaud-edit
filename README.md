# Plaud Edit

Internal AI copy tool for the Plaud Localization team. Generate on-brand copy from a brief, or audit existing copy against Plaud's brand voice.

## Features

- **Generate** — fill in a brief and stream AI-generated copy for ads, landing pages, EDMs, PR, and product descriptions
- **Audit** — paste any draft and get a brand voice score, issue breakdown, and suggested rewrite

## Access

Login credentials are shared internally. Contact the Localization team.

## Local Development

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` with your API credentials:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ANTHROPIC_VERTEX_BASE_URL=https://llm-proxy-global.nicebuild.click/api/proxy/v1/models/claude
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude via company proxy

## Deployment

Deployed on Vercel. Environment variables are configured in the Vercel dashboard — never commit `.env.local`.

## Changelog

### v0.3 — 2026-06-24
- Switched API routes to Edge runtime for improved compatibility
- Added detailed error logging and `/api/health` diagnostic endpoint
- Fixed env var configuration on Vercel (both `ANTHROPIC_API_KEY` and `ANTHROPIC_VERTEX_BASE_URL`)

### v0.2 — 2026-06-24
- Renamed project from `plaud-copy-tool` to **Plaud Edit**
- Replaced bottom floating nav pill with sticky top header
- Redesigned content-type selector as horizontal chips with Landing Page sub-group (Hero / Full Page)
- Removed Beta badges from all content types
- Fixed login page text contrast (white text on dark background)
- Fixed audit rewrite output to preserve line breaks
- Replaced Vertex SDK with direct `fetch` calls to fix Vercel compatibility

### v0.1 — Initial release
- Generate mode: stream AI copy from a brief across 5 content types (Ad Suite, Landing Page, EDM, PR, Product)
- Audit mode: score any draft against Plaud brand voice with issue breakdown and suggested rewrite
- Login-protected with shared team credentials
- Plaud brand design system (warm tones, custom logo, gradient CTA)
