# Autocomplete Demo

A single-page showcase of a configurable autocomplete widget (ported from the "Add Prescription" flow in `ianjmacintosh/pillbug`), letting visitors tune its settings against real-world data to evaluate it for their own use case.

## Language

**Dataset**:
The full set of candidate strings a Matching Strategy searches against for the currently selected Size Tier.
_Avoid_: corpus, word list, data source

**Size Tier**:
One of four fixed scales a visitor can select for the Dataset — 100, 1,000, 10,000, or 100,000 entries. Each tier is bound to its own themed, real-world Dataset (not a slice of one shared master list), so changing tiers changes both the scale and the flavor of the data together.
_Avoid_: corpus, corpus size

**Matching Strategy**:
The method used to compute suggestions from the Dataset for a given query. One of Prefix Match, Fuzzy Match, or Combined Match.
_Avoid_: matching algorithm, search algorithm

**Prefix Match**:
A Matching Strategy that returns Dataset entries whose text starts with the query, case-insensitive.

**Fuzzy Match**:
A Matching Strategy that returns Dataset entries within a normalized Levenshtein-distance threshold of the query, run in isolation (not only as a fallback).

**Combined Match**:
The Matching Strategy pillbug actually ships: try Prefix Match first, and only fall back to Fuzzy Match when Prefix Match returns nothing.

**Worker Mode**:
Whether a Fuzzy Match scan runs on a background Web Worker thread (on) or synchronously on the main thread (off). Toggling this off is meant to visibly demonstrate main-thread blocking at larger Size Tiers, not to disable fuzzy matching.

**Steal-It Prompt**:
A prompt, generated dynamically from the visitor's current settings (Size Tier, Matching Strategy, Worker Mode, debounce, result count, algo settings), meant to be pasted into an AI coding assistant to add this component — pre-configured that way — to the visitor's own project.
_Avoid_: copy prompt, install prompt
