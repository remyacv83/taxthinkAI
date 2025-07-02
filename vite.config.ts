import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()], // Remove Replit-specific plugins for production
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  root: "./client", // Ensure this matches your project structure
  build: {
    outDir: "../dist/public", // Relative to `root` (or use absolute path)
    emptyOutDir: true,
  },
});