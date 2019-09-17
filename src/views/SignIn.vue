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
import firebase from "firebase"
import db from "@/components/firebaseInit"

import FirebaseSignInUi from '@/components/sign-in/firebase-sign-in-ui'

import { createNamespacedHelpers } from "vuex"
import Auth from '@/components/auth'
import { setTimeout } from 'timers'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers(
 "auth"
)
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers(
 "project"
)
const { mapState: mapStateScenario, mapActions: mapActionsScenario } = createNamespacedHelpers(
 "scenario"
)

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
    ...mapActionsProject([
      'loadProject',
      'copyProject'
    ]),
    ...mapActionsScenario([
      'loadScenarioByProjectId'
    ]),
    onFailedAuthentication() {
      this.loggingIn = false
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
          creationTime: user.metadata.creationTime
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

        if(this.$route.params.projectId) {
          var project = await this.loadProject(this.$route.params.projectId)
          var scenarioArray = await this.loadScenarioByProjectId(this.$route.params.projectId)
          
          await this.copyProject({
            uid: user.uid,
            userDisplayName: user.displayName,
            scenario: scenarioArray,
            project: project
          })
        }
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
    /*signOut() {
      await firebase.auth().signOut();
    }*/
  },
  computed: {
    ...mapStateAuth([
      'uid',
    ]),
    ...mapStateProject([
      'project',
    ]),
    ...mapStateScenario([
      'scenarioArray',
    ])
  }
}
</script>

<style scoped>
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
