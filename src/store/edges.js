import Vue from "vue";

export const state = () => ({
  coordinates: {}
});

export const mutations = {
  set(state, value) {
    Vue.set(state.coordinates, value.id, value);
  },
  remove(state, id) {
    Vue.delete(state.coordinates, id);
  }
};

export const actions = {
  /*async loadScenarioByProjectId({commit}, projectId) { 
    commit('add', projectId);
  }*/
};

export const getters = {
  edges(state) {
    return Object.keys(state.coordinates)
      .map(key => {
        const coordinate = state.coordinates[key];
        const nextCoordinate = state.coordinates[coordinate.next];

        const hasNext = !!nextCoordinate;
        if (hasNext) {
          const from = coordinate.right;
          const to = nextCoordinate.left;
          return { from, to, id: `${coordinate.id}-${nextCoordinate.id}` };
        } else {
          return null;
        }
      })
      .filter(edge => edge !== null);
  }
};
