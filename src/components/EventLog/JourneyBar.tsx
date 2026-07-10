import { Tooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react";
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
// range to total up the search's own compute time, on whichever thread ran
// it. This is deliberately narrow — just the count/sort steps themselves,
// not all main-thread work — so it isn't a superset of computeBlockedMs
// below; most of a journey's blocking usually comes from elsewhere
// (rendering each keystroke, event handling, GC), not from matching itself.
function computeMatchSortMs(
  events: LoggedEvent[],
  start: number,
  end: number,
): number {
  const inRange = events
    .filter((event) => event.timestamp >= start && event.timestamp <= end)
    .slice()
    .reverse(); // events arrive newest-first; pairing needs chronological order

  let matchSortMs = 0;
  let openCountAt: number | null = null;
  let openSortAt: number | null = null;

  for (const event of inRange) {
    if (event.type === "countStart") {
      openCountAt = event.timestamp;
    } else if (event.type === "countEnd" && openCountAt !== null) {
      matchSortMs += event.timestamp - openCountAt;
      openCountAt = null;
    } else if (event.type === "sortStart") {
      openSortAt = event.timestamp;
    } else if (event.type === "sortEnd" && openSortAt !== null) {
      matchSortMs += event.timestamp - openSortAt;
      openSortAt = null;
    }
  }

  return matchSortMs;
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

interface StatProps {
  label: string;
  value: string;
  valueClassName: string;
  description: string;
}

// TooltipAnchor renders a plain, non-interactive div by default, so it needs
// its own accessible name (the tooltip itself is "strictly for visual
// purposes" per Ariakit's docs — it isn't wired up as a description) and a
// tabIndex to be reachable by keyboard, matching how the mouse-hover case
// discovers it.
function Stat({ label, value, valueClassName, description }: StatProps) {
  return (
    <TooltipProvider>
      <TooltipAnchor
        className="journey-bar-stat"
        tabIndex={0}
        aria-label={`${label}: ${value}`}
      >
        <dt className="journey-bar-stat-label">{label}</dt>
        <dd className={`journey-bar-stat-value ${valueClassName}`}>{value}</dd>
      </TooltipAnchor>
      <Tooltip className="journey-bar-tooltip">{description}</Tooltip>
    </TooltipProvider>
  );
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
  const matchSortMs = Math.round(computeMatchSortMs(events, start, end));
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
        <Stat
          label="Match/sort time"
          value={`${matchSortMs}ms`}
          valueClassName="journey-bar-stat-value--compute"
          description="Time spent inside the search's own count/sort steps, on whichever thread ran them. Narrow by design — not total CPU work, so it isn't guaranteed to bound Main thread blocked."
        />
        <Stat
          label="Main thread blocked"
          value={`${blockedMs}ms`}
          valueClassName="journey-bar-stat-value--blocked"
          description="Total time the main thread was frozen (any task over ~50ms) during this journey — rendering each keystroke, event handling, and GC included, not just matching."
        />
      </dl>
    </div>
  );
}
