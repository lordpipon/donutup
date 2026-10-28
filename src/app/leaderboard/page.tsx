"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { avatarColor, coins, formatCountdown } from "@/lib/format";
import { msUntilMidnight, useNow } from "@/lib/useNow";

type Period = "daily" | "weekly" | "all";

const PERIOD_LABEL: Record<Period, string> = {
  daily: "Today",
  weekly: "This week",
  all: "All time",
};

const PLAYERS = [
  { name: "donutlord", game: "Crash", wagered: 42800, won: 18420 },
  { name: "sprinklez", game: "Plinko", wagered: 39100, won: 15980 },
  { name: "minesweepr", game: "Mines", wagered: 33400, won: 13740 },
  { name: "limboqueen", game: "Limbo", wagered: 28700, won: 11260 },
  { name: "crashkid", game: "Crash", wagered: 24100, won: 9840 },
  { name: "glazedover", game: "Blackjack", wagered: 19800, won: 7410 },
  { name: "pixelpig", game: "Pig Race", wagered: 16400, won: 5280 },
  { name: "towerrat", game: "Towers", wagered: 12900, won: 3960 },
  { name: "casedrip", game: "Cases", wagered: 10200, won: 2840 },
  { name: "hongry", game: "Keno", wagered: 8100, won: 1720 },
];

const PERIOD_FACTOR: Record<Period, number> = { daily: 1, weekly: 4.2, all: 18.5 };

export default function LeaderboardPage() {
  const { user, stats, balance } = useApp();
  const [period, setPeriod] = useState<Period>("daily");
  const now = useNow();

  const factor = PERIOD_FACTOR[period];
  const rows = [
    ...PLAYERS.map((player) => ({
      ...player,
      wagered: Math.round(player.wagered * factor),
      won: Math.round(player.won * factor),
      you: false,
    })),
    {
      name: user?.name ?? "you",
      game: "Mixed",
      wagered: Math.round(stats.wagered * (period === "daily" ? 1 : factor)),
      won: Math.round(stats.won * (period === "daily" ? 1 : factor)),
      you: true,
    },
  ].sort((a, b) => b.won - a.won);

  const myRank = rows.findIndex((row) => row.you) + 1;
  const reset = msUntilMidnight(now);

  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Simulated standings</p>
          <h1 className="page-title">
            The <span className="grad">leaderboard</span>
          </h1>
          <p className="page-sub">
            Ten imaginary high rollers, one real local balance. Climb the board with demo winnings and absolutely no
            consequences.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-clock" /> Resets in {formatCountdown(reset)}
          </span>
          <span className="badge-soft">
            <Icon name="i-users" /> {PLAYERS.length + 1} players
          </span>
        </div>
      </section>

      <section className="container leaderboard-page">
        <div className="leaderboard-summary">
          <div>
            <span className="kicker">Your position</span>
            <strong className="leaderboard-rank">#{myRank}</strong>
            <span className="muted">{user ? user.name : "Guest"} · {coins(stats.won)} won</span>
          </div>
          <div className="leaderboard-summary-stats">
            <div>
              <span>Demo balance</span>
              <strong>{coins(balance)}</strong>
            </div>
            <div>
              <span>Total wagered</span>
              <strong>{coins(stats.wagered)}</strong>
            </div>
            <div>
              <span>Biggest win</span>
              <strong>{coins(stats.biggestWin)}</strong>
            </div>
          </div>
          <Link className="btn btn-primary" href="/games">
            <Icon name="i-play" /> Climb the board
          </Link>
        </div>

        <div className="leaderboard-toolbar">
          <div className="filters" role="group" aria-label="Leaderboard period">
            {(Object.keys(PERIOD_LABEL) as Period[]).map((option) => (
              <button
                key={option}
                type="button"
                className={`filter${period === option ? " is-active" : ""}`}
                aria-pressed={period === option}
                onClick={() => setPeriod(option)}
              >
                {PERIOD_LABEL[option]}
              </button>
            ))}
          </div>
          <span className="leaderboard-note">
            <Icon name="i-shield" /> Demo data · no server
          </span>
        </div>

        <div className="leaderboard-table">
          <div className="leaderboard-head">
            <span>Rank</span>
            <span>Player</span>
            <span>Favourite game</span>
            <span>Wagered</span>
            <span>Won</span>
          </div>
          {rows.map((row, index) => (
            <div key={`${row.name}-${index}`} className={`leaderboard-row${row.you ? " is-you" : ""}`}>
              <span className={`leaderboard-pos is-${index + 1}`}>
                {index < 3 ? <Icon name="i-trophy" /> : null}
                {index + 1}
              </span>
              <span className="leaderboard-player">
                <span className="avatar" style={{ background: avatarColor(row.name) }}>
                  {row.name.slice(0, 1).toUpperCase()}
                </span>
                <strong>{row.name}</strong>
                {row.you && <small>you</small>}
              </span>
              <span className="leaderboard-game">{row.game}</span>
              <span className="leaderboard-number">{coins(row.wagered)}</span>
              <span className="leaderboard-number is-win">{coins(row.won)}</span>
            </div>
          ))}
        </div>

        <div className="feature-grid leaderboard-features">
          <article className="feature">
            <span className="feature-icon">
              <Icon name="i-trend" />
            </span>
            <h3>Score is demo winnings</h3>
            <p>Your row uses the total payouts you have received in this browser. Nobody else can see it.</p>
          </article>
          <article className="feature">
            <span className="feature-icon feature-icon--gold">
              <Icon name="i-trophy" />
            </span>
            <h3>Fake prizes, real ego</h3>
            <p>There is no prize payout. The top three get a trophy icon and the quiet respect of your localStorage.</p>
          </article>
          <article className="feature">
            <span className="feature-icon feature-icon--blue">
              <Icon name="i-users" />
            </span>
            <h3>Everyone else is scenery</h3>
            <p>The other nine players are invented for the vibe. No multiplayer servers are involved.</p>
          </article>
        </div>
      </section>
    </>
  );
}
