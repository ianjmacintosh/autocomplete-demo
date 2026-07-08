import { useState } from "react";
import { buildStealItPrompt } from "../../lib/stealItPrompt";
import type { AutocompleteSettings } from "../../lib/types";
import "./StealItPanel.css";

const SOURCE_URL =
  "https://github.com/ianjmacintosh/pillbug/tree/main/src/components/PrescriptionForm";

interface StealItPanelProps {
  settings: AutocompleteSettings;
}

export function StealItPanel({ settings }: StealItPanelProps) {
  const [copied, setCopied] = useState(false);
  const prompt = buildStealItPrompt(settings);

  const handleCopy = () => {
    void navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="steal-it-panel">
      <h2>Steal it</h2>
      <p>
        The real implementation lives at{" "}
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">
          github.com/ianjmacintosh/pillbug
        </a>
        . Or copy this prompt into Claude, Codex, or your AI assistant of choice
        to add it to your own project, pre-configured exactly like this:
      </p>
      <textarea readOnly value={prompt} rows={11} className="steal-it-prompt" />
      <button
        type="button"
        onClick={handleCopy}
        className="steal-it-copy-button"
      >
        {copied ? "Copied!" : "Copy prompt"}
      </button>
    </section>
  );
}
