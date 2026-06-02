import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import { resolveApiProxyTarget } from "./src/config/ports";

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  root: ".",
  server: {
    proxy: {
      "/api": resolveApiProxyTarget(loadEnv(mode, process.cwd(), "")),
    },
  },
}));
