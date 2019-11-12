import Vue from "vue"
import Router from "vue-router"

import Index from "./views/Index.vue"
import Canvas from "./views/Canvas.vue"
import Conversation from "./views/Conversation.vue"
import SignIn from "./views/SignIn.vue"
import ServiceTerms from "./views/ServiceTerms.vue"
import PrivacyPolicy from "./views/PrivacyPolicy.vue"
import Top from "./views/Top.vue"
import Bots from "./views/Bots.vue"

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
      name: "sign-up",
      component: SignIn
    },
    {
      path: "/privacy-policy",
      name: "/privacy-policy",
      component: PrivacyPolicy
    },
    {
      path: "/service-terms",
      name: "/service-terms",
      component: ServiceTerms
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
      name: "preview_chat",
      component: Conversation
    },
    // for Inbox
    {
      path: "/team",
      name: "team",
      component: () =>
        import('@/views/Team')
    },
    {
      path: "/inbox",
      name: "inbox",
      component: () =>
        import('@/views/Inbox')
    },
    {
      path: '/:teamId',
      name: 'chat',
      component: () =>
        import('@/views/Chat')
    },
    {
      path: '/:teamId/:uid',
      name: 'chat',
      component: () =>
        import('@/views/Chat')
    },
    {
      path: '/profile/:teamId/:uid',
      name: 'profile',
      props: true,
      component: () =>
        import('@/views/Profile')
    },
    // {
    //   path: '/:teamId/:uid',
    //   name: 'chat',
    //   props: true,
    //   component: () =>
    //     import('@/views/Chat')
    // },
    // for v1
    {
      path: "/conversation/:id",
      name: "conversation",
      component: Conversation
    }
  ]
});
