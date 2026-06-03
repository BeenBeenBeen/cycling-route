import { loadConfig } from "./config";
import { createProductionApp } from "./productionApp";

const config = loadConfig();
const app = createProductionApp(config);

app.listen(config.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
