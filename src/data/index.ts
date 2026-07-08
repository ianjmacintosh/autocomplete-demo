import type { SizeTierId } from "../lib/types";

export interface SizeTier {
  id: SizeTierId;
  approxSize: number;
  theme: string;
  load: () => Promise<string[]>;
}

export const SIZE_TIERS: readonly SizeTier[] = [
  {
    id: "elements",
    approxSize: 118,
    theme: "Periodic table elements",
    load: () => import("./elements.json").then((m) => m.default as string[]),
  },
  {
    id: "cheeses",
    approxSize: 599,
    theme: "Cheese types",
    load: () => import("./cheeses.json").then((m) => m.default as string[]),
  },
  {
    id: "cities",
    approxSize: 10000,
    theme: "World cities",
    load: () =>
      import("./world-cities.json").then((m) => m.default as string[]),
  },
  {
    id: "books",
    approxSize: 100000,
    theme: "Book titles",
    load: () => import("./book-titles.json").then((m) => m.default as string[]),
  },
];

export function getSizeTier(id: SizeTierId): SizeTier {
  const tier = SIZE_TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown size tier: ${id}`);
  return tier;
}
