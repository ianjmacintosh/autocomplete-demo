// Ported from ianjmacintosh/pillbug's PrescriptionForm.helpers.ts, generalized
// from drug names to any string corpus and parameterized instead of hardcoded.
// Ported at pillbug@6b19cd8 (#291, "Add medication name autocomplete to
// prescription form"). Diff pillbug's file against that SHA to spot upstream
// changes worth porting — no automated sync, this is a manual, occasional check.

/** Case-insensitive prefix match, capped at `maxResults` — near-free to check. */
export function getPrefixMatches(
  query: string,
  corpus: readonly string[],
  maxResults: number,
): string[] {
  const q = query.toLowerCase();
  const results: string[] = [];
  for (const entry of corpus) {
    if (entry.toLowerCase().startsWith(q)) {
      results.push(entry);
      if (results.length >= maxResults) break;
    }
  }
  return results;
}

// Classic two-row dynamic-programming edit distance.
export function levenshteinDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/**
 * Fuzzy match by Levenshtein distance normalized to the longer string's
 * length, filtered to `distanceThreshold` and capped at `maxResults`.
 * Run standalone (not only as a fallback) so the Fuzzy Match strategy can
 * be evaluated on its own.
 */
export function getFuzzyMatches(
  query: string,
  corpus: readonly string[],
  maxResults: number,
  distanceThreshold: number,
): string[] {
  const q = query.toLowerCase();
  const scored: { entry: string; normalized: number; raw: number }[] = [];

  for (const entry of corpus) {
    const lower = entry.toLowerCase();
    const raw = levenshteinDistance(q, lower);
    const normalized = raw / Math.max(q.length, lower.length, 1);
    if (normalized <= distanceThreshold) {
      scored.push({ entry, normalized, raw });
    }
  }

  scored.sort((a, b) => a.normalized - b.normalized || a.raw - b.raw);
  return scored.slice(0, maxResults).map((s) => s.entry);
}
