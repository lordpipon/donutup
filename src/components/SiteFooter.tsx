"use client";

import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";

export function SiteFooter() {
  const { setChatOpen } = useApp();
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link className="brand brand--footer" href="/">
            <span className="brand-mark brand-mark--logo">
              <Image src="/logo-round.png" alt="" width={64} height={64} />
            </span>
            <span className="brand-word">
              Donut<span>Up</span>
            </span>
          </Link>
          <p>
            A fan-made play-money arcade inspired by DonutSMP. Not affiliated with DonutSMP, Mojang or any wagering
            operator. Every coin on this site is fake.
          </p>
          <div className="footer-socials">
            <button className="icon-btn" type="button" onClick={() => setChatOpen(true)} aria-label="Live chat">
              <Icon name="i-chat" />
            </button>
            <Link className="icon-btn" href="/games" aria-label="Games">
              <Icon name="i-grid" />
            </Link>
            <Link className="icon-btn" href="/fair" aria-label="Provably fair">
              <Icon name="i-shield" />
            </Link>
            <Link className="icon-btn" href="/leaderboard" aria-label="Leaderboard">
              <Icon name="i-trophy" />
            </Link>
          </div>
        </div>

        <div className="footer-col">
          <h3>Games</h3>
          <Link href="/games">All games</Link>
          <Link href="/games/cases">Cases</Link>
          <Link href="/games/mines">Mines</Link>
          <Link href="/games/crash">Crash</Link>
          <Link href="/games/plinko">Plinko</Link>
        </div>

        <div className="footer-col">
          <h3>Arcade</h3>
          <Link href="/rewards">Daily race</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/fair">Provably fair</Link>
          <button type="button" className="footer-link" onClick={() => setChatOpen(true)}>
            Live chat
          </button>
        </div>

        <div className="footer-col">
          <h3>About</h3>
          <Link href="/support">Support &amp; FAQ</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/wallet">Wallet</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} DonutUp. A front-end demo — fake coins only, no real money, no deposits.</p>
        <div className="footer-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> Play money
          </span>
          <span className="badge-soft">No deposits</span>
          <span className="badge-soft">Fan project</span>
        </div>
      </div>
    </footer>
  );
}
