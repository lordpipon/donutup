"use client";

import { useEffect, useRef, useState } from "react";
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
  useFairRoll,
  type HistoryEntry,
} from "@/components/games/shared";

/* ================================================================== */
/* Crash                                                               */
/* ================================================================== */

export function CrashGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [crashAt, setCrashAt] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const activeRef = useRef(false);
  const cashedRef = useRef(false);
  const crashRef = useRef(1);
  const amountRef = useRef(0);
  const multiplierRef = useRef(1);
  const startRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const stop = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => stop, []);

  const start = () => {
    if (active) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = Math.max(roll(), 0.00001);
    const point = Math.max(1, Math.floor((0.99 / u) * 100) / 100);
    amountRef.current = amount;
    crashRef.current = point;
    cashedRef.current = false;
    multiplierRef.current = 1;
    startRef.current = performance.now();
    activeRef.current = true;
    setActive(true);
    setCrashed(false);
    setCrashAt(null);
    setCurrent(1);
    setResult(null);
    stop();
    tickRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const value = round2(1 + Math.pow(elapsed, 1.35) * 0.6);
      if (value >= crashRef.current) {
        stop();
        activeRef.current = false;
        multiplierRef.current = crashRef.current;
        setCurrent(crashRef.current);
        setCrashAt(crashRef.current);
        setCrashed(true);
        setActive(false);
        if (!cashedRef.current) {
          setResult({ win: false, text: `Crashed at ${multiplier(crashRef.current)}. ${coins(amountRef.current)} gone.` });
          setHistory((hist) => [{ id: Date.now(), win: false, label: multiplier(crashRef.current) }, ...hist].slice(0, 12));
        }
        return;
      }
      multiplierRef.current = value;
      setCurrent(value);
    }, 50);
  };

  const cashOut = () => {
    if (!active || cashedRef.current) return;
    cashedRef.current = true;
    activeRef.current = false;
    stop();
    const factor = multiplierRef.current;
    const winAmount = round2(amountRef.current * factor);
    payout(winAmount, meta.name, `Crash ${multiplier(factor)}`);
    setActive(false);
    setResult({ win: true, text: `Cashed out +${coins(winAmount)} at ${multiplier(factor)}` });
    setHistory((hist) => [{ id: Date.now(), win: true, label: multiplier(factor) }, ...hist].slice(0, 12));
  };

  const progress = crashAt && crashAt > 1 ? Math.min(1, (current - 1) / (crashAt - 1)) : 0;
  const x = 8 + progress * 374;
  const peak = Math.max(2, crashAt ?? 2, current);
  const y = 200 - ((current - 1) / (peak - 1)) * 170;

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="crash-stage">
          <div className={`crash-readout${crashed ? " is-crashed" : ""}`}>{active || crashed ? `${current.toFixed(2)}×` : "1.00×"}</div>
          <svg className="crash-chart" viewBox="0 0 400 220" role="img" aria-label="Crash multiplier chart">
            <defs>
              <linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={crashed ? "#ef5353" : "#4bd68f"} stopOpacity=".32" />
                <stop offset="100%" stopColor={crashed ? "#ef5353" : "#4bd68f"} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => (
              <line key={line} className="grid-line" x1="8" y1={30 + line * 56} x2="390" y2={30 + line * 56} />
            ))}
            <polygon className="area" points={`8,200 ${x},${Math.max(30, y)} ${x},200`} />
            <polyline className={`curve${crashed ? " is-crashed" : ""}`} points={`8,200 ${x},${Math.max(30, y)}`} />
            <circle className={`end-dot${crashed ? " is-crashed" : ""}`} cx={x} cy={Math.max(30, y)} r="4" />
            <text className="axis" x="8" y="214">
              1.00×
            </text>
            <text className="axis" x="360" y="214">
              {peak.toFixed(2)}×
            </text>
          </svg>
          <div className="crash-meta">
            <span>
              {active ? "Climbing — cash out before it pops." : crashed ? "Round over." : "Start a round to launch the multiplier."}
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
          {active ? (
            <button className="btn btn-gold btn-block btn-lg" type="button" onClick={cashOut}>
              <Icon name="i-withdraw" /> Cash out {coins(amount * current)}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name="i-crash" /> Start round
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "The multiplier rises until it does not."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Plinko                                                              */
/* ================================================================== */

type PlinkoRisk = "low" | "medium" | "high";

const PLINKO_TABLE: Record<number, Record<PlinkoRisk, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

export function PlinkoGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [rows, setRows] = useState(12);
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
  const [ball, setBall] = useState<{ row: number; pos: number } | null>(null);
  const [drops, setDrops] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const table = PLINKO_TABLE[rows][risk];

  const drop = () => {
    if (dropping) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const path: number[] = [];
    let rights = 0;
    for (let row = 0; row < rows; row++) {
      if (roll() < 0.5) rights += 1;
      path.push(rights);
    }
    setDropping(true);
    setDrops(null);
    setResult(null);
    setBall({ row: 0, pos: 0 });
    timers.current = [];
    path.forEach((pos, index) => {
      timers.current.push(
        window.setTimeout(() => {
          setBall({ row: index + 1, pos });
        }, 90 + index * 90),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        const bucket = table[rights];
        setDrops(rights);
        setDropping(false);
        const winAmount = round2(amount * bucket);
        payout(winAmount, meta.name, `Plinko ${multiplier(bucket)}`);
        setResult({
          win: bucket >= 1,
          text: `${multiplier(bucket)} — ${bucket >= 1 ? `+${coins(winAmount)}` : "small return"}`,
        });
        setHistory((hist) => [
          { id: Date.now(), win: bucket >= 1, label: multiplier(bucket) },
          ...hist,
        ].slice(0, 12));
      }, 130 + rows * 90),
    );
  };

  const ballLeft = ball ? ((ball.pos + (rows - ball.row) / 2) / rows) * 100 : 50;
  const ballTop = ball ? (ball.row / rows) * 100 : 0;

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="plinko-stage">
          <span className="stage-badge">
            {rows} rows · <strong>{risk}</strong>
          </span>
          <div className="plinko-board">
            <div className="plinko-field" style={{ height: rows * 26 + 18 }}>
              {Array.from({ length: rows }, (_, row) =>
                Array.from({ length: row + 1 }, (_, pos) => {
                  const left = ((pos + (rows - row) / 2) / rows) * 100;
                  return <span key={`${row}-${pos}`} className="plinko-peg" style={{ left: `${left}%`, top: row * 26 + 8 }} />;
                }),
              )}
              {ball && (
                <span
                  className={`plinko-ball${dropping ? " is-dropping" : ""}`}
                  style={{ left: `${ballLeft}%`, top: `${8 + ballTop * 0.96}%` }}
                />
              )}
            </div>
            <div className="plinko-buckets">
              {table.map((value, index) => (
                <span
                  key={index}
                  className={`plinko-bucket${index === drops ? " is-hit" : ""}${value === 0.2 ? " is-edge" : ""}`}
                  style={{ flex: 1 }}
                >
                  {value >= 100 ? `${value}×` : value >= 10 ? value.toFixed(0) : value.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
          <p className="stage-copy">Every peg is a coin flip. Edge buckets pay, middle buckets tease.</p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={dropping} />
          <div className="panel-label">
            <span>Rows</span>
          </div>
          <div className="quick-row">
            {[8, 12, 16].map((option) => (
              <button
                key={option}
                type="button"
                className={rows === option ? "is-active" : ""}
                onClick={() => setRows(option)}
                disabled={dropping}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="panel-label">
            <span>Risk</span>
          </div>
          <div className="quick-row">
            {(Object.keys(PLINKO_TABLE[8]) as PlinkoRisk[]).map((option) => (
              <button
                key={option}
                type="button"
                className={risk === option ? "is-active" : ""}
                onClick={() => setRisk(option)}
                disabled={dropping}
              >
                {option}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={drop} disabled={dropping || amount <= 0}>
            <Icon name="i-plinko" /> {dropping ? "Dropping…" : "Drop ball"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Pick your board and drop."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
