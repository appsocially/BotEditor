import Vue from "vue";
import Router from "vue-router";

import Index from "./views/Index.vue";
import Canvas from "./views/Canvas.vue";
import Conversation from "./views/Conversation.vue";
import SignIn from "./views/SignIn.vue";
import Top from "./views/Top.vue";
import Bots from "./views/Bots.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "index",
      component: Index
    },
    {
      path: "/top",
      name: "top",
      component: Top
    },
    {
      path: "/openbots",
      name: "openbots",
      component: Bots
    },
    {
      path: "/sign-in",
      name: "sign-in",
      component: SignIn
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: SignIn
    },
    {
      path: "/sign-up/:projectId",
      name: "sign-up-with-project-id",
      component: SignIn
    },
    {
      path: "/canvas/:id",
      name: "canvas",
      component: Canvas
    },
    {
      path: "/canvas_preview/:id",
      name: "canvas_preview",
      component: Canvas
    },
    {
      path: "/preview/:id",
      name: "preview",
      component: Conversation
    },
    {
      path: "/chat/:id",
      name: "chat",
      component: Conversation
    },
    // for v1
    {
      path: "/conversation/:id",
      name: "conversation",
      component: Conversation
    }
  ]
});
