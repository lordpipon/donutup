"use client";

import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { GameCard } from "@/components/GameCard";
import { HeroArt } from "@/components/HeroArt";
import { GamesGrid } from "@/components/GamesGrid";
import { Icon } from "@/components/Icon";
import { FEATURED_SLUGS, GAMES, getGame } from "@/lib/games";
import { formatCountdown } from "@/lib/format";
import { useNow } from "@/lib/useNow";

export default function HomePage() {
  const { user, openAuth, claimDaily, dailyReadyAt, dailyAmount, setChatOpen, balance, stats } = useApp();
  const now = useNow();

  const wait = Math.max(0, dailyReadyAt - now);
  const ready = wait <= 0;
  const featured = FEATURED_SLUGS.map((slug) => getGame(slug)).filter((game): game is NonNullable<typeof game> => Boolean(game));
  const fresh = GAMES.filter((game) => game.badge === "new").slice(0, 4);

  return (
    <>
      <section className="container hero-wrap" id="top">
        <div className="hero">
          <div className="hero-content">
            <p className="eyebrow">
              <span className="live-dot" /> Play money · provably-fair-style RNG
            </p>
            <h1>
              DonutSMP <span className="grad">Arcade</span>
            </h1>
            <p className="hero-sub">
              Flip, mine, crash and climb the leaderboard. 28 original games, one very fake coin balance. No deposits —
              ever.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link className="btn btn-primary btn-lg" href="/games">
                  <Icon name="i-play" /> Play now
                </Link>
              ) : (
                <button className="btn btn-primary btn-lg" type="button" onClick={() => openAuth("register")}>
                  <Icon name="i-user-plus" /> Create free account
                </button>
              )}
              <Link className="btn btn-ghost btn-lg" href="/games">
                Browse games <Icon name="i-arrow" />
              </Link>
            </div>
            <div className="hero-meta">
              <div className="meta-item">
                <strong>28</strong>
                <span>original games</span>
              </div>
              <div className="meta-item">
                <strong>{balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong>
                <span>your fake coins</span>
              </div>
              <div className="meta-item">
                <strong>{stats.bets}</strong>
                <span>bets placed</span>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <HeroArt />
          </div>
        </div>

        <div className="promo-grid">
          <Link className="promo promo--gold" href="/leaderboard">
            <span className="promo-icon">
              <Icon name="i-trophy" />
            </span>
            <span className="promo-body">
              <span className="promo-kicker">Leaderboard</span>
              <strong>Race to the top</strong>
              <span>Climb the board, flex the stack</span>
            </span>
            <Icon name="i-arrow" className="promo-arrow" />
          </Link>
          <Link className="promo" href="/rewards">
            <span className="promo-icon promo-icon--green">
              <Icon name="i-gift" />
            </span>
            <span className="promo-body">
              <span className="promo-kicker">Rewards</span>
              <strong>Daily bonus</strong>
              <span>Free coins every couple of minutes</span>
            </span>
            <Icon name="i-arrow" className="promo-arrow" />
          </Link>
          <button className="promo" type="button" onClick={() => setChatOpen(true)}>
            <span className="promo-icon promo-icon--discord">
              <Icon name="i-discord" />
            </span>
            <span className="promo-body">
              <span className="promo-kicker">Community</span>
              <strong>Join the chat</strong>
              <span>Say hi — it is all simulated</span>
            </span>
            <Icon name="i-arrow" className="promo-arrow" />
          </button>
          <Link className="promo" href="/wallet">
            <span className="promo-icon promo-icon--blue">
              <Icon name="i-wallet" />
            </span>
            <span className="promo-body">
              <span className="promo-kicker">Wallet</span>
              <strong>Demo deposits</strong>
              <span>Top up instantly, no card needed</span>
            </span>
            <Icon name="i-arrow" className="promo-arrow" />
          </Link>
        </div>
      </section>

      <section className="section container" id="games">
        <div className="section-head">
          <div>
            <p className="kicker">Start here</p>
            <h2>Featured games</h2>
            <p className="section-sub">Eight ways to lose fake coins in style.</p>
          </div>
          <Link className="text-link" href="/games">
            All {GAMES.length} games <Icon name="i-arrow" />
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((game, index) => (
            <GameCard key={game.slug} game={game} index={index} />
          ))}
        </div>
      </section>

      <section className="section container">
        <GamesGrid compact />
      </section>

      <section className="section container" id="rewards">
        <div className="banner-grid">
          <article className="banner banner--gold">
            <span className="banner-art" aria-hidden="true">
              <Icon name="i-chest" />
            </span>
            <div className="banner-body">
              <p className="kicker">Rewards</p>
              <h3>Daily bonus &amp; rakeback</h3>
              <p>
                Claim a free stack of demo coins, then earn 1% rakeback on every wager. It is not real money, but it
                spends like it.
              </p>
              <div className="banner-actions">
                <button
                  className="btn btn-gold"
                  type="button"
                  disabled={!ready}
                  onClick={() => claimDaily()}
                >
                  <Icon name="i-gift" /> Claim {dailyAmount}
                </button>
                <span className={`claim-note${ready ? " is-ready" : ""}`}>
                  {ready ? "Ready to claim" : `Next claim in ${formatCountdown(wait)}`}
                </span>
              </div>
            </div>
          </article>

          <article className="banner banner--green">
            <span className="banner-art" aria-hidden="true">
              <Icon name="i-bolt" />
            </span>
            <div className="banner-body">
              <p className="kicker">Free to play</p>
              <h3>Zero deposit, zero risk</h3>
              <p>
                Every account starts with 5,000 fake coins. Bust your balance? Top up instantly from your account menu
                or the wallet page.
              </p>
              <div className="banner-actions">
                <Link className="btn btn-primary" href="/games/coinflip">
                  <Icon name="i-play" /> Play coinflip
                </Link>
                <span className="claim-note">No sign-up needed</span>
              </div>
            </div>
          </article>
        </div>

        <div className="feature-grid" id="fair">
          <article className="feature">
            <span className="feature-icon">
              <Icon name="i-shield" />
            </span>
            <h3>Provably fair, honestly</h3>
            <p>
              Every demo roll is generated in your browser from a seeded RNG. Check the seed line after each bet — it
              is all client-side.
            </p>
            <span className="feature-tag">1% house edge</span>
          </article>
          <article className="feature">
            <span className="feature-icon feature-icon--gold">
              <Icon name="i-bolt" />
            </span>
            <h3>Instant everything</h3>
            <p>
              No wallet connection, no deposits, no waiting. Bets settle the moment you click, and your balance is
              saved locally.
            </p>
            <span className="feature-tag">localStorage</span>
          </article>
          <article className="feature">
            <span className="feature-icon feature-icon--blue">
              <Icon name="i-chat" />
            </span>
            <h3>A living arcade</h3>
            <p>
              Player counts, chat and the daily race are simulated for the vibe. Say hi — the chat panel is fully
              interactive.
            </p>
            <span className="feature-tag">fan-made demo</span>
          </article>
        </div>
      </section>

      {fresh.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div>
              <p className="kicker">Fresh out of the fryer</p>
              <h2>New games</h2>
              <p className="section-sub">Recently added to the floor.</p>
            </div>
            <Link className="text-link" href="/games">
              See all <Icon name="i-arrow" />
            </Link>
          </div>
          <div className="games-grid games-grid--four">
            {fresh.map((game, index) => (
              <GameCard key={game.slug} game={game} index={index} />
            ))}
          </div>
        </section>
      )}

      <section className="section container" id="support">
        <div className="cta-strip">
          <div>
            <p className="kicker">Need a hand?</p>
            <h2>Built as a front-end showcase</h2>
            <p>
              No real wagering, no accounts on a server and no copied assets. Just Next.js, custom CSS and a seeded RNG
              recreating that DonutSMP arcade energy.
            </p>
          </div>
          <div className="cta-actions">
            <button className="btn btn-primary" type="button" onClick={() => setChatOpen(true)}>
              <Icon name="i-chat" /> Open live chat
            </button>
            <Link className="btn btn-ghost" href="/terms">
              Read the disclaimer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
