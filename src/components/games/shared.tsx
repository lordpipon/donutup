"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import type { GameMeta } from "@/lib/games";
import { categoryLabel } from "@/lib/games";
import { fairFloat, fairHash, loadSeeds, type FairSeeds } from "@/lib/fair";
import { coins, multiplier, round2 } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* layout                                                              */
/* ------------------------------------------------------------------ */

export function GameLayout({
  meta,
  stage,
  panel,
}: {
  meta: GameMeta;
  stage: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div className="container game-page">
      <div className="game-page-head">
        <Link className="back-link" href="/games">
          <Icon name="i-arrow-left" /> All games
        </Link>
        <div className="game-title-row">
          <span className="game-head-icon" style={{ color: meta.tint }}>
            <Icon name={meta.icon} />
          </span>
          <div>
            <h1>{meta.name}</h1>
            <p>
              {categoryLabel(meta.category)} · play-money demo
            </p>
          </div>
          <span className="game-badge game-badge--demo">no real money</span>
        </div>
      </div>
      <div className="game-layout">
        <section className={`game-stage game-stage--${meta.slug}`}>{stage}</section>
        <aside className="bet-panel">{panel}</aside>
      </div>
    </div>
  );
}

export function GameInfo({ meta }: { meta: GameMeta }) {
  return (
    <div className="container game-info-wrap">
      <div className="game-info-grid">
        <section className="info-card">
          <p className="kicker">How it works</p>
          <h2>Playing {meta.name}</h2>
          <ol className="howto-list">
            {meta.howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="info-note">
            <Icon name="i-shield" />
            <span>
              This game uses the shared provably-fair-style RNG stored in your browser. Every coin is simulated and
              has no cash value.
            </span>
          </div>
        </section>
        <section className="info-card">
          <p className="kicker">House rules</p>
          <h2>Demo parameters</h2>
          <dl className="stat-list">
            <div>
              <dt>Game type</dt>
              <dd>{categoryLabel(meta.category)}</dd>
            </div>
            <div>
              <dt>Wager</dt>
              <dd>1 – balance</dd>
            </div>
            <div>
              <dt>Payout</dt>
              <dd>Instant, in demo coins</dd>
            </div>
            <div>
              <dt>RNG</dt>
              <dd>Seeded, client-side</dd>
            </div>
          </dl>
          <div className="info-actions">
            <Link className="btn btn-ghost btn-block" href="/fair">
              <Icon name="i-shield" /> Verify the RNG
            </Link>
            <Link className="btn btn-primary btn-block" href="/games">
              <Icon name="i-grid" /> More games
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */

export function useFairRoll() {
  const seeds = useRef<FairSeeds | null>(null);
  const nonceRef = useRef(0);
  const [hash, setHash] = useState("");

  const roll = useCallback(() => {
    if (!seeds.current) seeds.current = loadSeeds();
    const next = nonceRef.current + 1;
    nonceRef.current = next;
    setHash(fairHash(seeds.current.server, seeds.current.client, next));
    return fairFloat(seeds.current.server, seeds.current.client, next);
  }, []);

  return { roll, hash };
}

/* ------------------------------------------------------------------ */
/* controls                                                            */
/* ------------------------------------------------------------------ */

export function BetInput({
  value,
  onChange,
  max,
  disabled,
  step = 10,
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
  step?: number;
}) {
  const apply = (next: number) => {
    const clamped = Math.min(Math.max(0, round2(next)), Math.max(0, round2(max)));
    onChange(clamped);
  };

  return (
    <>
      <div className="panel-label">
        <span>Bet amount</span>
        <span className="muted">max {coins(max)}</span>
      </div>
      <div className="bet-input">
        <Icon name="i-coin" />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={step}
          value={value === 0 ? "" : value}
          disabled={disabled}
          aria-label="Bet amount"
          onChange={(event) => apply(Number(event.target.value))}
        />
        <div className="bet-quick">
          <button
            type="button"
            disabled={disabled}
            onClick={() => apply(value / 2)}
            aria-label="Halve bet"
          >
            ½
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => apply(value * 2)}
            aria-label="Double bet"
          >
            2×
          </button>
          <button type="button" disabled={disabled} onClick={() => apply(max)} aria-label="Bet maximum">
            max
          </button>
        </div>
      </div>
    </>
  );
}

export function ResultLine({
  status = "idle",
  children,
}: {
  status?: "idle" | "win" | "loss";
  children: ReactNode;
}) {
  return <p className={`panel-result${status === "win" ? " is-win" : status === "loss" ? " is-loss" : ""}`}>{children}</p>;
}

export function FairLine({ hash }: { hash: string }) {
  return (
    <div className="fair-line">
      <Icon name="i-shield" />
      {hash ? (
        <>
          <code title={hash}>{hash.slice(0, 18)}…</code>
          <Link href="/fair" aria-label="How the RNG works">
            <Icon name="i-arrow" />
          </Link>
        </>
      ) : (
        <span>Seeded RNG · hash shown after your first bet</span>
      )}
    </div>
  );
}

export interface HistoryEntry {
  id: number;
  win: boolean;
  label: string;
}

export function History({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div className="history" aria-label="Recent results">
      {entries.slice(0, 10).map((entry) => (
        <span
          key={entry.id}
          className={`history-chip${entry.win ? " is-win" : " is-loss"}`}
          title={entry.win ? "win" : "loss"}
        >
          {entry.label}
        </span>
      ))}
    </div>
  );
}

export function StageResult({ status, children }: { status: "win" | "loss" | null; children: ReactNode }) {
  if (!status) return null;
  return (
    <div className={`stage-result${status === "win" ? " is-win" : " is-loss"}`} aria-live="polite">
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* cards                                                               */
/* ------------------------------------------------------------------ */

export type Suit = "♠" | "♥" | "♦" | "♣";

export interface Card {
  rank: string;
  suit: Suit;
}

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function cardValue(rank: string): number {
  if (rank === "A") return 11;
  if (rank === "K" || rank === "Q" || rank === "J") return 10;
  return Number(rank);
}

export function deckFromRoll(roll: () => number): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(roll() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = cards.reduce((sum, card) => sum + cardValue(card.rank), 0);
  let aces = cards.filter((card) => card.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return { total, soft: aces > 0 };
}

export function PlayingCard({
  card,
  hidden,
  small,
}: {
  card?: Card;
  hidden?: boolean;
  small?: boolean;
}) {
  if (hidden) return <div className={`playing-card playing-card--back${small ? " playing-card--sm" : ""}`} aria-label="Hidden card" />;
  if (!card) return <div className={`playing-card playing-card--empty${small ? " playing-card--sm" : ""}`} aria-hidden="true" />;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`playing-card${red ? " is-red" : ""}${small ? " playing-card--sm" : ""}`} aria-label={`${card.rank} of ${card.suit}`}>
      <span className="pc-rank">{card.rank}</span>
      <span className="pc-suit">{card.suit}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

export function MultiplierTag({ value }: { value: number }) {
  return <span className="stage-multiplier">{multiplier(value)}</span>;
}

export function ChanceLine({ chance, payout }: { chance: number; payout: number }) {
  return (
    <div className="chance-line">
      <span>
        Win chance <strong>{chance.toFixed(2)}%</strong>
      </span>
      <span>
        Payout <strong>{multiplier(payout)}</strong>
      </span>
    </div>
  );
}

export function Reel({ cells, className }: { cells: ReactNode[]; className?: string }) {
  return <div className={`mini-reel${className ? ` ${className}` : ""}`}>{cells}</div>;
}
