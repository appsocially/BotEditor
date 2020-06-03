<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div(slot-scope="{signOut}").wrap-conversation-page
      util-header(:sign-out="signOut" :label='label')
      div.wrap-conversation
        module-conversation(v-if='!!project && !!scenario' :project='project')

</template>

<style lang="scss">

.wrap-conversation-page {
  width: 100%;
  height: 90vh;
  overflow: hidden;
  .wrap-conversation {
    margin-top: 48px;
    height: calc(100% - 48px);  
  }
}

</style>

<script>
import Auth from '@/components/auth'

import db from "../components/firebaseInit"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers("auth")

import UtilHeader from "../components/util/UtilHeader"
import ModuleCanvas from "../components/module/ModuleCanvas"
import ModuleConversation from "../components/module/ModuleConversation"


export default {
  components: {
    Auth,
    UtilHeader,
    ModuleCanvas,
    ModuleConversation
  },
  //props: ['labels', 'projects'],
  data() {
    return {
      label: '',
      project: null,
      //scenarioArray: null,
      scenario: null,
    }
  },
  created: async function(){

    $('#nowLoading').fadeIn(400)

    var projectId = this.$route.params.id

    var project = await db.collection("projects")
      .doc(projectId)
      .get()
      .then(function(doc) {
        var data = doc.data()
        data.id = doc.id
        return data
      })
      .catch(function(error) {
        console.error("Error writing document: ", error)
      })

    // project.editedAt = new Date()

    // await db.collection("projects")
    //   .doc(projectId)
    //   .update({editedAt: new Date()})

    console.log('canvas', project)
    this.label = project.title
    this.project = project

    await this.loadScenarioByProjectId(projectId)
    this.scenario = this.scenarioArray

    this.loadAllCustomVars()

    $('#nowLoading').fadeOut(400)

    //var test = await this.loadScenarioByProjectId(projectId)
   
    /*
    var scenarioArray = await db.collection("projects")
      .doc(projectId)
      .collection('scenario')
      .get()
      .then(function(doc) {
        return doc.docs.map(function(doc){
          return doc.data();
        });
      }); 

    this.scenarioArray = scenarioArray;
    */

    //console.log('module-canvas (scenarioArray)', this.scenarioArray);

  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId',
      'loadAllCustomVars',
      'pushContentToScenario',
      'connectSingleNode',
      'connectGroupNode'
    ]),
    onFailedAuthentication() {
      //this.loggingIn = false;
      //this.$router.push('/sign-in');
    },
    onLoggedIn({ onboardingData }) {

    },
    onTitleClick(signOut){
      console.log('clicked')
      signOut();
    },
  },
  computed: {
    ...mapState([
      'scenarioArray',
      'customVars'
    ]),
    ...mapStateAuth([
      'uid'
    ])
  }
};
</script>
