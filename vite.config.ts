import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from "path";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  base: "/swedish-english-teac/",
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
  ],
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      css: {
        // Ensure CSS imports from node_modules are resolved
      },
    },
  },
  build: {
    cssCodeSplit: false, // Bundle all CSS together
  },
});
