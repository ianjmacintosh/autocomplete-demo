import { useCallback, useEffect, useRef, useState } from "react";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { StealItPanel } from "./StealIt/StealItPanel";
import { EventLog } from "./EventLog/EventLog";
import { useUrlSyncedSettings } from "../hooks/useUrlSyncedSettings";
import { useSuggestions } from "../hooks/useSuggestions";
import type {
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
          Object.keys(ALL_EVENT_TYPES_ENABLED).map((type) => [
            type,
            enabled,
          ]),
        ) as LoggedEventTypeFilter,
    );
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  const { suggestions } = useSuggestions(query, settings, logEvent);

  const handleQueryChange = useCallback(
    (value: string) => {
      logEvent("change", value);
      setQuery(value);
    },
    [logEvent],
  );

  return (
    <>
      <div className="app-main">
        <header className="app-header">
          <h1>Autocomplete, tuned to your use case</h1>
          <p>
            A configurable port of the drug-name lookup from{" "}
            <a
              href="https://github.com/ianjmacintosh/pillbug"
              target="_blank"
              rel="noreferrer"
            >
              ianjmacintosh/pillbug
            </a>
            's "Add Prescription" flow. Change the settings below and try
            typing.
          </p>
        </header>

        <Autocomplete
          value={query}
          onChange={handleQueryChange}
          suggestions={suggestions}
          minChars={settings.minChars}
          onInputFocus={() => logEvent("focus")}
          onInputBlur={() => logEvent("blur")}
          onInputKeyDown={(key) => logEvent("keydown", key)}
          onInputKeyUp={(key) => logEvent("keyup", key)}
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
        enabledEventTypes={enabledEventTypes}
        onToggleEventType={toggleEventType}
        onSetAllEventTypes={setAllEventTypes}
        onClear={clearEvents}
      />
    </>
  );
}

export default App;
