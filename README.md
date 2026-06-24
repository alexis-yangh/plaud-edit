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
