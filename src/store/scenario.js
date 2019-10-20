import db from "@/components/firebaseInit"
import entity from "@/components/entity"

export const state = () => ({
  scenarioArray: [],
  scenarioHistory: [],
  customVars: []
});

export const mutations = {
  replaceScenario(state, value) {
    state.scenarioArray = value
  },
  addNodeToScenario(state, value) {
    state.scenarioArray.push(value)
    window.scenarioArray = state.scenarioArray
  },
  updateCondition(state, value) {

    var getNewConditions = function(node, value) {
      if(node.conditions){
        var newConditions = node.conditions
        // 同じコンディションがすでに含まれているか
        var hasSameCondition = newConditions.filter((e) => { 
          return (e.type === value.condition && e.type !== "default")
        })[0]
        if(hasSameCondition){
          newConditions = newConditions.map((e) => {
            if(e.type === value.condition){
              var newCondition = {type: e.type, next: value.toId, id: value.id}
              return newCondition
            } else {
              return e
            }
          }) // map(e)
        // 同じコンディションがすでに含まれていなければ新しいコンディションとして足す
        } else { 
          newConditions.push({type: value.condition, next: value.toId, id: value.id})
        }

      } else {
        newConditions = [{next: value.toId, type: "else", id: value.id}]
      }

      return newConditions
    }


    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType==='single' || state.scenarioArray[i].nodeType==='point'){
        if(state.scenarioArray[i].id===value.fromId){
          // state.scenarioArray[i].next = value.toId;
          state.scenarioArray[i].conditions = getNewConditions(state.scenarioArray[i], value)
          return
        }

      } else if (state.scenarioArray[i].nodeType==='group'){
        
        var selections = state.scenarioArray[i].selections;
        for(var j=0; j<selections.length; j++){
          if(selections[j].id===value.fromId){
            // selections[j].next = value.toId;
            state.scenarioArray[i].selections[j].conditions = getNewConditions(selections[j], value)
            return
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
      })
  },
  deleteOneSelection(state, id) {
    var nodeId = id.split("-")[0]
    for(var i=0; i < state.scenarioArray.length; i++) {
      if(state.scenarioArray[i].id === nodeId) {
        state.scenarioArray[i].selections = state.scenarioArray[i].selections.filter((s) => {
          return (s.id !== id)
        })
      }
    }
  },
  updateNode(state, value) {
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].id == value.id){
        state.scenarioArray[i] = value;
      }
    }
  },
  async disconnectNode(state, value){
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single' || state.scenarioArray[i].nodeType=='point'){
        // if(state.scenarioArray[i].next==value){
        //   delete state.scenarioArray[i].next
        // } 
        if(state.scenarioArray[i].conditions){
          state.scenarioArray[i].conditions = state.scenarioArray[i].conditions.filter((e) => {
            return (e.next !== value)
          })
          if(!state.scenarioArray[i].conditions[0]) {
            delete state.scenarioArray[i].conditions

            var projectId = location.pathname.split('/')[2]
            await db.collection("projects")
              .doc(projectId)
              .collection("scenario")
              .doc(state.scenarioArray[i].id)
              .set(state.scenarioArray[i])
          }
        }

      } else if (state.scenarioArray[i].nodeType=='group'){

        var selections = state.scenarioArray[i].selections
        for(var j=0; j<selections.length; j++){
          // if(selections[j].next==value){
          //   delete selections[j].next
          // }
          if(selections[j].conditions){
            state.scenarioArray[i].selections[j].conditions = selections[j].conditions.filter((e) => {
              return (e.next !== value)
            })
            if(!state.scenarioArray[i].selections[j].conditions[0]){
              delete state.scenarioArray[i].selections[j].conditions

              var projectId = location.pathname.split('/')[2]
              await db.collection("projects")
                .doc(projectId)
                .collection("scenario")
                .doc(state.scenarioArray[i].id)
                .set(state.scenarioArray[i])
            }
          }
        }

      }
    }
  },
  addHistory(state, value){
    if(state.scenarioArray.length == 0) return;
    if(state.scenarioHistory.length > 10) state.scenarioHistory.shift();

    var scenario = state.scenarioArray.map(function(e){
      return e
    })
    state.scenarioHistory.push(scenario)
    //console.log('scenarioHistory:', state.scenarioHistory)
  },
  async saveScenario(state, value){
    
    var projectId = location.pathname.split('/')[2]
    const scenarioArray = await db.collection("projects")
      .doc(projectId)
      .collection('scenario')
      .get()
      .then(function(doc) {
        return doc.docs.map(function(doc){
          return doc.data()
        })
      })

    var dbScenario = scenarioArray

    var clientScenario = state.scenarioArray

    for(var i=0; i<clientScenario.length; i++){
      var clientContent = clientScenario[i]
      var dbContent = entity.getContent(dbScenario, clientContent.id)
      //var clientContent = entity.getContent(clientScenario, dbContent.id)

      if(clientContent==undefined || dbContent==undefined) break

      // dbに無い場合
      if(dbContent==false){
        db.collection("projects")
          .doc(projectId)
          .collection("scenario")
          .doc(clientContent.id)
          .set(clientContent)
          .then(function(e){
            // console.log('added new content')
          })
      
      // dbとコンテンツが違う場合
      } else if(JSON.stringify(dbContent) != JSON.stringify(clientContent)){
        db.collection("projects")
          .doc(projectId)
          .collection("scenario")
          .doc(clientContent.id)
          .update(clientContent)
          .then(function(e){
            // console.log('updated content')
          })

      // dbにコンテンツがあってクライアントにない場合
      }
      // delete処理ができてない
      
    }

    db.collection("projects")
      .doc(projectId)
      .update({nodeNum: window.project.nodeNum})

    console.log("saved")

  },
  setCustomVar(state, value){
    
    var content = entity.getContent(scenarioArray, value.nodeId)
    // content.customVariable.location = value.location
    // content.customVariable.varType = value.varType
    content.customVariable = {
      location: value.location,
      varType: value.varType
    }

    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].id === value.nodeId){
        state.scenarioArray[i] = content
      }
    }

  },
  updateCustomVar(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId)
    content.customVariable.location = value.location
    content.customVariable.varType = value.varType
  },
  loadAllCustomVars(state){
    var nodesWithCustomVars = state.scenarioArray.filter((e) => {
      return (e.customVariable)
    })
    
    state.customVars = nodesWithCustomVars.map((e) => {
      var varObj = {
        nodeId: e.id,
        varType: e.customVariable.varType,
        location: e.customVariable.location,
        value: null
      }
      return varObj
    })
    // return state.customVars
  },
  insertValueIntoCustomVar(state, value){
    return state.customVars = state.customVars.map((e) => {
      var customVar = e
      if(e.location === value.id) customVar.value = value.value
      return customVar
    })
  },
  setCustomAction(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customAction = value.customAction    
  },
  updateCustomAction(state, value){
    var content = entity.getContent(scenarioArray, value.nodeId);
    content.customAction = value.customAction
  },
  updateEdgeCondition(state, value){
    var content = entity.getContentByConditionId(scenarioArray, value.id)
    
    content.conditions = content.conditions.map((e) => {
      if(e.id === value.id) {
        var condition = e
        condition.id = value.new_condition_id
        condition.type = value.new_condition_id.split("-")[0]
        delete condition.option
        return e
      } else {
        return e
      }
    })
  },
  async removeEdgeCondition(state, id){
    for(var i=0; i<state.scenarioArray.length; i++){
      if(state.scenarioArray[i].nodeType=='single' || state.scenarioArray[i].nodeType=='point'){
        if(state.scenarioArray[i].conditions){
          state.scenarioArray[i].conditions = state.scenarioArray[i].conditions.filter((e) => {
            return (e.id !== id)
          })
          if(!state.scenarioArray[i].conditions[0]){
            delete state.scenarioArray[i].conditions

            var projectId = location.pathname.split('/')[2]
            await db.collection("projects")
              .doc(projectId)
              .collection("scenario")
              .doc(state.scenarioArray[i].id)
              .set(state.scenarioArray[i])
          }
        }
      } else if (state.scenarioArray[i].nodeType=='group'){
        var selections = state.scenarioArray[i].selections
        for(var j=0; j<selections.length; j++){
          if(selections[j].conditions){
            state.scenarioArray[i].selections[j].conditions = selections[j].conditions.filter((e) => {
              return (e.id !== id)
            })
            if(!state.scenarioArray[i].selections[j].conditions[0]){
              delete state.scenarioArray[i].selections[j].conditions

              var projectId = location.pathname.split('/')[2]
              await db.collection("projects")
                .doc(projectId)
                .collection("scenario")
                .doc(state.scenarioArray[i].id)
                .set(state.scenarioArray[i])
            }
          }
        }
      }
    }
  },
  setConditionOption(state, value){
    var content = entity.getConditionByConditionId(scenarioArray, value.conditionId)
    content.option = value.option
  }
};

export const actions = {
  async loadScenarioByProjectId({commit}, projectId) {
    // commit('addHistory')
    return new Promise(async resolve => {
      const scenarioArray = await db.collection("projects")
        .doc(projectId)
        .collection('scenario')
        .get()
        .then(function(doc) {
          return doc.docs.map(function(doc){
            return doc.data()
          })
        })
      commit('replaceScenario', scenarioArray)
      resolve(scenarioArray)
    })
  },
  resetScenario({commit}){
    commit('replaceScenario', [])
  },
  async pushContentToScenario({commit}, content){
    commit('addNodeToScenario', content)
    commit('saveScenario')
    commit('addHistory')
  },
  async deleteNode({commit}, id){
    commit('deleteNode', id)
    commit('addHistory')
  },
  deleteOneSelection({commit}, id){
    commit('deleteOneSelection', id)
    commit('saveScenario')
  },
  async updateNode({commit}, content){
    commit('updateNode', content)
    commit('saveScenario')
    commit('addHistory')
  },
  connectNode({commit}, id_from_to){
    commit('updateCondition', id_from_to)
    commit('saveScenario')
  },
  disconnectNode({commit}, id){
    commit('disconnectNode', id)
    commit('saveScenario')
  },
  addCustomVar({commit}, customVar){
    commit('setCustomVar', customVar)
    commit('loadAllCustomVars')
    commit('saveScenario')
  },
  updateCustomVar({commit}, customVar){
    commit('setCustomVar', customVar)
    commit('loadAllCustomVars')
    commit('saveScenario')
  },
  insertValueIntoCustomVar({commit}, value){
    commit('insertValueIntoCustomVar', value)
  },
  setConditionOption({commit}, option){
    commit('setConditionOption', option)
    commit('saveScenario')
  },
  addCustomAction({commit}, customAction){
    commit('setCustomAction', customAction)
    commit('saveScenario')
  },
  updateCustomAction({commit}, customAction){
    commit('setCustomAction', customAction)
    commit('saveScenario')
  },
  loadAllCustomVars({commit}){
    commit('loadAllCustomVars')
  },
  updateEdgeCondition({commit}, new_condition_id){
    commit('updateEdgeCondition', new_condition_id)
    commit('saveScenario')
  },
  removeEdgeCondition({commit}, id){
    commit('removeEdgeCondition', id)
    commit('saveScenario')
  }
};

export const getters = {
  getCustomVars() {
    console.log("state.customVars", state.customVars)
    return state.customVars
  }
}
/*
export default {state, mutations, actions};
*/