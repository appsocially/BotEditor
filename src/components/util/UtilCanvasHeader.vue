<template lang="pug">
  Auth(@loggedIn="onLoggedIn")
    div(v-if="project").wrap-util
      div.util-content.f.fc
        div.icon-left.f.fm
          div.mr8
            v-icon(v-if="!showDrawer" @click="toggleDrawer" color="#FF9A0A") dehaze
            v-icon(v-else @click="toggleDrawer" color="#FF9A0A") close
          div
            v-icon(@click="$router.push('/top')" color="#FF9A0A") home
          // span(@click="$router.push('/openbots')").logo BotEditor
        div.label.f.fm
          div(@click="toggleModal" v-if="project.author === uid").bot-icon.f.fh
            img(:src="project.botIcon")
          span.line-clamp-1.ml8 {{project.title}}
          // v-icon(
            @click="toggleModal"
            v-if="project.author === uid"
            color='#FF9A0A').settings.pb2 settings
        div.icon-right.f.fm
          //span test-r
          div(v-if="project.author === uid")
            div(v-if="!project.isAddedToTeamAsBot" @click="onAddBotToTeam").add-bot-to-team-button.right-button.f.fm.pl2.pr12.py5
              v-icon(color="#fff" size="20px") person_add
              span {{this.$t("canvas.header.add_bot")}}
            div(v-else-if="!showAddBotButtun").f.fm.pl2.pr12.py5
              v-icon(size="20px").mr4 check
              span Added
          div(v-else-if="isAnonymous || (!uid && project.publishedAsFormat)").wrap-get-started.f.fm
            span(@click="toSignIn").sign-in.mr16 {{this.$t("canvas.header.sign_in")}}
            span(@click="toSignUpWithBot").sign-up.px10.py6 {{this.$t("canvas.header.start_with_bot")}}
          div(v-else-if="project.author !== uid && uid && project.publishedAsFormat")
            div(@click="onImport").import-button.right-button.f.fm.pl2.pr12.py3
              v-icon(color="#fff" size="24px") play_for_work
              span {{this.$t("canvas.header.clone")}}
      div(v-if="project.author !== uid").notify-unauthed.f.fh
        span {{this.$t("canvas.header.no_right")}}

</template>

<style lang="scss">

.wrap-util {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 48px;
  border-bottom: solid .6px rgba(0,0,0,0.2);
  background: #FFF;
  /*background: #f8f8f8;*/
  z-index: 1;
  .util-content {
    position: relative;
    margin: 0 auto;
    /*width: 90%;*/
    /*max-width: 1048px;*/
    height: 100%;
    .label {
      .bot-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        /*border: solid 0.8px rgba(0,0,0,0.8);*/
        overflow: hidden;
        cursor: pointer;
        img {
          object-fit: cover;
          min-width: 100%;
          min-height: 100%;
        }
      }
      span {
        max-width: 100px;
      }
      // .settings {
      //   font-size: 20px;
      //   width: 30px;
      //   /*color: #FF9A0A !important;*/
      //   cursor: pointer;
      // }
    }
    .icon-left {
      position: absolute;
      left: 12px;
      height: 100%;
      .logo {
        font-weight: bold;
        font-size: 18px;
        color: #2a2a2a;
        letter-spacing: 0.4px;
        cursor: pointer;
      }
    }
    .icon-right {
      position: absolute;
      right: 12px;
      height: 100%;
      .wrap-get-started {     
        .sign-up {
          background: #FF9A0A;
          border-radius: 3px;
          font-size: 12px;
          font-weight: 500;
          color: #FFF;
          letter-spacing: 0.4px;
          cursor: pointer;
        }
        .sign-in {
          font-size: 12px;
          font-weight: 500;
          color: #FF9A0A;
        }
      }
      .right-button {        
        background: #FF9A0A;
        cursor: pointer;
        border-radius: 3px;
        i {
          width: 30px;
        }
        span {
          color: #FFF;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
        }
      }
    }
  }
  .notify-unauthed {
    position: absolute;
    top: 100%;
    width: 100%;
    height: 26px;
    background: #FFEB52;
  }
}

</style>

<script>
import { createNamespacedHelpers } from "vuex"
import { setTimeout } from 'timers'
import Auth from '@/components/auth'

const { mapState: mapStateAuth } = createNamespacedHelpers("auth")
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers("project")
const { mapState: mapStateScenario, mapActions: mapActionsScenario } = createNamespacedHelpers("scenario")
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

export default {
  components: {
    Auth
  },
  props: {
    showDrawer: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      showAddBotButtun: true
    }
  },
  watch :{
    project: (updatedProject) => {
      // if (this.showAddBotButtun && updatedProject.isAddedToTeamAsBot) this.showAddBotButtun = false
    }
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isSigningOut',
      'userDisplayName',
      'isAnonymous'
    ]),
    ...mapStateProject([
      'project',
    ]),
    ...mapStateScenario([
      'scenarioArray',
    ]),
    ...mapStateTeam([
      'team'
    ])
  },
  methods: {
    ...mapActionsProject([
      'copyProject',
      'addBotToTeam'
    ]),
    ...mapActionsScenario([
      'resetScenario',
      'loadScenarioByProjectId'
    ]),
    ...mapActionsTeam([
      'loadCurrentTeam'
    ]),
    onLoggedIn () {
      this.loadCurrentTeam(this.uid)
    },
    toggleModal () {
      this.$emit('toggleModal')
    },
    toSignIn () {
      this.$router.push("/sign-in")
    },
    toSignUpWithBot () {
      var projectId = this.$route.params.id
      this.$router.push(`/sign-up/${projectId}`)
    },
    async onImport () {
      $('#nowLoading').fadeIn(400)

      var newProjectId = await this.copyProject({
        uid: this.uid,
        userDisplayName: this.userDisplayName,
        scenario: this.scenarioArray,
        project: this.project        
      })
      this.resetScenario()
      this.$router.push(`/canvas/${newProjectId}`)
        
      await this.loadScenarioByProjectId(this.$route.params.id)
      this.$emit('reloadCanvasModuleArrays')

      this.$emit("enableEdit")

      alert("The scenario has been imported as your new Bot!!")
    },
    async onAddBotToTeam () {
      this.showAddBotButtun = false
      var setPrimaryByThisBot = (this.team.primary === this.uid)? true : false
      this.addBotToTeam({ uid: this.uid, teamId: this.team.id, setPrimaryByThisBot })
      alert("Your bot has been added to your team!")
    },
    toggleDrawer () {
      this.$emit("toggleDrawer")
    }
  }
};
</script>
