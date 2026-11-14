import solidPlugin from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig, type PluginOption } from "vite-plus";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "solid-js/web": "@solidjs/web",
      "solid-js/web/storage": "@solidjs/web/storage",
    },
  },
  plugins: [tailwindcss(), tanstackStart() as PluginOption, solidPlugin({ ssr: true })],
  server: {
    port: 3001,
  },
});
