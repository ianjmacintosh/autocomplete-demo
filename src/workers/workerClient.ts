// Isolated behind a factory (rather than constructed inline where it's used)
// so tests can mock this module and inject a fake worker — jsdom has no real
// Worker implementation.
export function createNameSearchWorker(): Worker {
  return new Worker(new URL("./nameSearch.worker.ts", import.meta.url), {
    type: "module",
  });
}
