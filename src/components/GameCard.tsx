import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { categoryLabel, type GameMeta } from "@/lib/games";

export function GameCard({ game, index = 0 }: { game: GameMeta; index?: number }) {
  const players = 90 + ((index * 173 + game.name.length * 41) % 460);
  return (
    <Link
      className="game-card"
      href={`/games/${game.slug}`}
      style={{ "--tint": game.tint, animationDelay: `${Math.min(index * 24, 360)}ms` } as CSSProperties}
      aria-label={`Play ${game.name}`}
    >
      <div className="game-art" />
      <span className="game-watermark" aria-hidden="true">
        <Icon name={game.icon} />
      </span>
      <span className="game-emblem" aria-hidden="true">
        <Icon name={game.icon} />
      </span>
      <span className="game-play" aria-hidden="true">
        <Icon name="i-play" />
      </span>
      {game.badge && <span className="game-new">{game.badge}</span>}
      <div className="game-info">
        <span className="game-title">{game.name}</span>
        <div className="game-publisher">
          <span>{categoryLabel(game.category)}</span>
          <span className="game-players">
            <span className="live-dot" /> {players}
          </span>
        </div>
      </div>
    </Link>
  );
}
