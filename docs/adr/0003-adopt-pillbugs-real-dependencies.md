# Adopt pillbug's real dependencies (@ariakit/react, lodash-es) rather than reimplementing

The demo adds `@ariakit/react` (combobox primitives) and `lodash-es` (debounce) as dependencies, matching what pillbug's actual "Add Prescription" flow uses, instead of reimplementing an accessible combobox and a debounce utility from scratch to keep this template dependency-free.

Reimplementing accessible keyboard/ARIA combobox behavior correctly is a substantial undertaking orthogonal to what this demo is actually evaluating (matching strategy, debounce, worker offloading), and a visitor deciding whether to adopt this component wants to see the real production implementation, not a simplified stand-in that could behave subtly differently.
