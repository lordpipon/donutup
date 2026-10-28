import type { ComponentType } from "react";
import type { GameMeta } from "@/lib/games";
import { CoinflipGame, DiceGame, DoubleGame, FlipGame, LimboGame, RpsGame, UpgraderGame } from "@/components/games/simple";
import {
  ChickenGame,
  FloorIsLavaGame,
  MinesGame,
  SlideGame,
  StripmineGame,
  TowersGame,
} from "@/components/games/grids";
import { CrashGame, PlinkoGame } from "@/components/games/crash";
import { BlackjackGame, HiLoGame, KenoGame, RouletteGame } from "@/components/games/cards";
import { CaseBattlesGame, CasesGame } from "@/components/games/cases";
import { ConnectFourGame, DrawGame, MinesDuelGame, UnoGame } from "@/components/games/versus";
import { PigRaceGame, SnakesGame, StocksGame } from "@/components/games/sim";

type GameComponent = ComponentType<{ meta: GameMeta }>;

export const GAME_COMPONENTS: Record<string, GameComponent> = {
  cases: CasesGame,
  flip: FlipGame,
  "mines-duel": MinesDuelGame,
  uno: UnoGame,
  "connect-four": ConnectFourGame,
  "case-battles": CaseBattlesGame,
  mines: MinesGame,
  towers: TowersGame,
  "floor-is-lava": FloorIsLavaGame,
  draw: DrawGame,
  "rock-paper-scissors": RpsGame,
  stripmine: StripmineGame,
  upgrader: UpgraderGame,
  coinflip: CoinflipGame,
  blackjack: BlackjackGame,
  dice: DiceGame,
  hilo: HiLoGame,
  limbo: LimboGame,
  plinko: PlinkoGame,
  crash: CrashGame,
  double: DoubleGame,
  roulette: RouletteGame,
  "pig-race": PigRaceGame,
  stocks: StocksGame,
  slide: SlideGame,
  keno: KenoGame,
  snakes: SnakesGame,
  chicken: ChickenGame,
};

export function getGameComponent(slug: string): GameComponent | undefined {
  return GAME_COMPONENTS[slug];
}
