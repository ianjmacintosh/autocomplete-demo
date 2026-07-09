import { TimerReset } from "lucide-react";
import type { Journey, LoggedEvent, LoggedEventType } from "../../lib/types";
import "./JourneyBar.css";

interface JourneyBarProps {
  events: LoggedEvent[];
  journey: Journey | null;
  onReset: () => void;
}

/** Segment 0 always spans from the first keystroke to the next logged
 * event (if any), so it gets a pseudo-type of its own rather than
 * borrowing one of the real LoggedEventTypes. */
type PhaseType = LoggedEventType | "typing";

const PHASE_LABEL: Record<PhaseType, string> = {
  typing: "typing",
  focus: "focus",
  blur: "blur",
  keydown: "key down",
  keyup: "key up",
  change: "typing",
  select: "select",
  debounceStart: "debounce",
  debounceEnd: "debounce settled",
  countStart: "counting",
  countEnd: "counted",
  sortStart: "sorting",
  sortEnd: "sorted",
};

interface Segment {
  type: PhaseType;
  durationMs: number;
}

// Each segment is the gap between two consecutive timestamps — the journey's
// start, every in-range logged event, and the journey's end — labeled by
// whichever event opened that gap (or "typing" for the first one, opened by
// the keystroke that started the journey rather than a logged event).
function buildSegments(
  events: LoggedEvent[],
  start: number,
  end: number,
): Segment[] {
  const inRange = events
    .filter((event) => event.timestamp >= start && event.timestamp <= end)
    .slice()
    .reverse(); // events arrive newest-first; segments need chronological order

  const boundaries = [start, ...inRange.map((event) => event.timestamp), end];
  const types: PhaseType[] = ["typing", ...inRange.map((event) => event.type)];

  const segments: Segment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const durationMs = boundaries[i + 1] - boundaries[i];
    if (durationMs <= 0) continue;
    segments.push({ type: types[i], durationMs });
  }
  return segments;
}

export function JourneyBar({ events, journey, onReset }: JourneyBarProps) {
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
  const segments = buildSegments(events, start, end);

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
      <div
        className="journey-bar-track"
        role="img"
        aria-label={`User journey from first keystroke to selection or blur, lasting ${totalMs} milliseconds`}
      >
        {totalMs <= 0 || segments.length === 0 ? (
          <div className="journey-bar-segment journey-bar-segment--typing" />
        ) : (
          segments.map((segment, index) => (
            <div
              key={index}
              className={`journey-bar-segment journey-bar-segment--${segment.type}`}
              style={{ width: `${(segment.durationMs / totalMs) * 100}%` }}
              title={`${PHASE_LABEL[segment.type]}: ${segment.durationMs}ms`}
            />
          ))
        )}
      </div>
    </div>
  );
}
