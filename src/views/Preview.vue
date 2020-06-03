<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    UtilHeader
    div.wrap-preview
      div(v-if="uid").preview
        ModulePreviewHeader(@reloadPreview="reloadPreview" @togglePreview="togglePreview")
        ModuleChat(ref="moduleChat" v-if="uid && scenarioArray" :isPreviewMode="true")

</template>

<style lang="scss" scoped>
.wrap-preview {
  padding-top: 48px;
  .preview {
    position: relative;
    height: calc(100vh - 48px);
  }
}
</style>

<script>
import Auth from '@/components/auth'
import db from "@/components/firebaseInit"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers("project")
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers("auth")

import UtilHeader from "../components/util/UtilHeader"
import ModulePreviewHeader from "../components/module/ModulePreviewHeader"
import ModuleChat from "../components/module/ModuleChat"

export default {
  components: {
    Auth,
    UtilHeader,
    ModulePreviewHeader,
    ModuleChat
  },
  data() {
    return {
      showPreview: true
    }
  },
  computed: {
    ...mapState([
      'scenarioArray'
    ]),
    ...mapStateProject([
      'project'
    ]),
    ...mapStateAuth([
      'uid'
    ]),
  },
  created: async function () {
    await this.loadProject(this.$route.params.id)
    await this.loadScenarioByProjectId(this.$route.params.id)
    // this.setTeamId(this.$route.params.teamId)
  },
  mounted: function () {
    
  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId'
    ]),
    ...mapActionsProject([
      'loadProject'
    ]),
    ...mapActionsAuth([
      'signInAnonymously',
      'setUid'
    ]),
    async onFailedAuthentication() {
      await this.signInAnonymously()
      // this.setUid('preview_user')
    },
    onLoggedIn({ onboardingData }) {
      
    },
    reloadPreview () {
      this.$refs.moduleChat.reloadPreview()
    },
    togglePreview () {
      this.showPreview = !this.showPreview
    }
  }
}
</script>
