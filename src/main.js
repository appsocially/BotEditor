import Vue from "vue"
import "./plugins/vuetify"
import "./plugins/firebase"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
