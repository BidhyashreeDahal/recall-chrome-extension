import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Content script entry (compiled to dist/content.js)
        content: resolve(__dirname, "src/content/content.tsx"),

        // Popup page entry (compiled to dist/popup.html + assets)
        popup: resolve(__dirname, "src/popup/popup.html")
      },
      output: {
        // Make filenames predictable (no hashes for entry files)
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
