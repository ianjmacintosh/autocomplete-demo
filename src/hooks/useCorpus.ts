import { useEffect, useState } from "react";
import { getSizeTier } from "../data";
import type { SizeTierId } from "../lib/types";

export interface UseCorpusResult {
  corpus: string[];
  isLoading: boolean;
}

/** Loads the current Size Tier's corpus on the main thread. */
export function useCorpus(tierId: SizeTierId): UseCorpusResult {
  const [loaded, setLoaded] = useState<{
    tierId: SizeTierId;
    corpus: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSizeTier(tierId)
      .load()
      .then((corpus) => {
        if (!cancelled) setLoaded({ tierId, corpus });
      });
    return () => {
      cancelled = true;
    };
  }, [tierId]);

  const isReady = loaded !== null && loaded.tierId === tierId;
  return { corpus: isReady ? loaded.corpus : [], isLoading: !isReady };
}
