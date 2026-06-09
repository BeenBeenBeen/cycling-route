import { createApp } from "./app";
import type { AppConfig } from "./config";
import { createProductionDependencies } from "./dependencies";

export const createProductionApp = (config: AppConfig) => {
  return createApp(createProductionDependencies(config));
};
