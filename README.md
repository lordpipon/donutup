# DonutUp

A DonutSMP-style **arcade** built with Next.js — 28 original mini-games, a simulated wallet, daily rewards, rakeback, a local leaderboard and a provably-fair-style RNG.

> **Play money only.** DonutUp is a demo. Coins are fake, balances live in your own browser, deposits and withdrawals are buttons that edit a number, and there is no payment processor, cash-out, or Minecraft account involved. Nothing here can be bought, sold, or withdrawn. Not affiliated with DonutSMP.

## What's inside

- **28 games** — Cases, Flip, Mines Duel, Uno, Connect Four, Case Battles, Mines, Towers, Floor is Lava, Draw, Rock Paper Scissors, Stripmine, Upgrader, Coinflip, Blackjack, Dice, Hi-Lo, Limbo, Plinko, Crash, Double, Roulette, Pig Race, Stocks, Slide, Keno, Snakes, Chicken.
- **Simulated wallet** — instant demo credit, simulated withdrawal, transaction history, free top-up.
- **Rewards** — daily bonus, 1% rakeback on wagers, daily race standings, referral code.
- **Provably-fair-style RNG** — deterministic `xmur3 + sfc32` seeded from a stored server seed, client seed and nonce. The `/fair` page lets you inspect and verify rolls.
- **Local demo accounts** — username + password shape validation, no email, no server, passwords are never stored.
- **Demo chat** — simulated chat with other "players" and a coin-rain button.
- **Fully responsive** — custom CSS design system, no UI framework.

## Tech stack

- [Next.js 16](https://nextjs.org) App Router + React 19
- TypeScript
- Hand-written CSS (`src/app/globals.css`)
- `localStorage` for all state — no database, no API routes, no environment variables
- Deploys to [Vercel](https://vercel.com) as a fully static site

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production build:

```bash
npm run build
npm start
```

Lint and type-check:

```bash
npm run lint
npx tsc --noEmit
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo.
3. Keep the detected settings (Framework: Next.js, build command `npm run build`).
4. Deploy. No environment variables or external services are required.

Every route is statically prerendered (`/games/[slug]` uses `generateStaticParams`), so it also works on any static host that supports Next.js output.

## How the demo works

- All state is stored under the `donutup.state.v1` key in `localStorage` and is per-browser. Clearing site data resets everything.
- Starting balance is **5,000 demo coins**. The wallet page can add or remove demo coins at any time.
- Bets deduct from the local balance; wins credit a payout. There is no real ledger.
- Seeds are stored alongside state so the fairness page can recompute any roll.

## Project structure

```
src/
  app/                 routes (home, games, wallet, rewards, leaderboard, fair, support, legal)
  components/
    games/             28 game components, shared layout + helpers, slug registry
    AppProvider.tsx    wallet/account/chat state and actions
  lib/                 game metadata, RNG, cases, formatting
public/logo-round.png  rounded logo / favicon source
```

## Disclaimer

This project is a fan-made, non-commercial demo built for fun and for learning Next.js. It is not a gambling operator, does not accept payments, and does not pay out anything of value. If gambling is a problem for you, seek local support services.
