import Link from "next/link";
import { Icon } from "@/components/Icon";
import { GAMES } from "@/lib/games";

export default function NotFound() {
  return (
    <section className="container not-found">
      <div className="not-found-art" aria-hidden="true">
        <Icon name="i-donut" />
      </div>
      <p className="kicker">404 · dropped on the floor</p>
      <h1>This page rolled away.</h1>
      <p className="page-sub">
        The link is broken, the donut is stale, or the game never existed. Either way there is plenty more to play.
      </p>
      <div className="not-found-actions">
        <Link className="btn btn-primary btn-lg" href="/games">
          <Icon name="i-grid" /> Browse {GAMES.length} games
        </Link>
        <Link className="btn btn-ghost btn-lg" href="/">
          Back to the arcade
        </Link>
      </div>
    </section>
  );
}
