import Vue from "vue";
import Router from "vue-router";
import Canvas from "./views/Canvas.vue";
import SignIn from "./views/SignIn.vue";
import Top from "./views/Top.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/top",
      name: "top",
      component: Top
    },
    {
      path: "/sign-in",
      name: "sign-in",
      component: SignIn
    },
    {
      path: "/canvas/:id",
      name: "canvas",
      component: Canvas
    }
  ]
});
