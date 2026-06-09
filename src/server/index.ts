import { createApp } from "./app";
import { loadConfig } from "./config";
import { createProductionDependencies } from "./dependencies";
import { resolveListenHost } from "../config/ports";

const config = loadConfig();
const app = createApp(createProductionDependencies(config));
const listenHost = resolveListenHost(config.appMode);

app.listen(config.port, listenHost, () => {
  console.log(`API listening on http://${listenHost}:${config.port}`);
});
