import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../lib/types";
import type { AutocompleteSettings } from "../lib/types";
import {
  searchParamsToSettings,
  settingsToSearchParams,
} from "../lib/urlState";

export type UpdateSettings = (patch: Partial<AutocompleteSettings>) => void;

/** Round-trips settings through the URL's query string so a shared link reproduces the exact config. */
export function useUrlSyncedSettings(): [AutocompleteSettings, UpdateSettings] {
  const [settings, setSettings] = useState<AutocompleteSettings>(() => {
    const params = new URLSearchParams(window.location.search);
    return [...params.keys()].length === 0
      ? DEFAULT_SETTINGS
      : searchParamsToSettings(params);
  });

  useEffect(() => {
    const params = settingsToSearchParams(settings);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [settings]);

  const update: UpdateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return [settings, update];
}
