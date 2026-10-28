"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { GameCard } from "@/components/GameCard";
import { CATEGORIES, GAMES, type Category } from "@/lib/games";

type Filter = Category | "all";

export function GamesGrid({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const games = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GAMES.filter((game) => {
      if (filter !== "all" && game.category !== filter) return false;
      if (!needle) return true;
      return `${game.name} ${game.blurb} ${game.category}`.toLowerCase().includes(needle);
    });
  }, [filter, query]);

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["all", GAMES.length]]);
    for (const game of GAMES) map.set(game.category, (map.get(game.category) ?? 0) + 1);
    return map;
  }, []);

  return (
    <>
      <div className="section-head">
        <div>
          <p className="kicker">The floor</p>
          <h2>{compact ? "Featured games" : "All games"}</h2>
          <p className="section-sub">
            {compact ? "Hand-picked chaos. All 28 are playable." : "Pick a game, set a bet, chase the multiplier."}
          </p>
        </div>
        <div className="games-tools">
          <label className="search">
            <Icon name="i-search" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games…"
              aria-label="Search games"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd aria-hidden="true">/</kbd>
          </label>
        </div>
      </div>

      <div className="filters" role="group" aria-label="Filter games">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`filter${filter === category.id ? " is-active" : ""}`}
            aria-pressed={filter === category.id}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
            <span className="filter-count">{counts.get(category.id) ?? 0}</span>
          </button>
        ))}
      </div>

      {games.length > 0 ? (
        <div className="games-grid">
          {games.map((game, index) => (
            <GameCard key={game.slug} game={game} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="i-search" />
          <h3>No games found</h3>
          <p>Try a different search or filter.</p>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
