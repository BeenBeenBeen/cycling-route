import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();

app.listen(config.port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${config.port}`);
});
