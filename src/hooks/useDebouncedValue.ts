import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash-es";
import type { DebouncedFunc } from "lodash-es";

// Ported from ianjmacintosh/pillbug's useDebouncedValue hook.
// Ported at pillbug@6b19cd8 (#291). Diff pillbug's file against that SHA to
// spot upstream changes worth porting — no automated sync, manual/occasional.
export interface UseDebouncedValueResult<T> {
  /** The most recently *settled* value. Lags `value` by up to `delayMs`. */
  value: T;
  /** True from the moment the input changes until the debounce settles. */
  isPending: boolean;
}

export function useDebouncedValue<T>(
  value: T,
  delayMs: number,
  onDebounceStart?: (value: T) => void,
  onDebounceEnd?: (value: T) => void,
): UseDebouncedValueResult<T> {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isPending, setIsPending] = useState(true);

  // Read via a ref so the debounced callback below (memoized on `delayMs`
  // alone) always calls the latest onDebounceEnd instead of one captured
  // from whichever render last recreated the debounce timer. Written from
  // an effect, not during render — mutating a ref while rendering is
  // forbidden by this repo's stricter lint rules.
  const onDebounceEndRef = useRef(onDebounceEnd);
  useEffect(() => {
    onDebounceEndRef.current = onDebounceEnd;
  }, [onDebounceEnd]);

  if (value !== prevValue) {
    setPrevValue(value);
    setIsPending(true);
    onDebounceStart?.(value);
  }

  // The debounced committer itself lives in a ref, built inside an effect
  // rather than useMemo — reading onDebounceEndRef.current from a closure
  // created during render (as useMemo's factory runs) is exactly what this
  // repo's stricter lint rules forbid, even though the closure itself only
  // actually runs later, off a timer.
  const debouncedCommitRef = useRef<DebouncedFunc<(next: T) => void> | null>(
    null,
  );

  useEffect(() => {
    const commit = debounce((next: T) => {
      setDebouncedValue(next);
      setIsPending(false);
      onDebounceEndRef.current?.(next);
    }, delayMs);
    debouncedCommitRef.current = commit;
    return () => commit.cancel();
  }, [delayMs]);

  useEffect(() => {
    // delayMs is a dependency (though unused in the body) so this re-fires
    // and re-arms the freshly (re)created debounced committer above
    // whenever delayMs changes, not just when value itself does.
    debouncedCommitRef.current?.(value);
  }, [value, delayMs]);

  return { value: debouncedValue, isPending };
}
