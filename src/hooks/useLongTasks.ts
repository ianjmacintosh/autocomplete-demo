import { useEffect, useState } from "react";

export interface RecordedLongTask {
  /** Epoch ms, aligned with LoggedEvent/Journey timestamps (Date.now()-based). */
  start: number;
  end: number;
}

const MAX_RECORDED_LONG_TASKS = 500;

// Measures actual main-thread freezes via the Long Tasks API (any task over
// ~50ms), rather than inferring blocking from which code path ran a
// computation. A worker search still lands a long task on the main thread
// once its result arrives — deserializing it, re-rendering the suggestion
// list — so only observing real long tasks reflects what the user felt.
export function useLongTasks(): RecordedLongTask[] {
  const [longTasks, setLongTasks] = useState<RecordedLongTask[]>([]);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;
    if (!PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
      return;
    }

    // performance.now() timestamps are relative to timeOrigin; converting
    // to epoch ms here keeps these comparable to Journey/LoggedEvent
    // timestamps, which are all Date.now()-based.
    const origin = performance.timeOrigin;
    const observer = new PerformanceObserver((list) => {
      const newTasks = list.getEntries().map((entry) => ({
        start: origin + entry.startTime,
        end: origin + entry.startTime + entry.duration,
      }));
      setLongTasks((prev) =>
        [...prev, ...newTasks].slice(-MAX_RECORDED_LONG_TASKS),
      );
    });

    observer.observe({ type: "longtask", buffered: true });
    return () => observer.disconnect();
  }, []);

  return longTasks;
}
