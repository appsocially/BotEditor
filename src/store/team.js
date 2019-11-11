import db from '@/components/firebaseInit'
import { COLLECTIONS_ENUM } from '@/enums'

export const state = () => ({
  team: null,
  memberUsers: null,
  primaryUser: null,
  guestUsers: null
})

export const mutations = {
  replaceTeam (state, team) {
    state.team = team
  },
  replaceMemberUsers (state, memberUsers) {
    state.memberUsers = memberUsers
  },
  replaceGuestUsers (state, guestUsers) {
    state.guestUsers = guestUsers
  },
  async loadCurrentTeam (state, uid) {
    var currentTeamId = await db.collection(COLLECTIONS_ENUM.users).doc(uid).get()
      .then((d) => {
        return d.data().currentTeam
      })
    state.team = await db.collection(COLLECTIONS_ENUM.teams).doc(currentTeamId).get()
      .then((d) => {
        var team = d.data()
        team.id = d.id
        return team
      })
    state.memberUsers = await db.collection(COLLECTIONS_ENUM.users)
      .where('team', 'array-contains', currentTeamId)
      .get()
      .then((d) => {
        return d.docs.map((e) => {
          var user = e.data()
          user.uid = e.id
          return user
        })
      })
    var primaryMember = state.memberUsers.filter((e) => { return (e.uid === state.team.primary) })[0]

    if (primaryMember.type === 'bot') {
      const api = 'https://us-central1-bot-editor-prod.cloudfunctions.net'
      const response = await fetch(`${api}/getProject`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'scenarioId': primaryMember.projectId // state.team.primary
        })
      })
      var projectResult = await response.json()
      var project = projectResult.project

      state.primaryUser = {
        author: primaryMember.uid,
        team: primaryMember.team,
        type: primaryMember.type,
        name: project.title,
        profile: project.discription,
        iconURL: project.botIcon
      }
    } else {
      state.primaryMember = primaryMember
    }
  }
}

export const actions = {
  // set team by teamId
  async setTeam ({ state, commit }, teamId) {
    return new Promise(async resolve => {
      var team = await db.collection(COLLECTIONS_ENUM.teams).doc(teamId).get()
        .then((d) => {
          var team = d.data()
          team.id = d.id
          return team
        })
      commit('replaceTeam', team)
      resolve(team)
    })
  },
  // load team data, team member, and primary user in the team by operator's uid.
  loadCurrentTeam ({ commit }, uid) {
    commit('loadCurrentTeam', uid)
  },
  async loadMemberUsers ({ state, commit }, teamId) {
    return new Promise(async resolve => {
      var memberUsers = await db.collection(COLLECTIONS_ENUM.users)
        .where('team', 'array-contains', teamId)
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var user = d.data()
            user.id = d.id
            return user
          })
        })
      commit('replaceMemberUsers', memberUsers)
      resolve(memberUsers)
    })
  },
  async loadGuestUsers ({ state, commit }, teamId) {
    return new Promise(async resolve => {
      var customerUsers = await db.collection(COLLECTIONS_ENUM.users)
        .where('teamAsGuest', 'array-contains', teamId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((q) => {
          return q.docs.map((d) => {
            var user = d.data()
            user.uid = d.id
            return user
          })
        })
      commit('replaceGuestUsers', customerUsers)
      resolve(customerUsers)
    })
  },
  async getUserByUid ({ state, commit }, uid) {
    return new Promise(async resolve => {
      var user = await db.collection(COLLECTIONS_ENUM.users)
        .doc(uid)
        .get()
        .then((d) => {
          var user = d.data()
          user.uid = d.id
          return user
        })
      resolve(user)
    })
  }
}

export const getters = {
  getFunction () {
    console.log('getter test')
  }
}
