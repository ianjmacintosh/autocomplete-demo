import { useCallback, useRef, useState } from "react";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { StealItPanel } from "./StealIt/StealItPanel";
import { EventLog } from "./EventLog/EventLog";
import { useUrlSyncedSettings } from "../hooks/useUrlSyncedSettings";
import { useSuggestions } from "../hooks/useSuggestions";
import { useLongTasks } from "../hooks/useLongTasks";
import type {
  Journey,
  LoggedEvent,
  LoggedEventType,
  LoggedEventTypeFilter,
} from "../lib/types";
import "./App.css";

const MAX_LOGGED_EVENTS = 200;

// This only controls what the visible log renders (see EventLog's own
// filtering) — it must never gate what logEvent records. JourneyBar derives
// its stats (Match/sort time, Main thread blocked) from the same full event
// history, and a Start/End pair (countStart/countEnd, sortStart/sortEnd)
// silently produces a wrong measurement if one half went unrecorded because
// a user hid it from the log.
//
// keydown/keyup/select are off by default: keydown and keyup in particular
// report event.key as "Unidentified" while a mobile IME (e.g. Android's
// Gboard) is composing, which reads as a bug in the log rather than the
// platform quirk it actually is.
const DEFAULT_EVENT_TYPE_FILTER: LoggedEventTypeFilter = {
  focus: true,
  blur: true,
  keydown: false,
  keyup: false,
  change: true,
  select: false,
  debounceStart: true,
  debounceEnd: true,
  countStart: true,
  countEnd: true,
  sortStart: true,
  sortEnd: true,
};

function App() {
  const [settings, updateSettings] = useUrlSyncedSettings();
  const [query, setQuery] = useState("");

  // Newest-first: paired with .event-log-list's flex-direction: column-reverse,
  // this keeps new entries anchored at the bottom of the panel without any
  // manual scroll management — scrolling up to review history just works.
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const nextEventId = useRef(0);

  const [enabledEventTypes, setEnabledEventTypes] =
    useState<LoggedEventTypeFilter>(DEFAULT_EVENT_TYPE_FILTER);

  const logEvent = useCallback((type: LoggedEventType, detail?: string) => {
    // Always records, regardless of enabledEventTypes — that filter only
    // controls what the visible log renders (see EventLog). JourneyBar's
    // stats need the full history to pair up Start/End events correctly.
    //
    // Captured here, not inside the updater below — React can defer that
    // updater until after several logEvent calls have already queued,
    // which would stamp back-to-back phase boundaries (e.g. countStart
    // right before an expensive synchronous loop, countEnd right after)
    // with the same instant instead of the real gap between them.
    const timestamp = Date.now();
    setEvents((prev) =>
      [
        {
          id: nextEventId.current++,
          type,
          detail,
          timestamp,
        },
        ...prev,
      ].slice(0, MAX_LOGGED_EVENTS),
    );
  }, []);

  const toggleEventType = useCallback((type: LoggedEventType) => {
    setEnabledEventTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const setAllEventTypes = useCallback((enabled: boolean) => {
    setEnabledEventTypes(
      () =>
        Object.fromEntries(
          Object.keys(DEFAULT_EVENT_TYPE_FILTER).map((type) => [type, enabled]),
        ) as LoggedEventTypeFilter,
    );
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  // A "journey" spans from the first character typed into an empty input to
  // the moment the visitor blurs the field — rendered as CPU/blocked stats
  // under the Event log. `end` stays null while the journey is still in
  // progress.
  const [journey, setJourney] = useState<Journey | null>(null);
  const prevQueryRef = useRef("");

  const completeJourney = useCallback(() => {
    setJourney((prev) =>
      prev && prev.end === null ? { ...prev, end: Date.now() } : prev,
    );
  }, []);

  const clearJourney = useCallback(() => setJourney(null), []);

  const longTasks = useLongTasks();

  const { suggestions } = useSuggestions(query, settings, logEvent);

  const handleQueryChange = useCallback(
    (value: string) => {
      logEvent("change", value);
      const wasEmpty = prevQueryRef.current.length === 0;
      prevQueryRef.current = value;
      if (wasEmpty && value.length > 0) {
        setJourney({ start: Date.now(), end: null });
      } else if (value.length === 0) {
        // Abandoned before reaching an end condition — nothing to show.
        setJourney((prev) => (prev && prev.end === null ? null : prev));
      }
      setQuery(value);
    },
    [logEvent],
  );

  return (
    <>
      <div className="app-main">
        <header className="app-header">
          <h1>Autocomplete</h1>
        </header>
        <label
          htmlFor="autocomplete-demo-input"
          className="autocomplete-input-label"
        >
          Start typing. This input searches the{" "}
          <span className="data-type">{settings.tierId}</span> dataset:
        </label>

        <Autocomplete
          value={query}
          onChange={handleQueryChange}
          suggestions={suggestions}
          minChars={settings.minChars}
          onInputFocus={() => logEvent("focus")}
          onInputBlur={() => {
            logEvent("blur");
            completeJourney();
          }}
          onInputKeyDown={(key) => logEvent("keydown", key)}
          onInputKeyUp={(key) => logEvent("keyup", key)}
          onOptionSelect={(selected) => logEvent("select", selected)}
        />

        <section>
          <p>
            I spent a few hours building and refining an autocomplete input.
            Even with the help of Sonnet 5.0, it was a little tedious getting
            the details right like picking algorithms and settings, debouncing
            queries, trying almost-but-not-quite libraries, and off-loading work
            to a web worker. I don't want to make this all over again next time
            I need an autocomplete input, so I made a note to reference this
            implementation in the future. Then I realized there are probably
            lots of other people who could use the same thing for their
            projects.
          </p>
          <p>
            Give it a spin. I hope you find it useful and shamelessly steal it.
            Make it better, make it faster, make it your own.
          </p>
          <p>
            You can try out different datasets and filtering options, and I've
            included verbose event logging so you can understand what's
            happening under the hood.
          </p>
        </section>

        <SettingsPanel settings={settings} onChange={updateSettings} />

        <StealItPanel settings={settings} />

        <footer className="app-footer">
          <p>
            <a
              href="https://www.geonames.org/"
              target="_blank"
              rel="noreferrer"
            >
              City data from GeoNames (CC BY 4.0)
            </a>
          </p>
          <p>
            Implementation stolen from{" "}
            <a
              href="https://github.com/ianjmacintosh/pillbug"
              target="_blank"
              rel="noreferrer"
            >
              ianjmacintosh/pillbug
            </a>
          </p>
          <p className="branding">
            © 2026{" "}
            <a
              href="https://www.ianjmacintosh.com/"
              target="_blank"
              rel="noreferrer"
            >
              Ian J. MacIntosh
            </a>
          </p>
        </footer>
      </div>

      <EventLog
        events={events}
        journey={journey}
        longTasks={longTasks}
        enabledEventTypes={enabledEventTypes}
        onToggleEventType={toggleEventType}
        onSetAllEventTypes={setAllEventTypes}
        onClear={clearEvents}
        onClearJourney={clearJourney}
      />
    </>
  );
}

export default App;
