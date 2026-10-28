"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
/* Pig Race                                                            */
/* ================================================================== */

interface Pig {
  name: string;
  odds: number;
  colour: string;
  weight: number;
}

const PIGS: Pig[] = [
  { name: "Truffle", odds: 2.4, colour: "#f5c542", weight: 38 },
  { name: "Bacon", odds: 3.2, colour: "#ff8a4c", weight: 28 },
  { name: "Hamlet", odds: 4.5, colour: "#f472b6", weight: 20 },
  { name: "Snout", odds: 6, colour: "#63a9ff", weight: 15 },
  { name: "Porkchop", odds: 9, colour: "#4bd68f", weight: 10 },
];

const RACE_TICKS = 34;

export function PigRaceGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [pick, setPick] = useState(0);
  const [positions, setPositions] = useState<number[]>(PIGS.map(() => 0));
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = () => {
    if (racing) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const totalWeight = PIGS.reduce((sum, pig) => sum + pig.weight, 0);
    let ticket = roll() * totalWeight;
    let winnerIndex = PIGS.length - 1;
    for (let i = 0; i < PIGS.length; i++) {
      ticket -= PIGS[i].weight;
      if (ticket < 0) {
        winnerIndex = i;
        break;
      }
    }
    setRacing(true);
    setWinner(null);
    setResult(null);
    setPositions(PIGS.map(() => 0));
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    let tick = 0;
    intervalRef.current = window.setInterval(() => {
      tick += 1;
      const progress = tick / RACE_TICKS;
      setPositions(
        PIGS.map((pig, index) => {
          const noise = (roll() - 0.5) * 0.14;
          const bias = index === winnerIndex ? 0.05 : 0;
          const pace = index === winnerIndex ? 0.92 : 0.78 - (pig.odds - 2.4) * 0.012;
          return Math.max(0, Math.min(1, progress * pace + noise + bias));
        }),
      );
      if (tick >= RACE_TICKS) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPositions(PIGS.map((_, index) => (index === winnerIndex ? 1 : 0.72 + Math.random() * 0.2)));
      }
    }, 90);
    timerRef.current = window.setTimeout(() => {
      setRacing(false);
      setWinner(winnerIndex);
      const pig = PIGS[winnerIndex];
      if (winnerIndex === pick) {
        const winAmount = round2(amount * pig.odds);
        payout(winAmount, meta.name, `Pig race — ${pig.name}`);
        setResult({ win: true, text: `${pig.name} wins! +${coins(winAmount)} at ${multiplier(pig.odds)}` });
      } else {
        setResult({ win: false, text: `${pig.name} took it. ${coins(amount)} gone.` });
      }
      setHistory((current) => [
        { id: Date.now(), win: winnerIndex === pick, label: pig.name },
        ...current,
      ].slice(0, 12));
    }, RACE_TICKS * 90 + 300);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="pig-stage">
          <span className="stage-badge">
            Race <strong>{racing ? "live" : winner !== null ? PIGS[winner].name : "ready"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="pig-track">
            {PIGS.map((pig, index) => (
              <div key={pig.name} className={`pig-lane${winner === index ? " is-winner" : ""}`}>
                <span className="pig-lane-name">
                  <span className="pig-dot" style={{ background: pig.colour }} />
                  {pig.name}
                </span>
                <div className="pig-lane-track">
                  <span
                    className="pig-runner"
                    style={{
                      left: `${positions[index] * 84}%`,
                      borderColor: pig.colour,
                      background: index === pick ? pig.colour : undefined,
                    }}
                  >
                    🐷
                  </span>
                  <span className="pig-finish" />
                </div>
                <span className="pig-lane-odds">{multiplier(pig.odds)}</span>
              </div>
            ))}
          </div>
          <p className="stage-copy">Five pigs, weighted odds, one photo finish. Payout is bet × your pig&apos;s odds.</p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={racing} />
          <div className="panel-label">
            <span>Your pig</span>
          </div>
          <div className="pig-picks">
            {PIGS.map((pig, index) => (
              <button
                key={pig.name}
                type="button"
                className={`pig-pick${pick === index ? " is-active" : ""}`}
                onClick={() => setPick(index)}
                disabled={racing}
                style={{ "--pig": pig.colour } as CSSProperties}
              >
                <span>🐷</span>
                <strong>{pig.name}</strong>
                <small>{multiplier(pig.odds)}</small>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={racing || amount <= 0}>
            <Icon name="i-race" /> {racing ? "Racing…" : "Start race"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? `Backing ${PIGS[pick].name} pays ${multiplier(PIGS[pick].odds)}.`}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Stocks                                                              */
/* ================================================================== */

interface Ticker {
  symbol: string;
  name: string;
  price: number;
  drift: number;
  tint: string;
}

const INITIAL_TICKERS: Ticker[] = [
  { symbol: "DNT", name: "Donut Inc.", price: 120, drift: 0.012, tint: "#f5c542" },
  { symbol: "GLZ", name: "Glaze Labs", price: 84, drift: 0.016, tint: "#4bd68f" },
  { symbol: "SPR", name: "Sprinkle Co.", price: 46, drift: 0.022, tint: "#f472b6" },
  { symbol: "OVN", name: "Oven Works", price: 210, drift: 0.008, tint: "#63a9ff" },
];

interface Position {
  symbol: string;
  invested: number;
  shares: number;
  entry: number;
}

export function StocksGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [tickers, setTickers] = useState<Ticker[]>(INITIAL_TICKERS);
  const [selected, setSelected] = useState(INITIAL_TICKERS[0].symbol);
  const [position, setPosition] = useState<Position | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const symbolRef = useRef(selected);

  useEffect(() => {
    symbolRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTickers((current) =>
        current.map((ticker) => {
          const swing = (roll() - 0.5) * 0.09 + ticker.drift;
          const next = Math.max(8, round2(ticker.price * (1 + swing)));
          return { ...ticker, price: next };
        }),
      );
    }, 2000);
    return () => window.clearInterval(id);
  }, [roll]);

  const active = position;
  const activeTicker = active ? tickers.find((ticker) => ticker.symbol === active.symbol) : null;
  const currentValue = active && activeTicker ? round2(active.shares * activeTicker.price) : 0;
  const pnl = active ? round2(currentValue - active.invested) : 0;

  const buy = () => {
    if (active) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that investment.", "loss");
      return;
    }
    const ticker = tickers.find((item) => item.symbol === symbolRef.current) ?? tickers[0];
    const shares = round2(amount / ticker.price);
    setPosition({ symbol: ticker.symbol, invested: amount, shares, entry: ticker.price });
    setResult(null);
  };

  const sell = () => {
    if (!active) return;
    const ticker = tickers.find((item) => item.symbol === active.symbol);
    if (!ticker) return;
    const value = round2(active.shares * ticker.price);
    payout(value, meta.name, `Stocks — ${active.symbol}`);
    const net = round2(value - active.invested);
    setResult({
      win: net >= 0,
      text: `${active.symbol} sold at ${coins(ticker.price)} — ${net >= 0 ? "+" : ""}${coins(net)}`,
    });
    setHistory((current) => [
      { id: Date.now(), win: net >= 0, label: `${net >= 0 ? "+" : ""}${coins(net)}` },
      ...current,
    ].slice(0, 12));
    setPosition(null);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="stocks-stage">
          <span className="stage-badge">
            Market <strong>{active ? "holding" : "open"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="stocks-grid">
            {tickers.map((ticker) => {
              const up = ticker.price >= (INITIAL_TICKERS.find((item) => item.symbol === ticker.symbol)?.price ?? ticker.price);
              const held = active?.symbol === ticker.symbol;
              return (
                <button
                  key={ticker.symbol}
                  type="button"
                  className={`stock-card${held ? " is-held" : ""}${selected === ticker.symbol ? " is-selected" : ""}`}
                  onClick={() => setSelected(ticker.symbol)}
                  disabled={Boolean(active)}
                  style={{ "--stock": ticker.tint } as CSSProperties}
                >
                  <span className="stock-symbol">{ticker.symbol}</span>
                  <span className="stock-name">{ticker.name}</span>
                  <strong className={up ? "is-up" : "is-down"}>{coins(ticker.price)}</strong>
                  <span className={`stock-trend${up ? " is-up" : " is-down"}`}>
                    <Icon name="i-trend" /> {up ? "up" : "down"} since open
                  </span>
                </button>
              );
            })}
          </div>
          <div className={`stock-position${active ? " is-live" : ""}`}>
            <div>
              <span className="muted">Position</span>
              <strong>{active ? `${active.symbol} · ${coins(active.shares)} shares` : "No open position"}</strong>
            </div>
            <div>
              <span className="muted">Value</span>
              <strong className={pnl > 0 ? "is-up" : pnl < 0 ? "is-down" : ""}>
                {active ? coins(currentValue) : "—"}
              </strong>
            </div>
            <div>
              <span className="muted">P/L</span>
              <strong className={pnl > 0 ? "is-up" : pnl < 0 ? "is-down" : ""}>
                {active ? `${pnl >= 0 ? "+" : ""}${coins(pnl)}` : "—"}
              </strong>
            </div>
          </div>
          <p className="stage-copy">Prices move every two seconds while you hold. Nothing here touches a real market.</p>
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={Boolean(active)} />
          <div className="panel-label">
            <span>Ticker</span>
            <strong className="mono">{selected}</strong>
          </div>
          <div className="quick-row">
            {tickers.map((ticker) => (
              <button
                key={ticker.symbol}
                type="button"
                className={selected === ticker.symbol ? "is-active" : ""}
                onClick={() => setSelected(ticker.symbol)}
                disabled={Boolean(active)}
              >
                {ticker.symbol}
              </button>
            ))}
          </div>
          {active ? (
            <button className="btn btn-gold btn-block btn-lg" type="button" onClick={sell}>
              <Icon name="i-withdraw" /> Sell for {coins(currentValue)}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={buy} disabled={amount <= 0}>
              <Icon name="i-stocks" /> Buy {selected}
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? (active ? "Watch the ticker, then sell." : "Pick a ticker and buy the dip.")}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Snakes                                                              */
/* ================================================================== */

const SNAKES_LAST = 24;
const LADDERS: Record<number, number> = { 3: 11, 7: 15, 17: 20 };
const SNAKES_TRAPS: Record<number, number> = { 13: 6, 19: 9, 22: 14 };

function snakesMove(from: number, die: number): { tile: number; via: "ladder" | "snake" | null } {
  const tile = Math.min(SNAKES_LAST, from + die);
  if (LADDERS[tile]) return { tile: LADDERS[tile], via: "ladder" };
  if (SNAKES_TRAPS[tile]) return { tile: SNAKES_TRAPS[tile], via: "snake" };
  return { tile, via: null };
}

export function SnakesGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [player, setPlayer] = useState(0);
  const [bot, setBot] = useState(0);
  const [die, setDie] = useState<number | null>(null);
  const [turn, setTurn] = useState<"player" | "bot">("player");
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const timers = useRef<number[]>([]);
  const activeRef = useRef(false);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const finish = (win: boolean, text: string) => {
    activeRef.current = false;
    setActive(false);
    setTurn("player");
    if (win) {
      const winAmount = round2(amount * 1.96);
      payout(winAmount, meta.name, "Snakes win");
      setResult({ win: true, text: `${text} +${coins(winAmount)}` });
      setHistory((current) => [{ id: Date.now(), win: true, label: "1.96×" }, ...current].slice(0, 12));
    } else {
      setResult({ win: false, text });
      setHistory((current) => [{ id: Date.now(), win: false, label: "bot" }, ...current].slice(0, 12));
    }
  };

  const botTurn = (playerTile: number, botTile: number) => {
    if (!activeRef.current) return;
    const rollValue = 1 + (Math.floor(roll() * 6) % 6);
    setDie(rollValue);
    const moved = snakesMove(botTile, rollValue);
    timers.current.push(
      window.setTimeout(() => {
        if (!activeRef.current) return;
        setBot(moved.tile);
        if (moved.tile >= SNAKES_LAST) {
          finish(false, `The bot reaches tile ${SNAKES_LAST} first. ${coins(amount)} gone.`);
          return;
        }
        setTurn("player");
      }, 620),
    );
  };

  const rollTurn = () => {
    if (!active || turn !== "player") return;
    const rollValue = 1 + (Math.floor(roll() * 6) % 6);
    setDie(rollValue);
    const moved = snakesMove(player, rollValue);
    setTurn("bot");
    timers.current.push(
      window.setTimeout(() => {
        if (!activeRef.current) return;
        setPlayer(moved.tile);
        if (moved.tile >= SNAKES_LAST) {
          finish(true, "You made it home!");
          return;
        }
        timers.current.push(window.setTimeout(() => botTurn(moved.tile, bot), 520));
      }, 480),
    );
  };

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    setPlayer(0);
    setBot(0);
    setDie(null);
    setTurn("player");
    setResult(null);
    activeRef.current = true;
    setActive(true);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="snakes-stage">
          <span className="stage-badge">
            {active ? (turn === "player" ? "Your roll" : "Bot rolling") : "Ready"}
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="snakes-board">
            {Array.from({ length: SNAKES_LAST }, (_, index) => {
              const tile = index + 1;
              const onPlayer = active && player === tile;
              const onBot = active && bot === tile;
              const ladder = LADDERS[tile];
              const snake = SNAKES_TRAPS[tile];
              return (
                <span
                  key={tile}
                  className={`snake-tile${ladder ? " is-ladder" : ""}${snake ? " is-snake" : ""}`}
                >
                  <small>{tile}</small>
                  {ladder && <span className="snake-tag is-ladder">↑{ladder}</span>}
                  {snake && <span className="snake-tag is-snake">↓{snake}</span>}
                  <span className="snake-pieces">
                    {onPlayer && <span className="snake-piece is-player">Y</span>}
                    {onBot && <span className="snake-piece is-bot">B</span>}
                  </span>
                </span>
              );
            })}
          </div>
          <div className="snakes-meta">
            <span>
              You <strong>{player}</strong>
            </span>
            <span className="snakes-die">{die ?? "–"}</span>
            <span>
              Bot <strong>{bot}</strong>
            </span>
          </div>
          <p className="stage-copy">Ladders jump ahead, snakes drag you back. First to tile 24 wins 1.96×.</p>
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
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={rollTurn} disabled={turn !== "player"}>
              <Icon name="i-dice" /> {turn === "player" ? "Roll the die" : "Waiting for bot…"}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name="i-snake" /> Start race home
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "You roll first. Ladders are your friend."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
