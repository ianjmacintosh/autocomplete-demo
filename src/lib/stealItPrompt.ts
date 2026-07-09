import { getSizeTier } from "../data";
import type { AutocompleteSettings, MatchingStrategy } from "./types";

const PILLBUG_SOURCE_URL =
  "https://github.com/ianjmacintosh/pillbug/tree/main/src/components/PrescriptionForm";

export function buildStealItPrompt(settings: AutocompleteSettings): string {
  const tier = getSizeTier(settings.tierId);
  const showsThreshold =
    settings.strategy === "fuzzy" || settings.strategy === "combined";

  const lines = [
    `Add an autocomplete/combobox input to my React app, ported from ianjmacintosh/pillbug's "Add Prescription" drug-name lookup (${PILLBUG_SOURCE_URL}), configured like this:`,
    "",
    `- Matching strategy: ${strategyDescription(settings.strategy)}`,
    `- Dataset size: ~${tier.approxSize.toLocaleString()} entries (themed like: ${tier.theme})`,
    `- Web Worker: ${
      settings.workerModeOn
        ? "on — fuzzy matching runs off the main thread"
        : "off — fuzzy matching runs synchronously on the main thread"
    }`,
    `- Debounce: ${settings.debounceMs}ms after the user stops typing`,
    `- Minimum characters before searching: ${settings.minChars}`,
    `- Maximum suggestions shown: ${settings.maxResults}`,
  ];

  if (showsThreshold) {
    lines.push(
      `- Fuzzy match normalized distance threshold: ${settings.distanceThreshold}`,
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
