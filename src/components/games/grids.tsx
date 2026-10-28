"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useApp } from "@/components/AppProvider";
import type { GameMeta } from "@/lib/games";
import { coins, fmt, multiplier, round2 } from "@/lib/format";
import {
  BetInput,
  FairLine,
  GameLayout,
  History,
  ResultLine,
  StageResult,
  useFairRoll,
  type HistoryEntry,
} from "@/components/games/shared";

/* ================================================================== */
/* Mines                                                               */
/* ================================================================== */

export function minesMultiplier(mines: number, revealed: number): number {
  let value = 0.99;
  for (let i = 0; i < revealed; i++) value *= (25 - i) / (25 - mines - i);
  return round2(value);
}

export function MinesGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [active, setActive] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [exploded, setExploded] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const current = active ? minesMultiplier(mineCount, revealed.length) : 1;

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const picked = new Set<number>();
    while (picked.size < mineCount) picked.add(Math.min(24, Math.floor(roll() * 25)));
    setMines([...picked]);
    setRevealed([]);
    setExploded(null);
    setResult(null);
    setActive(true);
  };

  const reveal = (index: number) => {
    if (!active || revealed.includes(index) || exploded !== null) return;
    if (mines.includes(index)) {
      setExploded(index);
      setActive(false);
      setResult({ win: false, text: `Mine. ${coins(amount)} gone.` });
      setHistory((current) => [{ id: Date.now(), win: false, label: "boom" }, ...current].slice(0, 12));
      return;
    }
    const next = [...revealed, index];
    setRevealed(next);
    if (next.length === 25 - mineCount) {
      const winAmount = round2(amount * minesMultiplier(mineCount, next.length));
      payout(winAmount, meta.name, "Mines clear");
      setActive(false);
      setResult({ win: true, text: `Board cleared! +${coins(winAmount)}` });
      setHistory((current) => [{ id: Date.now(), win: true, label: `${minesMultiplier(mineCount, next.length)}×` }, ...current].slice(0, 12));
    }
  };

  const cashOut = () => {
    if (!active || revealed.length === 0) return;
    const winAmount = round2(amount * current);
    payout(winAmount, meta.name, "Mines cashout");
    setActive(false);
    setResult({ win: true, text: `Cashed out +${coins(winAmount)} at ${multiplier(current)}` });
    setHistory((hist) => [{ id: Date.now(), win: true, label: multiplier(current) }, ...hist].slice(0, 12));
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="mines-stage">
          <span className="stage-badge">
            Mines <strong>{active ? mineCount : "—"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className={`mines-grid${active ? "" : " is-idle"}`}>
            {Array.from({ length: 25 }, (_, index) => {
              const isMine = exploded !== null && (mines.includes(index) || index === exploded);
              const isRevealed = revealed.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  className={`mine-tile${isRevealed ? " is-revealed" : ""}${isMine ? " is-mine" : ""}${!active && !isMine && !isRevealed ? " is-dim" : ""}`}
                  onClick={() => reveal(index)}
                  disabled={!active || isRevealed || exploded !== null}
                  aria-label={isRevealed ? "Safe tile" : isMine ? "Mine" : "Hidden tile"}
                >
                  <Icon name={isMine ? "i-bomb" : isRevealed ? "i-coin" : "i-sparkle"} />
                </button>
              );
            })}
          </div>
          <div className="mines-meta">
            <span>
              Next <strong>{active ? multiplier(minesMultiplier(mineCount, revealed.length + 1)) : "—"}</strong>
            </span>
            <span>
              Cashout <strong>{active ? `${coins(amount * current)}` : "—"}</strong>
            </span>
          </div>
        </div>
      }
      panel={
        <>
          <div className="panel-top">
            <span>Balance</span>
            <strong>
              <Icon name="i-coin" /> {fmt(balance)}
            </strong>
          </div>
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={active} />
          <div className="panel-label">
            <span>Mines</span>
            <strong className="mono">{mineCount}</strong>
          </div>
          <div className="quick-row">
            {[1, 3, 5, 10].map((value) => (
              <button key={value} type="button" onClick={() => setMineCount(value)} disabled={active}>
                {value}
              </button>
            ))}
          </div>
          {active ? (
            <button className="btn btn-gold btn-block btn-lg" type="button" onClick={cashOut} disabled={revealed.length === 0}>
              <Icon name="i-withdraw" /> Cash out {coins(amount * current)}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name="i-mines" /> Start round
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? (active ? `Current ${multiplier(current)}` : "Pick your mine count.")}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* generic climb game (Towers / Lava / Stripmine)                      */
/* ================================================================== */

interface ClimbConfig {
  rows: number;
  tiles: number;
  chance: number;
  step: number;
  className: string;
  bombIcon: string;
}

function ClimbGame({
  meta,
  config,
  labels,
}: {
  meta: GameMeta;
  config: ClimbConfig;
  labels: { title: string; sub: string; action: string; badge: string; bomb?: string };
}) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [bombs, setBombs] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [exploded, setExploded] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const floor = picked.length;
  const current = round2(0.99 * Math.pow(config.step, floor));

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const generated = Array.from({ length: config.rows }, () => Math.min(config.tiles - 1, Math.floor(roll() * config.tiles)));
    setBombs(generated);
    setPicked([]);
    setExploded(null);
    setResult(null);
    setActive(true);
  };

  const pick = (row: number, tile: number) => {
    if (!active || row !== floor) return;
    if (bombs[row] === tile) {
      setExploded(row * 10 + tile);
      setActive(false);
      setResult({ win: false, text: `${labels.bomb ?? "Boom"} — ${coins(amount)} gone at floor ${row + 1}.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: `${row + 1}F` }, ...hist].slice(0, 12));
      return;
    }
    const next = [...picked, tile];
    setPicked(next);
    if (next.length === config.rows) {
      const winAmount = round2(amount * round2(0.99 * Math.pow(config.step, config.rows)));
      payout(winAmount, meta.name, `${labels.title} clear`);
      setActive(false);
      setResult({ win: true, text: `Top reached! +${coins(winAmount)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: "top" }, ...hist].slice(0, 12));
    }
  };

  const cashOut = () => {
    if (!active || picked.length === 0) return;
    const winAmount = round2(amount * current);
    payout(winAmount, meta.name, `${labels.title} cashout`);
    setActive(false);
    setResult({ win: true, text: `Cashed out +${coins(winAmount)} at ${multiplier(current)}` });
    setHistory((hist) => [{ id: Date.now(), win: true, label: multiplier(current) }, ...hist].slice(0, 12));
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className={`climb-stage ${config.className}`}>
          <span className="stage-badge">
            {labels.badge} <strong>{floor}/{config.rows}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="climb-rows">
            {Array.from({ length: config.rows }, (_, offset) => {
              const row = config.rows - 1 - offset;
              const isCurrent = active && row === floor;
              const isPast = row < floor;
              const bomb = bombs[row];
              const isRevealedBomb = exploded !== null && Math.floor(exploded / 10) === row;
              return (
                <div
                  key={row}
                  className={`climb-row${isCurrent ? " is-current" : ""}${isPast ? " is-past" : ""}${row > floor ? " is-future" : ""}`}
                >
                  <span className="climb-mult">{multiplier(round2(0.99 * Math.pow(config.step, row + 1)))}</span>
                  <div className="climb-tiles" style={{ gridTemplateColumns: `repeat(${config.tiles}, 1fr)` }}>
                    {Array.from({ length: config.tiles }, (_, tile) => {
                      const isPicked = isPast && picked[row] === tile;
                      const showBomb = isRevealedBomb && bomb === tile;
                      return (
                        <button
                          key={tile}
                          type="button"
                          className={`climb-tile${isPicked ? " is-picked" : ""}${showBomb ? " is-bomb" : ""}`}
                          onClick={() => pick(row, tile)}
                          disabled={!isCurrent}
                          aria-label={`Floor ${row + 1} tile ${tile + 1}`}
                        >
                          <Icon name={showBomb ? "i-bomb" : isPicked ? "i-check" : config.bombIcon} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="stage-copy">{labels.sub}</p>
        </div>
      }
      panel={
        <>
          <div className="panel-top">
            <span>Balance</span>
            <strong>
              <Icon name="i-coin" /> {fmt(balance)}
            </strong>
          </div>
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={active} />
          <div className="panel-top panel-top--boxed">
            <span>Current multiplier</span>
            <strong>{multiplier(active ? current : 1)}</strong>
          </div>
          {active ? (
            <button className="btn btn-gold btn-block btn-lg" type="button" onClick={cashOut} disabled={picked.length === 0}>
              <Icon name="i-withdraw" /> Cash out {coins(amount * current)}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name={meta.icon} /> {labels.action}
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? `${labels.title}: one wrong tile ends the run.`}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

export function TowersGame({ meta }: { meta: GameMeta }) {
  return (
    <ClimbGame
      meta={meta}
      config={{ rows: 8, tiles: 4, chance: 0.75, step: 4 / 3, className: "towers-stage", bombIcon: "i-bomb" }}
      labels={{
        title: "Towers",
        sub: "Eight floors, four tiles, one bomb. Cash out before the tower bites.",
        action: "Start climbing",
        badge: "Floor",
        bomb: "Bomb",
      }}
    />
  );
}

export function FloorIsLavaGame({ meta }: { meta: GameMeta }) {
  return (
    <ClimbGame
      meta={meta}
      config={{ rows: 7, tiles: 3, chance: 2 / 3, step: 1.5, className: "lava-stage", bombIcon: "i-lava" }}
      labels={{
        title: "Floor is Lava",
        sub: "Seven rows of rocks, one is molten. Hop carefully.",
        action: "Start hopping",
        badge: "Row",
        bomb: "Lava",
      }}
    />
  );
}

export function StripmineGame({ meta }: { meta: GameMeta }) {
  return (
    <ClimbGame
      meta={meta}
      config={{ rows: 5, tiles: 5, chance: 0.8, step: 1.25, className: "strip-stage", bombIcon: "i-bomb" }}
      labels={{
        title: "Stripmine",
        sub: "Five rows, five rocks, one rigged charge per row.",
        action: "Start mining",
        badge: "Row",
        bomb: "Bomb",
      }}
    />
  );
}

/* ================================================================== */
/* Chicken                                                             */
/* ================================================================== */

const CHICKEN_LANES = 10;
const CHICKEN_BUST = 0.12;

export function ChickenGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [lane, setLane] = useState(0);
  const [busted, setBusted] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const current = round2(0.99 * Math.pow(1 / (1 - CHICKEN_BUST), lane));

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    setLane(0);
    setBusted(false);
    setResult(null);
    setActive(true);
  };

  const cross = () => {
    if (!active) return;
    if (roll() < CHICKEN_BUST) {
      setBusted(true);
      setActive(false);
      setResult({ win: false, text: `Squashed on lane ${lane + 1}. ${coins(amount)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: `${lane}F` }, ...hist].slice(0, 12));
      return;
    }
    const next = lane + 1;
    setLane(next);
    if (next >= CHICKEN_LANES) {
      const winAmount = round2(amount * round2(0.99 * Math.pow(1 / (1 - CHICKEN_BUST), CHICKEN_LANES)));
      payout(winAmount, meta.name, "Chicken full cross");
      setActive(false);
      setResult({ win: true, text: `Full crossing! +${coins(winAmount)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: "full" }, ...hist].slice(0, 12));
    }
  };

  const cashOut = () => {
    if (!active || lane === 0) return;
    const winAmount = round2(amount * current);
    payout(winAmount, meta.name, "Chicken cashout");
    setActive(false);
    setResult({ win: true, text: `Cashed out +${coins(winAmount)} at ${multiplier(current)}` });
    setHistory((hist) => [{ id: Date.now(), win: true, label: multiplier(current) }, ...hist].slice(0, 12));
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="chicken-stage">
          <span className="stage-badge">
            Lane <strong>{lane}/{CHICKEN_LANES}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className={`chicken-road${busted ? " is-busted" : ""}`}>
            {Array.from({ length: CHICKEN_LANES }, (_, index) => (
              <div key={index} className={`chicken-lane${index < lane ? " is-crossed" : ""}${busted && index === lane ? " is-hit" : ""}`}>
                <span className="chicken-lane-mult">{multiplier(round2(0.99 * Math.pow(1 / (1 - CHICKEN_BUST), index + 1)))}</span>
                <span className="chicken-lane-line" />
                {index < lane && <span className="chicken-lane-chick">🐔</span>}
                {busted && index === lane && <span className="chicken-lane-car">🚗</span>}
                {index >= lane && !busted && <span className="chicken-lane-car chicken-lane-car--ghost">🚗</span>}
              </div>
            ))}
          </div>
          <p className="stage-copy">Each lane has a 12% chance of ending the run.</p>
        </div>
      }
      panel={
        <>
          <div className="panel-top">
            <span>Balance</span>
            <strong>
              <Icon name="i-coin" /> {fmt(balance)}
            </strong>
          </div>
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={active} />
          <div className="panel-top panel-top--boxed">
            <span>Next multiplier</span>
            <strong>{multiplier(active ? round2(0.99 * Math.pow(1 / (1 - CHICKEN_BUST), lane + 1)) : 1)}</strong>
          </div>
          {active ? (
            <div className="panel-actions">
              <button className="btn btn-gold" type="button" onClick={cashOut} disabled={lane === 0}>
                <Icon name="i-withdraw" /> {coins(amount * current)}
              </button>
              <button className="btn btn-primary" type="button" onClick={cross}>
                <Icon name="i-chicken" /> Cross
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name="i-chicken" /> Start crossing
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Lane by lane. Cash out when your nerves go."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Slide                                                               */
/* ================================================================== */

type Risk = "low" | "medium" | "high";

const SLIDE_BUCKETS: Record<Risk, { mult: number; weight: number }[]> = {
  low: [
    { mult: 0, weight: 550 },
    { mult: 1.4, weight: 250 },
    { mult: 2, weight: 120 },
    { mult: 4, weight: 60 },
    { mult: 8, weight: 20 },
  ],
  medium: [
    { mult: 0, weight: 760 },
    { mult: 2, weight: 120 },
    { mult: 4, weight: 70 },
    { mult: 8, weight: 40 },
    { mult: 15, weight: 10 },
  ],
  high: [
    { mult: 0, weight: 900 },
    { mult: 4, weight: 50 },
    { mult: 8, weight: 30 },
    { mult: 20, weight: 15 },
    { mult: 50, weight: 5 },
  ],
};

export function SlideGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [risk, setRisk] = useState<Risk>("low");
  const [landed, setLanded] = useState<number | null>(null);
  const [sliding, setSliding] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const buckets = SLIDE_BUCKETS[risk];

  const play = () => {
    if (sliding) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const total = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
    let ticket = roll() * total;
    let index = buckets.length - 1;
    for (let i = 0; i < buckets.length; i++) {
      ticket -= buckets[i].weight;
      if (ticket < 0) {
        index = i;
        break;
      }
    }
    const bucket = buckets[index];
    setSliding(true);
    setResult(null);
    setLanded(null);
    window.setTimeout(() => {
      setLanded(index);
      setSliding(false);
      if (bucket.mult > 0) {
        const winAmount = round2(amount * bucket.mult);
        payout(winAmount, meta.name, `Slide ${multiplier(bucket.mult)}`);
        setResult({ win: true, text: `+${coins(winAmount)} at ${multiplier(bucket.mult)}` });
      } else {
        setResult({ win: false, text: "Dead bucket. Better luck next slide." });
      }
      setHistory((current) => [
        { id: Date.now(), win: bucket.mult > 0, label: bucket.mult > 0 ? multiplier(bucket.mult) : "0×" },
        ...current,
      ].slice(0, 12));
    }, 1000);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="slide-stage">
          <span className="stage-badge">
            Risk <strong>{risk}</strong>
          </span>
          <div className="slide-ramp">
            <div className="slide-ramp-bar" />
            <div
              className={`slide-puck${sliding ? " is-sliding" : ""}`}
              style={{ left: landed === null ? "3%" : `${5 + landed * 19}%` }}
            >
              <Icon name="i-slide" />
            </div>
          </div>
          <div className="slide-buckets">
            {buckets.map((bucket, index) => (
              <div
                key={`${risk}-${index}`}
                className={`slide-bucket${bucket.mult === 0 ? " is-empty" : ""}${landed === index ? " is-landed" : ""}`}
              >
                <span>{bucket.mult === 0 ? "0×" : multiplier(bucket.mult)}</span>
                <small>{((bucket.weight / 1000) * 100).toFixed(0)}%</small>
              </div>
            ))}
          </div>
          <p className="stage-copy">Lower risk, fatter safe buckets. Higher risk, wilder multipliers.</p>
        </div>
      }
      panel={
        <>
          <div className="panel-top">
            <span>Balance</span>
            <strong>
              <Icon name="i-coin" /> {fmt(balance)}
            </strong>
          </div>
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={sliding} />
          <div className="panel-label">
            <span>Risk</span>
          </div>
          <div className="quick-row">
            {(Object.keys(SLIDE_BUCKETS) as Risk[]).map((option) => (
              <button
                key={option}
                type="button"
                className={risk === option ? "is-active" : ""}
                onClick={() => setRisk(option)}
                disabled={sliding}
              >
                {option}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={sliding || amount <= 0}>
            <Icon name="i-slide" /> {sliding ? "Sliding…" : "Send the puck"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Pick a risk level and slide."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
