export type MatchingStrategy = "prefix" | "fuzzy" | "combined";

export type SizeTierId = "elements" | "cheeses" | "cities" | "books";

export type DebouncePreset = "off" | "200" | "400" | "800" | "custom";

export interface AutocompleteSettings {
  tierId: SizeTierId;
  strategy: MatchingStrategy;
  workerModeOn: boolean;
  debouncePreset: DebouncePreset;
  /** Effective debounce delay in ms, derived from debouncePreset (or the custom value). */
  debounceMs: number;
  maxResults: number;
  minChars: number;
  /** Only meaningful for the "fuzzy" and "combined" strategies. */
  distanceThreshold: number;
}

export const DEFAULT_SETTINGS: AutocompleteSettings = {
  tierId: "cheeses",
  strategy: "combined",
  workerModeOn: true,
  debouncePreset: "400",
  debounceMs: 400,
  maxResults: 10,
  minChars: 3,
  distanceThreshold: 0.6,
};

export interface SearchMeta {
  elapsedMs: number;
  ranOn: "main" | "worker";
  strategyUsed: "prefix" | "fuzzy";
}
