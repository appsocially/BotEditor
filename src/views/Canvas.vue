<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div(slot-scope="{signOut}").wrap-canvas-page.f
      util-canvas-header(
        v-if="project"
        @toggleModal="toggleModal"
        @toggleDrawer="toggleDrawer"
        @loadCanvas="loadCanvas"
        @enableEdit="enableEdit"
        @reloadCanvasModuleArrays="reloadCanvasModuleArrays"
        :showDrawer="showDrawer")
      module-canvas-drawer(
        :showDrawer="showDrawer"
        @toggleDrawer="toggleDrawer")
      module-canvas(
        ref="canvas"
        v-if='!!project && !!scenarioArray'
        :project='project'
        :letEdit="letEdit")
      div(v-show="showPreview").wrap-preview
        //- module-conversation(
          ref="conversation"
          v-if='!!project && !!scenarioArray'
          :project='project'
          @togglePreview="togglePreview")
        ModulePreviewHeader(@reloadPreview="reloadPreview" @togglePreview="togglePreview")
        ModuleChat(ref="moduleChat" v-if="uid && scenarioArray" :isPreviewMode="true")
      div(v-show="!showPreview" @click="togglePreview").wrap-preview-float-icon.f.fh
        v-icon(color='#2a2a2a') remove_red_eye
      ModuleModal(
        v-if="showModal"
        @toggleModal="toggleModal"
        @updateProject="updateProject"
        :project="project")

</template>

<style lang="scss">

.wrap-canvas-page {
  padding-top: 48px;
  .wrap-preview {
    position: fixed;
    z-index: 103;
    right: 16px;
    bottom: 16px;
    width: 320px;
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

// import exportUPIL from "../exportUPIL"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers("project")
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers("auth")

import UtilHeader from "../components/util/UtilHeader"
import UtilCanvasHeader from "../components/util/UtilCanvasHeader"
import ModuleCanvas from "../components/module/ModuleCanvas"
import ModuleConversation from "../components/module/ModuleConversation"
import ModulePreviewHeader from "../components/module/ModulePreviewHeader"
import ModuleChat from "../components/module/ModuleChat"
import ModuleCanvasDrawer from "../components/module/ModuleCanvasDrawer"
import ModuleModal from "../components/module/ModuleModal"

import ItemPreviewHeader from "../components/item/ItemPreviewHeader"

export default {
  components: {
    Auth,
    UtilHeader,
    UtilCanvasHeader,
    ModuleCanvas,
    ModulePreviewHeader,
    ModuleChat,
    ModuleConversation,
    ModuleCanvasDrawer,
    ModuleModal,
    ItemPreviewHeader
  },
  //props: ['labels', 'projects'],
  data() {
    return {
      // scenario: null,
      showPreview: true,
      showModal: false,
      showDrawer: false,
      letEdit: "let-edit",
      letInitConversation: true
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
  },
  watch:{
    $route (to, from) {
      this.letInitConversation = true
      this.loadCanvas()
      // this.$refs.conversation.initConversation()
    },
    // scenarioArray (scenario) {
    //   console.log("new scenario:", scenario)
    // }
    scenarioArray: {
      handler: function (scenarioArray) {
        // console.log("new scenario:", scenarioArray)
        this.$refs.canvas.loadNodesArray()
      },
      deep: true
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

      if(this.project.author !== this.uid && !this.project.publishedAsFormat) {
        alert(this.$t("canvas.dialogs.no_right"))
        this.$router.push("/top")
      }

      if(this.project.author === this.uid){
        this.updateEditTime (this.project.id)
      } else {
        this.letEdit = "not-let-edit"
      }
      await this.loadScenarioByProjectId(this.project.id)
      // this.scenario = this.scenarioArray

      this.loadAllCustomVars()

      if(this.$refs.conversation && this.letInitConversation){
        if(!this.$refs.conversation.messageBubbles[0] && !this.$refs.conversation.isInitialized){
          this.$refs.conversation.initConversation()
          this.letInitConversation = false
        }
      }
      if(this.$refs.canvas) this.$refs.canvas.scrollToStartNode()

      $('#nowLoading').fadeOut(400)
    },
    reloadCanvasModuleArrays () {
      this.$refs.canvas.loadNodesArray()
    },
    enableEdit () {
      this.letEdit = "let-edit"
    },
    reloadPreview () {
      this.$refs.moduleChat.reloadPreview()
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
    },
    toggleDrawer () {
      console.log("toggleDrawer")
      this.showDrawer = !this.showDrawer
    }
  } 
}
</script>
