import { useCallback, useRef, useState } from "react";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { TimingReadout } from "./TimingReadout/TimingReadout";
import { StealItPanel } from "./StealIt/StealItPanel";
import { EventLog } from "./EventLog/EventLog";
import type { DomEventType, LoggedEvent } from "./EventLog/EventLog";
import { useUrlSyncedSettings } from "../hooks/useUrlSyncedSettings";
import { useSuggestions } from "../hooks/useSuggestions";
import "./App.css";

const MAX_LOGGED_EVENTS = 200;

function App() {
  const [settings, updateSettings] = useUrlSyncedSettings();
  const [query, setQuery] = useState("");
  const { suggestions, meta, corpusSize } = useSuggestions(query, settings);

  // Newest-first: paired with .event-log-list's flex-direction: column-reverse,
  // this keeps new entries anchored at the bottom of the panel without any
  // manual scroll management — scrolling up to review history just works.
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const nextEventId = useRef(0);
  const logEvent = useCallback((type: DomEventType, key?: string) => {
    setEvents((prev) =>
      [
        { id: nextEventId.current++, type, key, timestamp: Date.now() },
        ...prev,
      ].slice(0, MAX_LOGGED_EVENTS),
    );
  }, []);

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
          onChange={setQuery}
          suggestions={suggestions}
          minChars={settings.minChars}
          onInputFocus={() => logEvent("focus")}
          onInputBlur={() => logEvent("blur")}
          onInputKeyDown={(key) => logEvent("keydown", key)}
          onInputKeyUp={(key) => logEvent("keyup", key)}
        />
        <TimingReadout meta={meta} corpusSize={corpusSize} />

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

      <EventLog events={events} />
    </>
  );
}

export default App;
