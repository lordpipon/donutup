"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { FEATURED_SLUGS, GAMES } from "@/lib/games";
import { fmt, initials } from "@/lib/format";

const SUB_LINKS = [
  { href: "/games", label: "Casino", match: "/games" },
  { href: "/rewards#race", label: "Daily race", match: "/rewards" },
  { href: "/rewards#referrals", label: "Referrals", match: "/rewards" },
  { href: "/fair", label: "Provably fair", match: "/fair" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { balance, user, openAuth, signOut, topUp, setChatOpen } = useApp();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [online, setOnline] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setGamesOpen(false);
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => setOnline(150 + Math.floor(Math.random() * 80));
    tick();
    const id = window.setInterval(tick, 6500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
      if (!headerRef.current?.contains(event.target as Node)) {
        setGamesOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGamesOpen(false);
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const featured = FEATURED_SLUGS.map((slug) => GAMES.find((game) => game.slug === slug)).filter(
    (game): game is NonNullable<typeof game> => Boolean(game),
  );

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} ref={headerRef}>
      <div className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" href="/" aria-label="DonutUp home">
            <span className="brand-mark brand-mark--logo">
              <Image src="/logo-round.png" alt="" width={64} height={64} priority />
            </span>
            <span className="brand-word">
              Donut<span>Up</span>
            </span>
            <span className="brand-tag">demo</span>
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <button
              className="nav-pill"
              type="button"
              aria-expanded={gamesOpen}
              aria-controls="gamesMenu"
              onClick={() => setGamesOpen((open) => !open)}
            >
              <Icon name="i-grid" />
              <span>Games</span>
              <Icon name="i-caret" className="caret" />
            </button>
            <Link className="nav-pill nav-pill--gold" href="/rewards">
              <Icon name="i-gift" />
              <span>Rewards</span>
            </Link>
          </nav>

          <div className="topbar-actions">
            <Link className="wallet" href="/wallet" title="Your demo wallet">
              <span className="wallet-coin">
                <Icon name="i-coin" />
              </span>
              <span className="wallet-amount">{fmt(balance)}</span>
              <span className="wallet-plus" aria-hidden="true">
                <Icon name="i-plus" />
              </span>
            </Link>

            <div className="online-pill" title="Players online (simulated)">
              <span className="live-dot" aria-hidden="true" />
              <span>{online}</span>
              <span className="online-label">online</span>
            </div>

            {user ? (
              <div className="account" ref={accountRef}>
                <button
                  className="avatar-btn"
                  type="button"
                  aria-expanded={accountOpen}
                  aria-controls="accountMenu"
                  aria-label="Account menu"
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span className="avatar">{initials(user.name)}</span>
                </button>
                {accountOpen && (
                  <div className="account-menu" id="accountMenu">
                    <div className="account-head">
                      <span className="avatar avatar--lg">{initials(user.name)}</span>
                      <div>
                        <strong>{user.name}</strong>
                        <span className="muted">Local demo account</span>
                      </div>
                    </div>
                    <div className="account-balance">
                      <span>Balance</span>
                      <strong>
                        <Icon name="i-coin" />
                        {fmt(balance)}
                      </strong>
                    </div>
                    <Link className="menu-item" href="/wallet" onClick={() => setAccountOpen(false)}>
                      <Icon name="i-wallet" /> Wallet &amp; transactions
                    </Link>
                    <button className="menu-item" type="button" onClick={topUp}>
                      <Icon name="i-plus" /> Add 1,000 demo coins
                    </button>
                    <button className="menu-item" type="button" onClick={signOut}>
                      <Icon name="i-logout" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-actions">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => openAuth("signin")}>
                  Sign in
                </button>
                <button className="btn btn-primary btn-sm" type="button" onClick={() => openAuth("register")}>
                  Register
                </button>
              </div>
            )}

            <button
              className="icon-btn mobile-menu-btn"
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobileMenu"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <Icon name={mobileOpen ? "i-x" : "i-menu"} />
            </button>
          </div>
        </div>
      </div>

      <div className="subbar">
        <div className="container subbar-inner">
          {SUB_LINKS.map((link) => (
            <Link
              key={link.label}
              className={`sub-link${pathname === link.match ? " is-active" : ""}`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <span className="subbar-spacer" />
          <button className="sub-link sub-chat" type="button" onClick={() => setChatOpen(true)}>
            <span className="live-dot" aria-hidden="true" /> Live chat
          </button>
          <Link className="sub-link" href="/support">
            Support
          </Link>
        </div>
      </div>

      {gamesOpen && (
        <div className="games-menu" id="gamesMenu">
          <div className="container">
            <div className="menu-head">
              <div>
                <p className="kicker">Jump back in</p>
                <h2>Popular games</h2>
              </div>
              <Link className="text-link" href="/games">
                View all {GAMES.length} games <Icon name="i-arrow" />
              </Link>
            </div>
            <div className="menu-grid">
              {featured.map((game) => (
                <Link className="menu-game" key={game.slug} href={`/games/${game.slug}`}>
                  <span className="menu-game-icon">
                    <Icon name={game.icon} />
                  </span>
                  <span>
                    <strong>{game.name}</strong>
                    <span>{game.category === "instant" ? "Instant" : game.category === "versus" ? "Versus" : game.category === "table" ? "Table" : "Minigame"}</span>
                  </span>
                  {game.badge === "hot" && <span className="menu-game-badge">hot</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="mobile-menu" id="mobileMenu">
          <nav aria-label="Mobile navigation">
            <Link className="mobile-link" href="/games">
              Casino
            </Link>
            <Link className="mobile-link" href="/rewards">
              Rewards
            </Link>
            <Link className="mobile-link" href="/leaderboard">
              Leaderboard
            </Link>
            <Link className="mobile-link" href="/fair">
              Provably fair
            </Link>
            <Link className="mobile-link" href="/wallet">
              Wallet
            </Link>
            <Link className="mobile-link" href="/support">
              Support
            </Link>
          </nav>
          {user ? (
            <div className="mobile-auth">
              <button className="btn btn-ghost btn-block" type="button" onClick={signOut}>
                Sign out
              </button>
              <Link className="btn btn-primary btn-block" href="/wallet">
                Wallet
              </Link>
            </div>
          ) : (
            <div className="mobile-auth">
              <button
                className="btn btn-ghost btn-block"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth("signin");
                }}
              >
                Sign in
              </button>
              <button
                className="btn btn-primary btn-block"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth("register");
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
