import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import {
  parseAppMode,
  resolveApiProxyTarget,
  resolveListenHost,
} from "./src/config/ports";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = parseAppMode(process.env.APP_MODE ?? env.APP_MODE);

  return {
    plugins: [vue()],
    root: ".",
    server: {
      host: resolveListenHost(appMode),
      proxy: {
        "/api": resolveApiProxyTarget(env),
        "/media": resolveApiProxyTarget(env),
      },
    },
  };
});
