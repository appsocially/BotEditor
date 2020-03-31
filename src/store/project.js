import db from "@/components/firebaseInit"

export const state = () => ({
  project: null
})

export const mutations = {
  replaceProject(state, value) {
    state.project = value
  },
  activateBot(state) {
    state.project.isAddedToTeamAsBot = true
  },
  updateEditTime(state, id) {
    var now = new Date()
    db.collection("projects")
      .doc(id)
      .update({editedAt: now})
    state.project.editedAt = now
  },
  updateSettings(state, settings) {
    state.project.title = settings.title
    state.project.discription = settings.discription
    state.project.themeColor = settings.themeColor
    state.project.botIcon = settings.botIcon
    state.project.pulishedAsFormat = settings.pulishedAsFormat
  }
}

export const actions = {
  async loadProject({ commit }, id) {
    return new Promise(async resolve => {
      // commit('loadProject', id)
      var project = await db.collection("projects")
        .doc(id)
        .get()
        .then(function(doc) {
          var data = doc.data()
          data.id = doc.id
          return data
        })
      commit('replaceProject', project)
      resolve(project)
    })
  },
  async getProject({ commit }, id) {
    return new Promise(async resolve => {
      // commit('loadProject', id)
      var project = await db.collection("projects")
        .doc(id)
        .get()
        .then(function(doc) {
          var data = doc.data()
          data.id = doc.id
          return data
        })
      resolve(project)
    })
  },
  replaceProject({ commit }, project) {
    commit('replaceProject', project)
  },
  updateEditTime({ commit }, id) {
    commit('updateEditTime', id)
  },
  updateSettings({ commit }, data) {
    db.collection("projects")
      .doc(data.id)
      .update({
        title: data.settings.title,
        discription: data.settings.discription,
        botIcon: data.settings.botIcon,
        themeColor: data.settings.themeColor,
        publishedAsFormat: data.settings.pulishedAsFormat
      })
    commit('updateSettings', data.settings)
  },
  async copyProject({ commit }, data) {
    return new Promise(async resolve => {
      var baseProjectId = data.project.id
      var projectObj = {
        title: `Imported:${data.project.title}`,
        discription: data.project.discription,
        botIcon: data.project.botIcon,
        userName: data.userDisplayName,
        author: data.uid,
        originalAuthor: data.project.author,
        originalProjectId: baseProjectId,
        nodeNum: data.project.nodeNum,
        createdAt: new Date(),
        editedAt: new Date(),
        publishedAsFormat: false
      }
      
      var copiedProject = await db.collection("projects").add(projectObj).then((d) => { return d } )

      var newScenario = data.scenario.map(node => {
        var myNode = node
        myNode.author = data.uid
        return myNode
      })

      const promises = newScenario.map(node => {
        return db.collection("projects")
          .doc(copiedProject.id)
          .collection("scenario")
          .doc(node.id)
          .set(node)
      })
      await Promise.all(promises)

      resolve(copiedProject.id)
    })
  },
  async deleteProject({ commit }, id) {
    var nodeIds = await db.collection("projects").doc(id).collection("scenario").get().then((d) => {
      return d.docs.map((doc) => {
        return doc.id
      })
    })
    for(var i=0; i<nodeIds.length; i++){
      db.collection("projects").doc(id).collection("scenario").doc(nodeIds[i]).delete()
    }
    await db.collection("projects").doc(id).delete()
  },
  async addBotToTeam ({state, commit}, data) {
    var botObj = {
      author: data.uid,
      team: [data.teamId],
      type: 'bot',
      projectId: state.project.id,
      isAnonymous: false
    }
    await db.collection("users").doc(state.project.id).set(botObj)
    db.collection("projects").doc(state.project.id).update({ isAddedToTeamAsBot: true })
    commit("activateBot")

    if (data.setPrimaryByThisBot) {
      db.collection("teams").doc(data.teamId).update({ primary: state.project.id })
    }
  }
}

export const getters = {
  getFunction() {
    console.log("getter test")
  }
}