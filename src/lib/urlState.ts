import { DEFAULT_SETTINGS } from "./types";
import type {
  AutocompleteSettings,
  DebouncePreset,
  MatchingStrategy,
  SizeTierId,
} from "./types";

const TIER_IDS: readonly SizeTierId[] = [
  "elements",
  "cheeses",
  "cities",
  "books",
];
const STRATEGIES: readonly MatchingStrategy[] = ["prefix", "fuzzy", "combined"];
const DEBOUNCE_PRESETS: readonly DebouncePreset[] = [
  "off",
  "200",
  "400",
  "800",
  "custom",
];

export function settingsToSearchParams(
  settings: AutocompleteSettings,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("tier", settings.tierId);
  params.set("strategy", settings.strategy);
  params.set("worker", settings.workerModeOn ? "1" : "0");
  params.set("debounce", settings.debouncePreset);
  params.set("debounceMs", String(settings.debounceMs));
  params.set("results", String(settings.maxResults));
  params.set("minChars", String(settings.minChars));
  params.set("threshold", String(settings.distanceThreshold));
  return params;
}

export function searchParamsToSettings(
  params: URLSearchParams,
): AutocompleteSettings {
  const tier = params.get("tier");
  const strategy = params.get("strategy");
  const debouncePreset = params.get("debounce");
  const debounceMs = Number(params.get("debounceMs"));
  const maxResults = Number(params.get("results"));
  const minChars = Number(params.get("minChars"));
  const distanceThreshold = Number(params.get("threshold"));

  return {
    tierId: isTierId(tier) ? tier : DEFAULT_SETTINGS.tierId,
    strategy: isStrategy(strategy) ? strategy : DEFAULT_SETTINGS.strategy,
    workerModeOn:
      params.get("worker") === "0" ? false : DEFAULT_SETTINGS.workerModeOn,
    debouncePreset: isDebouncePreset(debouncePreset)
      ? debouncePreset
      : DEFAULT_SETTINGS.debouncePreset,
    debounceMs:
      Number.isFinite(debounceMs) && debounceMs >= 0
        ? debounceMs
        : DEFAULT_SETTINGS.debounceMs,
    maxResults:
      Number.isFinite(maxResults) && maxResults > 0
        ? maxResults
        : DEFAULT_SETTINGS.maxResults,
    minChars:
      Number.isFinite(minChars) && minChars > 0
        ? minChars
        : DEFAULT_SETTINGS.minChars,
    distanceThreshold:
      Number.isFinite(distanceThreshold) && distanceThreshold > 0
        ? distanceThreshold
        : DEFAULT_SETTINGS.distanceThreshold,
  };
}

function isTierId(value: string | null): value is SizeTierId {
  return TIER_IDS.includes(value as SizeTierId);
}

function isStrategy(value: string | null): value is MatchingStrategy {
  return STRATEGIES.includes(value as MatchingStrategy);
}

function isDebouncePreset(value: string | null): value is DebouncePreset {
  return DEBOUNCE_PRESETS.includes(value as DebouncePreset);
}
