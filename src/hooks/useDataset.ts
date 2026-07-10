import { useEffect, useState } from "react";
import { getSizeTier } from "../data";
import type { SizeTierId } from "../lib/types";

export interface UseDatasetResult {
  dataset: string[];
  isLoading: boolean;
}

const EMPTY_DATASET: string[] = [];

/**
 * Loads the current Size Tier's dataset on the main thread — pass
 * `enabled: false` when nothing on the main thread actually needs it (e.g.
 * a pure Fuzzy Match search with Worker Mode on, where the worker loads its
 * own copy), so a 100,000-entry JSON parse doesn't block the main thread
 * for no reason.
 */
export function useDataset(
  tierId: SizeTierId,
  enabled = true,
): UseDatasetResult {
  const [loaded, setLoaded] = useState<{
    tierId: SizeTierId;
    dataset: string[];
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void getSizeTier(tierId)
      .load()
      .then((dataset) => {
        if (!cancelled) setLoaded({ tierId, dataset });
      });
    return () => {
      cancelled = true;
    };
  }, [tierId, enabled]);

  const isReady = loaded !== null && loaded.tierId === tierId;
  return {
    dataset: isReady ? loaded.dataset : EMPTY_DATASET,
    isLoading: enabled && !isReady,
  };
}
