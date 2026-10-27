import { defineConfig } from "vite";
import { webClientPreset } from "./harness/vite-preset.ts";

export default defineConfig(webClientPreset({ entry: "src/main.tsx" }));
