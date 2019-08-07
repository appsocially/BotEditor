import db from "@/components/firebaseInit";
import entity from "@/components/entity";


export const state = ()=>({
  scenarioArray: [],
  scenarioHistory: []
});

export const mutations = {
  replaceScenario(state, value) {
    state.scenarioArray = value;
  },
  addNodeToScenario(state, value) {
    state.scenarioArray.push(value);
  },
  updateNext(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single' || state.scenarioArray[i].nodeType=='point'){
        if(state.scenarioArray[i].id==value.fromId){
          state.scenarioArray[i].next = value.toId;
          return;
        }

      } else if (state.scenarioArray[i].nodeType=='group'){
        
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

    var projectId = location.pathname.split('/')[2];
    db.collection("projects")
      .doc(projectId)
      .collection("scenario")
      .doc(value)
      .delete().then(function(){
        console.log('delete');
      });
  },
  updateNode(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].id == value.id){
        state.scenarioArray[i] = value;
      }
    }
  },
  disconnectNode(state, value){
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single' || state.scenarioArray[i].nodeType=='point'){
        
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
  },

  addHistory(state, value){
    if(state.scenarioArray.length == 0) return;
    if(state.scenarioHistory.length > 10) state.scenarioHistory.shift();

    var scenario = state.scenarioArray.map(function(e){
      return e;
    });
    state.scenarioHistory.push(scenario);
    //console.log('scenarioHistory:', state.scenarioHistory);
  },
  async saveScenario(state, value){
    
    var projectId = location.pathname.split('/')[2];
    const scenarioArray = await db.collection("projects")
      .doc(projectId)
      .collection('scenario')
      .get()
      .then(function(doc) {
        return doc.docs.map(function(doc){
          return doc.data();
        });
      });

    var dbScenario = scenarioArray;

    var clientScenario = state.scenarioArray;

    for(var i=0; i<clientScenario.length; i++){
      var clientContent = clientScenario[i];
      var dbContent = entity.getContent(dbScenario, clientContent.id);
      //var clientContent = entity.getContent(clientScenario, dbContent.id);

      if(clientContent==undefined || dbContent==undefined) break;

      // dbに無い場合
      if(dbContent==false){
        db.collection("projects")
          .doc(projectId)
          .collection("scenario")
          .doc(clientContent.id)
          .set(clientContent)
          .then(function(e){
            console.log('added new content');
          });

      // dbとコンテンツが違う場合
      } else if(JSON.stringify(dbContent) != JSON.stringify(clientContent)){
        db.collection("projects")
          .doc(projectId)
          .collection("scenario")
          .doc(clientContent.id)
          .update(clientContent)
          .then(function(e){
            console.log('updated content');
          });

      // dbにコンテンツがあってクライアントにない場合
      }
      // delete処理ができてない
      
    }

    db.collection("projects")
      .doc(projectId)
      .update({nodeNum: window.project.nodeNum});

    console.log("saved")

  },
  addCustomVar(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customVariable = {
      location: value.location,
      varType: value.varType
    }
  },
  updateCustomVar(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customVariable = {
      location: value.location,
      varType: value.varType
    }
  },
  addCustomAction(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customAction = value.customAction
  },
  updateCustomAction(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customAction = value.customAction
  }
};

export const actions = {
  async loadScenarioByProjectId({commit}, projectId) {
    commit('addHistory');
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
  async pushContentToScenario({commit}, content){
    commit('addNodeToScenario', content);
    commit('saveScenario');
    commit('addHistory');
  },
  async deleteNode({commit}, id){
    commit('deleteNode', id);
    commit('addHistory');
  },
  async updateNode({commit}, content){
    commit('updateNode', content);
    commit('saveScenario');
    commit('addHistory');
  },
  connectNode({commit}, id_from_to){
    commit('updateNext', id_from_to);
    commit('saveScenario');
  },
  disconnectNode({commit}, id){
    commit('disconnectNode', id);
    commit('saveScenario');
  },
  addCustomVar({commit}, customVar){
    commit('addCustomVar', customVar);
    commit('saveScenario');
  },
  updateCustomVar({commit}, customVar){
    commit('addCustomVar', customVar);
    commit('saveScenario');
  },
  addCustomAction({commit}, customAction){
    commit('addCustomAction', customAction);
    commit('saveScenario');
  },
  updateCustomAction({commit}, customAction){
    commit('addCustomAction', customAction);
    commit('saveScenario');
  }
};

/*
export default {state, mutations, actions};
*/