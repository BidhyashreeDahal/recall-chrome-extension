import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,

    // This forces ONE single file output (no imports, no chunks)
    lib: {
      entry: path.resolve(__dirname, "src/content/content.tsx"),
      name: "RecallContent",
      formats: ["iife"],
      fileName: () => "content.js"
    },

    // Prevent chunk splitting
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    },

    // Keep it simple for Chrome
    cssCodeSplit: false,
    sourcemap: false
  }
});
