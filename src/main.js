import Vue from "vue"
import "./plugins/vuetify"
import "./plugins/firebase"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import VueClipboard from 'vue-clipboard2'

import Router from 'vue-router'

Vue.use(VueClipboard)
Vue.config.productionTip = false
const routerPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return routerPush.call(this, location).catch(error => error)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")
