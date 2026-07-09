import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React y su ecosistema base: cambia poco, se cachea a largo plazo.
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
              return "react";
            }
            // Cliente de Supabase: se actualiza a su propio ritmo.
            if (id.includes("node_modules/@supabase/")) {
              return "supabase";
            }
            // Resto de librerías (radix, lucide, zod, sonner...).
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".vercel.app",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

