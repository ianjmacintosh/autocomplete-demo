import { useEffect, useState } from "react";
import { getSizeTier } from "../data";
import type { SizeTierId } from "../lib/types";

export interface UseDatasetResult {
  dataset: string[];
  isLoading: boolean;
}

/** Loads the current Size Tier's dataset on the main thread. */
export function useDataset(tierId: SizeTierId): UseDatasetResult {
  const [loaded, setLoaded] = useState<{
    tierId: SizeTierId;
    dataset: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSizeTier(tierId)
      .load()
      .then((dataset) => {
        if (!cancelled) setLoaded({ tierId, dataset });
      });
    return () => {
      cancelled = true;
    };
  }, [tierId]);

  const isReady = loaded !== null && loaded.tierId === tierId;
  return { dataset: isReady ? loaded.dataset : [], isLoading: !isReady };
}
