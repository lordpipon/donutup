"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { coins, formatCountdown } from "@/lib/format";
import { msUntilMidnight, useNow } from "@/lib/useNow";

const RACE_NAMES = [
  { name: "donutlord", score: 18420 },
  { name: "sprinklez", score: 15980 },
  { name: "minesweepr", score: 13740 },
  { name: "limboqueen", score: 11260 },
  { name: "crashkid", score: 9840 },
  { name: "glazedover", score: 7410 },
  { name: "pixelpig", score: 5280 },
  { name: "towerrat", score: 3960 },
];

const PRIZES = [2500, 1500, 750, 400, 200];

export default function RewardsPage() {
  const { user, stats, dailyAmount, dailyReadyAt, claimDaily, rakeback, claimRakeback, pushToast } = useApp();
  const now = useNow();
  const [copied, setCopied] = useState(false);

  const wait = Math.max(0, dailyReadyAt - now);
  const ready = wait <= 0;
  const reset = msUntilMidnight(now);
  const code = user ? `${user.name.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "DONUT"}UP` : "DONUTUP";

  const race = [...RACE_NAMES, { name: user?.name ?? "you", score: Math.round(stats.won), you: true }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 9);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      pushToast("Referral code copied — it is still just a demo.", "info");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      pushToast(`Your demo referral code is ${code}`, "info");
    }
  };

  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Free fake coins</p>
          <h1 className="page-title">
            Rewards &amp; <span className="grad">daily race</span>
          </h1>
          <p className="page-sub">
            Bonuses, rakeback and a leaderboard full of imaginary rivals. Claim as often as the timers allow — it is
            all play money.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-gift" /> Daily bonus
          </span>
          <span className="badge-soft">
            <Icon name="i-refresh" /> 1% rakeback
          </span>
        </div>
      </section>

      <section className="container rewards-page">
        <div className="reward-grid">
          <article className="reward-card reward-card--gold">
            <span className="reward-icon">
              <Icon name="i-gift" />
            </span>
            <p className="kicker">Every 60 seconds</p>
            <h2>Daily bonus</h2>
            <p className="reward-amount">+{dailyAmount} coins</p>
            <p className="muted">
              One click, a small stack of demo coins. The cooldown is one minute so you can keep playing after a bad
              run.
            </p>
            <button className="btn btn-gold btn-block" type="button" disabled={!ready} onClick={() => claimDaily()}>
              <Icon name="i-gift" /> {ready ? `Claim ${dailyAmount} demo coins` : `Claim in ${formatCountdown(wait)}`}
            </button>
          </article>

          <article className="reward-card">
            <span className="reward-icon is-green">
              <Icon name="i-refresh" />
            </span>
            <p className="kicker">Always-on rebate</p>
            <h2>Rakeback</h2>
            <p className="reward-amount is-green">+{coins(rakeback)} coins</p>
            <p className="muted">
              Every wager builds a 1% rebate. Claim it whenever it reaches 1 coin. Lose a lot, get a little back.
            </p>
            <button
              className="btn btn-primary btn-block"
              type="button"
              disabled={rakeback < 1}
              onClick={() => claimRakeback()}
            >
              <Icon name="i-refresh" /> {rakeback >= 1 ? `Claim ${coins(rakeback)}` : "Keep wagering to earn"}
            </button>
          </article>

          <article className="reward-card reward-card--blue">
            <span className="reward-icon is-blue">
              <Icon name="i-trophy" />
            </span>
            <p className="kicker">Resets in {formatCountdown(reset)}</p>
            <h2>Daily race</h2>
            <p className="reward-amount is-blue">{coins(5350)} prize pool</p>
            <p className="muted">
              The top five players on the simulated board share a fake prize pool. Your score is your total demo
              winnings.
            </p>
            <Link className="btn btn-ghost btn-block" href="#race">
              <Icon name="i-trend" /> See the standings
            </Link>
          </article>
        </div>

        <section className="reward-section" id="race">
          <div className="section-head">
            <div>
              <p className="kicker">Live-ish standings</p>
              <h2>Daily race leaderboard</h2>
              <p className="section-sub">Your score: {coins(stats.won)} demo coins won. Resets at midnight local time.</p>
            </div>
            <Link className="text-link" href="/leaderboard">
              Full leaderboard <Icon name="i-arrow" />
            </Link>
          </div>

          <div className="race-prizes">
            {PRIZES.map((prize, index) => (
              <span key={prize} className={`race-prize is-${index + 1}`}>
                <small>#{index + 1}</small>
                <strong>{coins(prize)}</strong>
              </span>
            ))}
          </div>

          <ol className="race-list">
            {race.map((entry, index) => (
              <li key={`${entry.name}-${index}`} className={`race-row${"you" in entry ? " is-you" : ""}`}>
                <span className={`race-rank is-${index + 1}`}>{index + 1}</span>
                <span className="race-avatar">{entry.name.slice(0, 1).toUpperCase()}</span>
                <span className="race-name">
                  {entry.name}
                  {"you" in entry && <small>you</small>}
                </span>
                <span className="race-score">{coins(entry.score)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="reward-section" id="referrals">
          <div className="referral-card">
            <div>
              <p className="kicker">Invite a friend, both get nothing real</p>
              <h2>Demo referrals</h2>
              <p className="muted">
                Share your code with a friend. If they type it into the referral box, you both get 1,000 demo coins.
                There is no tracking, no payout and definitely no affiliate cheque.
              </p>
              <div className="referral-code">
                <code>{code}</code>
                <button className="btn btn-ghost btn-sm" type="button" onClick={copy}>
                  <Icon name={copied ? "i-check" : "i-copy"} /> {copied ? "Copied" : "Copy code"}
                </button>
              </div>
              <p className="wallet-note">
                <Icon name="i-shield" /> Referral codes are cosmetic in this front-end demo. Nothing is sent anywhere.
              </p>
            </div>
            <div className="referral-perks">
              <div>
                <Icon name="i-coin" />
                <strong>1,000 coins</strong>
                <span>for you</span>
              </div>
              <div>
                <Icon name="i-gift" />
                <strong>1,000 coins</strong>
                <span>for them</span>
              </div>
              <div>
                <Icon name="i-shield" />
                <strong>0 real money</strong>
                <span>as always</span>
              </div>
            </div>
          </div>
        </section>

        <section className="reward-section">
          <div className="feature-grid">
            <article className="feature">
              <span className="feature-icon">
                <Icon name="i-clock" />
              </span>
              <h3>Timers that actually tick</h3>
              <p>The daily bonus has a one-minute cooldown stored in your browser, so refreshing does not reset it.</p>
              <span className="feature-tag">localStorage</span>
            </article>
            <article className="feature">
              <span className="feature-icon feature-icon--gold">
                <Icon name="i-refresh" />
              </span>
              <h3>Rakeback on every bet</h3>
              <p>1% of everything you wager since your last claim. It is tiny, it is fake, it is still satisfying.</p>
              <span className="feature-tag">always on</span>
            </article>
            <article className="feature">
              <span className="feature-icon feature-icon--blue">
                <Icon name="i-trophy" />
              </span>
              <h3>Bragging rights only</h3>
              <p>The leaderboard mixes your stats with simulated players. Nothing is submitted to a server.</p>
              <span className="feature-tag">simulated</span>
            </article>
          </div>
        </section>
      </section>
    </>
  );
}
