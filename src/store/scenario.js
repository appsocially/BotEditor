
import db from "@/components/firebaseInit";


export const state = ()=>({
  scenarioArray: []
});

export const mutations = {
  replaceScenario(state, value) {
    state.scenarioArray = value;
  },
  addNodeToScenario(state, value) {
    state.scenarioArray.push(value);
  },
  updateNextOfSingleNode(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].id==value.fromId){
        state.scenarioArray[i].next = value.toId;
        return;
      }
    }
  },
  updateNextOfGroupNode(state, value) {

    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='group'){
        
        var selections = state.scenarioArray[i].selections;
        for(var j=0; j<selections.length; j++){
          if(selections[j].id==value.fromId){
            selections[j].next = value.toId;
            return;
          }
        }

      }
    }

    console.log('update next of selection');
  },
};

export const actions = {
  async loadScenarioByProjectId({commit}, projectId) {
    const scenarioArray = await db.collection("projects")
      .doc(projectId)
      .collection('scenario')
      .get()
      .then(function(doc) {
        return doc.docs.map(function(doc){
          return doc.data();
        });
      });
    commit('replaceScenario', scenarioArray);
  },
  pushContentToScenario({commit}, content){
    commit('addNodeToScenario', content);
  },
  connectSingleNode({commit}, id_from_to){
    commit('updateNextOfSingleNode', id_from_to);
  },
  connectGroupNode({commit}, id_from_to){
    commit('updateNextOfGroupNode', id_from_to);
  },
};

/*
export default {state, mutations, actions};
*/