import type { AutocompleteSettings, MatchingStrategy } from "./types";

const PILLBUG_SOURCE_URL =
  "https://github.com/ianjmacintosh/pillbug/tree/main/src/components/PrescriptionForm";

export function buildStealItPrompt(settings: AutocompleteSettings): string {
  const usesFuzzyMatch =
    settings.strategy === "fuzzy" || settings.strategy === "combined";

  const lines = [
    `Add an autocomplete/combobox input to my React app, ported from ianjmacintosh/pillbug's "Add Prescription" drug-name lookup (${PILLBUG_SOURCE_URL}), configured like this:`,
    "",
    `- Matching strategy: ${strategyDescription(settings.strategy)}`,
    `- Debounce: ${settings.debounceMs}ms after the user stops typing`,
    `- Minimum characters before searching: ${settings.minChars}`,
    `- Maximum suggestions shown: ${settings.maxResults}`,
  ];

  // Only relevant when Fuzzy Match can actually run — Prefix Match is
  // always synchronous on the main thread regardless of this setting, so
  // it's not a blanket "Web Worker: on/off" toggle for the whole feature.
  if (usesFuzzyMatch) {
    lines.push(
      `- Fuzzy match normalized distance threshold: ${settings.distanceThreshold}`,
      `- Fuzzy Match runs ${
        settings.workerModeOn
          ? "in a Web Worker, off the main thread"
          : "synchronously on the main thread"
      } (Prefix Match, when tried, always runs on the main thread — it's cheap enough not to matter)`,
    );
  }

  lines.push(
    "",
    "Use @ariakit/react's Combobox primitives for the UI and lodash-es's debounce, matching the reference implementation.",
  );

  return lines.join("\n");
}

function strategyDescription(strategy: MatchingStrategy): string {
  switch (strategy) {
    case "prefix":
      return "Prefix Match only (case-insensitive startsWith)";
    case "fuzzy":
      return "Fuzzy Match only (normalized Levenshtein distance)";
    case "combined":
      return "Combined — Prefix Match first, falling back to Fuzzy Match when it finds nothing";
  }
}
