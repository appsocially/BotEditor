<template>
  <div>
    <span class='title-welcome'>Welcome to Bot Editor !!</span>
    <div id="firebaseui-auth-container"/>
    <v-progress-circular 
      v-show="!isSignInUILoaded"
      :size="50"
      color="primary"
      indeterminate
    />
  </div>
</template>

<script>
import { firebase } from '@/components/firebaseInit'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
const ui = new firebaseui.auth.AuthUI(firebase.auth())

export default {
  data() {
    return {
      isSignInUILoaded: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setupSignInUi()
    })
  },
  methods: {
    setupSignInUi() {
      const vInstance = this
      const uiConfig = {
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        callbacks: {
          uiShown() {
            vInstance.isSignInUILoaded = true
          },
          signInSuccess: () => false
          // signInSuccessWithAuthResult: () => false
        },
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          // firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
          // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: '<your-tos-url>',
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
          window.location.assign('<your-privacy-policy-url>')
        }
      }
      // Initialize the FirebaseUI Widget using Firebase.
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig)
    }
  }
}
</script>

<style>
/* Collapse height of firebase ui loading spinner container */
.mdl-card .firebaseui-callback-indicator-container {
  height: 2px;
}
/* Collapse height of firebase ui loading spinner container */
.mdl-card.firebaseui-container {
  min-height: 2px;
}
.title-welcome {
  position: relative;
  top: -20px;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 0.6px;
}
</style>