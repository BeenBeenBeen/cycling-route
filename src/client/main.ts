import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { clearRoutePlannerSession } from "./stores/routePlannerSessionStore";
import { clearRoutePublishDraft } from "./stores/routePublishDraftStore";

clearRoutePlannerSession();
clearRoutePublishDraft();
createApp(App).use(router).mount("#app");
