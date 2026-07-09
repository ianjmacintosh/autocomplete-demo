import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
  useComboboxStore,
} from "@ariakit/react";
import { X } from "lucide-react";
import "./Autocomplete.css";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  minChars: number;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  onInputKeyDown?: (key: string) => void;
  onInputKeyUp?: (key: string) => void;
  onOptionSelect?: (value: string) => void;
}

// Generalized from ianjmacintosh/pillbug's DrugNameCombobox.tsx. Purely
// presentational — matching/debounce/worker orchestration lives in
// useSuggestions, called once by the parent so the search isn't duplicated.
//
// Ported at pillbug@6b19cd8 (#291). Diff pillbug's file against that SHA to
// spot upstream changes worth porting — no automated sync, manual/occasional.
export function Autocomplete({
  value,
  onChange,
  suggestions,
  minChars,
  onInputFocus,
  onInputBlur,
  onInputKeyDown,
  onInputKeyUp,
  onOptionSelect,
}: AutocompleteProps) {
  const combobox = useComboboxStore({ value, setValue: onChange });

  return (
    <ComboboxProvider store={combobox}>
      <div className="autocomplete-input-wrapper">
        <Combobox
          id="autocomplete-demo-input"
          className="autocomplete-input"
          placeholder={`Type at least ${minChars} character${minChars === 1 ? "" : "s"}…`}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={(event) => onInputKeyDown?.(event.key)}
          onKeyUp={(event) => onInputKeyUp?.(event.key)}
        />
        {value.length > 0 && (
          <button
            type="button"
            className="autocomplete-clear-button"
            aria-label="Clear input"
            onClick={() => onChange("")}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <ComboboxPopover sameWidth gutter={4} className="autocomplete-popover">
          <ComboboxList className="autocomplete-list">
            {suggestions.map((entry) => (
              <ComboboxItem
                key={entry}
                value={entry}
                className="autocomplete-item"
                onClick={() => onOptionSelect?.(entry)}
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      )}
    </ComboboxProvider>
  );
}
