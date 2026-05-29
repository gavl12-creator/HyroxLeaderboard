# HYROX Analytics Platform

A Next.js MVP for a HYROX gym event analytics platform. It combines a Formula 1-style timing dashboard with Strava-inspired athlete analysis: leaderboard classification, station rankings, position progression, places gained/lost, strengths, weaknesses, and AI-style race summaries.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts

## Features

- Leaderboard page with 50 mock athletes
- Athlete profile pages at `/athletes/[slug]`
- Full HYROX station-by-station splits
- Station leaderboards for every race segment
- Position progression charts
- Places gained and lost during the race
- Strength and weakness analysis per athlete
- Projected best-time model
- AI race summary component using deterministic analytics text
- Dark timing-dashboard UI inspired by Formula 1 race control and Strava activity analytics

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the leaderboard.

## Useful Commands

```bash
npm run build
npm run typecheck
npm run lint
```

## Project Structure

- `app/page.tsx` - leaderboard dashboard route
- `app/athletes/[slug]/page.tsx` - athlete profile route
- `components/DashboardClient.tsx` - charts and leaderboard UI
- `components/AthleteProfileClient.tsx` - athlete analytics UI
- `lib/data.ts` - deterministic mock dataset for 50 athletes
- `lib/analytics.ts` - rankings, progression, strengths, weaknesses, summaries
- `lib/types.ts` - shared TypeScript types

## Notes

This MVP uses mock data and a deterministic summary generator. A production version could add authentication, athlete uploads, Strava API imports, screenshot OCR, a database, and real LLM-generated summaries.
