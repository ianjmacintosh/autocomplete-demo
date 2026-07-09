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

/**
 * Every event the demo surfaces in the Event log: raw DOM events from the
 * input, plus the internal search pipeline stages (debounce settling,
 * counting candidate matches, sorting them) so the log can narrate what the
 * search is doing, not just what the user did.
 */
export type LoggedEventType =
  | "focus"
  | "blur"
  | "keydown"
  | "keyup"
  | "change"
  | "debounceStart"
  | "debounceEnd"
  | "countStart"
  | "countEnd"
  | "sortStart"
  | "sortEnd";

export interface LoggedEvent {
  id: number;
  type: LoggedEventType;
  /** Free-form context: a key name, the query value, or a match count. */
  detail?: string;
  timestamp: number;
}

/** Per-type on/off switch, so noisy event types can be silenced in the log. */
export type LoggedEventTypeFilter = Record<LoggedEventType, boolean>;
