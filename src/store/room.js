import db from '@/components/firebaseInit'
import { COLLECTIONS_ENUM } from '@/enums'
import { api } from "@/components/firebaseInit"

export const state = () => ({
  room: null,
  assignedUser: null,
  roomUsers: null,
  messages: null,
  roomsInTeam: null,
  customVarsInRoom: null,
  botUserForPreview: null,
  humanUserForPreview: null
})

export const mutations = {
  replaceRoom (state, room) {
    state.room = room
  },
  replaceMessages (state, messages) {
    state.messages = messages
  },
  resetMessages (state) {
    state.messages = []
  },
  pushMessages (state, message) {
    state.messages.push(message)
  },
  replaceAssignedUser (state, assignedUser) {
    state.assignedUser = assignedUser
  },
  replaceCurrentScenario (state, scenario) {
    state.currentScenario = scenario
  },
  replaceRoomUsers (state, roomUsers) {
    state.roomUsers = roomUsers
  },
  replaceRoomsInTeam (state, roomsInTeam) {
    state.roomsInTeam = roomsInTeam
  },
  replaceCustomVarsInRoom (state, customVarsInRoom) {
    state.customVarsInRoom = customVarsInRoom
  },
  replaceBotUserForPreview (state, botUserForPreview) {
    state.botUserForPreview = botUserForPreview
  },
  replaceHumanUserForPreview (state, humanUserForPreview) {
    state.humanUserForPreview = humanUserForPreview
  }
}

export const actions = {
  async createRoom ({ commit }, data) {
    return new Promise(async resolve => {
      // await commit('createRoom', data)
      var roomObj = {
        teamId: data.teamId,
        createdBy: data.anonymousUid,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedUid: data.assignedUid,
        isRead: false
      }
      
      await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
        .doc(data.anonymousUid)
        .set(roomObj)
      
      roomObj.id = data.anonymousUid
      commit('replaceRoom', roomObj)
      resolve(roomObj)
    })
  },
  async setRoom ({ dispatch, commit }, data) {
    return new Promise(async resolve => {

      var roomDoc = await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
        .doc(data.anonymousUid)
        .get()
      
      var room
      
      if (roomDoc.exists) {
        room = roomDoc.data()
        room.id = roomDoc.id
        commit('replaceRoom', room)
        resolve(room)
      } else {
        dispatch('createRoom', {
          anonymousUid: data.anonymousUid,
          teamId: data.teamId,
          assignedUid: data.primary
        })
        resolve("No Room")
      }

    })
  },
  async handleMessages ({ commit }, data) {
    return new Promise(async resolve => {
      commit('resetMessages')

      var docRef
      if (data.isPreviewMode) {
        docRef = db.collection(COLLECTIONS_ENUM.teams)
          .doc(data.teamId)
          .collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = db.collection(COLLECTIONS_ENUM.teams)
          .doc(data.teamId)
          .collection(COLLECTIONS_ENUM.rooms)
      }

      await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.messages)
        .orderBy('createdAt', 'asc')
        .onSnapshot((q) => {
          var messages = q.docs.map(d => {
            var message = d.data()
            message.id = d.id
            return message
          })
          commit('replaceMessages', messages)
          resolve(messages)
        })
    })
  },
  resetMessages ({ commit }) {
    commit('resetMessages')
  },
  async addMessage ({ commit }, data) {
    return new Promise(async resolve => {
      var docRef
      if (data.isPreviewMode) {
        docRef = db.collection(COLLECTIONS_ENUM.teams)
          .doc(data.teamId)
          .collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = db.collection(COLLECTIONS_ENUM.teams)
          .doc(data.teamId)
          .collection(COLLECTIONS_ENUM.rooms)
      }

      var messageObj = {
        text: data.text,
        createdAt: new Date(),
        createdBy: data.uid,
        type: 'normal',
        teamId: data.teamId
      }
      await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.messages)
        .add(messageObj)
      resolve(messageObj)
    })
  },
  async setCustomVar ({ commit }, data) {
    return new Promise(async resolve => {
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
      if (data.isPreviewMode) {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      }

      var customVarObj = {
        location: data.location,
        varType: data.varType,
        value: data.value,
        createdAt: new Date(),
        createdBy: data.uid,
        teamId: data.teamId
      }
      await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .doc(data.location)
        .set(customVarObj)
      
      resolve(customVarObj)
    })
  },
  
  async loadCustomVarsInRoom ({ commit }, data) {
    return new Promise(async resolve => {
      var docRef = db.collection(COLLECTIONS_ENUM.teams).doc(data.teamId)
      if (data.isPreviewMode) {
        docRef = docRef.collection(COLLECTIONS_ENUM.previewRooms)
      } else {
        docRef = docRef.collection(COLLECTIONS_ENUM.rooms)
      }
      
      var customVars = await docRef
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            return d.data()
          })
        })
      commit('replaceCustomVarsInRoom', customVars)
      resolve(customVars)
    })
  },
  async loadAssignedUser ({ commit }, uid) {
    return new Promise(async resolve => {
      var user = await db.collection(COLLECTIONS_ENUM.users).doc(uid).get()
        .then((d) => {
          var user = d.data()
          user.uid = d.id
          return user
        })
      commit('replaceAssignedUser', user)
      resolve(user)
    })
  },
  async loadRoomUsers ({ commit }, data) {
    return new Promise(async resolve => {
      var users = await db.collection(COLLECTIONS_ENUM.users)
        .where('team', 'array-contains', data.teamId)
        .where('isAnonymous', '==', false)
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var user = d.data()
            user.uid = d.id
            return user
          })
        })
      
      // setIconURL of Bot User
      // (MEMO) use promise all
      for (var i = 0; i < users.length; i++) {
        if (users[i].type === 'bot') {
          var project = await db.collection("projects")
            .doc(users[i].projectId)
            .get()
            .then((d) => { return d.data() })
          
          users[i].iconURL = project.botIcon
          users[i].name = project.title
        }
      }
      
      var guestUser = await db.collection(COLLECTIONS_ENUM.users)
        .where('room', 'array-contains', data.roomId)
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var user = d.data()
            user.uid = d.id
            return user
          })[0]
        })
      
      commit('replaceRoomUsers', users.concat(guestUser))
      resolve(users.concat(guestUser))

      // var anonymousUser = await db.collection('users')
      //   .where('room', 'array-contains', data.roomId)
      //   .where('isAnonymous', '==', true)
      //   .get()
      //   .then((q) => {
      //     return q.docs.map((d) => {
      //       var user = d.data()
      //       user.uid = d.id
      //       return user
      //     })[0]
      //   })

      // commit('replaceRoomUsers', users.concat(anonymousUser))
      // resolve(users.concat(anonymousUser))
    })
  },
  async loadRoomsInTeam ({ commit }, teamId) {
    return new Promise(async resolve => {
      var rooms = await db.collection(COLLECTIONS_ENUM.teams).doc(teamId)
        .collection('rooms')
        .orderBy('createdAt', 'asc')
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var room = d.data()
            room.id = d.id
            return room
          })
        })
      commit('replaceRoomsInTeam', rooms)
      resolve(rooms)
    })
  },
  getRoomUserById ({ state }, uid) {
    if (state.roomUsers) {
      return state.roomUsers.filter((user) => { return (user.uid === uid) })[0]
    } else {
      return false
    }
  },
  loadBotUserForPreview ({ commit }, data) {
    return new Promise(async resolve => {
      var project = await await db.collection("projects")
        .doc(data.projectId)
        .get()
        .then((d) => { return d.data() })
      
      var user = {
        type: "bot",
        projectId: data.projectId,
        isAnonymous: false,
        team: [data.teamId]
      }
      user.iconURL = project.botIcon
      user.name = project.title

      commit('replaceBotUserForPreview', user)
      
      resolve(user)
    })
  },
  loadHumanUserForPreview ({ commit }, uid) {
    return new Promise(async resolve => {
      var user = await db.collection("users")
        .doc(uid)
        .get()
        .then((d) => {
          var user = d.data()
          user.uid = d.id
          return user
        })
      commit('replaceHumanUserForPreview', user)
      
      resolve(user)
    })
  },
  setHumanUserForPreview ({ commit }, uid) {
    var user = {
      name: "Guest",
      uid: uid,
      isAnonymous: true,
      profile: "No Profile",
      type: "human",
      iconURL: "https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fuser-default.png?alt=media&token=5d9ac3a4-6849-4f60-a182-1d6df8d340ba"
    }
    commit('replaceHumanUserForPreview', user)
  }
}

export const getters = {
  getFunction () {
    console.log('getter test')
  },
  getTest: (state) => (id) => {
    return state.test
  }
}
