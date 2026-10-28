import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata = {
  title: "Terms of use",
  description: "DonutUp terms of use. A play-money demo with no real wagering, deposits or cash value.",
};

export default function TermsPage() {
  return (
    <>
      <section className="container page-hero">
        <div>
          <p className="kicker">The boring but important bit</p>
          <h1 className="page-title">
            Terms of <span className="grad">use</span>
          </h1>
          <p className="page-sub">Last updated 28 October 2026. Short version: it is a demo, the coins are fake.</p>
        </div>
        <div className="page-hero-badges">
          <span className="badge-soft">
            <Icon name="i-shield" /> No real money
          </span>
          <span className="badge-soft">Fan project</span>
        </div>
      </section>

      <section className="container legal-page">
        <article className="legal-card">
          <h2>1. Play money only</h2>
          <p>
            DonutUp is a front-end demonstration of an arcade-style game collection. Every balance, wager, payout,
            deposit, withdrawal, bonus and leaderboard score is simulated. Coins have no monetary value, cannot be
            purchased, transferred, redeemed or exchanged for anything of value, and do not represent a stake in any
            game of chance.
          </p>

          <h2>2. No gambling services</h2>
          <p>
            This site does not offer real-money gambling and is not a licensed gambling operator. There is no ability to
            deposit real funds, no payment processor integration, no crypto wallet, no cash-out and no payment bot. Do
            not send money to anyone claiming to represent DonutUp.
          </p>

          <h2>3. Local demo accounts</h2>
          <p>
            Accounts are labels stored in your browser. No email address, password or personal profile is collected.
            Clearing site data, using private browsing or switching browsers will reset your balance and history. We
            cannot recover a local demo account because we never receive it.
          </p>

          <h2>4. No affiliation</h2>
          <p>
            DonutUp is an independent, fan-made project. It is not affiliated with, endorsed by or connected to
            DonutSMP, Mojang Studios, Microsoft, any Minecraft server or any wagering operator. All product names and
            icons used here are original or generic; no third-party site assets are copied.
          </p>

          <h2>5. Availability and warranties</h2>
          <p>
            The site is provided “as is” without warranties of any kind. Games may change, break or reset without
            notice. To the maximum extent permitted by law, the project authors are not liable for any loss or damage
            arising from use of the demo — including, theoretically, the loss of imaginary coins.
          </p>

          <h2>6. Acceptable use</h2>
          <ul>
            <li>Do not attempt to use DonutUp for real wagering or present it as a real casino.</li>
            <li>Do not misrepresent the demo to others as a way to deposit, withdraw or earn money.</li>
            <li>Do not attack, overload or attempt to compromise the hosting infrastructure.</li>
          </ul>

          <h2>7. Changes</h2>
          <p>
            These terms may be updated as the demo evolves. The date at the top of this page reflects the latest
            revision. Continued use after a change means you accept the revised terms.
          </p>

          <div className="legal-note">
            <Icon name="i-shield" />
            <span>
              By using DonutUp you confirm that you understand it is an entertainment demo with no real-money
              functionality. If you want to gamble for real money, this is not the site — and please only do so where it
              is legal and you are of age.
            </span>
          </div>

          <div className="legal-actions">
            <Link className="btn btn-ghost" href="/privacy">
              Privacy policy
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
