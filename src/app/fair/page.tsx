"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { fairFloat, fairHash, loadSeeds, randomHex, saveSeeds, type FairSeeds } from "@/lib/fair";

export default function FairPage() {
  const { pushToast } = useApp();
  const [seeds, setSeeds] = useState<FairSeeds | null>(null);
  const [server, setServer] = useState("");
  const [client, setClient] = useState("");
  const [nonce, setNonce] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadSeeds();
    setSeeds(loaded);
    setServer(loaded.server);
    setClient(loaded.client);
  }, []);

  const result = fairFloat(server || "seed", client || "seed", nonce);
  const hash = fairHash(server || "seed", client || "seed", nonce);
  const dice = Math.floor(result * 10000) / 100;

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      pushToast("Copied to clipboard", "info");
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      pushToast("Clipboard unavailable in this browser.", "loss");
    }
  };

  const rotate = (which: "server" | "client") => {
    if (!seeds) return;
    const next: FairSeeds = {
      ...seeds,
      [which]: randomHex(which === "server" ? 16 : 8),
    };
    saveSeeds(next);
    setSeeds(next);
    setServer(next.server);
    setClient(next.client);
    pushToast(`${which === "server" ? "Server" : "Client"} seed rotated`, "gold");
  };

  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Provably-fair-style RNG</p>
          <h1 className="page-title">
            Nothing up our <span className="grad">sleeve</span>
          </h1>
          <p className="page-sub">
            Every roll comes from a deterministic hash of two seeds and a nonce, generated in your browser. Verify any
            result here — the maths is the same code the games use.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> Client-side
          </span>
          <span className="badge-soft">
            <Icon name="i-eye" /> Fully inspectable
          </span>
        </div>
      </section>

      <section className="container fair-page">
        <div className="fair-seed-grid">
          <article className="fair-card">
            <div className="fair-card-head">
              <span className="fair-card-icon">
                <Icon name="i-lock" />
              </span>
              <div>
                <p className="kicker">Server seed</p>
                <h2>Fixed per browser</h2>
              </div>
            </div>
            <code className="fair-seed">{seeds?.server ?? "loading…"}</code>
            <div className="fair-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => seeds && copy(seeds.server, "server")}>
                <Icon name={copied === "server" ? "i-check" : "i-copy"} /> Copy
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => rotate("server")}>
                <Icon name="i-refresh" /> Rotate
              </button>
            </div>
            <p className="wallet-note">
              <Icon name="i-shield" /> In a real casino this would stay secret until rotation. Here it lives in your
              localStorage.
            </p>
          </article>

          <article className="fair-card">
            <div className="fair-card-head">
              <span className="fair-card-icon is-gold">
                <Icon name="i-user" />
              </span>
              <div>
                <p className="kicker">Client seed</p>
                <h2>Yours to change</h2>
              </div>
            </div>
            <code className="fair-seed">{seeds?.client ?? "loading…"}</code>
            <div className="fair-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => seeds && copy(seeds.client, "client")}>
                <Icon name={copied === "client" ? "i-check" : "i-copy"} /> Copy
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => rotate("client")}>
                <Icon name="i-refresh" /> Rotate
              </button>
            </div>
            <p className="wallet-note">
              <Icon name="i-bolt" /> Rotating the client seed changes every future nonce but keeps your demo balance.
            </p>
          </article>
        </div>

        <article className="fair-verify">
          <div className="fair-verify-head">
            <div>
              <p className="kicker">Roll your own</p>
              <h2>Verify a result</h2>
              <p className="muted">
                Change any field to see the same seed triple produce a different hash and float. The games feed their
                bets through the same function with an incrementing nonce.
              </p>
            </div>
            <span className="badge-soft">
              <Icon name="i-shield" /> xmur3 + sfc32
            </span>
          </div>

          <div className="fair-form">
            <label className="fair-field">
              <span>Server seed</span>
              <input value={server} onChange={(event) => setServer(event.target.value)} spellCheck={false} />
            </label>
            <label className="fair-field">
              <span>Client seed</span>
              <input value={client} onChange={(event) => setClient(event.target.value)} spellCheck={false} />
            </label>
            <label className="fair-field fair-field--nonce">
              <span>Nonce</span>
              <input
                type="number"
                min={1}
                value={nonce}
                onChange={(event) => setNonce(Math.max(1, Number(event.target.value)))}
              />
            </label>
          </div>

          <div className="fair-output">
            <div>
              <span>Hash</span>
              <code>{hash}</code>
            </div>
            <div>
              <span>Float</span>
              <strong>{result.toFixed(8)}</strong>
            </div>
            <div>
              <span>Dice result</span>
              <strong>{dice.toFixed(2)}</strong>
            </div>
            <div>
              <span>Coin</span>
              <strong>{result < 0.5 ? "Heads" : "Tails"}</strong>
            </div>
          </div>
        </article>

        <div className="fair-steps">
          <article className="fair-step">
            <span className="fair-step-num">01</span>
            <h3>Seeds are created once</h3>
            <p>
              A random server seed and client seed are generated with <code>crypto.getRandomValues</code> and stored in
              localStorage. No seed ever leaves the browser.
            </p>
          </article>
          <article className="fair-step">
            <span className="fair-step-num">02</span>
            <h3>Each bet bumps the nonce</h3>
            <p>
              The triple <code>server:client:nonce</code> is hashed by xmur3, then expanded by an sfc32 generator. The
              first 12 values are discarded before the result is used.
            </p>
          </article>
          <article className="fair-step">
            <span className="fair-step-num">03</span>
            <h3>You can reproduce it</h3>
            <p>
              The same inputs always produce the same float. That is what makes the games deterministic — and why this
              page can verify them without trusting a server.
            </p>
          </article>
        </div>

        <div className="fair-foot">
          <p>
            <Icon name="i-shield" /> To be clear: this is a <strong>provably-fair-style demo</strong>, not a certified
            RNG. There is no real money, no operator, and no reason to audit the donuts.
          </p>
          <Link className="btn btn-primary" href="/games">
            <Icon name="i-play" /> Back to the games
          </Link>
        </div>
      </section>
    </>
  );
}
