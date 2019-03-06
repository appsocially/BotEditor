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
  /*updateNextOfSingleNode(state, value) {
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
  },*/
  updateNext(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single'){

        if(state.scenarioArray[i].id==value.fromId){
          state.scenarioArray[i].next = value.toId;
          return;
        }

      }else if(state.scenarioArray[i].nodeType=='group'){
        
        var selections = state.scenarioArray[i].selections;
        for(var j=0; j<selections.length; j++){
          if(selections[j].id==value.fromId){
            selections[j].next = value.toId;
            return;
          }
        }

      }
    }
  },
  deleteNode(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].id==value) state.scenarioArray.splice(i,1);
    }
  },
  disconnectNode(state, value){
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single'){
        
        if(state.scenarioArray[i].next==value){
          delete state.scenarioArray[i].next;
        } 

      }else if(state.scenarioArray[i].nodeType=='group'){

        var selections = state.scenarioArray[i].selections;
        for(var j=0; j<selections.length; j++){
          if(selections[j].next==value){
            delete selections[j].next;
          }
        }

      }
    }
  }
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
  /*connectSingleNode({commit}, id_from_to){
    commit('updateNextOfSingleNode', id_from_to);
  },
  connectGroupNode({commit}, id_from_to){
    commit('updateNextOfGroupNode', id_from_to);
  },*/
  connectNode({commit}, id_from_to){
    commit('updateNext', id_from_to);
  },
  deleteNode({commit}, id){
    commit('deleteNode', id);
  },
  disconnectNode({commit}, id){
    commit('disconnectNode', id);
  }
};

/*
export default {state, mutations, actions};
*/