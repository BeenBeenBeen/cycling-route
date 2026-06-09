import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const RoutePlannerView = () => import("./views/RoutePlannerView.vue");
const PublisherView = () => import("./views/PublisherView.vue");

export const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/route-planner" },
  { path: "/route-planner", component: RoutePlannerView },
  { path: "/publisher", component: PublisherView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
