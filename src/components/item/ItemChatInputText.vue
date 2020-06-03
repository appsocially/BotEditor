<template lang="pug">
  div(v-if="showTextInput").wrap-item-input-text.py4
    div.wrap-input.f.fm.flex-between
      div.wrap-textarea.f.fm.pr8
        textarea(:placeholder="placeholder" v-model="value").px6.pt1
      div.wrap-icon.f.fm.flex-right
        v-icon(@click="sendMessage" :color="iconColor") send
</template>

<style lang="scss">
.wrap-item-input-text {
  width: 100%;
  height: 40px;
  border-top: solid 0.6px rgba(0, 0, 0, 0.2);
  .wrap-input {
    width: 95%;
    max-width: 620px;
    height: 100%;
    margin: 0 auto;
    .wrap-textarea {
      width: 100%;
      height: 22px;
      textarea {
        width: 100%;
        height: 26px;
        border: solid 0.6px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        resize: none;
        outline: none;
        font-size: 16px;
      }
      .wrap-icon {
        width: 24px;
        height: 100%;
        i {
          cursor: pointer;
        }
      }
    }
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateProject } = createNamespacedHelpers("project")
const { mapState: mapStateScenario, mapActions: mapActionsScenario } = createNamespacedHelpers('scenarioForChat')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')
const { mapState: mapStateTeam } = createNamespacedHelpers('team')

export default {
  data () {
    return {
      value: '',
      placeholder: 'Type text here.',
      iconColor: '#999',
      showTextInput: true
    }
  },
  watch: {
    async currentNode (newNode) {
      this.showTextInput = true
      if (newNode.type === 'openquestion'
       || newNode.type === 'ask_email'
       || newNode.type === 'ask_phone_number') {
        this.placeholder = await this.getPlaceholderTextOf(newNode.id)
      } else if (newNode.type === 'selection'
       || newNode.type === 'multipleselection') {
        this.showTextInput = false
      } else {
        this.placeholder = 'Type text here.'
      }
    },
    value (newValue) {
      var activeColor = (this.project.themeColor)? this.project.themeColor.hex: "#FF9A0A"
      this.iconColor = (newValue === '') ? '#999' : activeColor
    }
  },
  computed: {
    ...mapStateAuth(['uid', 'isAnonymous']),
    ...mapStateProject(['project']),
    ...mapStateScenario(['currentNode', 'handledCuntumVariable']),
    ...mapStateTeam(['team', 'teamId']),
    ...mapStateRoom(['room', 'messages'])
  },
  async created () {
    this.user = await this.getRoomUserById(this.uid)
  },
  async mounted () {

  },
  methods: {
    ...mapActionsRoom(['getRoomUserById', 'addMessage']),
    ...mapActionsScenario([
      'getNodeConditions',
      'getNextEventByConditions',
      'onEvent',
      'getPlaceholderTextOf',
      'setCustomVar'
    ]),
    async sendMessage () {
      if (this.value === "") return
      
      if (this.currentNode.type === "ask_email" && !this.validateEmail(this.value)) {
        alert("Invalid Email Adress.")
        return
      }
      if (this.currentNode.type === "ask_phone_number" && !this.validatePhoneNumber(this.value)) {
        alert("Invalid Phone Number.")
        return
      }

      // For Preview
      var isPreviewMode = false
      if (this.$route.name === "canvas" 
        　|| this.$route.name === "preview"
        　|| this.$route.name === "preview_chat") {
        var projectId = this.$route.params.id
        var teamId = this.teamId
        var roomId = `${projectId}-${this.uid}`

        isPreviewMode = true
      } else {
        var teamId = this.team.id
        var roomId = this.room.id
      }

      var messageObj = {
        text: this.value,
        uid: this.uid,
        teamId: teamId,
        roomId: roomId
      }
      if (isPreviewMode) messageObj.isPreviewMode = true
      await this.addMessage(messageObj)

      if (!this.isAnonymous && !isPreviewMode) {
        this.value = ''
        return true
      }
      
      if (this.handledCuntumVariable
       && (this.handledCuntumVariable.handleType === 'openquestion'
       || this.handledCuntumVariable.handleType === 'ask_email'
       || this.handledCuntumVariable.handleType === 'ask_phone_number')) {
        
        var customVarObj = {
          value: this.value,
          customVariable: this.handledCuntumVariable,
          teamId: teamId,
          roomId: roomId,
          uid: this.uid
        }
        if (this.messages[this.messages.length - 2]) {
          customVarObj.questionMessage = this.messages[this.messages.length-2]
        }

        if (isPreviewMode) customVarObj.isPreviewMode = true
        await this.setCustomVar(customVarObj)
      }

      this.value = ''

      // If there is matched condition, trigger next event.
      var conditions = await this.getNodeConditions(this.currentNode.id)
      if (conditions) {
        var nextEvent = await this.getNextEventByConditions(conditions)
        if (nextEvent) {
          var eventObj = {
            nodeId: nextEvent,
            // uid: this.room.assignedUid,
            teamId: teamId,
            roomId: roomId
          }
          if (isPreviewMode) {
            eventObj.uid = "previewBot"
            eventObj.isPreviewMode = true
          } else {
            eventObj.uid = this.room.assignedUid
          }
          this.onEvent(eventObj)
        }
      }
    },
    validateEmail (email) {
      var regexp = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/
      return regexp.test(email)
    },
    validatePhoneNumber (phoneNumber) {
      var noBar = phoneNumber.replace(/[━.*‐.*―.*－.*\-.*ー.*\-]/gi,'')
      var regexp = /^(0[5-9]0[0-9]{8}|0[1-9][1-9][0-9]{7})$/
      return regexp.test(noBar)
    }
  }
}
</script>
