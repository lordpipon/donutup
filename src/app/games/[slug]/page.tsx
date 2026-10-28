import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameInfo } from "@/components/games/shared";
import { getGameComponent } from "@/components/games/registry";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getGame(slug);
  if (!meta) return { title: "Game not found" };
  return {
    title: meta.name,
    description: `${meta.blurb} Play ${meta.name} at DonutUp with fake demo coins — no real money, ever.`,
    openGraph: {
      title: `${meta.name} · DonutUp`,
      description: meta.blurb,
    },
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getGame(slug);
  if (!meta) notFound();
  // The registry is a module-level map, so this reference is stable across
  // renders and never remounts game state.
  const Game = getGameComponent(slug);
  if (!Game) notFound();

  return (
    <>
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Game meta={meta} />
      <GameInfo meta={meta} />
    </>
  );
}
