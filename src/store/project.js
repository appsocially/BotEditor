import db from "@/components/firebaseInit"

export const state = () => ({
  project: null
})

export const mutations = {
  replaceProject(state, value) {
    state.project = value
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
    state.project.botIcon = settings.botIcon
    state.project.pulishedAsFormat = settings.pulishedAsFormat
  }
}

export const actions = {
  async loadProject({commit}, id) {
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
  replaceProject({commit}, project) {
    commit('replaceProject', project)
  },
  updateEditTime({commit}, id) {
    commit('updateEditTime', id)
  },
  updateSettings({commit}, data) {
    db.collection("projects")
      .doc(data.id)
      .update({
        title: data.settings.title,
        discription: data.settings.discription,
        botIcon: data.settings.botIcon,
        pulishedAsFormat: data.settings.pulishedAsFormat
      })
    commit('updateSettings', data.settings)
  },
  async copyProject({commit}, data) {
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
  }
}

export const getters = {
  getFunction() {
    console.log("getter test")   
  }
}