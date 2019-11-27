import db, { firebase, api } from '@/components/firebaseInit'
import { COLLECTIONS_ENUM } from '@/enums'
// import firestore from '@/components/firebaseInit'
// import { firestore } from '@/components/firebaseInit'

export const state = () => ({
  userDisplayName: null,
  isAuthenticating: true,
  isLoggedIn: false,
  isSigningOut: false,
  uid: null,
  onboardingData: null,
  subscriptionEnder: null,
  loadedUserData: false,
  roles: [],
  isAnonymous: null,
  teamsThatUserBelongs: null,
  teamAsGuest: null,
  currentTeam: null,
  plan: null
})

export const mutations = {
  updateUid(state, value) {
    state.uid = value
  },
  updateUserDisplayName(state, value) {
    state.userDisplayName = value
  },
  updateIsAuthenticating(state, value) {
    state.isAuthenticating = value
  },
  updateIsLoggedIn(state, value) {
    state.isLoggedIn = value
  },
  updateIsSigningOut(state, value) {
    state.isSigningOut = value
  },
  updateUserData(state, { onboardingData, roles }) {
    state.onboardingData = onboardingData
    state.roles = roles
    state.loadedUserData = true
  },
  updateAuthStatus(state, user) {
    const isLoggedIn = !!user
    const hasAuthEmail = !!user && !!user.email
    state.userDisplayName = isLoggedIn ? user.displayName : "No Name"
    state.uid = isLoggedIn ? user.uid : null
    state.userAuthEmail = hasAuthEmail ? user.email : null
    state.isAuthenticating = false
    state.isLoggedIn = isLoggedIn
    state.isSigningOut = false
    state.isAnonymous = user ? user.isAnonymous : null
  },
  resetState (state) {
    state.isLoggedIn = false
    state.isAuthenticating = true
    state.userAuthEmail = null
    state.isSigningOut = false
    state.userDisplayName = null
    state.isAnonymous = null
  },
  updateSubscriptionEnder(state, value) {
    state.subscriptionEnder = value
  },
  replaceTeamsThatUserBelongs (state, value) {
    if (state.teamsThatUserBelongs) {
      state.teamsThatUserBelongs = value
    } else {
      state.teamsThatUserBelongs = []
    }
  },
  replaceCurrentTeam (state, currentTeam) {
    state.currentTeam = currentTeam
  },
  replaceTeamAsGuest (state, teamAsGuest) {
    state.teamAsGuest = teamAsGuest
  },
  pushTeamAsGuest (state, teamId) {
    if (state.teamAsGuest) {
      state.teamAsGuest = state.teamAsGuest.push(teamId)
    } else {
      state.teamAsGuest = [teamId]
    }
  }
}

/*
function analyticsIdentifyUser(user) {
  if (user) {
    const analytics = window.analytics
    const {
      uid,
      displayName,
      email,
      phoneNumber,
      photoURL,
      providerData: [{ providerId }],
      emailVerified
    } = user

    const analyticsPayload = {
      displayName,
      email,
      photoURL,
      providerId,
      emailVerified,
      pickllVersion: window.release
    }
    analytics.identify(uid, analyticsPayload)

    Sentry.configureScope(scope => {
      scope.setUser({ id: uid, ...analyticsPayload })
    })
  }
}
*/

export const actions = {
  setupAuthStateHandler({ dispatch, commit }) {
    dispatch('endSubscription')
    const ender = firebase.auth().onAuthStateChanged(user => {
      //analyticsIdentifyUser(user)
      commit('updateAuthStatus', user)
      if (!!user) {
        dispatch('getUserData')
      }
    })
    commit('updateSubscriptionEnder', ender)
  },
  endSubscription({ state, commit }) {
    if (state.subscriptionEnder) {
      state.subscriptionEnder()
      commit('updateSubscriptionEnder', null)
    }
  },
  async signOut({ commit, dispatch }) {
    commit('updateIsSigningOut', true)
    try {
      await firebase.auth().signOut()
      dispatch('endSubscription')
    } catch (err) {
      console.error('error signing out of firebase', err)
    } finally {
      commit('updateIsSigningOut', false)
    }
  },
  async getUserData({ state, commit }) {
    // If onboarding data and roles are already loaded in the store, use that. Otherwise grab
    // them from the database, and load into the store

    /*
    const userData = await firestore
      .collection(collections.USERS)
      .doc(state.uid)
      .get()
      .then(docSnap => (docSnap.exists ? docSnap.data() : null))

    const onboardingData = !!userData ? userData.onboardingData : null
    const roles = !!userData ? userData.roles : []

    commit('updateUserData', { onboardingData, roles })
    return { onboardingData, roles }
    */

    return {};
  },
  async signInAnonymously ({ commit }) {
    return new Promise(async resolve => {
      await firebase.auth().signInAnonymously().catch(function (error) {
        console.error('Login anonymously error: ', error)
      })
      var user = await firebase.auth().currentUser
      commit('updateAuthStatus', user)
      resolve(user)
    })
  },
  async createAnonymousUser ({ commit }, data) {
    return new Promise(async resolve => {
      var userObj = {
        name: 'Guest',
        iconURL: 'https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fuser-default.png?alt=media&token=5d9ac3a4-6849-4f60-a182-1d6df8d340ba',
        profile: 'No Profile',
        // team: [data.teamId],
        teamAsGuest: [data.teamId],
        room: [data.roomId],
        type: 'human',
        isAnonymous: true,
        createdAt: new Date(),
        latestSignInTime: new Date()
      }
      await db.collection(String(COLLECTIONS_ENUM.users)).doc(data.uid).set(userObj)
      userObj.uid = data.uid
      resolve(userObj)
    })
  },
  async setUserTeamOf ({ commit }, uid) {
    return new Promise(async resolve => {
      var user = await db.collection(COLLECTIONS_ENUM.users).doc(uid).get()
        .then((d) => {
          var user = d.data()
          user.uid = d.id
          return user
        })
      commit('replaceTeamsThatUserBelongs', user.team)
      commit('replaceCurrentTeam', user.currentTeam)
      commit('replaceTeamAsGuest', user.teamAsGuest)

      resolve(user.team)
    })
  },
  async updateUserTeamAsGuest ({ commit, state }, data) {
    return new Promise(async resolve => {
      // await db.collection(COLLECTIONS_ENUM.users).doc(data.uid)
      //   .update({
      //     teamAsGuest: firebase.firestore.FieldValue.arrayUnion(data.teamId)
      //   })

      fetch(`${api}/updateTeamAsGuest`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'uid': data.uid,
          'teamId': data.teamId
        })
      })

      commit('pushTeamAsGuest', data.teamId)

      resolve('succeed')
    })
  },
  // for Plan
  async updatePlanOfUser ({ commit }, data) {
    return new Promise(async resolve => {
      await db.collection(COLLECTIONS_ENUM.users).doc(data.uid).update({
        plan: data.plan
      })
      resolve('succeeded')
    })
  },
  async getPlanOfUser ({ commit }, uid) {
    return new Promise(async resolve => {
      var user = await db.collection(COLLECTIONS_ENUM.users).doc(uid).get()
        .then((d) => {
          var user = d.data()
          user.uid = d.id
          return user
        })
      resolve(user.plan)
    })
  }
}
