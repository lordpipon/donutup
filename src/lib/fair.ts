const SEED_KEY = "donutup.seeds.v1";

export interface FairSeeds {
  server: string;
  client: string;
}

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Deterministic float in [0, 1) for a seed triple. */
export function fairFloat(server: string, client: string, nonce: string | number): number {
  const seed = xmur3(`${server}:${client}:${nonce}`);
  const rng = sfc32(seed(), seed(), seed(), seed());
  for (let i = 0; i < 12; i++) rng();
  return rng();
}

/** A short hex fingerprint of a seed triple. */
export function fairHash(server: string, client: string, nonce: string | number): string {
  const seed = xmur3(`${server}:${client}:${nonce}`);
  return Array.from({ length: 4 }, () => seed().toString(16).padStart(8, "0")).join("");
}

export function randomHex(bytes = 16): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Array.from({ length: bytes * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function loadSeeds(): FairSeeds {
  if (typeof window === "undefined") {
    return { server: "0".repeat(32), client: "0".repeat(16) };
  }
  try {
    const raw = window.localStorage.getItem(SEED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FairSeeds>;
      if (parsed.server && parsed.client) {
        return { server: parsed.server, client: parsed.client };
      }
    }
  } catch {
    /* fall through to a fresh pair */
  }
  const seeds: FairSeeds = { server: randomHex(16), client: randomHex(8) };
  try {
    window.localStorage.setItem(SEED_KEY, JSON.stringify(seeds));
  } catch {
    /* storage can be unavailable */
  }
  return seeds;
}

export function saveSeeds(seeds: FairSeeds): void {
  try {
    window.localStorage.setItem(SEED_KEY, JSON.stringify(seeds));
  } catch {
    /* ignore */
  }
}
