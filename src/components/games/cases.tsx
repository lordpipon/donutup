"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { useApp } from "@/components/AppProvider";
import type { GameMeta } from "@/lib/games";
import { CASES, RARITY_COLOR, RARITY_LABEL, casePrice, caseRtp, openCase, type CaseItem } from "@/lib/cases";
import { coins, fmt, round2 } from "@/lib/format";
import {
  FairLine,
  GameLayout,
  History,
  ResultLine,
  StageResult,
  useFairRoll,
  type HistoryEntry,
} from "@/components/games/shared";

function rarityStyle(item: CaseItem) {
  return { "--rarity": RARITY_COLOR[item.rarity] } as CSSProperties;
}

function ReelItem({ item }: { item: CaseItem }) {
  return (
    <div className={`reel-item is-${item.rarity}`} style={rarityStyle(item)}>
      <span className="reel-gem">
        <Icon name="i-case" />
      </span>
      <strong>{item.name}</strong>
      <span>{coins(item.value)}</span>
    </div>
  );
}

/* ================================================================== */
/* Cases                                                               */
/* ================================================================== */

export function CasesGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [caseId, setCaseId] = useState(CASES[0].id);
  const [reel, setReel] = useState<CaseItem[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [outcome, setOutcome] = useState<CaseItem | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const selected = CASES.find((item) => item.id === caseId) ?? CASES[0];
  const price = casePrice(selected);

  const open = () => {
    if (spinning) return;
    if (!bet(price, meta.name)) {
      pushToast("Not enough demo coins for that case.", "loss");
      return;
    }
    const item = openCase(selected, roll());
    const filler = Array.from({ length: 30 }, () => {
      const index = Math.floor(Math.random() * selected.items.length);
      return selected.items[index];
    });
    filler[24] = item;
    setReel(filler);
    setOutcome(null);
    setResult(null);
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setOutcome(item);
      payout(item.value, meta.name, item.name);
      const net = round2(item.value - price);
      setResult({
        win: net >= 0,
        text: `${item.name} — ${coins(item.value)} (${net >= 0 ? "+" : ""}${coins(net)} net)`,
      });
      setHistory((current) => [
        { id: Date.now(), win: net >= 0, label: coins(item.value) },
        ...current,
      ].slice(0, 12));
    }, 2300);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="cases-stage">
          <span className="stage-badge">
            {selected.name} <strong>{coins(price)}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className={`case-reel${spinning ? " is-spinning" : ""}`}>
            <div className="case-reel-window">
              <div
                className="case-reel-track"
                style={{ transform: outcome ? "translateX(calc(50% - 2450px))" : "translateX(0px)" }}
              >
                {(reel.length > 0 ? reel : Array.from({ length: 31 }, () => selected.items[0])).map((item, index) => (
                  <ReelItem key={`${item.name}-${index}`} item={item} />
                ))}
              </div>
              <div className="case-reel-pointer" />
            </div>
            <div className="case-stage-crate" style={{ borderColor: selected.tint }}>
              <span style={{ color: selected.tint }}>
                <Icon name="i-case" />
              </span>
              <strong>{selected.name}</strong>
              <small>{selected.tagline}</small>
              <div className="case-item-strip">
                {selected.items.map((item) => (
                  <span key={item.name} className={`case-dot is-${item.rarity}`} style={rarityStyle(item)} title={`${item.name} · ${coins(item.value)}`} />
                ))}
              </div>
            </div>
          </div>
          <p className="stage-copy">
            Return to player {(caseRtp(selected)).toFixed(1)}% · items are cosmetic labels, coins are fake.
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
          <div className="panel-label">
            <span>Choose a case</span>
          </div>
          <div className="case-picker">
            {CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`case-choice${caseId === item.id ? " is-active" : ""}`}
                onClick={() => setCaseId(item.id)}
                disabled={spinning}
                style={{ "--case-tint": item.tint } as CSSProperties}
              >
                <Icon name="i-case" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{coins(casePrice(item))} · {(caseRtp(item)).toFixed(1)}% RTP</small>
                </span>
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-block btn-lg"
            type="button"
            onClick={open}
            disabled={spinning || price > balance}
          >
            <Icon name="i-chest" /> {spinning ? "Opening…" : `Open for ${coins(price)}`}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Every case is tuned to roughly a 94% return."}
          </ResultLine>
          {outcome && (
            <div className="case-outcome" style={rarityStyle(outcome)}>
              <span>{RARITY_LABEL[outcome.rarity]}</span>
              <strong>{outcome.name}</strong>
              <small>{coins(outcome.value)}</small>
            </div>
          )}
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}

/* ================================================================== */
/* Case Battles                                                        */
/* ================================================================== */

export function CaseBattlesGame({ meta }: { meta: GameMeta }) {
  const { balance, bet, payout, pushToast } = useApp();
  const { roll, hash } = useFairRoll();
  const [caseId, setCaseId] = useState(CASES[0].id);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<{ player: CaseItem; bot: CaseItem; outcome: "win" | "loss" | "draw" } | null>(null);
  const [result, setResult] = useState<{ win: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const selected = CASES.find((item) => item.id === caseId) ?? CASES[0];
  const price = casePrice(selected);

  const battle = () => {
    if (busy) return;
    if (!bet(price, meta.name)) {
      pushToast("Not enough demo coins for that battle.", "loss");
      return;
    }
    const playerItem = openCase(selected, roll());
    const botItem = openCase(selected, roll());
    const outcome = playerItem.value === botItem.value ? "draw" : playerItem.value > botItem.value ? "win" : "loss";
    setBusy(true);
    setReveal(null);
    setResult(null);
    window.setTimeout(() => {
      setBusy(false);
      setReveal({ player: playerItem, bot: botItem, outcome });
      if (outcome === "win") {
        const winAmount = round2(price * 1.96);
        payout(winAmount, meta.name, "Case battle win");
        setResult({ win: true, text: `You win the pot: +${coins(winAmount)}` });
      } else if (outcome === "draw") {
        payout(price, meta.name, "Case battle draw");
        setResult({ win: false, text: "Identical value — entry refunded." });
      } else {
        setResult({ win: false, text: `Bot takes it. ${coins(price)} gone.` });
      }
      setHistory((current) => [
        { id: Date.now(), win: outcome === "win", label: outcome === "draw" ? "draw" : outcome === "win" ? "W" : "L" },
        ...current,
      ].slice(0, 12));
    }, 1600);
  };

  return (
    <GameLayout
      meta={meta}
      stage={
        <div className="casebattle-stage">
          <span className="stage-badge">
            Entry <strong>{coins(price)}</strong>
          </span>
          <StageResult status={result ? (result.win ? "win" : "loss") : null}>{result?.text}</StageResult>
          <div className="casebattle-grid">
            <div className={`casebattle-side${reveal?.outcome === "win" ? " is-winner" : ""}`}>
              <div className="casebattle-head">
                <span className="avatar">Y</span>
                <strong>You</strong>
              </div>
              {reveal ? (
                <ReelItem item={reveal.player} />
              ) : (
                <div className={`casebattle-hidden${busy ? " is-opening" : ""}`}>
                  <Icon name="i-case" />
                  <span>{busy ? "Opening…" : "Ready"}</span>
                </div>
              )}
            </div>
            <div className="casebattle-vs">VS</div>
            <div className={`casebattle-side${reveal && reveal.outcome !== "win" && reveal.outcome !== "draw" ? " is-winner" : ""}`}>
              <div className="casebattle-head">
                <span className="avatar vs-bot">B</span>
                <strong>Battlebot</strong>
              </div>
              {reveal ? (
                <ReelItem item={reveal.bot} />
              ) : (
                <div className={`casebattle-hidden${busy ? " is-opening" : ""}`}>
                  <Icon name="i-case" />
                  <span>{busy ? "Opening…" : "Ready"}</span>
                </div>
              )}
            </div>
          </div>
          <p className="stage-copy">Same case, same odds. Highest item value takes the 1.96× pot.</p>
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
          <div className="panel-label">
            <span>Battle case</span>
          </div>
          <div className="case-picker">
            {CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`case-choice${caseId === item.id ? " is-active" : ""}`}
                onClick={() => setCaseId(item.id)}
                disabled={busy}
                style={{ "--case-tint": item.tint } as CSSProperties}
              >
                <Icon name="i-case" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{coins(casePrice(item))} entry</small>
                </span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="button" onClick={battle} disabled={busy || price > balance}>
            <Icon name="i-battles" /> {busy ? "Battling…" : "Start battle"}
          </button>
          <ResultLine status={result ? (result.win ? "win" : "loss") : "idle"}>
            {result?.text ?? "Both players open one item. Highest value wins."}
          </ResultLine>
          <History entries={history} />
          <FairLine hash={hash} />
        </>
      }
    />
  );
}
