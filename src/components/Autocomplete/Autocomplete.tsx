import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxPopover,
  ComboboxProvider,
  useComboboxStore,
} from "@ariakit/react";
import "./Autocomplete.css";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  minChars: number;
}

// Generalized from ianjmacintosh/pillbug's DrugNameCombobox.tsx. Purely
// presentational — matching/debounce/worker orchestration lives in
// useSuggestions, called once by the parent so the search isn't duplicated.
export function Autocomplete({
  value,
  onChange,
  suggestions,
  minChars,
}: AutocompleteProps) {
  const combobox = useComboboxStore({ value, setValue: onChange });

  return (
    <ComboboxProvider store={combobox}>
      <Combobox
        id="autocomplete-demo-input"
        className="autocomplete-input"
        placeholder={`Type at least ${minChars} characters…`}
        autoSelect
      />
      {suggestions.length > 0 && (
        <ComboboxPopover sameWidth gutter={4} className="autocomplete-popover">
          <ComboboxList className="autocomplete-list">
            {suggestions.map((entry) => (
              <ComboboxItem
                key={entry}
                value={entry}
                className="autocomplete-item"
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      )}
    </ComboboxProvider>
  );
}
