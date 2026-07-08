import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  worker: {
    // The search worker dynamically imports its corpus JSON, which needs
    // ES module output — Vite's default IIFE worker format doesn't support
    // code-splitting.
    format: "es",
  },
});
