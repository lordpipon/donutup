import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata = {
  title: "Privacy policy",
  description: "DonutUp privacy policy. No accounts on a server, no tracking, no personal data collection.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">Nothing to sell, nothing to leak</p>
          <h1 className="page-title">
            Privacy <span className="grad">policy</span>
          </h1>
          <p className="page-sub">Last updated 28 October 2026. Your demo balance never leaves your browser.</p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-lock" /> localStorage only
          </span>
          <span className="badge-soft">No tracking</span>
        </div>
      </section>

      <section className="container legal-page">
        <article className="legal-card">
          <h2>1. What we collect</h2>
          <p>
            DonutUp does not operate a user database. There is no sign-up form that sends data anywhere, no email
            collection, no password storage, no analytics script and no advertising pixel. Your demo account is a JSON
            object kept in your browser&apos;s localStorage.
          </p>

          <h2>2. What is stored locally</h2>
          <ul>
            <li>
              <strong>donutup.state.v1</strong> — your display name, demo balance, simulated transactions, wager and
              payout stats, and cooldown timestamps.
            </li>
            <li>
              <strong>donutup.seeds.v1</strong> — the server and client seeds used by the demo RNG.
            </li>
          </ul>
          <p>
            This data stays on your device. It is sent to no server and is not shared with any third party. You can
            erase it at any time by clearing site data for this domain or using the reset option on the wallet page.
          </p>

          <h2>3. Cookies and analytics</h2>
          <p>
            The app does not set advertising or analytics cookies. Hosting infrastructure may keep standard access logs
            (such as IP address and request path) for security and reliability, as nearly all web hosts do. Those logs
            are not linked to a DonutUp account because no such account exists on the server.
          </p>

          <h2>4. Third-party services</h2>
          <p>
            Fonts are served through the Next.js font pipeline. If the site is deployed on Vercel, Vercel processes
            requests under its own privacy terms. Outbound links (for example to the public repository) are subject to
            the destination site&apos;s policy. No payment or wallet providers are integrated.
          </p>

          <h2>5. Children and eligibility</h2>
          <p>
            The site is an entertainment demo intended for a general audience, but it depicts casino-style games. It is
            not directed at children. Because no real wagering exists, no age verification is performed — but please do
            not present the demo to minors as a gambling product.
          </p>

          <h2>6. Your choices</h2>
          <ul>
            <li>Clear localStorage to remove your demo profile and seeds.</li>
            <li>Use private browsing to start with a clean, disposable session.</li>
            <li>Disable JavaScript and the site will not run — but it also will not collect anything.</li>
          </ul>

          <h2>7. Contact</h2>
          <p>
            Privacy questions can be raised through the public repository&apos;s issue tracker. Since no personal data
            is collected, there is no data-deletion request process beyond clearing your own browser storage.
          </p>

          <div className="legal-note">
            <Icon name="i-lock" />
            <span>
              In plain terms: the only person who can see your DonutUp history is you. The coins are fake and the
              privacy surface is about as small as a web app can have.
            </span>
          </div>

          <div className="legal-actions">
            <Link className="btn btn-ghost" href="/terms">
              Terms of use
            </Link>
            <Link className="btn btn-primary" href="/games">
              <Icon name="i-play" /> Back to the arcade
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
