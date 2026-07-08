# Track pillbug drift via source-commit breadcrumbs, not automated sync

Each file ported from pillbug (`src/lib/matching.ts`, `src/hooks/useDebouncedValue.ts`, `src/hooks/useSuggestions.ts`, `src/components/Autocomplete/Autocomplete.tsx`) now names the pillbug commit SHA it was ported from (`6b19cd8`, PR #291) in its header comment, instead of a shared package or CI check that flags upstream changes automatically.

The ported code is already meant to diverge — generalized from drug names to any corpus, parameterized instead of hardcoded, demo-specific UI — so a straight copy or shared dependency would fight that divergence. A breadcrumb SHA lets a future pass do `git log <sha>..main -- <file>` against pillbug and decide by hand whether an upstream change (bug fix vs. drug-specific logic) is worth porting. The tradeoff: drift is invisible until someone goes looking; there's no automatic alert when pillbug's matching logic changes.
