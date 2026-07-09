import { useCallback, useEffect, useRef, useState } from "react";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { StealItPanel } from "./StealIt/StealItPanel";
import { EventLog } from "./EventLog/EventLog";
import { useUrlSyncedSettings } from "../hooks/useUrlSyncedSettings";
import { useSuggestions } from "../hooks/useSuggestions";
import type {
  Journey,
  LoggedEvent,
  LoggedEventType,
  LoggedEventTypeFilter,
} from "../lib/types";
import "./App.css";

const MAX_LOGGED_EVENTS = 200;

const ALL_EVENT_TYPES_ENABLED: LoggedEventTypeFilter = {
  focus: true,
  blur: true,
  keydown: true,
  keyup: true,
  change: true,
  select: true,
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
    useState<LoggedEventTypeFilter>(ALL_EVENT_TYPES_ENABLED);
  // logEvent is called from effects deep in useSuggestions, which re-run
  // whenever its identity changes — a ref keeps it stable across toggles
  // instead of tying its identity to enabledEventTypes.
  const enabledEventTypesRef = useRef(enabledEventTypes);
  useEffect(() => {
    enabledEventTypesRef.current = enabledEventTypes;
  }, [enabledEventTypes]);

  const logEvent = useCallback((type: LoggedEventType, detail?: string) => {
    if (!enabledEventTypesRef.current[type]) return;
    setEvents((prev) =>
      [
        { id: nextEventId.current++, type, detail, timestamp: Date.now() },
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
          Object.keys(ALL_EVENT_TYPES_ENABLED).map((type) => [type, enabled]),
        ) as LoggedEventTypeFilter,
    );
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  // A "journey" spans from the first character typed into an empty input to
  // the moment the visitor either picks a suggestion or blurs the field —
  // rendered as a segmented bar under the Event log. `end` stays null while
  // the journey is still in progress.
  const [journey, setJourney] = useState<Journey | null>(null);
  const prevQueryRef = useRef("");

  const completeJourney = useCallback(() => {
    setJourney((prev) =>
      prev && prev.end === null ? { ...prev, end: Date.now() } : prev,
    );
  }, []);

  const clearJourney = useCallback(() => setJourney(null), []);

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

        <p>
          I spent a couple of days building and refining an autocomplete input
          with Sonnet 5.0. It was fun, but I don't want to make this all over
          again next time I need an autocomplete input, so I made a note to
          reference this implementation in the future. Then I realized there are
          probably lots of other people who could use the same thing for their
          projects.
        </p>
        <p>
          Give it a spin. I hope you find it useful and shamelessly steal it.
          Make it your own!
        </p>
        <p>
          You can try out different datasets and filtering options, and I've
          included verbose event logging so you can understand what's happening
          under the hood.
        </p>

        <label htmlFor="autocomplete-demo-input">
          This input uses the {settings.tierId} dataset:
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
          onOptionSelect={(selected) => {
            logEvent("select", selected);
            completeJourney();
          }}
        />
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
          <p>
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
