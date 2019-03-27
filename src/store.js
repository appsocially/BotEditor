import Vue from "vue";
import Vuex from "vuex";
import * as scenario from "./store/scenario";
import * as auth from "./store/auth";

Vue.use(Vuex);

console.log('store:', scenario);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    scenario: {
      namespaced: true,
      ...scenario,
      //state: scenario.state
    },
    auth: {
      namespaced: true,
      ...auth,
      //state: scenario.state
    },
    //scenario, // memo: means scenarion: scenario
    //projects
  },
});
