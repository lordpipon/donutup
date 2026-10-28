export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export interface CaseItem {
  name: string;
  value: number;
  rarity: Rarity;
  weight: number;
}

export interface CaseDef {
  id: string;
  name: string;
  tint: string;
  tagline: string;
  items: CaseItem[];
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9aa8a0",
  uncommon: "#4bd68f",
  rare: "#63a9ff",
  epic: "#a78bfa",
  legendary: "#f5c542",
  mythic: "#f472b6",
};

const WEIGHTS = [5200, 2400, 1400, 600, 250, 100, 35, 15];
const RARITIES: Rarity[] = [
  "common",
  "common",
  "uncommon",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
];

function buildItems(names: string[], values: number[]): CaseItem[] {
  return names.map((name, index) => ({
    name,
    value: values[index],
    rarity: RARITIES[index],
    weight: WEIGHTS[index],
  }));
}

const BRONZE_NAMES = [
  "Crumbs",
  "Stale Glaze",
  "Sprinkle Scrap",
  "Chocolate Chip",
  "Donut Shard",
  "Golden Icing",
  "Syrup Blade",
  "The Original Donut",
];

const NEON_NAMES = [
  "Neon Crumb",
  "Glow Dust",
  "Laser Sprinkle",
  "Cyber Chip",
  "Holo Shard",
  "Plasma Icing",
  "Circuit Blade",
  "Midnight Donut",
];

const ROYAL_NAMES = [
  "Royal Crumb",
  "Velvet Dust",
  "Crown Sprinkle",
  "Diamond Chip",
  "Sceptre Shard",
  "24K Icing",
  "Emperor Blade",
  "The First Donut",
];

export const CASES: CaseDef[] = [
  {
    id: "bronze",
    name: "Bronze Crate",
    tint: "#d89a56",
    tagline: "The everyday opener. Cheap, quick, honest.",
    items: buildItems(
      BRONZE_NAMES,
      [25, 50, 100, 250, 500, 1000, 3000, 10000],
    ),
  },
  {
    id: "neon",
    name: "Neon Crate",
    tint: "#63a9ff",
    tagline: "Ten times the stack, ten times the sting.",
    items: buildItems(
      NEON_NAMES,
      [250, 500, 1000, 2500, 5000, 10000, 30000, 100000],
    ),
  },
  {
    id: "royal",
    name: "Royal Crate",
    tint: "#f5c542",
    tagline: "High stakes, mythic pulls, one very smug donut.",
    items: buildItems(
      ROYAL_NAMES,
      [1250, 2500, 5000, 12500, 25000, 50000, 150000, 500000],
    ),
  },
];

export function casePrice(caseDef: CaseDef): number {
  const totalWeight = caseDef.items.reduce((sum, item) => sum + item.weight, 0);
  const ev = caseDef.items.reduce((sum, item) => sum + (item.value * item.weight) / totalWeight, 0);
  return Math.max(50, Math.round(ev / 0.94 / 10) * 10);
}

export function openCase(caseDef: CaseDef, roll: number): CaseItem {
  const totalWeight = caseDef.items.reduce((sum, item) => sum + item.weight, 0);
  let ticket = roll * totalWeight;
  for (const item of caseDef.items) {
    ticket -= item.weight;
    if (ticket < 0) return item;
  }
  return caseDef.items[caseDef.items.length - 1];
}

export function caseRtp(caseDef: CaseDef): number {
  const totalWeight = caseDef.items.reduce((sum, item) => sum + item.weight, 0);
  const ev = caseDef.items.reduce((sum, item) => sum + (item.value * item.weight) / totalWeight, 0);
  return (ev / casePrice(caseDef)) * 100;
}
