import {
  PopoverProvider,
  Popover,
  PopoverDisclosure,
  PopoverDismiss,
} from "@ariakit/react";
import { Settings, Trash2, X } from "lucide-react";
import type {
  LoggedEvent,
  LoggedEventType,
  LoggedEventTypeFilter,
} from "../../lib/types";
import "./EventLog.css";

export type { LoggedEvent, LoggedEventType };

interface EventLogProps {
  events: LoggedEvent[];
  enabledEventTypes: LoggedEventTypeFilter;
  onToggleEventType: (type: LoggedEventType) => void;
  onSetAllEventTypes: (enabled: boolean) => void;
  onClear: () => void;
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

const EVENT_TYPES = Object.keys(EVENT_LABEL) as LoggedEventType[];

export function EventLog({
  events,
  enabledEventTypes,
  onToggleEventType,
  onSetAllEventTypes,
  onClear,
}: EventLogProps) {
  const allEnabled = EVENT_TYPES.every((type) => enabledEventTypes[type]);
  const allDisabled = EVENT_TYPES.every((type) => !enabledEventTypes[type]);
  return (
    <aside className="event-log" aria-label="Input and search event log">
      <div className="event-log-header">
        <h2 className="event-log-title">Event log</h2>
        <div className="event-log-actions">
          <button
            type="button"
            className="event-log-action-button"
            onClick={onClear}
          >
            <Trash2 size={14} aria-hidden="true" />
            Clear
          </button>
          <PopoverProvider placement="bottom-end">
            <PopoverDisclosure
              className="event-log-action-button event-log-settings-button"
              aria-label="Event log settings"
            >
              <Settings size={14} aria-hidden="true" />
              Settings
            </PopoverDisclosure>
            <Popover
              gutter={4}
              className="event-log-settings-popover"
              aria-label="Toggle logged event types"
            >
              <div className="event-log-settings-popover-header">
                <span>Logged events</span>
                <PopoverDismiss
                  className="event-log-settings-close"
                  aria-label="Close settings"
                >
                  <X size={14} aria-hidden="true" />
                </PopoverDismiss>
              </div>
              <div className="event-log-settings-bulk-actions">
                <button
                  type="button"
                  className="event-log-settings-bulk-button"
                  onClick={() => onSetAllEventTypes(true)}
                  disabled={allEnabled}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="event-log-settings-bulk-button"
                  onClick={() => onSetAllEventTypes(false)}
                  disabled={allDisabled}
                >
                  Deselect all
                </button>
              </div>
              <ul className="event-log-settings-list">
                {EVENT_TYPES.map((type) => (
                  <li key={type}>
                    <label className="event-log-settings-item">
                      <input
                        type="checkbox"
                        checked={enabledEventTypes[type]}
                        onChange={() => onToggleEventType(type)}
                      />
                      {EVENT_LABEL[type]}
                    </label>
                  </li>
                ))}
              </ul>
            </Popover>
          </PopoverProvider>
        </div>
      </div>
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
