import db from '@/components/firebaseInit'
import { COLLECTIONS_ENUM } from '@/enums'
import { api } from "@/components/firebaseInit"

export const state = () => ({
  messages: null,
  currentEvent: null,
  currentNode: null,
  handledCuntumVariable: null,
  customVars: null
})

export const mutations = {
  replaceCurrentScenario (state, scenario) {
    state.currentScenario = scenario
  },
  replaceCurrentEvent (state, event) {
    state.currentEvent = event
  },
  replaceCurrentNode (state, node) {
    state.currentNode = node
  },
  replaceHandledCustomVariable (state, handledCuntumVariable) {
    state.handledCuntumVariable = handledCuntumVariable
  },
  clearHandledCustomVariable (state) {
    state.handledCuntumVariable = null
  },
  replaceCustomVars (state, customVars) {
    state.customVars = customVars
  },
  setCustomVar (state, customVar) {
    var cvInStore = state.customVars.filter(e => { return e.location === customVar.location })[0]

    if (!cvInStore) {
      customVar.id = customVar.location
      state.customVars.push(customVar)
    } else {
      state.customVars = state.customVars.map((e) => {
        if (e.location === customVar.location) e.value = customVar.value
        return e
      })
    }
  }
}

export const actions = {
  async loadScenarioOf ({ commit }, projectId) {
    return new Promise(async resolve => {
      var scenario = await db.collection("projects")
        .doc(projectId)
        .collection("scenario")
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var scenario = d.data()
            scenario.id = d.id
            return scenario
          })
        })
      commit('replaceCurrentScenario', scenario)
      resolve(scenario)
    })
  },
  setScenarioForPreview ({ commit }, scenario) {
    commit('replaceCurrentScenario', scenario)
  },
  getFirstEventOf ({ commit, getters }, scenario) {
    var startPointNode = scenario.filter((e) => { return (e.eventType === 'open_chat') })[0]
    // var firstEvent = startPointNode.conditions.filter((e) => { return (e.type === 'else') })[0]
    return startPointNode.id
  },
  async onEvent ({ dispatch, commit, state }, data) {
    var getNodeById = (scenario, nodeId) => {
      return scenario.filter((e) => { return (e.id === nodeId) })[0]
    }

    var topNode = getNodeById(state.currentScenario, data.nodeId)

    if (!topNode) return false

    commit('replaceCurrentEvent', topNode.id)
    commit('replaceCurrentNode', topNode)

    var sleep = msec => new Promise(resolve => setTimeout(resolve, msec))
    
    while (true) {
      var node = getNodeById(state.currentScenario, state.currentEvent)
      var messageObj = {
        createdAt: new Date(),
        createdBy: data.uid,
        type: node.type,
        teamId: data.teamId,
        nodeId: node.id
      }
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms).doc(data.roomId)
        .collection(COLLECTIONS_ENUM.messages)

      if (data.isPreviewMode) {
        docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
          .collection(COLLECTIONS_ENUM.previewRooms).doc(data.roomId)
          .collection(COLLECTIONS_ENUM.messages)
      }

      switch (node.type) {
        case 'normal':
          messageObj.text = node.text
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'selection':
          if (node.customVariable) {
            var customVariable = node.customVariable
            customVariable.handleType = 'selection'
            commit('replaceHandledCustomVariable', customVariable)
          }

          messageObj.text = node.text
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'multipleselection':
          if (node.customVariable) {
            var customVariable = node.customVariable
            customVariable.handleType = 'multipleselection'
            commit('replaceHandledCustomVariable', customVariable)
          }

          messageObj.text = node.text
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'openquestion':
          if (node.customVariable) {
            var customVariable = node.customVariable
            customVariable.handleType = 'openquestion'
            commit('replaceHandledCustomVariable', customVariable)
          }

          messageObj.text = node.text
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'ask_email':
          if (node.customVariable) {
            var customVariable = node.customVariable
            customVariable.handleType = 'ask_email'
            commit('replaceHandledCustomVariable', customVariable)
          }

          messageObj.text = node.text
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'media':
          messageObj.mediaType = node.mediaType
          messageObj.mediaURI = node.mediaURI
          await sleep(1200)
          await docRef.add(messageObj)
          break

        case 'goto':
          dispatch('onEvent', {
            nodeId: node.toId,
            uid: data.uid,
            teamId: data.teamId,
            roomId: data.roomId
          })
          break
      }

      // getMatchedCondition is duplicated in actions.
      // so I have to learn how to access outer getMatchedCondition.
      var getMatchedCondition = (conditions) => {
        if (!conditions) return false
        var matchedCondition
        var elseCondition = conditions.filter((e) => { return (e.type === 'else') })[0]
        matchedCondition = elseCondition
        return matchedCondition
      }

      if (node.type === 'selection' ||
          node.type === 'multipleselection' ||
          node.type === 'openquestion' ||
          node.type === 'ask_email' ||
          node.type === 'goto') break

      var next = getMatchedCondition(node.conditions).next
      if (!next) break

      var nextNode = getNodeById(state.currentScenario, next)

      if (!nextNode) {
        break
      } else {
        commit('replaceCurrentEvent', nextNode.id)
        commit('replaceCurrentNode', nextNode)
      }
    } // while
  },
  getPlaceholderTextOf ({ state }, eventId) {
    var node = state.currentScenario.filter((e) => { return (e.id === eventId) })[0]
    return (node.expectedAnswer) ? node.expectedAnswer : 'Type text here.'
  },
  getSelectionsOf ({ state }, eventId) {
    var node = state.currentScenario.filter((e) => { return (e.id === eventId) })[0]
    return (node.selections) ? node.selections : []
  },
  getNodeConditions ({ state }, eventId) {
    var node = state.currentScenario.filter((e) => { return (e.id === eventId) })[0]
    if (node.type === 'normal' ||
      node.type === 'openquestion' ||
      node.type === 'ask_email' ||
      node.type === 'ask_phone_number' ||
      node.type === 'media' ||
      node.type === 'point') {
      return (node.conditions) ? node.conditions : null
    } else if (node.type === 'goto') {
      if (node.toId) return { next: node.toId, type: 'else', id: `else-${node.type}-${node.id}` }
      return null
    } else {
      // if selection
    }
  },
  getNextEventByConditions ({ state }, conditions) {
    var getMatchedCondition = (conditions) => {
      if (!conditions) return false
      var matchedCondition
      var elseCondition = conditions.filter((e) => { return (e.type === 'else') })[0]
      matchedCondition = elseCondition
      return matchedCondition
    }
    return getMatchedCondition(conditions).next
  },
  getCustomVarInNode ({ state }, nodeId) {
    var node = state.currentScenario.filter((e) => { return (e.id === nodeId) })[0]
    return (node.customVariable) ? node.customVariable : false
  },
  async loadCustomVars ({ commit }, data) {
    return new Promise(async resolve => {
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
      if (data.isPreviewMode) {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = docRef.collection(COLLECTIONS_ENUM.rooms)
      }
      var vars = await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var varObj = d.data()
            varObj.id = d.id
            return varObj
          })
        })
      commit('replaceCustomVars', vars)
      resolve(vars)
    })
  },
  async setCustomVar ({ state, commit }, data) {
    return new Promise(async resolve => {
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
      if (data.isPreviewMode) {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = docRef.collection(COLLECTIONS_ENUM.rooms)
      }
      
      var customVariableObj = data.customVariable
      customVariableObj.createdBy = data.uid
      customVariableObj.createdAt = new Date()
      customVariableObj.value = data.value
      await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .doc(data.customVariable.location)
        .set(customVariableObj)
      commit('setCustomVar', customVariableObj)
      commit('clearHandledCustomVariable')
      resolve(data)
    })
  },
  async deleteCustomVar ({ state, commit }, data) {
    return new Promise(async resolve => {
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
      if (data.isPreviewMode) {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      }

      await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .doc(data.customVariable.location)
        .delete()

      resolve(data)
    })
  },
  async deleteMessagesForPreview ({ state, commit }, data) {
    return new Promise(async resolve => {
      var messagesCollectionRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
        .collection(COLLECTIONS_ENUM.previewRooms).doc(data.roomId)
        .collection(COLLECTIONS_ENUM.messages)
      
      var promises = data.messages.map((message) => {
        return messagesCollectionRef.doc(message.id).delete()
      })
      
      await Promise.all(promises)
      
      resolve(true)
    })
  }
}

export const getters = {
  getFunction () {
    // console.log('getter test')
  },
  getTest: (state) => (id) => {
    return state.test
  }
}
