"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";

const FAQS = [
  {
    q: "Is any of this real money?",
    a: "No. Every coin is fake, deposits are simulated and withdrawals simply reduce a number in localStorage. There is no payment processor, cash-out, crypto wallet or Minecraft payment bot anywhere in this project.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can play immediately as a guest with 5,000 demo coins. Creating a local account only adds a name to the header and the simulated leaderboard. No email or password is stored.",
  },
  {
    q: "Where is my balance saved?",
    a: "In your browser's localStorage under the key donutup.state.v1. Clearing site data wipes your balance, stats and transaction history. Nothing is synced to a server.",
  },
  {
    q: "How does the provably-fair RNG work?",
    a: "Each roll hashes a server seed, client seed and nonce with xmur3, then expands it with sfc32. The seeds live in localStorage. Visit the Provably fair page to inspect, rotate and reproduce any result.",
  },
  {
    q: "Why did my balance reset?",
    a: "Private browsing, a different browser or clearing site data starts a fresh local account. The Wallet page also has a reset option. There is no server-side backup to restore.",
  },
  {
    q: "Is this affiliated with DonutSMP?",
    a: "No. DonutUp is a fan-made front-end showcase inspired by the DonutSMP community. It is not affiliated with DonutSMP, Mojang, Microsoft or any wagering operator, and it uses no copied site assets.",
  },
];

const CHANNELS = [
  {
    icon: "i-chat",
    title: "Live chat",
    body: "The chat widget in the corner is simulated but interactive. Open it and say hello.",
    action: "chat" as const,
  },
  {
    icon: "i-shield",
    title: "Fairness questions",
    body: "Every seed and hash is inspectable. Start with the verifier if a roll looked suspicious.",
    action: "fair" as const,
  },
  {
    icon: "i-stocks",
    title: "Something broken?",
    body: "Open an issue on the public repository. Include your browser and the page you were on.",
    action: "issues" as const,
  },
];

export default function SupportPage() {
  const { setChatOpen } = useApp();

  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Help &amp; FAQ</p>
          <h1 className="page-title">
            Support for a site with <span className="grad">no customers</span>
          </h1>
          <p className="page-sub">
            DonutUp is a self-contained demo. Most answers live in this page, and the rest are one simulated chat
            message away.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> Play money
          </span>
          <span className="badge-soft">
            <Icon name="i-clock" /> No wait times
          </span>
        </div>
      </section>

      <section className="container support-page">
        <div className="support-grid">
          {CHANNELS.map((channel) => {
            const inner = (
              <>
                <span className="support-card-icon">
                  <Icon name={channel.icon} />
                </span>
                <h2>{channel.title}</h2>
                <p>{channel.body}</p>
                <span className="support-card-link">
                  {channel.action === "chat" ? "Open chat" : channel.action === "fair" ? "Verify the RNG" : "View repository"}
                  <Icon name="i-arrow" />
                </span>
              </>
            );
            if (channel.action === "chat") {
              return (
                <button key={channel.title} className="support-card" type="button" onClick={() => setChatOpen(true)}>
                  {inner}
                </button>
              );
            }
            if (channel.action === "fair") {
              return (
                <Link key={channel.title} className="support-card" href="/fair">
                  {inner}
                </Link>
              );
            }
            return (
              <a
                key={channel.title}
                className="support-card"
                href="https://github.com/lordpipon/donutup/issues"
                target="_blank"
                rel="noreferrer"
              >
                {inner}
              </a>
            );
          })}
        </div>

        <section className="support-faq">
          <div className="section-head">
            <div>
              <p className="kicker">The short version</p>
              <h2>Frequently asked questions</h2>
              <p className="section-sub">Six answers that cover almost everything.</p>
            </div>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, index) => (
              <details key={faq.q} className="faq-item" open={index === 0}>
                <summary>
                  <span>{faq.q}</span>
                  <Icon name="i-caret" />
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="support-limits">
          <div>
            <p className="kicker">Known limits</p>
            <h2>What this demo deliberately does not do</h2>
          </div>
          <ul className="support-list">
            <li>
              <Icon name="i-x" /> No real deposits, withdrawals or payment methods.
            </li>
            <li>
              <Icon name="i-x" /> No accounts on a server, passwords, emails or recovery.
            </li>
            <li>
              <Icon name="i-x" /> No multiplayer, real opponents or persistent chat history.
            </li>
            <li>
              <Icon name="i-x" /> No cash value, crypto, skins or item trading.
            </li>
            <li>
              <Icon name="i-check" /> Plenty of fake coins and 28 games that actually work.
            </li>
          </ul>
        </section>

        <div className="fair-foot">
          <p>
            <Icon name="i-shield" /> If a page looks broken, a hard refresh or clearing site data usually fixes it.
            Nothing you do here can cost you money.
          </p>
          <Link className="btn btn-primary" href="/games">
            <Icon name="i-grid" /> Browse the arcade
          </Link>
        </div>
      </section>
    </>
  );
}
