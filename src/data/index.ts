import type { SizeTierId } from "../lib/types";

export interface SizeTier {
  id: SizeTierId;
  label: string;
  approxSize: number;
  theme: string;
  attribution?: { text: string; href: string };
  load: () => Promise<string[]>;
}

export const SIZE_TIERS: readonly SizeTier[] = [
  {
    id: "elements",
    label: "100",
    approxSize: 118,
    theme: "Periodic table elements",
    load: () => import("./elements.json").then((m) => m.default as string[]),
  },
  {
    id: "cheeses",
    label: "1,000",
    approxSize: 599,
    theme: "Cheese types",
    load: () => import("./cheeses.json").then((m) => m.default as string[]),
  },
  {
    id: "cities",
    label: "10,000",
    approxSize: 10000,
    theme: "World cities",
    attribution: {
      text: "City data from GeoNames (CC BY 4.0)",
      href: "https://www.geonames.org/",
    },
    load: () =>
      import("./world-cities.json").then((m) => m.default as string[]),
  },
  {
    id: "books",
    label: "100,000",
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
