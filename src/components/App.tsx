import { useState } from "react";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { SettingsPanel } from "./Settings/SettingsPanel";
import { TimingReadout } from "./TimingReadout/TimingReadout";
import { StealItPanel } from "./StealIt/StealItPanel";
import { useUrlSyncedSettings } from "../hooks/useUrlSyncedSettings";
import { useSuggestions } from "../hooks/useSuggestions";
import { getSizeTier } from "../data";
import "./App.css";

function App() {
  const [settings, updateSettings] = useUrlSyncedSettings();
  const [query, setQuery] = useState("");
  const { suggestions, meta, corpusSize } = useSuggestions(query, settings);
  const tier = getSizeTier(settings.tierId);

  return (
    <>
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
          's "Add Prescription" flow. Change the settings below and try typing.
        </p>
      </header>

      <Autocomplete
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        minChars={settings.minChars}
      />
      <TimingReadout meta={meta} corpusSize={corpusSize} />
      {tier.attribution && (
        <p className="attribution-note">
          <a href={tier.attribution.href} target="_blank" rel="noreferrer">
            {tier.attribution.text}
          </a>
        </p>
      )}

      <SettingsPanel settings={settings} onChange={updateSettings} />

      <StealItPanel settings={settings} />
    </>
  );
}

export default App;
