import Vue from "vue"
import Vuex from "vuex"
import * as auth from "./store/auth"
import * as project from "./store/project"
import * as scenario from "./store/scenario"
import * as edges from "./store/edges"
import * as team from "./store/team"

Vue.use(Vuex)

console.log('store:', scenario);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth: {
      namespaced: true,
      ...auth
    },
    project: {
      namespaced: true,
      ...project
    },
    scenario: {
      namespaced: true,
      ...scenario
    },
    edges: {
      namespaced: true,
      ...edges
    },

    team: {
      namespaced: true,
      ...team
    }
    //scenario, // memo: means scenarion: scenario
    //projects
  },
});
