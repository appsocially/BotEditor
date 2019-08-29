<template>
  <Auth 
    :on-failed-authentication="onFailedAuthentication" 
    @loggedIn="onLoggedIn">
    <v-app>
      <v-content>
        <v-container 
          fluid 
          fill-height>
          <v-layout 
            align-center 
            justify-center>
            <v-flex 
              xs12 
              sm8 
              md4 
              class="text-xs-center fc">
              <!--img src="../assets/pickll_logo_row.svg"-->
              <v-progress-circular 
                v-if="loggingIn"
                :size="50"
                color="primary"
                indeterminate
                class="mt-3 fc"
              />
              <FirebaseSignInUi v-else/>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </Auth>
</template>

<script>
import firebase from "firebase";
import db from "@/components/firebaseInit";

import FirebaseSignInUi from '@/components/sign-in/firebase-sign-in-ui'

import { createNamespacedHelpers } from "vuex";
import Auth from '@/components/auth'
import { setTimeout } from 'timers';
const { mapState, mapActions } = createNamespacedHelpers(
 "auth"
);

export default {
  components: {
    FirebaseSignInUi,
    Auth
  },
  data() {
    return {
      loggingIn: true
    }
  },
  methods: {
    onFailedAuthentication() {
      this.loggingIn = false

      if(this.$route.name === "sign-up") setTimeout(this.replaceSignInText, 10)   
    },
    async onLoggedIn({ onboardingData }) {

      var userDoc = await db.collection('users').doc(this.uid).get()

      if(!userDoc.exists){
        var user = await firebase.auth().currentUser

        var userObj = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoUrl: user.photoURL,
          lastSignInTime: user.metadata.lastSignInTime,
          creationTime: user.metadata.creationTime,
          groups: ['Appsocially'],
        }

        await db.collection("users")
          .doc(user.uid)
          .set(userObj)
          .then(function() {
            console.log("Document successfully written!")
          })
          .catch(function(error) {
            console.error("Error writing document: ", error)
          })
      }


      this.$router.push('/top')

      /*
      if (!!onboardingData) {
        this.$router.push('/create-page')
      } else {
        this.$router.push('/user-onboarding')
      }
      */
    },
    replaceSignInText () {
      var titles = document.getElementsByClassName("firebaseui-title")
      for(var i=0; i<titles.length; i++){
        titles[i].innerText = titles[i].innerText.replace("Sign in", "Sign up")
      }
    }
    /*signOut() {
      await firebase.auth().signOut();
    }*/
  },
  computed: {
    ...mapState([
      'uid',
    ]),
  }
}
</script>

<style>
img {
  width: 100%;
}

.v-btn__content {
  justify-content: flex-start;
}

.v-icon {
  width: 50px;
}
</style>
