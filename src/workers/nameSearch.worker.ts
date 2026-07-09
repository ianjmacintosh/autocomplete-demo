import { getFuzzyMatches } from "../lib/matching";
import { getSizeTier } from "../data";
import type { SizeTierId } from "../lib/types";

export type WorkerRequest =
  | { type: "setDataset"; tierId: SizeTierId }
  | {
      type: "search";
      requestId: number;
      query: string;
      maxResults: number;
      distanceThreshold: number;
    };

export type SearchProgressPhase =
  | "countStart"
  | "countEnd"
  | "sortStart"
  | "sortEnd";

export type WorkerResponse =
  | { type: "datasetReady"; tierId: SizeTierId }
  | {
      type: "searchProgress";
      requestId: number;
      phase: SearchProgressPhase;
      query?: string;
      count?: number;
    }
  | {
      type: "searchResult";
      requestId: number;
      query: string;
      results: string[];
      elapsedMs: number;
      tierId: SizeTierId;
    };

// Typed by hand rather than pulling in the "webworker" lib, which conflicts
// with the "dom" lib the rest of the app's tsconfig needs.
interface WorkerGlobalLike {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
}

const ctx = self as unknown as WorkerGlobalLike;

let dataset: string[] = [];
let currentTierId: SizeTierId | undefined;

// Loads its own copy of the dataset by tier id rather than having it
// transferred over postMessage, so switching Worker Mode on doesn't require
// shipping a 100,000-entry array across the thread boundary first.
ctx.onmessage = (event) => {
  const msg = event.data;

  if (msg.type === "setDataset") {
    currentTierId = msg.tierId;
    void getSizeTier(msg.tierId)
      .load()
      .then((loaded) => {
        if (currentTierId !== msg.tierId) return; // superseded by a newer setDataset
        dataset = loaded;
        ctx.postMessage({ type: "datasetReady", tierId: msg.tierId });
      });
    return;
  }

  const start = performance.now();
  const results = getFuzzyMatches(
    msg.query,
    dataset,
    msg.maxResults,
    msg.distanceThreshold,
    {
      onCountStart: () =>
        ctx.postMessage({
          type: "searchProgress",
          requestId: msg.requestId,
          phase: "countStart",
          query: msg.query,
        }),
      onCountEnd: (count) =>
        ctx.postMessage({
          type: "searchProgress",
          requestId: msg.requestId,
          phase: "countEnd",
          count,
        }),
      onSortStart: () =>
        ctx.postMessage({
          type: "searchProgress",
          requestId: msg.requestId,
          phase: "sortStart",
        }),
      onSortEnd: () =>
        ctx.postMessage({
          type: "searchProgress",
          requestId: msg.requestId,
          phase: "sortEnd",
        }),
    },
  );
  const elapsedMs = performance.now() - start;
  ctx.postMessage({
    type: "searchResult",
    requestId: msg.requestId,
    query: msg.query,
    results,
    elapsedMs,
    // currentTierId is always set by the time a "search" message can arrive
    // — the client only calls search() after datasetReady for some tier.
    tierId: currentTierId!,
  });
};
