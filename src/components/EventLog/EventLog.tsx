import { useEffect, useRef } from "react";
import "./EventLog.css";

export type DomEventType = "focus" | "blur" | "keydown" | "keyup";

export interface LoggedEvent {
  id: number;
  type: DomEventType;
  key?: string;
  timestamp: number;
}

interface EventLogProps {
  events: LoggedEvent[];
}

const EVENT_LABEL: Record<DomEventType, string> = {
  focus: "focus",
  blur: "blur",
  keydown: "keyDown",
  keyup: "keyUp",
};

export function EventLog({ events }: EventLogProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Auto-scroll to the newest (bottom) entry, but only when the visitor
  // hasn't scrolled up to review history — otherwise a new event would
  // yank them back down mid-review.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 48) {
      container.scrollTop = container.scrollHeight;
    }
  }, [events]);

  return (
    <aside
      ref={containerRef}
      className="event-log"
      aria-label="Input DOM event log"
    >
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
              {event.key && <span className="event-log-key">{event.key}</span>}
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
