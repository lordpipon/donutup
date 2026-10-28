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
  PlayingCard,
  ResultLine,
  StageResult,
  cardValue,
  deckFromRoll,
  handTotal,
  useFairRoll,
  type Card,
  type HistoryEntry,
} from "@/components/games/shared";

/* ================================================================== */
/* Blackjack                                                           */
/* ================================================================== */

type Phase = "idle" | "player" | "done";

export function BlackjackGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [staked, setStaked] = useState(0);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const settle = (playerCards: Card[], dealerCards: Card[], totalStake: number, blackjack = false) => {
    const p = handTotal(playerCards).total;
    const d = handTotal(dealerCards).total;
    const push = (text: string) => {
      payout(totalStake, meta.name, "Blackjack push");
      setResult({ win: false, text });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "push" }, ...hist].slice(0, 12));
    };
    if (p > 21) {
      setResult({ win: false, text: `Bust at ${p}. ${coins(totalStake)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: `bust ${p}` }, ...hist].slice(0, 12));
    } else if (d > 21) {
      const factor = blackjack ? 2.5 : 2;
      payout(round2(totalStake * factor), meta.name, "Blackjack dealer bust");
      setResult({ win: true, text: `Dealer busts at ${d}. +${coins(totalStake * factor)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: `${factor}×` }, ...hist].slice(0, 12));
    } else if (p > d) {
      const factor = blackjack ? 2.5 : 2;
      payout(round2(totalStake * factor), meta.name, blackjack ? "Blackjack" : "Blackjack win");
      setResult({ win: true, text: `${blackjack ? "Blackjack" : "Win"} ${p}–${d}. +${coins(totalStake * factor)}` });
      setHistory((hist) => [{ id: Date.now(), win: true, label: blackjack ? "BJ" : `${p}` }, ...hist].slice(0, 12));
    } else if (p === d) {
      push(`Push at ${p}. Your ${coins(totalStake)} is back.`);
    } else {
      setResult({ win: false, text: `Dealer ${d} beats ${p}. ${coins(totalStake)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: `${p}` }, ...hist].slice(0, 12));
    }
    setPhase("done");
  };

  const dealerPlay = (playerCards: Card[], dealerCards: Card[], shoe: Card[], totalStake: number) => {
    const cards = [...dealerCards];
    let rest = [...shoe];
    while (handTotal(cards).total < 17) {
      if (rest.length === 0) rest = deckFromRoll(roll);
      cards.push(rest[0]);
      rest = rest.slice(1);
    }
    setDealer(cards);
    setDeck(rest);
    settle(playerCards, cards, totalStake);
  };

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    let shoe = deckFromRoll(roll);
    const p = [shoe[0], shoe[1]];
    const d = [shoe[2], shoe[3]];
    shoe = shoe.slice(4);
    setPlayer(p);
    setDealer(d);
    setDeck(shoe);
    setStaked(amount);
    setResult(null);
    setPhase("player");
    if (handTotal(p).total === 21) {
      if (handTotal(d).total === 21) {
        payout(amount, meta.name, "Blackjack push");
        setResult({ win: false, text: "Both blackjack — push." });
        setHistory((hist) => [{ id: Date.now(), win: false, label: "push" }, ...hist].slice(0, 12));
        setPhase("done");
      } else {
        settle(p, d, amount, true);
      }
    }
  };

  const hit = () => {
    if (phase !== "player") return;
    let shoe = deck.length > 0 ? deck : deckFromRoll(roll);
    const next = [...player, shoe[0]];
    shoe = shoe.slice(1);
    setPlayer(next);
    setDeck(shoe);
    if (handTotal(next).total > 21) settle(next, dealer, staked);
  };

  const stand = () => {
    if (phase !== "player") return;
    dealerPlay(player, dealer, deck, staked);
  };

  const double = () => {
    if (phase !== "player" || player.length !== 2) return;
    if (!bet(amount, `${meta.name} double`)) {
      pushToast("Not enough demo coins to double down.", "loss");
      return;
    }
    let shoe = deck.length > 0 ? deck : deckFromRoll(roll);
    const next = [...player, shoe[0]];
    shoe = shoe.slice(1);
    const total = staked + amount;
    setStaked(total);
    setPlayer(next);
    setDeck(shoe);
    if (handTotal(next).total > 21) {
      settle(next, dealer, total);
      return;
    }
    dealerPlay(next, dealer, shoe, total);
  };

  const playerTotal = handTotal(player).total;
  const dealerTotal = handTotal(dealer).total;
  const showDealer = phase !== "player" && dealer.length > 0;

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="blackjack-stage">
          <span className="stage-badge">
            Dealer <strong>{showDealer ? dealerTotal : dealer.length ? cardValue(dealer[0].rank) : "—"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="blackjack-hand">
            <div className="hand-label">Dealer</div>
            <div className="hand-cards">
              {dealer.length === 0 ? (
                <>
                  <PlayingCard />
                  <PlayingCard />
                </>
              ) : (
                dealer.map((card, index) => (
                  <PlayingCard key={`${card.rank}${card.suit}${index}`} card={card} hidden={!showDealer && index === 1} />
                ))
              )}
            </div>
          </div>
          <div className="blackjack-divider">
            <span>{phase === "player" ? "Your move" : phase === "done" ? "Round over" : "Place a bet"}</span>
          </div>
          <div className="blackjack-hand">
            <div className="hand-label">You {player.length > 0 && <span>{playerTotal}</span>}</div>
            <div className="hand-cards">
              {player.length === 0 ? (
                <>
                  <PlayingCard />
                  <PlayingCard />
                </>
              ) : (
                player.map((card, index) => <PlayingCard key={`${card.rank}${card.suit}${index}`} card={card} />)
              )}
            </div>
          </div>
          {phase === "player" && (
            <div className="blackjack-actions">
              <button className="btn btn-primary" type="button" onClick={hit}>
                Hit
              </button>
              <button className="btn btn-ghost" type="button" onClick={stand}>
                Stand
              </button>
              <button className="btn btn-gold" type="button" onClick={double} disabled={player.length !== 2 || balance < amount}>
                Double
              </button>
            </div>
          )}
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
          <BetInput value={amount} onChange={setAmount} max={balance} disabled={phase === "player"} />
          <button
            className="btn btn-primary btn-block btn-lg"
            type="button"
            onClick={start}
            disabled={phase === "player" || amount <= 0}
          >
            <Icon name="i-blackjack" /> {phase === "done" ? "Deal again" : "Deal"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Blackjack pays 2.5×, a win pays 2×, push refunds."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* HiLo                                                                */
/* ================================================================== */

function rankValue(card: Card): number {
  return cardValue(card.rank) === 11 ? 14 : cardValue(card.rank);
}

export function HiLoGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [deck, setDeck] = useState<Card[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [active, setActive] = useState(false);
  const [multiplierValue, setMultiplierValue] = useState(1);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const remaining = deck.length;
  const currentValue = card ? rankValue(card) : 0;
  const higherCount = deck.filter((item) => rankValue(item) > currentValue).length;
  const lowerCount = deck.filter((item) => rankValue(item) < currentValue).length;
  const higherChance = remaining > 0 ? (higherCount / remaining) * 100 : 0;
  const lowerChance = remaining > 0 ? (lowerCount / remaining) * 100 : 0;

  const start = () => {
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const shoe = deckFromRoll(roll);
    setDeck(shoe.slice(1));
    setCard(shoe[0]);
    setActive(true);
    setMultiplierValue(1);
    setResult(null);
  };

  const guess = (direction: "higher" | "lower") => {
    if (!active || !card) return;
    let shoe = deck.length > 0 ? deck : deckFromRoll(roll);
    const nextCard = shoe[0];
    shoe = shoe.slice(1);
    const current = rankValue(card);
    const next = rankValue(nextCard);
    const chance = direction === "higher" ? higherCount / Math.max(1, remaining) : lowerCount / Math.max(1, remaining);
    setCard(nextCard);
    setDeck(shoe);
    if (next === current) {
      payout(amount, meta.name, "HiLo tie refund");
      setActive(false);
      setResult({ win: false, text: `Tie at ${cardValue(nextCard.rank)} — bet refunded.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "tie" }, ...hist].slice(0, 12));
      return;
    }
    const correct = direction === "higher" ? next > current : next < current;
    if (correct) {
      const factor = Math.max(1.01, round2(0.99 / Math.max(chance, 0.01)));
      setMultiplierValue((value) => round2(value * factor));
      setResult({ win: true, text: `Correct! Next call or cash out ${coins(amount * multiplierValue * factor)}.` });
    } else {
      setActive(false);
      setResult({ win: false, text: `${cardValue(nextCard.rank)} against you. ${coins(amount)} gone.` });
      setHistory((hist) => [{ id: Date.now(), win: false, label: "miss" }, ...hist].slice(0, 12));
    }
  };

  const cashOut = () => {
    if (!active) return;
    const winAmount = round2(amount * multiplierValue);
    payout(winAmount, meta.name, "HiLo cashout");
    setActive(false);
    setResult({ win: true, text: `Cashed out +${coins(winAmount)} at ${multiplier(multiplierValue)}` });
    setHistory((hist) => [{ id: Date.now(), win: true, label: multiplier(multiplierValue) }, ...hist].slice(0, 12));
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="hilo-stage">
          <span className="stage-badge">
            Streak <strong>{multiplier(multiplierValue)}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="hilo-card">
            {card ? <PlayingCard card={card} /> : <PlayingCard />}
          </div>
          <div className="hilo-choices">
            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={() => guess("higher")}
              disabled={!active || higherCount === 0}
            >
              <Icon name="i-hilo" /> Higher <span className="hilo-odds">{higherChance.toFixed(0)}%</span>
            </button>
            <button
              className="btn btn-ghost btn-lg"
              type="button"
              onClick={() => guess("lower")}
              disabled={!active || lowerCount === 0}
            >
              <Icon name="i-hilo" /> Lower <span className="hilo-odds">{lowerChance.toFixed(0)}%</span>
            </button>
          </div>
          <p className="stage-copy">{remaining} cards left in the shoe. Ties refund the round.</p>
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
              <Icon name="i-withdraw" /> Cash out {coins(amount * multiplierValue)}
            </button>
          ) : (
            <button className="btn btn-primary btn-block btn-lg" type="button" onClick={start} disabled={amount <= 0}>
              <Icon name="i-hilo" /> Deal a card
            </button>
          )}
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Higher or lower than the current card?"}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Keno                                                                */
/* ================================================================== */

const KENO_PAYOUTS: Record<number, number> = { 3: 1, 4: 1.5, 5: 3, 6: 8, 7: 25, 8: 100, 9: 400, 10: 1000 };

export function KenoGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [selected, setSelected] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const toggle = (number: number) => {
    if (busy) return;
    setSelected((current) =>
      current.includes(number)
        ? current.filter((item) => item !== number)
        : current.length >= 10
          ? current
          : [...current, number],
    );
  };

  const quickPick = () => {
    if (busy) return;
    const picks = new Set<number>();
    while (picks.size < 10) picks.add(1 + Math.floor(Math.random() * 40));
    setSelected([...picks].sort((a, b) => a - b));
  };

  const play = () => {
    if (busy) return;
    if (selected.length !== 10) {
      pushToast("Pick exactly 10 numbers.", "loss");
      return;
    }
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const picks = new Set<number>();
    while (picks.size < 10) picks.add(1 + (Math.floor(roll() * 40) % 40));
    const draw = [...picks].slice(0, 10);
    setBusy(true);
    setDrawn([]);
    setResult(null);
    draw.forEach((number, index) => {
      window.setTimeout(() => setDrawn((current) => [...current, number]), 110 * (index + 1));
    });
    window.setTimeout(() => {
      const hits = draw.filter((number) => selected.includes(number)).length;
      const factor = KENO_PAYOUTS[hits] ?? 0;
      setBusy(false);
      if (factor > 0) {
        const winAmount = round2(amount * factor);
        payout(winAmount, meta.name, `Keno ${hits}/10`);
        setResult({ win: true, text: `${hits} matches — +${coins(winAmount)} at ${multiplier(factor)}` });
      } else {
        setResult({ win: false, text: `${hits} matches. Need at least 3 to get paid.` });
      }
      setHistory((current) => [{ id: Date.now(), win: factor > 0, label: `${hits}/10` }, ...current].slice(0, 12));
    }, 1400);
  };

  const hits = drawn.filter((number) => selected.includes(number)).length;

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="keno-stage">
          <span className="stage-badge">
            Matches <strong>{drawn.length ? `${hits}/10` : "—"}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="keno-grid">
            {Array.from({ length: 40 }, (_, index) => {
              const number = index + 1;
              const isPicked = selected.includes(number);
              const isDrawn = drawn.includes(number);
              return (
                <button
                  key={number}
                  type="button"
                  className={`keno-cell${isPicked ? " is-picked" : ""}${isDrawn ? " is-drawn" : ""}${isDrawn && isPicked ? " is-hit" : ""}`}
                  onClick={() => toggle(number)}
                  disabled={busy}
                  aria-pressed={isPicked}
                >
                  {number}
                </button>
              );
            })}
          </div>
          <p className="stage-copy">Pick ten numbers. Three matches gets your bet back, ten pays 1,000×.</p>
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
            <span>Selected</span>
            <strong className="mono">{selected.length}/10</strong>
          </div>
          <div className="panel-actions">
            <button className="btn btn-ghost" type="button" onClick={quickPick} disabled={busy}>
              Quick pick
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setSelected([])} disabled={busy}>
              Clear
            </button>
          </div>
          <button
            className="btn btn-primary btn-block btn-lg"
            type="button"
            onClick={play}
            disabled={busy || amount <= 0 || selected.length !== 10}
          >
            <Icon name="i-keno" /> {busy ? "Drawing…" : "Draw numbers"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Match 3 for 1×, 5 for 3×, 10 for 1,000×."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Roulette                                                            */
/* ================================================================== */

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
type RouletteBet = "red" | "black" | "odd" | "even" | "low" | "high" | "straight";

const ROULETTE_BETS: { id: RouletteBet; label: string; payout: string }[] = [
  { id: "red", label: "Red", payout: "2×" },
  { id: "black", label: "Black", payout: "2×" },
  { id: "odd", label: "Odd", payout: "2×" },
  { id: "even", label: "Even", payout: "2×" },
  { id: "low", label: "1–18", payout: "2×" },
  { id: "high", label: "19–36", payout: "2×" },
  { id: "straight", label: "Straight", payout: "36×" },
];

export function RouletteGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [amount, setAmount] = useState(100);
  const [betType, setBetType] = useState<RouletteBet>("red");
  const [straight, setStraight] = useState(7);
  const [spin, setSpin] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pocket, setPocket] = useState<number | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const colourOf = (value: number) => (value === 0 ? "green" : RED_NUMBERS.has(value) ? "red" : "black");

  const play = () => {
    if (spinning) return;
    if (!bet(amount, meta.name)) {
      pushToast("Not enough demo coins for that bet.", "loss");
      return;
    }
    const landed = Math.min(36, Math.floor(roll() * 37));
    const colour = colourOf(landed);
    const win =
      betType === "straight"
        ? landed === straight
        : betType === "red"
          ? colour === "red"
          : betType === "black"
            ? colour === "black"
            : betType === "odd"
              ? landed !== 0 && landed % 2 === 1
              : betType === "even"
                ? landed !== 0 && landed % 2 === 0
                : betType === "low"
                  ? landed >= 1 && landed <= 18
                  : landed >= 19 && landed <= 36;
    const factor = betType === "straight" ? 36 : 2;
    setSpinning(true);
    setPocket(null);
    setResult(null);
    const slice = 360 / 37;
    setSpin((current) => current + 360 * 6 + (360 - landed * slice - slice / 2));
    window.setTimeout(() => {
      setSpinning(false);
      setPocket(landed);
      if (win) {
        const winAmount = round2(amount * factor);
        payout(winAmount, meta.name, `Roulette ${betType}`);
        setResult({ win: true, text: `${landed} ${colour} — +${coins(winAmount)}` });
      } else {
        setResult({ win: false, text: `${landed} ${colour}. ${coins(amount)} gone.` });
      }
      setHistory((current) => [
        { id: Date.now(), win, label: `${landed}` },
        ...current,
      ].slice(0, 12));
    }, 2400);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="roulette-stage">
          <span className="stage-badge">
            Pocket <strong>{pocket ?? "—"}</strong>
          </span>
          <div className="roulette-wheel-wrap">
            <div className="roulette-pointer" />
            <div
              className="roulette-wheel"
              style={{
                transform: `rotate(${spin}deg)`,
                background: "conic-gradient(from 0deg, #2fbf71 0deg 9.73deg, #171c19 9.73deg 360deg)",
              }}
            />
            <div className="roulette-wheel-rim" />
            <div className="roulette-hub">
              <span>{pocket ?? "37"}</span>
            </div>
          </div>
          <div className="roulette-strip">
            {[0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5].map((number, index) => (
              <span key={`${number}-${index}`} className={`roulette-strip-cell is-${colourOf(number)}`}>
                {number}
              </span>
            ))}
          </div>
          <p className="stage-copy">European wheel: 37 pockets, one zero. Straight pays 36×, outside bets pay 2×.</p>
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
            <span>Bet on</span>
          </div>
          <div className="roulette-bets">
            {ROULETTE_BETS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`roulette-bet is-${option.id}${betType === option.id ? " is-active" : ""}`}
                onClick={() => setBetType(option.id)}
                disabled={spinning}
              >
                <span>{option.label}</span>
                <small>{option.payout}</small>
              </button>
            ))}
          </div>
          {betType === "straight" && (
            <div className="bet-input">
              <Icon name="i-roulette" />
              <input
                type="number"
                min={0}
                max={36}
                value={straight}
                disabled={spinning}
                onChange={(event) => setStraight(Math.min(36, Math.max(0, Number(event.target.value))))}
                aria-label="Straight number"
              />
              <span className="input-suffix">0–36</span>
            </div>
          )}
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={play} disabled={spinning || amount <= 0}>
            <Icon name="i-roulette" /> {spinning ? "Spinning…" : "Spin the wheel"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>{result?.text ?? "Place your bet."}</ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
