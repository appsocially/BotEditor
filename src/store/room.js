import db from '@/components/firebaseInit'
import { COLLECTIONS_ENUM } from '@/enums'
import { api } from "@/components/firebaseInit"

export const state = () => ({
  room: null,
  assignedUser: null,
  roomUsers: null,
  messages: null,
  roomsInTeam: null,
  customVarsInRoom: null
})

export const mutations = {
  replaceRoom (state, room) {
    state.room = room
  },
  replaceMessages (state, messages) {
    state.messages = messages
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
        assignedUid: data.assignedUid
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
  async setRoom ({ commit }, data) {
    return new Promise(async resolve => {
      var room = await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
        .doc(data.anonymousUid)
        .get()
        .then((d) => {
          var room = d.data()
          room.id = d.id
          return room
        })
      commit('replaceRoom', room)
      resolve(room)
    })
  },
  async handleMessages ({ commit }, data) {
    return new Promise(async resolve => {
      await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
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
  async addMessage ({ commit }, data) {
    return new Promise(async resolve => {
      var messageObj = {
        text: data.text,
        createdAt: new Date(),
        createdBy: data.uid,
        type: 'normal',
        teamId: data.teamId
      }
      await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.messages)
        .add(messageObj)
      resolve(messageObj)
    })
  },
  async setCustomVar ({ commit }, data) {
    return new Promise(async resolve => {
      var customVarObj = {
        location: data.location,
        varType: data.varType,
        value: data.value,
        createdAt: new Date(),
        createdBy: data.uid,
        teamId: data.teamId
      }
      await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
        .doc(data.roomId)
        .collection(COLLECTIONS_ENUM.customVars)
        .doc(data.location)
        .set(customVarObj)
      resolve(customVarObj)
    })
  },
  async loadCustomVarsInRoom ({ commit }, data) {
    return new Promise(async resolve => {
      var customVars = await db.collection(COLLECTIONS_ENUM.teams)
        .doc(data.teamId)
        .collection(COLLECTIONS_ENUM.rooms)
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
          // const api = 'https://us-central1-bot-editor-prod.cloudfunctions.net'
          const response = await fetch(`${api}/getProject`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              'scenarioId': users[i].projectId // state.team.primary
            })
          })
          var projectResult = await response.json()
          users[i].iconURL = projectResult.project.botIcon
          users[i].name = projectResult.project.title
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
    return state.roomUsers.filter((user) => { return (user.uid === uid) })[0]
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
