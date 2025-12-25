import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "assets"),
    rollupOptions: {
      input: path.resolve(__dirname, "src/widget/index.html"),
      output: {
        entryFileNames: "grocery-store-[hash].js",
        chunkFileNames: "grocery-store-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith("index.html")) {
            return "grocery-store.html";
          }
          return "grocery-store-[hash][extname]";
        },
      },
    },
  },
});

