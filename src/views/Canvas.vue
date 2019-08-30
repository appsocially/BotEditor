<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div(slot-scope="{signOut}").wrap-canvas-page
      util-canvas-header(
        v-if="project"
        @toggleModal="toggleModal"
        @loadCanvas="loadCanvas"
        @enableEdit="enableEdit")
      module-canvas(
        ref="canvas"
        v-if='!!project && !!scenario'
        :project='project'
        :letEdit="letEdit")
      div(v-show="showPreview").wrap-preview
        module-conversation(
          ref="conversation"
          v-if='!!project && !!scenario'
          :project='project'
          @togglePreview="togglePreview")
      div(v-show="!showPreview" @click="togglePreview").wrap-preview-float-icon.f.fh
        v-icon(color='#2a2a2a') remove_red_eye
      module-modal(
        v-if="showModal"
        @toggleModal="toggleModal"
        @updateProject="updateProject"
        :project="project")

</template>

<style lang="scss">

.wrap-canvas-page {
  .wrap-preview {
    position: fixed;
    z-index: 200;
    right: 16px;
    bottom: 16px;
    width: 300px;
    height: 440px;
    filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
    overflow: hidden;
    border-radius: 3px;
  }
  .wrap-preview-float-icon {
    position: fixed;
    z-index: 200;
    right: 16px;
    bottom: 16px;
    width: 60px;
    height: 60px;
    filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
    border-radius: 50%;
    background: #FFEB52;
    cursor: pointer;
    i {
      font-size: 32px;
    }
  }
}

</style>

<script>
import Auth from '@/components/auth'
import db from "@/components/firebaseInit"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers(
 "scenario"
)
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers(
 "project"
)
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers(
 "auth"
)

import UtilHeader from "../components/util/UtilHeader"
import UtilCanvasHeader from "../components/util/UtilCanvasHeader"
import ModuleCanvas from "../components/module/ModuleCanvas"
import ModuleConversation from "../components/module/ModuleConversation"
import ModuleModal from "../components/module/ModuleModal"

import ItemPreviewHeader from "../components/item/ItemPreviewHeader"
import { functions } from 'firebase';

export default {
  name: 'Canvas',
  components: {
    Auth,
    UtilHeader,
    UtilCanvasHeader,
    ModuleCanvas,
    ModuleConversation,
    ModuleModal,
    ItemPreviewHeader
  },
  //props: ['labels', 'projects'],
  data() {
    return {
      // project: null,
      // scenarioArray: null,
      scenario: null,
      showPreview: true,
      showModal: false,
      letEdit: "let-edit",
      letInitConversation: true
    }
  },
  watch:{
    $route (to, from){
      this.letInitConversation = true
      this.loadCanvas()
      // this.$refs.conversation.initConversation()
    }
  }, 
  created: async function () {
    this.loadCanvas()
  },
  mounted: function () {
    
  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId',
      'loadAllCustomVars'
    ]),
    ...mapActionsProject([
      'loadProject',
      'updateEditTime',
      'updateSettings'
    ]),
    async onFailedAuthentication() {
      this.loadCanvas()
    },
    onLoggedIn({ onboardingData }) {
      this.loadCanvas()
    },
    async loadCanvas () {
      $('#nowLoading').fadeIn(400)
      
      await this.loadProject(this.$route.params.id)
      if(this.project.author === this.uid){
        this.updateEditTime (this.project.id)
      } else {
        this.letEdit = "not-let-edit"
      }
      await this.loadScenarioByProjectId(this.project.id)
      this.scenario = this.scenarioArray

      this.loadAllCustomVars()

      if(this.$refs.conversation && this.letInitConversation){
        this.$refs.conversation.initConversation()
        this.letInitConversation = false
      }
      if(this.$refs.canvas) this.$refs.canvas.scrollToStartNode()

      $('#nowLoading').fadeOut(400)
    },
    // onTitleClick(signOut) {
    //   console.log('clicked')
    //   signOut()
    // },
    enableEdit () {
      this.letEdit = "let-edit"
    },
    togglePreview () {
      this.showPreview = !this.showPreview
    },
    toggleModal () {
      this.showModal = !this.showModal
    },
    updateProject (settings) {
      this.updateSettings({
        settings: settings,
        id: this.project.id
      })

      alert("Bot Setting has been updated!")
      this.toggleModal()
    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
      'customVars'
    ]),
    ...mapStateProject([
      'project',
      'test'
    ]),
    ...mapStateAuth([
      'uid'
    ]),
  }
};
</script>
