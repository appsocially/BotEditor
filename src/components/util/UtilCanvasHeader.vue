<template lang="pug">

  div(v-if="project").wrap-util
    div.util-content.f.fc
      div.icon-left.f.fm
        //span test-l
      div.label.f.fm
        span {{project.title}}
        v-icon(
          @click="toggleModal"
          v-if="project.author === uid"
          color='#2a2a2a').settings settings
      div.icon-right.f.fm
        //span test-r
        div(v-if="!uid")
          
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
  background: #f8f8f8;
  z-index: 1;
  .util-content {
    position: relative;
    margin: 0 auto;
    width: 90%;
    max-width: 1048px;
    height: 100%;
    .label {
      .settings {
        font-size: 20px;
        width: 30px;
        color: #FF9A0A !important;
        cursor: pointer;
      }
    }
    .icon-left {
      position: absolute;
      left: 0;
      height: 100%;
    }
    .icon-right {
      position: absolute;
      right: 0;
      height: 100%;
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
          font-weight: bold;
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
const { mapState: mapStateScenario } = createNamespacedHelpers(
 "scenario"
)
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers(
 "project"
)
const { mapState: mapStateAuth } = createNamespacedHelpers(
 "auth"
)

export default {
  props: {
    
  },
  data() {
    return {
    }
  },
  created: function (){
    
  },
  methods: {
    ...mapActionsProject([
      'copyProject'
    ]),
    toggleModal () {
      this.$emit('toggleModal')
    },
    async onImport () {
      $('#nowLoading').fadeIn(400)

      var newProjectId = await this.copyProject({
        uid: this.uid,
        userDisplayName: this.userDisplayName,
        scenario: this.scenarioArray,
        project: this.project        
      })
      
      this.$router.push("/top")
      this.$router.push(`/canvas/${newProjectId}`)

      this.$emit("loadCanvas")
      this.$emit("enableEdit")

      alert("The scenario has been imported as your new Bot!!")

      setTimeout(() => {
        var canvasWrapper = document.querySelector('#canvasWrapper')
        if (canvasWrapper) {
          canvasWrapper.scrollLeft = 0
          canvasWrapper.scrollTop = 100000/2 - window.innerHeight/2
        }
      }, 800)
      
    }
  },
  computed: {
    ...mapStateScenario([
      'scenarioArray',
    ]),
    ...mapStateAuth([
      'uid',
      'userDisplayName'
    ]),
    ...mapStateProject([
      'project',
    ])
  }
};
</script>
