"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useApp } from "@/components/AppProvider";
import type { GameMeta } from "@/lib/games";
import { coins, fmt, multiplier, round2 } from "@/lib/format";
import {
  BetInput,
  ChanceLine,
  FairLine,
  GameLayout,
  History,
  ResultLine,
  useFairRoll,
  type HistoryEntry,
} from "@/components/games/shared";

/* ================================================================== */
/* Coinflip                                                            */
/* ================================================================== */

export function CoinflipGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [rotation, setRotation] = useState(0);
  const [side, setSide] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const play = () => {
    if (flipping) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = roll();
    const landed: "heads" | "tails" = u < 0.5 ? "heads" : "tails";
    const win = landed === choice;
    setFlipping(true);
    setResult(null);
    setSide(null);
    setRotation((current) => current + 1800 + (landed === "tails" ? 180 : 0));
    timers.current.push(
      window.setTimeout(() => {
        setSide(landed);
        setFlipping(false);
        if (win) {
          const winAmount = round2(amount * 1.96);
          payout(winAmount, meta.name, "Coinflip win");
          setResult({ win: true, text: `+${coins(winAmount)} — ${landed}!` });
        } else {
          setResult({ win: false, text: `Landed ${landed}. ${coins(amount)} gone.` });
        }
        setHistory((current) => [{ id: Date.now(), win, label: win ? "1.96×" : "0×" }, ...current].slice(0, 12));
      }, 1500),
    );
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="coin-stage">
          <span className="stage-badge">
            Last flip <strong>{side ?? "—"}</strong>
          </span>
          <div className="coin-3d" aria-live="polite">
            <div className="coin-inner" style={{ transform: `rotateY(${rotation}deg)` }}>
              <div className="coin-face">
                <Icon name="i-donut" />
                <span>Heads</span>
              </div>
              <div className="coin-face coin-face--back">
                <Icon name="i-coin" />
                <span>Tails</span>
              </div>
            </div>
          </div>
          <div className="coin-caption">
            <strong>{flipping ? "Flipping…" : result ? (result.win ? "Nice call." : "Not this time.") : "Pick a side."}</strong>
            <span>Correct call pays 1.96× your bet.</span>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={flipping} />
          <div className="panel-label">
            <span>Your call</span>
          </div>
          <div className="choice-row">
            <button
              type="button"
              className={`choice${choice === "heads" ? " is-active is-active--gold" : ""}`}
              onClick={() => setChoice("heads")}
              disabled={flipping}
              aria-pressed={choice === "heads"}
            >
              <Icon name="i-donut" /> Heads
            </button>
            <button
              type="button"
              className={`choice${choice === "tails" ? " is-active" : ""}`}
              onClick={() => setChoice("tails")}
              disabled={flipping}
              aria-pressed={choice === "tails"}
            >
              <Icon name="i-coin" /> Tails
            </button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={flipping || amount <= 0}>
            <Icon name="i-flip" /> {flipping ? "Flipping…" : "Flip coin"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Heads or tails?"}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Versus Flip                                                         */
/* ================================================================== */

export function FlipGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<{ player: "heads" | "tails"; bot: "heads" | "tails"; win: boolean } | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const play = () => {
    if (busy) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = roll();
    const landed: "heads" | "tails" = u < 0.5 ? "heads" : "tails";
    const bot = choice === "heads" ? "tails" : "heads";
    const win = landed === choice;
    setBusy(true);
    setResult(null);
    setReveal(null);
    window.setTimeout(() => {
      setReveal({ player: choice, bot, win });
      setBusy(false);
      if (win) {
        const winAmount = round2(amount * 1.96);
        payout(winAmount, meta.name, "Versus flip win");
        setResult({ win: true, text: `+${coins(winAmount)} — you called it!` });
      } else {
        setResult({ win: false, text: `The bot takes ${coins(amount)}.` });
      }
      setHistory((current) => [{ id: Date.now(), win, label: win ? "1.96×" : "0×" }, ...current].slice(0, 12));
    }, 1200);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="versus-stage">
          <div className="versus-row">
            <div className={`versus-player${reveal?.win ? " is-winner" : ""}`}>
              <span className="avatar avatar--lg">Y</span>
              <strong>You</strong>
              <span>{reveal ? reveal.player : choice}</span>
            </div>
            <div className="versus-vs">
              <Icon name="i-flip" />
              <span>VS</span>
            </div>
            <div className={`versus-player${reveal && !reveal.win ? " is-winner" : ""}`}>
              <span className="avatar avatar--lg vs-bot">B</span>
              <strong>Flipbot</strong>
              <span>{reveal ? reveal.bot : choice === "heads" ? "tails" : "heads"}</span>
            </div>
          </div>
          <div className={`versus-coin${busy ? " is-spinning" : ""}`}>
            <Icon name="i-donut" />
            <span>{reveal ? (reveal.win ? "You win" : "Bot wins") : busy ? "Flipping" : "Ready"}</span>
          </div>
          <p className="stage-copy">The bot always calls the opposite side. Winner takes the pot at 1.96×.</p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={busy} />
          <div className="panel-label">
            <span>Your side</span>
          </div>
          <div className="choice-row">
            <button
              type="button"
              className={`choice${choice === "heads" ? " is-active is-active--gold" : ""}`}
              onClick={() => setChoice("heads")}
              disabled={busy}
            >
              <Icon name="i-donut" /> Heads
            </button>
            <button
              type="button"
              className={`choice${choice === "tails" ? " is-active" : ""}`}
              onClick={() => setChoice("tails")}
              disabled={busy}
            >
              <Icon name="i-coin" /> Tails
            </button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={busy || amount <= 0}>
            <Icon name="i-flip" /> {busy ? "Flipping…" : "Challenge bot"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Bot is waiting."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Dice                                                                */
/* ================================================================== */

export function DiceGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [mode, setMode] = useState<"over" | "under">("over");
  const [target, setTarget] = useState(50);
  const [value, setValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const chance = mode === "over" ? 100 - target : target;
  const pay = round2(99 / Math.max(chance, 0.01));

  const play = () => {
    if (rolling) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = roll();
    const landed = Math.floor(u * 10000) / 100;
    const win = mode === "over" ? landed > target : landed < target;
    setRolling(true);
    setResult(null);
    setValue(null);
    timers.current.push(
      window.setTimeout(() => {
        setValue(landed);
        setRolling(false);
        if (win) {
          const winAmount = round2(amount * pay);
          payout(winAmount, meta.name, `Dice ${mode} ${target}`);
          setResult({ win: true, text: `+${coins(winAmount)} at ${multiplier(pay)}` });
        } else {
          setResult({ win: false, text: `${landed.toFixed(2)} missed your range.` });
        }
        setHistory((current) => [
          { id: Date.now(), win, label: landed.toFixed(2) },
          ...current,
        ].slice(0, 12));
      }, 420),
    );
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="dice-stage">
          <span className="stage-badge">
            Roll <strong>{mode === "over" ? "over" : "under"} {target.toFixed(2)}</strong>
          </span>
          <div className={`dice-readout${value === null ? "" : value > target === (mode === "over") ? " is-win" : " is-loss"}`}>
            {rolling ? "…" : value === null ? "00.00" : value.toFixed(2)}
          </div>
          <div className="dice-track">
            <div className="dice-rail">
              <div
                className={`dice-range${mode === "over" ? " is-over" : " is-under"}`}
                style={
                  mode === "over"
                    ? { left: `${target}%`, right: 0 }
                    : { left: 0, right: `${100 - target}%` }
                }
              />
              <div className="dice-target" style={{ left: `${target}%` }} />
              {value !== null && !rolling && <div className="dice-marker" style={{ left: `${value}%` }} />}
            </div>
            <div className="dice-scale">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
          <ChanceLine chance={chance} payout={pay} />
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={rolling} />
          <div className="panel-label">
            <span>Direction</span>
          </div>
          <div className="choice-row">
            <button
              type="button"
              className={`choice${mode === "under" ? " is-active" : ""}`}
              onClick={() => setMode("under")}
              disabled={rolling}
            >
              Under
            </button>
            <button
              type="button"
              className={`choice${mode === "over" ? " is-active is-active--gold" : ""}`}
              onClick={() => setMode("over")}
              disabled={rolling}
            >
              Over
            </button>
          </div>
          <div className="panel-label">
            <span>Target</span>
            <strong className="mono">{target.toFixed(2)}</strong>
          </div>
          <input
            className="dice-slider"
            type="range"
            min={2}
            max={98}
            step={0.5}
            value={target}
            disabled={rolling}
            onChange={(event) => setTarget(Number(event.target.value))}
            aria-label="Dice target"
          />
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={rolling || amount <= 0}>
            <Icon name="i-dice" /> {rolling ? "Rolling…" : "Roll dice"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? `${chance.toFixed(2)}% chance · ${multiplier(pay)}`}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Limbo                                                               */
/* ================================================================== */

export function LimboGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [target, setTarget] = useState(2);
  const [display, setDisplay] = useState(1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const raf = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((id) => window.clearTimeout(id));
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const chance = Math.min(99, round2(99 / target));

  const animate = (to: number) => {
    const start = performance.now();
    const from = 1;
    const duration = 900;
    const step = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(round2(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const play = () => {
    if (running) return;
    if (!Number.isFinite(target) || target < 1.01) {
      pushToast("Target must be at least 1.01×.", "loss");
      return;
    }
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = Math.max(roll(), 0.000001);
    const outcome = Math.min(1_000_000, Math.floor((0.99 / u) * 100) / 100);
    const win = outcome >= target;
    setRunning(true);
    setResult(null);
    animate(outcome);
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        if (win) {
          const winAmount = round2(amount * target);
          payout(winAmount, meta.name, `Limbo ${multiplier(target)}`);
          setResult({ win: true, text: `+${coins(winAmount)} at ${multiplier(target)}` });
        } else {
          setResult({ win: false, text: `Crashed at ${multiplier(outcome)}.` });
        }
        setHistory((current) => [
          { id: Date.now(), win, label: multiplier(outcome) },
          ...current,
        ].slice(0, 12));
      }, 1000),
    );
  };

  const fill = Math.min(100, (Math.log(Math.max(display, 1)) / Math.log(100)) * 100);

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="limbo-stage">
          <span className="stage-badge">
            Target <strong>{multiplier(target)}</strong>
          </span>
          <div className={`limbo-number${result ? (result.win ? " is-win" : " is-loss") : ""}`}>
            {display.toFixed(2)}×
          </div>
          <div className="limbo-track">
            <div className="limbo-fill" style={{ width: `${fill}%` }} />
          </div>
          <div className="limbo-scale">
            <span>1×</span>
            <span>10×</span>
            <span>100×</span>
          </div>
          <p className="stage-copy">Result = 0.99 ÷ a random number. Beat your target to win.</p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={running} />
          <div className="panel-label">
            <span>Target multiplier</span>
            <span className="muted">{chance.toFixed(2)}% win</span>
          </div>
          <div className="limbo-target">
            <input
              type="number"
              min={1.01}
              step={0.1}
              value={target}
              disabled={running}
              onChange={(event) => setTarget(Math.max(1.01, Number(event.target.value)))}
              aria-label="Target multiplier"
            />
          </div>
          <div className="quick-row">
            {[1.5, 2, 5, 10, 100].map((value) => (
              <button key={value} type="button" onClick={() => setTarget(value)} disabled={running}>
                {value}×
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={running || amount <= 0}>
            <Icon name="i-limbo" /> {running ? "Flying…" : "Launch"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? `${multiplier(target)} pays ${coins(amount * target)}`}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Upgrader                                                            */
/* ================================================================== */

export function UpgraderGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [target, setTarget] = useState(2);
  const [spin, setSpin] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const chance = round2(94 / target);
  const green = Math.max(2, Math.min(92, chance));

  const play = () => {
    if (spinning) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = roll();
    const win = u * 100 < chance;
    setSpinning(true);
    setResult(null);
    const slice = win ? green / 2 : green + (100 - green) / 2;
    setSpin((current) => current + 360 * 5 + (360 - slice));
    window.setTimeout(() => {
      setSpinning(false);
      if (win) {
        const winAmount = round2(amount * target);
        payout(winAmount, meta.name, `Upgrader ${multiplier(target)}`);
        setResult({ win: true, text: `+${coins(winAmount)} at ${multiplier(target)}` });
      } else {
        setResult({ win: false, text: `Missed the green. ${coins(amount)} gone.` });
      }
      setHistory((current) => [
        { id: Date.now(), win, label: win ? multiplier(target) : "miss" },
        ...current,
      ].slice(0, 12));
    }, 1400);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="upgrader-stage">
          <div className="upgrader-wheel-wrap">
            <div
              className="upgrader-wheel"
              style={{
                background: `conic-gradient(#2fbf71 0deg ${green * 3.6}deg, #26302a ${green * 3.6}deg 360deg)`,
                transform: `rotate(${spin}deg)`,
              }}
            >
              <div className="upgrader-hub">
                <Icon name="i-upgrade" />
              </div>
            </div>
            <div className="upgrader-pointer" />
          </div>
          <div className="upgrader-readout">
            <strong>{multiplier(target)}</strong>
            <span>{chance.toFixed(2)}% chance</span>
          </div>
          <ChanceLine chance={chance} payout={target} />
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={spinning} />
          <div className="panel-label">
            <span>Target multiplier</span>
            <strong className="mono">{multiplier(target)}</strong>
          </div>
          <input
            className="dice-slider"
            type="range"
            min={1.2}
            max={10}
            step={0.1}
            value={target}
            disabled={spinning}
            onChange={(event) => setTarget(Number(event.target.value))}
            aria-label="Upgrade target"
          />
          <div className="quick-row">
            {[1.5, 2, 3, 5, 10].map((value) => (
              <button key={value} type="button" onClick={() => setTarget(value)} disabled={spinning}>
                {value}×
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={spinning || amount <= 0}>
            <Icon name="i-upgrade" /> {spinning ? "Spinning…" : "Upgrade"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? `Win ${coins(amount * target)}`}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Double                                                              */
/* ================================================================== */

const DOUBLE_SLOTS = 15;

export function DoubleGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [choice, setChoice] = useState<"red" | "black" | "green">("red");
  const [spin, setSpin] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const play = () => {
    if (spinning) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const slot = Math.min(DOUBLE_SLOTS - 1, Math.floor(roll() * DOUBLE_SLOTS));
    const colour = slot === 0 ? "green" : slot % 2 === 1 ? "red" : "black";
    const win = choice === colour;
    setSpinning(true);
    setResult(null);
    setLanded(null);
    const slice = 360 / DOUBLE_SLOTS;
    const angle = 360 * 6 + (360 - slot * slice - slice / 2);
    setSpin((current) => current + angle);
    window.setTimeout(() => {
      setSpinning(false);
      setLanded(slot);
      if (win) {
        const factor = colour === "green" ? 14 : 2;
        const winAmount = round2(amount * factor);
        payout(winAmount, meta.name, `Double ${colour}`);
        setResult({ win: true, text: `${colour} — +${coins(winAmount)}` });
      } else {
        setResult({ win: false, text: `${colour} — the wheel disagrees.` });
      }
      setHistory((current) => [
        { id: Date.now(), win, label: colour.slice(0, 1).toUpperCase() },
        ...current,
      ].slice(0, 12));
    }, 2200);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="double-stage">
          <div className="double-wheel-wrap">
            <div className="double-pointer" />
            <div className="double-wheel" style={{ transform: `rotate(${spin}deg)` }}>
              {Array.from({ length: DOUBLE_SLOTS }, (_, index) => {
                const colour = index === 0 ? "green" : index % 2 === 1 ? "red" : "black";
                return (
                  <span
                    key={index}
                    className={`double-slot is-${colour}${landed === index ? " is-landed" : ""}`}
                    style={{ transform: `rotate(${index * (360 / DOUBLE_SLOTS)}deg) skewY(-${90 - 360 / DOUBLE_SLOTS}deg)` }}
                  >
                    <span>{index === 0 ? "14×" : "2×"}</span>
                  </span>
                );
              })}
            </div>
            <div className="double-hub">
              <Icon name="i-wheel" />
            </div>
          </div>
          <div className="double-legend">
            <span className="is-red">Red · 7 slots</span>
            <span className="is-black">Black · 7 slots</span>
            <span className="is-green">Green · 1 slot</span>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={spinning} />
          <div className="panel-label">
            <span>Colour</span>
          </div>
          <div className="colour-row">
            <button
              type="button"
              className={`colour-choice is-red${choice === "red" ? " is-active" : ""}`}
              onClick={() => setChoice("red")}
              disabled={spinning}
            >
              Red <span>2×</span>
            </button>
            <button
              type="button"
              className={`colour-choice is-black${choice === "black" ? " is-active" : ""}`}
              onClick={() => setChoice("black")}
              disabled={spinning}
            >
              Black <span>2×</span>
            </button>
            <button
              type="button"
              className={`colour-choice is-green${choice === "green" ? " is-active" : ""}`}
              onClick={() => setChoice("green")}
              disabled={spinning}
            >
              Green <span>14×</span>
            </button>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={spinning || amount <= 0}>
            <Icon name="i-wheel" /> {spinning ? "Spinning…" : "Spin the wheel"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Red and black pay 2×, green pays 14×."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Rock Paper Scissors                                                 */
/* ================================================================== */

const RPS_EMOJI = { rock: "✊", paper: "✋", scissors: "✌" } as const;
type RpsPick = keyof typeof RPS_EMOJI;

export function RpsGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [pick, setPick] = useState<RpsPick>("rock");
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<{ player: RpsPick; bot: RpsPick; outcome: "win" | "loss" | "draw" } | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const play = () => {
    if (busy) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const u = roll();
    const options: RpsPick[] = ["rock", "paper", "scissors"];
    const bot = options[Math.floor(u * 3) % 3];
    const outcome =
      bot === pick ? "draw" : (pick === "rock" && bot === "scissors") || (pick === "paper" && bot === "rock") || (pick === "scissors" && bot === "paper") ? "win" : "loss";
    setBusy(true);
    setResult(null);
    setReveal(null);
    window.setTimeout(() => {
      setBusy(false);
      setReveal({ player: pick, bot, outcome });
      if (outcome === "win") {
        const winAmount = round2(amount * 1.96);
        payout(winAmount, meta.name, "RPS win");
        setResult({ win: true, text: `+${coins(winAmount)} — ${pick} beats ${bot}.` });
      } else if (outcome === "draw") {
        payout(amount, meta.name, "RPS draw refund");
        setResult({ win: false, text: `Draw — your ${coins(amount)} is back.` });
      } else {
        setResult({ win: false, text: `${bot} beats ${pick}. ${coins(amount)} gone.` });
      }
      setHistory((current) => [
        { id: Date.now(), win: outcome === "win", label: outcome === "draw" ? "draw" : outcome === "win" ? "W" : "L" },
        ...current,
      ].slice(0, 12));
    }, 900);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="rps-stage">
          <div className="rps-hands">
            <div className={`rps-hand${reveal?.outcome === "win" ? " is-winner" : ""}`}>
              <span>{reveal ? RPS_EMOJI[reveal.player] : RPS_EMOJI[pick]}</span>
              <strong>You</strong>
            </div>
            <span className="rps-vs">VS</span>
            <div className={`rps-hand${reveal?.outcome === "loss" ? " is-winner" : ""}`}>
              <span>{busy || !reveal ? "✊" : RPS_EMOJI[reveal.bot]}</span>
              <strong>Bot</strong>
            </div>
          </div>
          <p className="stage-copy">
            {reveal
              ? reveal.outcome === "draw"
                ? "Dead even. Bet refunded."
                : reveal.outcome === "win"
                  ? "You take the throw."
                  : "Bot takes the throw."
              : "Pick your throw. Winner pays 1.96×, draws refund."}
          </p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={busy} />
          <div className="panel-label">
            <span>Your throw</span>
          </div>
          <div className="rps-picks">
            {(Object.keys(RPS_EMOJI) as RpsPick[]).map((option) => (
              <button
                key={option}
                type="button"
                className={`rps-pick${pick === option ? " is-active" : ""}`}
                onClick={() => setPick(option)}
                disabled={busy}
                aria-pressed={pick === option}
              >
                <span>{RPS_EMOJI[option]}</span>
                {option}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={busy || amount <= 0}>
            <Icon name="i-rps" /> {busy ? "Throwing…" : "Throw"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Best of one."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
