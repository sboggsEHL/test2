import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.join(__dirname, "src", "renderer"),
  base: "./",
  publicDir: path.join(__dirname, "src", "renderer", "public"),
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: path.join(__dirname, "src", "renderer", "index.html"),
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js"),
  },
  server: {
    port: 5173,
    historyApiFallback: true,
  },
  envDir: path.resolve(__dirname), // This points to the root directory where .env is located
});
