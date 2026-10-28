"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { useApp } from "@/components/AppProvider";
import type { GameMeta } from "@/lib/games";
import { coins, fmt, round2 } from "@/lib/format";
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
/* Mines Duel                                                          */
/* ================================================================== */

type DuelOwner = "player" | "bot";

export function MinesDuelGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<{ index: number; owner: DuelOwner; mine: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const picked = new Set<number>();
    while (picked.size < 5) picked.add(Math.floor(roll() * 25) % 25);
    setMines([...picked]);
    setRevealed([]);
    setActive(true);
    setBusy(false);
    setResult(null);
  };

  const botTurn = (revealedState: { index: number; owner: DuelOwner; mine: boolean }[], mineState: number[]) => {
    const available = Array.from({ length: 25 }, (_, index) => index).filter(
      (index) => !revealedState.some((cell) => cell.index === index),
    );
    if (available.length === 0) return;
    const choice = available[Math.floor(roll() * available.length) % available.length];
    const isMine = mineState.includes(choice);
    const nextRevealed = [...revealedState, { index: choice, owner: "bot" as const, mine: isMine }];
    setRevealed(nextRevealed);
    if (isMine) {
      const winAmount = round2(amount * 1.96);
      payout(winAmount, meta.name, "Mines duel win");
      setActive(false);
      setBusy(false);
      setResult({ win: true, text: `Battlebot hit a mine! +${coins(winAmount)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: "1.96×" }, ...hist].slice(0, 12));
      return;
    }
    setBusy(false);
  };

  const pick = (index: number) => {
    if (!active || busy || revealed.some((cell) => cell.index === index)) return;
    const isMine = mines.includes(index);
    const nextRevealed = [...revealed, { index, owner: "player" as const, mine: isMine }];
    setRevealed(nextRevealed);
    if (isMine) {
      setActive(false);
      setResult({ win: false, text: `Mine on your turn. ${coins(amount)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "mine" }, ...hist].slice(0, 12));
      return;
    }
    setBusy(true);
    window.setTimeout(() => botTurn(nextRevealed, mines), 750);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="duel-stage">
          <span className="stage-badge">
            {busy ? "Battlebot's turn" : active ? "Your turn" : "Ready"}
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="duel-players">
            <span className="duel-player is-you">
              <span className="avatar">Y</span> You
            </span>
            <span className="duel-vs">vs</span>
            <span className="duel-player is-bot">
              <span className="avatar vs-bot">B</span> Battlebot
            </span>
          </div>
          <div className="mines-grid duel-grid">
            {Array.from({ length: 25 }, (_, index) => {
              const cell = revealed.find((item) => item.index === index);
              return (
                <button
                  key={index}
                  type="button"
                  className={`mine-tile${cell ? (cell.mine ? " is-mine" : cell.owner === "player" ? " is-revealed" : " is-bot") : ""}`}
                  onClick={() => pick(index)}
                  disabled={!active || busy || Boolean(cell)}
                  aria-label={cell ? (cell.mine ? "Mine" : `${cell.owner} safe pick`) : "Hidden tile"}
                >
                  <Icon name={cell?.mine ? "i-bomb" : cell ? "i-check" : "i-sparkle"} />
                </button>
              );
            })}
          </div>
          <p className="stage-copy">Alternate safe picks. First player to uncover a mine loses the pot.</p>
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
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={active || amount <= 0}>
            <Icon name="i-duel" /> {active ? "Duel in progress" : "Challenge bot"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Five mines, 25 tiles, one shared board."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Connect Four                                                        */
/* ================================================================== */

const C4_COLS = 7;
const C4_ROWS = 6;
type Disc = "p" | "b" | null;

function dropDisc(board: Disc[], col: number, who: "p" | "b"): { board: Disc[]; row: number } | null {
  for (let row = C4_ROWS - 1; row >= 0; row--) {
    if (!board[row * C4_COLS + col]) {
      const next = [...board];
      next[row * C4_COLS + col] = who;
      return { board: next, row };
    }
  }
  return null;
}

function c4Winner(board: Disc[], row: number, col: number): Disc {
  const who = board[row * C4_COLS + col];
  if (!who) return null;
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && board[r * C4_COLS + c] === who) {
        count += 1;
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (count >= 4) return who;
  }
  return null;
}

function c4FindWin(board: Disc[], who: "p" | "b"): number | null {
  for (let col = 0; col < C4_COLS; col++) {
    const dropped = dropDisc(board, col, who);
    if (!dropped) continue;
    if (c4Winner(dropped.board, dropped.row, col) === who) return col;
  }
  return null;
}

export function ConnectFourGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [board, setBoard] = useState<Disc[]>(Array(42).fill(null));
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const finish = (win: boolean, draw = false) => {
    setActive(false);
    setBusy(false);
    if (draw) {
      payout(amount, meta.name, "Connect Four draw");
      setResult({ win: false, text: "Board full — bet refunded." });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "draw" }, ...hist].slice(0, 12));
      return;
    }
    if (win) {
      const winAmount = round2(amount * 1.96);
      payout(winAmount, meta.name, "Connect Four win");
      setResult({ win: true, text: `Four in a row! +${coins(winAmount)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: "1.96×" }, ...hist].slice(0, 12));
    } else {
      setResult({ win: false, text: `The bot connects four. ${coins(amount)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "bot" }, ...hist].slice(0, 12));
    }
  };

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    setBoard(Array(42).fill(null));
    setActive(true);
    setBusy(false);
    setResult(null);
  };

  const play = (col: number) => {
    if (!active || busy) return;
    const dropped = dropDisc(board, col, "p");
    if (!dropped) return;
    if (c4Winner(dropped.board, dropped.row, col) === "p") {
      setBoard(dropped.board);
      finish(true);
      return;
    }
    if (dropped.board.every(Boolean)) {
      setBoard(dropped.board);
      finish(false, true);
      return;
    }
    setBoard(dropped.board);
    setBusy(true);
    window.setTimeout(() => {
      const winning = c4FindWin(dropped.board, "b");
      const block = c4FindWin(dropped.board, "p");
      const valid = Array.from({ length: C4_COLS }, (_, index) => index).filter(
        (index) => dropDisc(dropped.board, index, "b"),
      );
      const preferred = winning ?? block ?? valid[Math.floor(roll() * valid.length) % valid.length];
      const botMove = dropDisc(dropped.board, preferred, "b");
      if (!botMove) {
        finish(false, true);
        return;
      }
      if (c4Winner(botMove.board, botMove.row, preferred) === "b") {
        setBoard(botMove.board);
        finish(false);
        return;
      }
      setBoard(botMove.board);
      setBusy(false);
      if (botMove.board.every(Boolean)) finish(false, true);
    }, 520);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="c4-stage">
          <span className="stage-badge">
            {busy ? "Bot thinking" : active ? "Your turn — red" : "Ready"}
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className={`c4-board${busy ? " is-busy" : ""}`} role="grid" aria-label="Connect Four board">
            {board.map((disc, index) => {
              const col = index % C4_COLS;
              return (
                <button
                  key={index}
                  type="button"
                  role="gridcell"
                  className={`c4-cell${disc === "p" ? " is-red" : disc === "b" ? " is-yellow" : ""}`}
                  onClick={() => play(col)}
                  disabled={!active || busy}
                  aria-label={`Column ${col + 1}`}
                >
                  {disc && <span className="c4-disc" />}
                </button>
              );
            })}
          </div>
          <div className="c4-legend">
            <span className="is-red">You</span>
            <span className="is-yellow">Bot</span>
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
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={active || amount <= 0}>
            <Icon name="i-connect" /> {active ? "Game in progress" : "New game"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "You move first. Connect four before the bot."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Draw                                                                */
/* ================================================================== */

const DOODLES: { name: string; art: ReactNode }[] = [
  {
    name: "donut",
    art: (
      <>
        <circle cx="100" cy="100" r="62" />
        <circle cx="100" cy="100" r="20" />
        <path d="M70 60l10-10M128 60l10-10M142 112l12 4M64 120l-12 6M100 155l4 12" />
      </>
    ),
  },
  {
    name: "cat",
    art: (
      <>
        <circle cx="100" cy="108" r="48" />
        <path d="M62 76l-8-34 34 14M138 76l8-34-34 14M82 104h.01M118 104h.01M100 118l-6 8h12l-6-8M72 122l-26 8M72 132l-26 14M128 122l26 8M128 132l26 14" />
      </>
    ),
  },
  {
    name: "house",
    art: (
      <>
        <path d="M40 96 100 44l60 52" />
        <path d="M54 94v66h92V94" />
        <path d="M86 160v-38h28v38M74 112h10M116 112h10" />
      </>
    ),
  },
  {
    name: "rocket",
    art: (
      <>
        <path d="M100 28c26 20 36 50 28 84l-28 22-28-22c-8-34 2-64 28-84Z" />
        <circle cx="100" cy="76" r="14" />
        <path d="M72 100 48 130l24 2M128 100l24 30-24 2M88 136l12 34 12-34" />
      </>
    ),
  },
  {
    name: "fish",
    art: (
      <>
        <path d="M42 100c24-30 62-38 98-14 10 7 18 14 20 14-2 0-10 7-20 14-36 24-74 16-98-14Z" />
        <path d="M140 100l30-26v52l-30-26" />
        <circle cx="76" cy="94" r="4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "star",
    art: (
      <>
        <path d="m100 34 20 44 48 6-35 34 9 48-42-24-42 24 9-48-35-34 48-6 20-44Z" />
      </>
    ),
  },
  {
    name: "tree",
    art: (
      <>
        <path d="M100 36 60 96h24l-28 42h88l-28-42h24L100 36Z" />
        <path d="M94 138h12v30H94zM60 168h80" />
      </>
    ),
  },
  {
    name: "ghost",
    art: (
      <>
        <path d="M56 160V96a44 44 0 0 1 88 0v64l-15-12-14 12-15-12-15 12-14-12-15 12Z" />
        <circle cx="84" cy="96" r="5" fill="currentColor" stroke="none" />
        <circle cx="116" cy="96" r="5" fill="currentColor" stroke="none" />
        <path d="M100 108v10" />
      </>
    ),
  },
  {
    name: "ice cream",
    art: (
      <>
        <path d="M76 112h48l-24 56-24-56Z" />
        <circle cx="100" cy="84" r="30" />
        <path d="M82 56c4-14 18-20 32-10 12-4 20 6 16 16" />
      </>
    ),
  },
  {
    name: "umbrella",
    art: (
      <>
        <path d="M36 108a64 64 0 0 1 128 0H36Z" />
        <path d="M100 44v92a18 18 0 0 0 36 0" />
        <path d="M68 108c0-18 8-34 18-44M132 108c0-18-8-34-18-44" />
      </>
    ),
  },
];

export function DrawGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [doodle, setDoodle] = useState<(typeof DOODLES)[number] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const liveRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const finish = (correct: boolean) => {
    if (!liveRef.current) return;
    liveRef.current = false;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setActive(false);
    if (correct) {
      const winAmount = round2(amount * 1.9);
      payout(winAmount, meta.name, "Draw guess");
      setResult({ win: true, text: `Correct! +${coins(winAmount)}` });
    } else {
      setResult({ win: false, text: `Wrong doodle. ${coins(amount)} gone.` });
    }
    setHistory((hist) => [{ id: Date.now(), win: correct, label: correct ? "1.9×" : "miss" }, ...hist].slice(0, 12));
  };

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const index = Math.floor(roll() * DOODLES.length) % DOODLES.length;
    const correct = DOODLES[index];
    const others = DOODLES.filter((item) => item.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((item) => item.name);
    const shuffled = [correct.name, ...others].sort(() => Math.random() - 0.5);
    liveRef.current = true;
    setDoodle(correct);
    setOptions(shuffled);
    setAnswer(null);
    setResult(null);
    setActive(true);
    // Wall-clock deadline, read only from this click handler.
    // eslint-disable-next-line react-hooks/purity
    const startedAt = Date.now();
    setDeadline(startedAt + 12_000);
    setNow(startedAt);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => finish(false), 12_000);
  };

  const choose = (option: string) => {
    if (!active || !doodle) return;
    setAnswer(option);
    finish(option === doodle.name);
  };

  const remaining = active ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="draw-stage">
          <span className="stage-badge">
            Timer <strong>{active ? `${remaining}s` : "—"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className={`doodle-frame${active ? " is-live" : ""}`}>
            {doodle ? (
              <svg viewBox="0 0 200 200" className="doodle-svg" role="img" aria-label="Mystery doodle">
                <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                  {doodle.art}
                </g>
              </svg>
            ) : (
              <span className="doodle-placeholder">
                <Icon name="i-draw" />
                Place a bet to reveal a doodle
              </span>
            )}
          </div>
          <div className="draw-options">
            {(active ? options : options.length ? options : ["?", "?", "?", "?"]).map((option, index) => (
              <button
                key={`${option}-${index}`}
                type="button"
                className={`draw-option${answer === option ? " is-chosen" : ""}${active && doodle && option === doodle.name && answer ? " is-correct" : ""}`}
                onClick={() => choose(option)}
                disabled={!active}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="stage-copy">Guess the doodle in 12 seconds. Correct pays 1.9×.</p>
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
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={active || amount <= 0}>
            <Icon name="i-draw" /> {active ? "Drawing…" : "Start round"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Four options, one doodle, twelve seconds."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Uno                                                                 */
/* ================================================================== */

type UnoColor = "red" | "yellow" | "green" | "blue" | "wild";
interface UnoCard {
  id: number;
  color: UnoColor;
  value: string;
}

const UNO_COLORS: UnoColor[] = ["red", "yellow", "green", "blue"];

function makeUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let id = 0;
  for (const color of UNO_COLORS) {
    for (let value = 1; value <= 9; value++) {
      deck.push({ id: id++, color, value: String(value) });
      deck.push({ id: id++, color, value: String(value) });
    }
  }
  for (let wild = 0; wild < 6; wild++) deck.push({ id: id++, color: "wild", value: "wild" });
  return deck;
}

function unoPlayable(card: UnoCard, top: UnoCard): boolean {
  if (card.color === "wild") return true;
  return card.color === top.color || card.value === top.value;
}

function unoPreferredColor(hand: UnoCard[]): UnoColor {
  const counts = new Map<UnoColor, number>();
  for (const card of hand) {
    if (card.color === "wild") continue;
    counts.set(card.color, (counts.get(card.color) ?? 0) + 1);
  }
  let best: UnoColor = "red";
  let bestCount = -1;
  for (const color of UNO_COLORS) {
    const count = counts.get(color) ?? 0;
    if (count > bestCount) {
      best = color;
      bestCount = count;
    }
  }
  return best;
}

function UnoCardView({ card, onClick, disabled }: { card: UnoCard; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`uno-card is-${card.color}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${card.color} ${card.value}`}
    >
      <span className="uno-card-inner">
        <span className="uno-corner">{card.value === "wild" ? "W" : card.value}</span>
        <span className="uno-centre">{card.value === "wild" ? "★" : card.value}</span>
        <span className="uno-corner uno-corner--bottom">{card.value === "wild" ? "W" : card.value}</span>
      </span>
    </button>
  );
}

export function UnoGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [active, setActive] = useState(false);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [botHand, setBotHand] = useState<UnoCard[]>([]);
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [top, setTop] = useState<UnoCard | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const finish = (win: boolean, text: string) => {
    setActive(false);
    if (win) {
      const winAmount = round2(amount * 1.96);
      payout(winAmount, meta.name, "Uno win");
      setResult({ win: true, text: `${text} +${coins(winAmount)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: "1.96×" }, ...hist].slice(0, 12));
    } else {
      setResult({ win: false, text });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "bot" }, ...hist].slice(0, 12));
    }
  };

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const shuffled = makeUnoDeck();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(roll() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let cursor = 0;
    let starting = shuffled[cursor++];
    while (starting.color === "wild") starting = shuffled[cursor++];
    const player = shuffled.slice(cursor, cursor + 7);
    const bot = shuffled.slice(cursor + 7, cursor + 14);
    const rest = shuffled.slice(cursor + 14);
    setDeck(rest);
    setPlayerHand(player);
    setBotHand(bot);
    setTop(starting);
    setActive(true);
    setResult(null);
  };

  const playCard = (card: UnoCard) => {
    if (!active || !top || !unoPlayable(card, top)) return;
    const nextTop: UnoCard = card.color === "wild" ? { ...card, color: unoPreferredColor(playerHand.filter((item) => item.id !== card.id)) } : card;
    const nextHand = playerHand.filter((item) => item.id !== card.id);
    setTop(nextTop);
    setPlayerHand(nextHand);
    if (nextHand.length === 0) {
      finish(true, "You emptied your hand!");
      return;
    }
    let nextBot = [...botHand];
    let nextDeck = [...deck];
    const botIndex = nextBot.findIndex((item) => unoPlayable(item, nextTop));
    if (botIndex >= 0) {
      const played = nextBot[botIndex];
      nextBot = nextBot.filter((_, index) => index !== botIndex);
      const botTop: UnoCard = played.color === "wild" ? { ...played, color: unoPreferredColor(nextBot) } : played;
      setTop(botTop);
      setBotHand(nextBot);
      if (nextBot.length === 0) {
        finish(false, "The bot emptied its hand first.");
        return;
      }
      return;
    }
    if (nextDeck.length > 0) {
      const drawn = nextDeck[0];
      nextDeck = nextDeck.slice(1);
      nextBot = [...nextBot, drawn];
      setDeck(nextDeck);
      setBotHand(nextBot);
      if (unoPlayable(drawn, nextTop)) {
        nextBot = nextBot.filter((item) => item.id !== drawn.id);
        const botTop: UnoCard = drawn.color === "wild" ? { ...drawn, color: unoPreferredColor(nextBot) } : drawn;
        setTop(botTop);
        setBotHand(nextBot);
        if (nextBot.length === 0) finish(false, "The bot drew and emptied its hand.");
      }
    }
  };

  const drawForPlayer = () => {
    if (!active || !top) return;
    if (deck.length === 0) return;
    const drawn = deck[0];
    const nextDeck = deck.slice(1);
    const nextHand = [...playerHand, drawn];
    setDeck(nextDeck);
    setPlayerHand(nextHand);
    let nextBot = [...botHand];
    let rest = [...nextDeck];
    const botIndex = nextBot.findIndex((item) => unoPlayable(item, top));
    if (botIndex >= 0) {
      const played = nextBot[botIndex];
      nextBot = nextBot.filter((_, index) => index !== botIndex);
      const botTop: UnoCard = played.color === "wild" ? { ...played, color: unoPreferredColor(nextBot) } : played;
      setTop(botTop);
      setBotHand(nextBot);
      if (nextBot.length === 0) finish(false, "The bot emptied its hand first.");
      return;
    }
    if (rest.length > 0) {
      nextBot = [...nextBot, rest[0]];
      rest = rest.slice(1);
      setDeck(rest);
      setBotHand(nextBot);
    }
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="uno-stage">
          <span className="stage-badge">
            Deck <strong>{deck.length}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="uno-opponent">
            <span className="uno-label">
              <span className="avatar vs-bot">B</span> Battlebot · {botHand.length} cards
            </span>
            <div className="uno-hand uno-hand--bot">
              {botHand.map((card) => (
                <span key={card.id} className="uno-back" />
              ))}
            </div>
          </div>
          <div className="uno-table">
            <div className="uno-pile">
              <span className="uno-pile-label">Draw</span>
              <span className="uno-back uno-back--pile">{deck.length}</span>
            </div>
            <div className="uno-pile">
              <span className="uno-pile-label">Top</span>
              {top ? <UnoCardView card={top} disabled /> : <span className="uno-back uno-back--pile" />}
            </div>
          </div>
          <div className="uno-player">
            <span className="uno-label">Your hand · {playerHand.length} cards</span>
            <div className="uno-hand">
              {playerHand.length === 0 && <span className="uno-empty">No cards yet.</span>}
              {playerHand.map((card) => (
                <UnoCardView
                  key={card.id}
                  card={card}
                  onClick={() => playCard(card)}
                  disabled={!active || !top || !unoPlayable(card, top)}
                />
              ))}
            </div>
          </div>
          {active && (
            <button className="btn btn-ghost btn-sm uno-draw" type="button" onClick={drawForPlayer} disabled={deck.length === 0}>
              Draw a card
            </button>
          )}
          <p className="stage-copy">Match by colour or number. Wilds choose your strongest colour.</p>
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
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={active || amount <= 0}>
            <Icon name="i-uno" /> {active ? "Game in progress" : "Deal a game"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Empty your hand before the bot to win 1.96×."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
