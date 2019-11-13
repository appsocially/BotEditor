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
              <div v-if="loggingIn" class="wrap-now-loading f fh">
                <v-progress-circular 
                  :size="50"
                  color="primary"
                  indeterminate
                  class="mt-3 fc"
                />
              </div>
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
  computed: {
    ...mapStateAuth([
      'uid',
      'isAnonymous'
    ]),
    ...mapStateProject([
      'project',
    ]),
    ...mapStateScenario([
      'scenarioArray',
    ])
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

        // var userObj = {
        //   uid: user.uid,
        //   name: user.displayName,
        //   email: user.email,
        //   photoUrl: user.photoURL,
        //   lastSignInTime: user.metadata.lastSignInTime,
        //   creationTime: user.metadata.creationTime
        // }

        // await db.collection("users")
        //   .doc(user.uid)
        //   .set(userObj)
        //   .then(function() {
        //     console.log("Document successfully written!")
        //   })
        //   .catch(function(error) {
        //     console.error("Error writing document: ", error)
        //   })

        var teamObj = {
          author: user.uid,
          iconURL: "https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fcc-logo.png?alt=media&token=3554e2f5-8a27-44e3-a8d6-365fe5554852",
          name: `Team ${user.displayName}`,
          primary: user.uid
        }
        var teamId = await db.collection("teams").add(teamObj).then((d) => {
          return d.id
        })
        
        var newUserObj = {
          createdAt: new Date(),
          currentTeam: teamId,
          iconURL: "https://firebasestorage.googleapis.com/v0/b/chatcenter-min-ui.appspot.com/o/util%2Fcc-logo.png?alt=media&token=3554e2f5-8a27-44e3-a8d6-365fe5554852",
          isAnonymous: false,
          lastSignInTime: new Date(),
          name: user.displayName,
          plan: "BASIC_PLAN",
          profile: "No Profile",
          roomNum: 0,
          team: [teamId],
          type: "human",
          uid: user.uid
        }

        await db.collection("users").doc(user.uid).set(newUserObj)
        db.collection("users").doc(user.uid)
          .collection("secrets").doc("email")
          .set({ author: user.uid, email: user.email })

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

      if (!this.isAnonymous) {
        this.$router.push('/top')
      } else {
        this.loggingIn = false
      }

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

.wrap-now-loading {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
</style>
