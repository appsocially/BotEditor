import { firebase } from '@/components/firebaseInit'
import firestore from '@/components/firebaseInit'
//import { collections } from '@/components/vars'

export const state = () => ({
  userDisplayName: null,
  isAuthenticating: true,
  isLoggedIn: false,
  isSigningOut: false,
  uid: null,
  onboardingData: null,
  subscriptionEnder: null,
  loadedUserData: false,
  roles: []
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
    state.userDisplayName = isLoggedIn ? user.displayName : "No Name"
    state.uid = isLoggedIn ? user.uid : null
    state.isAuthenticating = false
    state.isLoggedIn = isLoggedIn
    state.isSigningOut = false
  },
  updateSubscriptionEnder(state, value) {
    state.subscriptionEnder = value
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
  }
}
