import { useCallback, useEffect, useRef, useState } from "react";
import { createNameSearchWorker } from "../workers/workerClient";
import type {
  SearchProgressPhase,
  WorkerResponse,
} from "../workers/nameSearch.worker";
import type { SizeTierId } from "../lib/types";

export interface NameSearchWorkerResult {
  query: string;
  results: string[];
  elapsedMs: number;
}

export interface NameSearchWorker {
  search: (
    query: string,
    maxResults: number,
    distanceThreshold: number,
  ) => void;
  result: NameSearchWorkerResult | null;
  corpusReady: boolean;
}

interface RawResult extends NameSearchWorkerResult {
  tierId: SizeTierId;
}

// Owns only the worker RPC lifecycle: creating/terminating the worker,
// keeping its corpus in sync with `tierId`, and correlating responses to the
// request/tier that triggered them so a stale response (from before a tier
// switch) can't be applied.
export function useNameSearchWorker(
  tierId: SizeTierId,
  onProgress?: (
    phase: SearchProgressPhase,
    detail?: { query?: string; count?: number },
  ) => void,
): NameSearchWorker {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const [readyTierId, setReadyTierId] = useState<SizeTierId | null>(null);
  const [rawResult, setRawResult] = useState<RawResult | null>(null);

  // Read via a ref (rather than depending on it in the mount-only effect
  // below) so a new onProgress identity each render doesn't force the
  // worker to be recreated, and progress reported mid-computation always
  // reaches the latest callback instead of a stale closure. Written from
  // an effect, not during render — mutating a ref while rendering is
  // forbidden by this repo's stricter lint rules.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const worker = createNameSearchWorker();
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (data.type === "corpusReady") {
        setReadyTierId(data.tierId);
      } else if (data.type === "searchProgress") {
        if (data.requestId === requestIdRef.current) {
          onProgressRef.current?.(data.phase, {
            query: data.query,
            count: data.count,
          });
        }
      } else if (data.requestId === requestIdRef.current) {
        setRawResult({
          query: data.query,
          results: data.results,
          elapsedMs: data.elapsedMs,
          tierId: data.tierId,
        });
      }
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    workerRef.current?.postMessage({ type: "setCorpus", tierId });
  }, [tierId]);

  const search = useCallback(
    (query: string, maxResults: number, distanceThreshold: number) => {
      requestIdRef.current += 1;
      workerRef.current?.postMessage({
        type: "search",
        requestId: requestIdRef.current,
        query,
        maxResults,
        distanceThreshold,
      });
    },
    [],
  );

  return {
    search,
    result: rawResult && rawResult.tierId === tierId ? rawResult : null,
    corpusReady: readyTierId === tierId,
  };
}
