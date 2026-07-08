import { SIZE_TIERS } from "../../data";
import type {
  AutocompleteSettings,
  DebouncePreset,
  MatchingStrategy,
  SizeTierId,
} from "../../lib/types";
import "./SettingsPanel.css";

const DEBOUNCE_PRESET_MS: Record<Exclude<DebouncePreset, "custom">, number> = {
  off: 0,
  "200": 200,
  "400": 400,
  "800": 800,
};

interface SettingsPanelProps {
  settings: AutocompleteSettings;
  onChange: (patch: Partial<AutocompleteSettings>) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const showDistanceThreshold =
    settings.strategy === "fuzzy" || settings.strategy === "combined";
  const workerModeApplies =
    settings.strategy === "fuzzy" || settings.strategy === "combined";

  return (
    <form className="settings-panel" onSubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend>Dataset</legend>
        <div className="settings-row">
          {SIZE_TIERS.map((tier) => (
            <label key={tier.id} className="settings-radio">
              <input
                type="radio"
                name="tierId"
                value={tier.id}
                checked={settings.tierId === tier.id}
                onChange={() => onChange({ tierId: tier.id as SizeTierId })}
              />
              {tier.label} — {tier.theme}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Matching strategy</legend>
        <div className="settings-row">
          {(["prefix", "fuzzy", "combined"] as MatchingStrategy[]).map(
            (strategy) => (
              <label key={strategy} className="settings-radio">
                <input
                  type="radio"
                  name="strategy"
                  value={strategy}
                  checked={settings.strategy === strategy}
                  onChange={() => onChange({ strategy })}
                />
                {strategyLabel(strategy)}
              </label>
            ),
          )}
        </div>
      </fieldset>

      <fieldset disabled={!workerModeApplies}>
        <legend>Worker mode</legend>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={settings.workerModeOn}
            onChange={(e) => onChange({ workerModeOn: e.target.checked })}
          />
          Run fuzzy matching in a Web Worker
        </label>
        {!workerModeApplies && (
          <p className="settings-hint">
            Prefix Match has nothing expensive to offload — pick Fuzzy or
            Combined to compare worker vs. main-thread.
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend>Debounce</legend>
        <div className="settings-row">
          {(["off", "200", "400", "800", "custom"] as DebouncePreset[]).map(
            (preset) => (
              <label key={preset} className="settings-radio">
                <input
                  type="radio"
                  name="debouncePreset"
                  value={preset}
                  checked={settings.debouncePreset === preset}
                  onChange={() =>
                    onChange({
                      debouncePreset: preset,
                      debounceMs:
                        preset === "custom"
                          ? settings.debounceMs
                          : DEBOUNCE_PRESET_MS[preset],
                    })
                  }
                />
                {preset === "custom"
                  ? "Custom"
                  : preset === "off"
                    ? "Off"
                    : `${preset}ms`}
              </label>
            ),
          )}
          {settings.debouncePreset === "custom" && (
            <input
              type="text"
              inputMode="numeric"
              className="settings-number"
              value={settings.debounceMs}
              onChange={(e) =>
                onChange({
                  debounceMs: parsePositiveInt(
                    e.target.value,
                    settings.debounceMs,
                  ),
                })
              }
              aria-label="Custom debounce in milliseconds"
            />
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>Result count</legend>
        <input
          type="text"
          inputMode="numeric"
          className="settings-number"
          value={settings.maxResults}
          onChange={(e) =>
            onChange({
              maxResults: clamp(
                parsePositiveInt(e.target.value, settings.maxResults),
                1,
                50,
              ),
            })
          }
          aria-label="Maximum number of suggestions to show"
        />
      </fieldset>

      <fieldset>
        <legend>Algorithm settings</legend>
        <label className="settings-field">
          Minimum characters before searching
          <input
            type="text"
            inputMode="numeric"
            className="settings-number"
            value={settings.minChars}
            onChange={(e) =>
              onChange({
                minChars: clamp(
                  parsePositiveInt(e.target.value, settings.minChars),
                  1,
                  10,
                ),
              })
            }
          />
        </label>
        {showDistanceThreshold && (
          <label className="settings-field">
            Fuzzy distance threshold ({settings.distanceThreshold.toFixed(2)})
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={settings.distanceThreshold}
              onChange={(e) =>
                onChange({ distanceThreshold: Number(e.target.value) })
              }
            />
          </label>
        )}
      </fieldset>
    </form>
  );
}

function strategyLabel(strategy: MatchingStrategy): string {
  switch (strategy) {
    case "prefix":
      return "Prefix Match";
    case "fuzzy":
      return "Fuzzy Match";
    case "combined":
      return "Combined (pillbug's actual strategy)";
  }
}

function parsePositiveInt(raw: string, fallback: number): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits === "") return fallback;
  return Number.parseInt(digits, 10);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
