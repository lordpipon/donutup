"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { coins, fmt, timeAgo } from "@/lib/format";
import type { TxKind } from "@/components/AppProvider";

const TX_ICON: Record<TxKind, string> = {
  deposit: "i-deposit",
  withdraw: "i-withdraw",
  bet: "i-play",
  payout: "i-coin",
  bonus: "i-gift",
  topup: "i-plus",
  rakeback: "i-refresh",
};

const TX_LABEL: Record<TxKind, string> = {
  deposit: "Demo deposit",
  withdraw: "Simulated withdrawal",
  bet: "Bet",
  payout: "Payout",
  bonus: "Bonus",
  topup: "Top-up",
  rakeback: "Rakeback",
};

export default function WalletPage() {
  const {
    balance,
    user,
    transactions,
    stats,
    deposit,
    withdraw,
    topUp,
    pushToast,
    openAuth,
  } = useApp();
  const [depositAmount, setDepositAmount] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState(500);

  const doDeposit = () => {
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      pushToast("Enter a deposit amount above zero.", "loss");
      return;
    }
    if (deposit(depositAmount)) {
      pushToast(`Simulated deposit: +${coins(depositAmount)} demo coins`, "win");
    } else {
      pushToast("That deposit is outside the demo limit.", "loss");
    }
  };

  const doWithdraw = () => {
    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      pushToast("Enter a withdrawal amount above zero.", "loss");
      return;
    }
    if (withdraw(withdrawAmount)) {
      pushToast(`Simulated withdrawal: ${coins(withdrawAmount)} demo coins removed`, "gold");
    } else {
      pushToast("Not enough demo coins for that withdrawal.", "loss");
    }
  };

  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Play money only</p>
          <h1 className="page-title">
            Your <span className="grad">demo wallet</span>
          </h1>
          <p className="page-sub">
            Everything here is simulated. Deposits create fake coins, withdrawals delete them, and no payment method
            ever touches this site.
          </p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> No real payments
          </span>
          <span className="badge-soft">
            <Icon name="i-lock" /> Saved locally
          </span>
        </div>
      </section>

      <section className="container wallet-page">
        <div className="wallet-balance-card">
          <div className="wallet-balance-main">
            <span className="wallet-balance-label">Demo balance</span>
            <strong>
              <Icon name="i-coin" /> {fmt(balance)}
            </strong>
            <span className="muted">{user ? `Signed in as ${user.name}` : "Playing as a local guest"}</span>
          </div>
          <div className="wallet-stat-row">
            <div>
              <span>Wagered</span>
              <strong>{coins(stats.wagered)}</strong>
            </div>
            <div>
              <span>Won</span>
              <strong>{coins(stats.won)}</strong>
            </div>
            <div>
              <span>Biggest win</span>
              <strong>{coins(stats.biggestWin)}</strong>
            </div>
            <div>
              <span>Bets</span>
              <strong>{stats.bets}</strong>
            </div>
          </div>
          <div className="wallet-balance-actions">
            <button className="btn btn-primary" type="button" onClick={topUp}>
              <Icon name="i-plus" /> Free 1,000 top-up
            </button>
            <Link className="btn btn-ghost" href="/games">
              <Icon name="i-play" /> Play a game
            </Link>
          </div>
        </div>

        <div className="wallet-grid">
          <article className="wallet-card">
            <div className="wallet-card-head">
              <span className="wallet-card-icon is-green">
                <Icon name="i-deposit" />
              </span>
              <div>
                <h2>Simulated deposit</h2>
                <p>Creates demo coins out of thin air. No card, no invoice.</p>
              </div>
            </div>
            <div className="bet-input">
              <Icon name="i-coin" />
              <input
                type="number"
                min={1}
                step={100}
                value={depositAmount === 0 ? "" : depositAmount}
                onChange={(event) => setDepositAmount(Math.max(0, Number(event.target.value)))}
                aria-label="Demo deposit amount"
              />
            </div>
            <div className="quick-row">
              {[500, 1000, 5000, 10000].map((value) => (
                <button key={value} type="button" onClick={() => setDepositAmount(value)}>
                  {fmt(value)}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-block" type="button" onClick={doDeposit}>
              <Icon name="i-deposit" /> Add {coins(depositAmount)} demo coins
            </button>
            <p className="wallet-note">
              <Icon name="i-shield" /> This button does not process money. It only edits the number in your browser.
            </p>
          </article>

          <article className="wallet-card">
            <div className="wallet-card-head">
              <span className="wallet-card-icon is-gold">
                <Icon name="i-withdraw" />
              </span>
              <div>
                <h2>Simulated withdrawal</h2>
                <p>Removes demo coins from your local balance.</p>
              </div>
            </div>
            <div className="bet-input">
              <Icon name="i-coin" />
              <input
                type="number"
                min={1}
                step={100}
                value={withdrawAmount === 0 ? "" : withdrawAmount}
                onChange={(event) => setWithdrawAmount(Math.max(0, Number(event.target.value)))}
                aria-label="Simulated withdrawal amount"
              />
            </div>
            <div className="quick-row">
              {[250, 500, 1000, 5000].map((value) => (
                <button key={value} type="button" onClick={() => setWithdrawAmount(value)}>
                  {fmt(value)}
                </button>
              ))}
            </div>
            <button className="btn btn-gold btn-block" type="button" onClick={doWithdraw} disabled={balance <= 0}>
              <Icon name="i-withdraw" /> Withdraw {coins(withdrawAmount)}
            </button>
            <p className="wallet-note">
              <Icon name="i-bolt" /> There is no cash-out, no wallet address and no payment bot. It is a counter.
            </p>
          </article>

          <article className="wallet-card wallet-card--wide">
            <div className="wallet-card-head">
              <span className="wallet-card-icon is-blue">
                <Icon name="i-history" />
              </span>
              <div>
                <h2>Transaction history</h2>
                <p>The last 60 demo movements, stored in localStorage.</p>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div className="empty-state empty-state--sm">
                <Icon name="i-history" />
                <h3>No transactions yet</h3>
                <p>Claim a bonus or place a bet and it will show up here.</p>
              </div>
            ) : (
              <ul className="tx-list">
                {transactions.map((tx) => (
                  <li key={tx.id} className="tx-row">
                    <span className={`tx-icon${tx.amount >= 0 ? " is-plus" : " is-minus"}`}>
                      <Icon name={TX_ICON[tx.kind]} />
                    </span>
                    <span className="tx-main">
                      <strong>{tx.label}</strong>
                      <small>
                        {TX_LABEL[tx.kind]} · {timeAgo(tx.ts)}
                      </small>
                    </span>
                    <span className={`tx-amount${tx.amount >= 0 ? " is-plus" : " is-minus"}`}>
                      {tx.amount >= 0 ? "+" : "−"}
                      {coins(Math.abs(tx.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="wallet-card wallet-card--wide wallet-account">
            <div>
              <p className="kicker">Local account</p>
              <h2>{user ? `Signed in as ${user.name}` : "You are playing as a guest"}</h2>
              <p className="muted">
                Accounts exist only in this browser. No email, no password, no server. Signing in simply labels your
                balance and adds you to the simulated leaderboard.
              </p>
            </div>
            <div className="wallet-account-actions">
              {user ? (
                <span className="badge-soft">
                  <Icon name="i-user" /> {user.name}
                </span>
              ) : (
                <button className="btn btn-primary" type="button" onClick={() => openAuth("register")}>
                  <Icon name="i-user-plus" /> Create a local account
                </button>
              )}
              <Link className="btn btn-ghost" href="/rewards">
                <Icon name="i-gift" /> Claim rewards
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
