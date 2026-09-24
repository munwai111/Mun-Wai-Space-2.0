import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Each case study is a real page with its own HTML, title and social card, so
// /projects/career-os/ can be sent to someone on its own. No client router and
// no catch-all rewrite.
const dir = (p) => resolve(__dirname, p, "index.html");

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        main: dir("."),
        careerOs: dir("projects/career-os"),
        vtac: dir("projects/vtac"),
        ciairi: dir("projects/ciairi"),
        metaxy: dir("projects/metaxy"),
        midas: dir("projects/midas"),
        uniqlo: dir("work/uniqlo"),
      },
      output: {
        // Only React is forced into a shared chunk. Everything else is left to
        // Rollup to split per entry, so a case-study page does not download the
        // homepage's animation libraries and icon set.
        manualChunks: (id) =>
          /\/node_modules\/(react|react-dom|scheduler)\//.test(id)
            ? "react"
            : undefined,
      },
    },
  },
});
