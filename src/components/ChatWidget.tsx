"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { avatarColor, initials } from "@/lib/format";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  ts: number;
  system?: boolean;
  self?: boolean;
}

const START_MESSAGES: ChatMessage[] = [
  { id: "m1", user: "glazedgoblin", text: "anyone hitting the crash ladder tonight?", ts: Date.now() - 1000 * 60 * 14 },
  { id: "m2", user: "donutlord", text: "just pulled a mythic from the bronze crate 💀", ts: Date.now() - 1000 * 60 * 11 },
  { id: "m3", user: "mace_energy", text: "plinko high risk is a personality, not a strategy", ts: Date.now() - 1000 * 60 * 8 },
  { id: "m4", user: "sprinklez", text: "daily bonus resets in a minute, don't forget", ts: Date.now() - 1000 * 60 * 5 },
  { id: "m5", user: "toasted", text: "who's up for a case battle? 1v1 me", ts: Date.now() - 1000 * 60 * 3 },
  { id: "m6", user: "DonutUp", text: "Reminder: every coin here is fake. No deposits, no real money.", ts: Date.now() - 1000 * 60 * 1, system: true },
];

const BOT_REPLIES = [
  "that's the spirit. fake coins, real adrenaline.",
  "ngl the mines cashout button gets me every time",
  "sending it on limbo 100× brb",
  "the daily bonus is free, just saying",
  "bro the plinko edge buckets are calling me",
  "this is a demo chat but I respect the grind",
  "spear_and_mace would be proud",
  "donut up or shut up 🍩",
];

const BOT_NAMES = ["glazedgoblin", "mace_energy", "sprinklez", "toasted", "donutlord", "crashcart"];

function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function ChatWidget() {
  const { chatOpen, setChatOpen, balance, user, tip, pushToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(START_MESSAGES);
  const [draft, setDraft] = useState("");
  const [pool, setPool] = useState(12450);
  const [online, setOnline] = useState(0);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimer = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => setOnline(130 + Math.floor(Math.random() * 60));
    tick();
    if (!chatOpen) return;
    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
  }, [chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setChatOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    };
  }, []);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const name = user?.name ?? "Guest";
    setMessages((current) => [
      ...current,
      { id: `me-${Date.now()}`, user: name, text, ts: Date.now(), self: true },
    ]);
    setDraft("");
    setTyping(true);
    const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
    const who = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `bot-${Date.now()}`, user: who, text: reply, ts: Date.now() },
      ]);
      setTyping(false);
    }, 1300 + Math.random() * 900);
  };

  const sendRain = () => {
    if (!tip(25, "Chat rain tip")) {
      pushToast("Not enough demo coins for that tip.", "loss");
      return;
    }
    setPool((current) => current + 25);
    setMessages((current) => [
      ...current,
      { id: `rain-${Date.now()}`, user: "DonutUp", text: "You tipped 25 demo coins into the rain pool.", ts: Date.now(), system: true },
    ]);
    pushToast("Tipped 25 demo coins into the rain pool.", "gold");
  };

  return (
    <>
      <button
        className="chat-fab"
        type="button"
        aria-expanded={chatOpen}
        aria-controls="chatPanel"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <Icon name="i-chat" />
        <span>Live chat</span>
        <span className="chat-fab-count">{online}</span>
      </button>

      {chatOpen && (
        <aside className="chat-panel" id="chatPanel" aria-label="Live chat">
          <div className="chat-head">
            <div>
              <strong>
                <span className="live-dot" aria-hidden="true" /> Live chat
              </strong>
              <span className="muted">{online} online</span>
            </div>
            <button className="icon-btn" type="button" onClick={() => setChatOpen(false)} aria-label="Close chat">
              <Icon name="i-x" />
            </button>
          </div>

          <div className="rain-strip">
            <span>
              <Icon name="i-coin" /> Rain pool
            </span>
            <strong>{pool.toLocaleString("en-US")}</strong>
            <button className="rain-btn" type="button" onClick={sendRain} title="Tip 25 demo coins into the pool">
              Tip 25
            </button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((message) =>
              message.system ? (
                <div className="chat-msg chat-msg--system" key={message.id}>
                  {message.text}
                </div>
              ) : (
                <div className={`chat-msg${message.self ? " chat-msg--me" : ""}`} key={message.id}>
                  <span className="chat-avatar" style={{ background: avatarColor(message.user) }}>
                    {initials(message.user)}
                  </span>
                  <div className="chat-body">
                    <span className="chat-name" style={{ color: avatarColor(message.user) }}>
                      {message.user}
                    </span>
                    <span className="chat-time">{clock(message.ts)}</span>
                    <div className="chat-text">{message.text}</div>
                  </div>
                </div>
              ),
            )}
            {typing && (
              <div className="chat-msg">
                <span className="chat-avatar" style={{ background: "#2fbf71" }}>
                  ?
                </span>
                <div className="chat-body">
                  <span className="chat-time">someone is typing…</span>
                </div>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={send} autoComplete="off">
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={140}
              placeholder="Say something…"
              aria-label="Chat message"
            />
            <button className="btn btn-primary btn-icon" type="submit" aria-label="Send message" disabled={!draft.trim()}>
              <Icon name="i-arrow" />
            </button>
          </form>
          <p className="chat-note">
            Demo chat — local only. You have {balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} fake coins.
          </p>
        </aside>
      )}
    </>
  );
}
