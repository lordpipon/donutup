import type { Metadata } from "next";
import { GamesGrid } from "@/components/GamesGrid";
import { Icon } from "@/components/Icon";
import { GAMES } from "@/lib/games";

export const metadata: Metadata = {
  title: "All 28 games",
  description:
    "Every DonutUp game in one place — instant, versus, table and minigames. All playable with fake demo coins.",
};

export default function GamesPage() {
  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">No real money · 28 games</p>
          <h1 className="page-title">
            The whole <span className="grad">arcade</span>
          </h1>
          <p className="page-sub">
            Instant wins, bot duels, table classics and chaotic minigames. Pick one, set a bet and see where the fake
            coins land.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> Provably fair
          </span>
          <span className="badge-soft">
            <Icon name="i-bolt" /> Instant payouts
          </span>
          <span className="badge-soft">
            <Icon name="i-users" /> {GAMES.length} games
          </span>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 24 }}>
        <GamesGrid />
      </section>
    </>
  );
}
