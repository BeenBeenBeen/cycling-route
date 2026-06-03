import { createApp } from "./app";
import { loadConfig } from "./config";
import { createProductionDependencies } from "./dependencies";

const config = loadConfig();
const app = createApp(createProductionDependencies(config));

app.listen(config.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
