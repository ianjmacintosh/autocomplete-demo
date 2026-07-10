import { TimerReset } from "lucide-react";
import type { Journey, LoggedEvent } from "../../lib/types";
import type { RecordedLongTask } from "../../hooks/useLongTasks";
import "./JourneyBar.css";

interface JourneyBarProps {
  events: LoggedEvent[];
  journey: Journey | null;
  longTasks: RecordedLongTask[];
  onReset: () => void;
}

// Pairs up countStart/countEnd and sortStart/sortEnd within the journey's
// range to total up algorithmic compute time, on whichever thread ran it.
function computeCpuMs(events: LoggedEvent[], start: number, end: number): number {
  const inRange = events
    .filter((event) => event.timestamp >= start && event.timestamp <= end)
    .slice()
    .reverse(); // events arrive newest-first; pairing needs chronological order

  let cpuMs = 0;
  let openCountAt: number | null = null;
  let openSortAt: number | null = null;

  for (const event of inRange) {
    if (event.type === "countStart") {
      openCountAt = event.timestamp;
    } else if (event.type === "countEnd" && openCountAt !== null) {
      cpuMs += event.timestamp - openCountAt;
      openCountAt = null;
    } else if (event.type === "sortStart") {
      openSortAt = event.timestamp;
    } else if (event.type === "sortEnd" && openSortAt !== null) {
      cpuMs += event.timestamp - openSortAt;
      openSortAt = null;
    }
  }

  return cpuMs;
}

// Sums how much of the journey overlapped a real main-thread freeze (a Long
// Task, >~50ms) rather than guessing from which code path ran a
// computation — a worker's result still has to be deserialized and
// re-rendered on the main thread, so this is what the user actually felt.
function computeBlockedMs(
  longTasks: RecordedLongTask[],
  start: number,
  end: number,
): number {
  let blockedMs = 0;
  for (const task of longTasks) {
    const overlapStart = Math.max(task.start, start);
    const overlapEnd = Math.min(task.end, end);
    if (overlapEnd > overlapStart) blockedMs += overlapEnd - overlapStart;
  }
  return blockedMs;
}

export function JourneyBar({
  events,
  journey,
  longTasks,
  onReset,
}: JourneyBarProps) {
  if (!journey || journey.end === null) {
    return (
      <div className="journey-bar">
        <div className="journey-bar-header">
          <span className="journey-bar-title">Journey</span>
        </div>
        <p className="journey-bar-empty">
          Type into the input to start a journey…
        </p>
      </div>
    );
  }

  const { start, end } = journey;
  const totalMs = end - start;
  const cpuMs = Math.round(computeCpuMs(events, start, end));
  const blockedMs = Math.round(computeBlockedMs(longTasks, start, end));

  return (
    <div className="journey-bar">
      <div className="journey-bar-header">
        <span className="journey-bar-title">Journey</span>
        <span className="journey-bar-header-right">
          <span className="journey-bar-total">{totalMs}ms</span>
          <button
            type="button"
            className="journey-bar-reset-button"
            aria-label="Reset journey timer"
            title="Reset journey timer"
            onClick={onReset}
          >
            <TimerReset size={13} aria-hidden="true" />
          </button>
        </span>
      </div>
      <dl
        className="journey-bar-stats"
        aria-label={`User journey from first keystroke to blur, lasting ${totalMs} milliseconds`}
      >
        <div className="journey-bar-stat">
          <dt className="journey-bar-stat-label">CPU processing</dt>
          <dd className="journey-bar-stat-value journey-bar-stat-value--cpu">
            {cpuMs}ms
          </dd>
        </div>
        <div className="journey-bar-stat">
          <dt className="journey-bar-stat-label">User blocked</dt>
          <dd className="journey-bar-stat-value journey-bar-stat-value--blocked">
            {blockedMs}ms
          </dd>
        </div>
      </dl>
    </div>
  );
}
