import type { SearchMeta } from "../../lib/types";
import "./TimingReadout.css";

interface TimingReadoutProps {
  meta: SearchMeta | null;
  corpusSize: number;
}

export function TimingReadout({ meta, corpusSize }: TimingReadoutProps) {
  return (
    <p className="timing-readout" role="status">
      {meta ? (
        <>
          <strong>{meta.elapsedMs.toFixed(1)}ms</strong> · {meta.strategyUsed}{" "}
          match · ran on{" "}
          {meta.ranOn === "worker" ? "Web Worker" : "main thread"} · corpus:{" "}
          {corpusSize.toLocaleString()} entries
        </>
      ) : (
        <>Type to search a corpus of {corpusSize.toLocaleString()} entries…</>
      )}
    </p>
  );
}
