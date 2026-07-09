import type { LoggedEvent, LoggedEventType } from "../../lib/types";
import "./EventLog.css";

export type { LoggedEvent, LoggedEventType };

interface EventLogProps {
  events: LoggedEvent[];
}

const EVENT_LABEL: Record<LoggedEventType, string> = {
  focus: "focus",
  blur: "blur",
  keydown: "keyDown",
  keyup: "keyUp",
  change: "change",
  debounceStart: "debounceStart",
  debounceEnd: "debounceEnd",
  countStart: "countStart",
  countEnd: "countEnd",
  sortStart: "sortStart",
  sortEnd: "sortEnd",
};

export function EventLog({ events }: EventLogProps) {
  return (
    <aside className="event-log" aria-label="Input and search event log">
      <h2 className="event-log-title">Event log</h2>
      {events.length === 0 ? (
        <p className="event-log-empty">
          Focus the input to start logging events…
        </p>
      ) : (
        <ol className="event-log-list">
          {events.map((event) => (
            <li
              key={event.id}
              className={`event-log-entry event-log-entry--${event.type}`}
            >
              <span className="event-log-timestamp">
                {formatTimestamp(event.timestamp)}
              </span>
              <span className="event-log-type">{EVENT_LABEL[event.type]}</span>
              {event.detail && (
                <span className="event-log-key">{event.detail}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

function formatTimestamp(ms: number): string {
  const time = new Date(ms).toLocaleTimeString("en-US", { hour12: false });
  const millis = String(ms % 1000).padStart(3, "0");
  return `${time}.${millis}`;
}
