export type Category = "instant" | "versus" | "table" | "minigames";

export interface GameMeta {
  slug: string;
  name: string;
  category: Category;
  icon: string;
  tint: string;
  blurb: string;
  howTo: string[];
  badge?: "hot" | "new";
}

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All games" },
  { id: "instant", label: "Instant" },
  { id: "versus", label: "Versus" },
  { id: "table", label: "Table" },
  { id: "minigames", label: "Minigames" },
];

export const GAMES: GameMeta[] = [
  {
    slug: "cases",
    name: "Cases",
    category: "instant",
    icon: "i-case",
    tint: "#f5c542",
    blurb: "Open a case, land a skin, take the coins. Three tiers of loot.",
    howTo: [
      "Pick a case and pay its listed price.",
      "The reel reveals a random item. Its coin value is credited instantly.",
      "Every case is tuned to roughly 94% return — no fake 'guaranteed win'.",
    ],
    badge: "hot",
  },
  {
    slug: "flip",
    name: "Flip",
    category: "versus",
    icon: "i-flip",
    tint: "#63a9ff",
    blurb: "Call the coin against a bot. Winner takes the pot.",
    howTo: [
      "Choose heads or tails and place your bet.",
      "The bot automatically calls the opposite side.",
      "Hit your side to take 1.96× your bet.",
    ],
  },
  {
    slug: "mines-duel",
    name: "Mines Duel",
    category: "versus",
    icon: "i-duel",
    tint: "#f472b6",
    blurb: "Take turns digging. Hit a mine and your opponent takes the pot.",
    howTo: [
      "You and the bot alternate picking tiles on a 5×5 board with 5 mines.",
      "A safe tile passes the turn; a mine ends the round for that player.",
      "Be the last one standing to win 1.96× your bet.",
    ],
  },
  {
    slug: "uno",
    name: "Uno",
    category: "versus",
    icon: "i-uno",
    tint: "#ef5353",
    blurb: "Classic colour-matching card duel against a bot.",
    howTo: [
      "Match the top card by colour or number.",
      "Play a wild to change the colour when you are stuck.",
      "Empty your hand before the bot to win 1.96×.",
    ],
  },
  {
    slug: "connect-four",
    name: "Connect Four",
    category: "versus",
    icon: "i-connect",
    tint: "#63a9ff",
    blurb: "Drop discs, build a line of four before the bot does.",
    howTo: [
      "You are red and always move first.",
      "Click a column to drop a disc into the lowest free slot.",
      "Connect four in a row before the bot to win 1.96×.",
    ],
  },
  {
    slug: "case-battles",
    name: "Case Battles",
    category: "versus",
    icon: "i-battles",
    tint: "#f5c542",
    blurb: "Open the same case as the bot. Highest item value wins the pot.",
    howTo: [
      "Pick a case — both players pay the same entry.",
      "You and the bot open one item each.",
      "The higher item value wins the whole pot at 1.96× your entry.",
    ],
  },
  {
    slug: "mines",
    name: "Mines",
    category: "instant",
    icon: "i-mines",
    tint: "#2fbf71",
    blurb: "Reveal tiles, dodge the mines, cash out before you blow up.",
    howTo: [
      "Choose 1–10 mines and start a round.",
      "Every safe tile grows your multiplier.",
      "Cash out at any time; hitting a mine loses the bet.",
    ],
    badge: "hot",
  },
  {
    slug: "towers",
    name: "Towers",
    category: "instant",
    icon: "i-tower",
    tint: "#a78bfa",
    blurb: "Climb eight floors, one bomb per floor. Cash out when you dare.",
    howTo: [
      "Each floor has four tiles and one bomb.",
      "Pick a safe tile to climb and raise your multiplier.",
      "Cash out at any point, or reach the top for the full payout.",
    ],
  },
  {
    slug: "floor-is-lava",
    name: "Floor is Lava",
    category: "instant",
    icon: "i-lava",
    tint: "#ff8a4c",
    blurb: "Hop across the lava rocks. Three tiles per row, one is doom.",
    howTo: [
      "Each row has three tiles with one lava tile.",
      "Pick a rock to move up and increase your multiplier.",
      "Cash out before the floor catches you.",
    ],
  },
  {
    slug: "draw",
    name: "Draw",
    category: "versus",
    icon: "i-draw",
    tint: "#f472b6",
    blurb: "Guess the doodle before the timer runs out.",
    howTo: [
      "Place a bet and study the doodle.",
      "Pick the correct answer from four options within 12 seconds.",
      "A correct guess pays 1.9×; a wrong one loses the bet.",
    ],
    badge: "new",
  },
  {
    slug: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    category: "versus",
    icon: "i-rps",
    tint: "#4bd68f",
    blurb: "Best of one against the bot. Pure nerve.",
    howTo: [
      "Pick rock, paper or scissors.",
      "The bot picks at random at the same time.",
      "Win the throw to take 1.96×; a draw refunds your bet.",
    ],
  },
  {
    slug: "stripmine",
    name: "Stripmine",
    category: "instant",
    icon: "i-pickaxe",
    tint: "#8ea2ff",
    blurb: "Strip one row at a time. One rock in five is rigged.",
    howTo: [
      "Each row hides one bomb across five rocks.",
      "Pick a safe rock to clear the row and boost your multiplier.",
      "Cash out whenever you like — five cleared rows is the max.",
    ],
  },
  {
    slug: "upgrader",
    name: "Upgrader",
    category: "instant",
    icon: "i-upgrade",
    tint: "#f5c542",
    blurb: "Spin the upgrade wheel and multiply your stack.",
    howTo: [
      "Choose a target multiplier between 1.2× and 10×.",
      "Smaller targets have a bigger green slice and better odds.",
      "Land in the green to win bet × target.",
    ],
  },
  {
    slug: "coinflip",
    name: "Coinflip",
    category: "instant",
    icon: "i-coin",
    tint: "#f5c542",
    blurb: "One coin, two sides, 1.96× if you call it right.",
    howTo: [
      "Pick heads or tails and set your bet.",
      "The coin flips and lands on a random side.",
      "Correct call pays 1.96× instantly.",
    ],
    badge: "hot",
  },
  {
    slug: "blackjack",
    name: "Blackjack",
    category: "table",
    icon: "i-blackjack",
    tint: "#ef5353",
    blurb: "Beat the dealer to 21. Hit, stand or double down.",
    howTo: [
      "Get closer to 21 than the dealer without going over.",
      "Blackjack pays 2.5×, a normal win pays 2×, a push refunds.",
      "Dealer stands on 17. Double is available on your first two cards.",
    ],
  },
  {
    slug: "dice",
    name: "Dice",
    category: "instant",
    icon: "i-dice",
    tint: "#63a9ff",
    blurb: "Pick over or under a target and roll 0.00–99.99.",
    howTo: [
      "Set a target with the slider and choose over or under.",
      "The payout scales with your win chance: 99 ÷ chance.",
      "Roll into your range and the multiplier is paid instantly.",
    ],
  },
  {
    slug: "hilo",
    name: "HiLo",
    category: "table",
    icon: "i-hilo",
    tint: "#2fbf71",
    blurb: "Will the next card be higher or lower? Build a streak.",
    howTo: [
      "Guess whether the next card is higher or lower than the current one.",
      "Every correct call grows your multiplier; you can cash out any time.",
      "A wrong call loses the hand; a tie returns your bet.",
    ],
  },
  {
    slug: "limbo",
    name: "Limbo",
    category: "instant",
    icon: "i-limbo",
    tint: "#a78bfa",
    blurb: "Set a target multiplier and watch the rocket fly.",
    howTo: [
      "Choose a target multiplier from 1.01× to 100×.",
      "A random result is drawn from 0.99 ÷ u.",
      "If the result reaches your target, you win bet × target.",
    ],
    badge: "hot",
  },
  {
    slug: "plinko",
    name: "Plinko",
    category: "instant",
    icon: "i-plinko",
    tint: "#ffd76a",
    blurb: "Drop a ball through the pegs. Where it lands, you get paid.",
    howTo: [
      "Choose your rows (8, 12 or 16) and risk level.",
      "The ball bounces left or right at every peg.",
      "Edge buckets pay huge multipliers; the middle barely returns your bet.",
    ],
  },
  {
    slug: "crash",
    name: "Crash",
    category: "instant",
    icon: "i-crash",
    tint: "#4bd68f",
    blurb: "The multiplier climbs. Cash out before it crashes.",
    howTo: [
      "Start a round; the multiplier rises in real time.",
      "Cash out before the crash to bank bet × the current multiplier.",
      "If the graph crashes first, the bet is gone.",
    ],
    badge: "hot",
  },
  {
    slug: "double",
    name: "Double",
    category: "table",
    icon: "i-wheel",
    tint: "#ef5353",
    blurb: "Red, black or green. A 15-slot wheel, 14× on green.",
    howTo: [
      "Pick red, black or green.",
      "The wheel has 7 red, 7 black and 1 green slot.",
      "Red or black pays 2×; green pays 14×.",
    ],
  },
  {
    slug: "roulette",
    name: "Roulette",
    category: "table",
    icon: "i-roulette",
    tint: "#f5c542",
    blurb: "European roulette with a full number grid.",
    howTo: [
      "Bet on a colour, parity, half or a single number.",
      "A European wheel has 37 pockets from 0 to 36.",
      "Colour and parity pay 2×, a straight number pays 36×.",
    ],
  },
  {
    slug: "pig-race",
    name: "Pig Race",
    category: "minigames",
    icon: "i-pig",
    tint: "#f472b6",
    blurb: "Pick your pig, watch them sprint, collect the payout.",
    howTo: [
      "Pick one of five pigs and place a bet.",
      "Each pig has its own odds shown before the race.",
      "Your pig crosses first and you win bet × its odds.",
    ],
  },
  {
    slug: "stocks",
    name: "Stocks",
    category: "minigames",
    icon: "i-stocks",
    tint: "#63a9ff",
    blurb: "Buy the dip, sell the pump. Four fake tickers, live prices.",
    howTo: [
      "Pick a ticker and invest an amount.",
      "Prices tick every two seconds while you hold a position.",
      "Sell to bank the value — or take the loss like a legend.",
    ],
    badge: "new",
  },
  {
    slug: "slide",
    name: "Slide",
    category: "instant",
    icon: "i-slide",
    tint: "#4bd68f",
    blurb: "Send the puck down the ramp into a multiplier slot.",
    howTo: [
      "Place a bet and choose a risk level.",
      "The puck slides into a weighted multiplier slot.",
      "Higher slots pay more but land far less often.",
    ],
  },
  {
    slug: "keno",
    name: "Keno",
    category: "table",
    icon: "i-keno",
    tint: "#a78bfa",
    blurb: "Pick ten numbers. Hope the draw is kind.",
    howTo: [
      "Select ten numbers from 1–40.",
      "Ten balls are drawn from the same pool.",
      "Match 3 to get paid; match 10 for a 1,000× moonshot.",
    ],
  },
  {
    slug: "snakes",
    name: "Snakes",
    category: "minigames",
    icon: "i-snake",
    tint: "#4bd68f",
    blurb: "Snakes and ladders, but for coins. Race the bot home.",
    howTo: [
      "You and the bot take turns rolling a die across a 24-tile board.",
      "Ladders boost you forward; snakes drag you back.",
      "Reach tile 24 first to win 1.96× your bet.",
    ],
  },
  {
    slug: "chicken",
    name: "Chicken",
    category: "minigames",
    icon: "i-chicken",
    tint: "#f5c542",
    blurb: "Cross the road one lane at a time. Cash out before the traffic.",
    howTo: [
      "Every lane you cross increases your multiplier.",
      "Each lane has a 12% chance of ending the run.",
      "Cash out whenever you like; keep crossing for a bigger stack.",
    ],
  },
];

export const FEATURED_SLUGS = [
  "coinflip",
  "mines",
  "crash",
  "limbo",
  "plinko",
  "blackjack",
  "cases",
  "dice",
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((game) => game.slug === slug);
}

export function categoryLabel(category: Category): string {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
