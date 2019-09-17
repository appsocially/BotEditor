<template lang="pug">

  div(v-if="project").wrap-util
    div.util-content.f.fc
      div.icon-left.f.fm
        v-icon(v-if="!showDrawer" @click="toggleDrawer" color="#FF9A0A") dehaze
        v-icon(v-else @click="toggleDrawer" color="#FF9A0A") close
        // span(@click="$router.push('/openbots')").logo BotEditor
      div.label.f.fm
        div(@click="toggleModal" v-if="project.author === uid").bot-icon.f.fh
          img(:src="project.botIcon")
        span.ml8 {{project.title}}
        // v-icon(
          @click="toggleModal"
          v-if="project.author === uid"
          color='#FF9A0A').settings.pb2 settings
      div.icon-right.f.fm
        //span test-r
        div(v-if="!uid && project.pulishedAsFormat").wrap-get-started.f.fm
          span(@click="toSignIn").sign-in.mr16 Sign In
          span(@click="toSignUpWithBot").sign-up.px10.py6 Sign Up with this Bot
        div(v-else-if="project.author !== uid && uid && project.pulishedAsFormat")
          div(@click="onImport").import-button.f.fm.pl2.pr12.py3
            v-icon play_for_work
            span Import this Bot
    div(v-if="project.author !== uid").notify-unauthed.f.fh
      span You don't have the right to edit.

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
      .import-button {        
        background: #FF9A0A;
        cursor: pointer;
        border-radius: 3px;
        i {
          font-size: 24px;
          width: 30px;
          color: #FFF !important;
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
import { setTimeout } from 'timers';

const { mapState: mapStateAuth } = createNamespacedHelpers(
 "auth"
)
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers(
 "project"
)
const { mapState: mapStateScenario } = createNamespacedHelpers(
 "scenario"
)

export default {
  props: {
    showDrawer: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      
    }
  },
  methods: {
    ...mapActionsProject([
      'copyProject'
    ]),
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
      
      this.$router.push(`/canvas/${newProjectId}`)

      this.$emit("enableEdit")

      alert("The scenario has been imported as your new Bot!!")
    },
    toggleDrawer () {
      this.$emit("toggleDrawer")
    }
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isSigningOut',
      'userDisplayName'
    ]),
    ...mapStateProject([
      'project',
    ]),
    ...mapStateScenario([
      'scenarioArray',
    ])
  }
};
</script>
