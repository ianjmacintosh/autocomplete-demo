import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";

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
): UseDebouncedValueResult<T> {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isPending, setIsPending] = useState(true);

  if (value !== prevValue) {
    setPrevValue(value);
    setIsPending(true);
  }

  const debouncedCommit = useMemo(
    () =>
      debounce((next: T) => {
        setDebouncedValue(next);
        setIsPending(false);
      }, delayMs),
    [delayMs],
  );

  useEffect(() => {
    debouncedCommit(value);
  }, [value, debouncedCommit]);

  useEffect(() => {
    return () => debouncedCommit.cancel();
  }, [debouncedCommit]);

  return { value: debouncedValue, isPending };
}
