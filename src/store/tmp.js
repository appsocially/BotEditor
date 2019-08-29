import db from "@/components/firebaseInit"
import entity from "@/components/entity"

export const state = () => ({
  project: {}
})

export const mutations = {
  replaceProject(state, value) {
    state.project = value
  }
}

export const actions = {
  replaceProject({commit}, project){
    commit('replaceProject', project)
  }
}

export const getters = {
  getFunction() {
    console.log("getter test")   
  }
}