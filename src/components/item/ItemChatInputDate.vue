<template lang="pug">
  div.wrap-item-input-date.py4
    div.wrap-input.f.fm.flex-between
      div.wrap-widget-button.f.fm.flex-between.pr8
        div(v-if="currentNode.type==='ask_date' || currentNode.type==='ask_date_and_time'"
          @click="onInputDate").input.f.fm
          v-icon(size="18px" color="#FF9A0A").mr4 calendar_today
          span.pt1 {{dateValue}}
        div(v-if="currentNode.type==='ask_time' || currentNode.type==='ask_date_and_time'"
          @click="onInputTime").input.f.fm
          v-icon(size="18px" color="#FF9A0A").mr4 access_time
          span.pt1 {{timeValue}}
      div.wrap-icon.f.fm.flex-right
        v-icon(@click="sendMessage" :color="iconColor") send
    transition(name="fade")
      div(v-if="showDateWidget").wrap-widgets
        div.wrap-date-widget.f.fc.py8
          v-date-picker(v-model="datePicker" color="#FF9A0A")
    transition(name="fade")
      div(v-if="showTimeWidget").wrap-widgets
        div.wrap-time-widget.f.fc.py8
          v-time-picker(v-model="timePicker" color="#FF9A0A")

</template>

<style lang="scss">
.wrap-item-input-date {
  position: relative;
  width: 100%;
  height: 40px;
  border-top: solid 0.6px rgba(0, 0, 0, 0.2);
  .wrap-input {
    width: 95%;
    max-width: 620px;
    height: 100%;
    margin: 0 auto;
    .wrap-widget-button {
      width: 100%;
      height: 22px;
      .input {
        width: 49%;
        border-bottom: solid 0.6px #FF9A0A;
        span {
          color: #FF9A0A;
          font-weight: bold;
        }
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

  .wrap-widgets {
    position: absolute;
    bottom: calc(100% + 6px);
    width: 100%;
    .wrap-date-widget {
      width: 95%;
      max-width: 620px;
      margin: 0 auto;
      background: #FFF;
      .v-picker__title {
        display: none;
      }
    }
    .wrap-time-widget {
      width: 95%;
      max-width: 620px;
      margin: 0 auto;
      background: #FFF;
      .v-picker__title {
        display: none;
      }
    }
    &.fade-enter-active, &.fade-leave-active {
      transition: opacity .4s;
    }
    &.fade-enter, &.fade-leave-to {
      opacity: 0;
    }
  }
  
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateScenario, mapActions: mapActionsScenario } = createNamespacedHelpers('scenarioForChat')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')
const { mapState: mapStateTeam } = createNamespacedHelpers('team')

export default {
  data () {
    return {
      datePicker: new Date().toISOString().substr(0, 10),
      dateValue: "Date",
      showDateWidget: false,
      timePicker: null,
      timeValue: "Time",
      showTimeWidget: false,
      iconColor: '#999'
    }
  },
  watch: {
    datePicker (newDate) {
      this.dateValue = newDate
      this.iconColor = (newDate === 'Date') ? '#999' : '#FF9A0A'
      if (this.currentNode.type === "ask_date_and_time"
        && (newDate === 'Date' || this.timeValue === "Time")) {
        this.iconColor = '#999'
      }
    },
    timePicker (newTime) {
      this.timeValue = newTime
      this.iconColor = (newTime === 'Time') ? '#999' : '#FF9A0A'
      if (this.currentNode.type === "ask_date_and_time"
        && (newTime === 'Time' || this.dateValue === "Date")) {
        this.iconColor = '#999'
      }
    }
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isAnonymous'
    ]),
    ...mapStateScenario([
      'currentNode',
      'handledCuntumVariable'
    ]),
    ...mapStateTeam([
      'team',
      'teamId',
    ]),
    ...mapStateRoom([
      'room',
      'messages'
    ])
  },
  async created () {
    this.user = await this.getRoomUserById(this.uid)
  },
  async mounted () {

  },
  methods: {
    ...mapActionsRoom([
      'getRoomUserById',
      'addMessage'
    ]),
    ...mapActionsScenario([
      'getNodeConditions',
      'getNextEventByConditions',
      'onEvent',
      'getPlaceholderTextOf',
      'setCustomVar'
    ]),
    onInputDate () {
      this.showTimeWidget = false
      this.showDateWidget = !this.showDateWidget
    },
    onInputTime () {
      this.showDateWidget = false
      this.showTimeWidget = !this.showTimeWidget
    },
    async sendMessage () {
      if (this.iconColor === "#999") return
      
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

      if (this.currentNode.type === "ask_date") {
        var value = this.dateValue
      } else if (this.currentNode.type === "ask_date_and_time") {
        var value = `${this.dateValue} ${this.timeValue}`
      }

      var messageObj = {
        text: value,
        uid: this.uid,
        teamId: teamId,
        roomId: roomId
      }
      if (isPreviewMode) messageObj.isPreviewMode = true
      await this.addMessage(messageObj)

      if (!this.isAnonymous && !isPreviewMode) {
        this.dateValue = "Date"
        this.timeValue = "Time"
        this.showDateWidget = false
        this.showTimeWidget = false
        return
      }
      
      if (this.handledCuntumVariable) {
        var customVarObj = {
          value: value,
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

      this.dateValue = "Date"
      this.timeValue = "Time"
      this.showDateWidget = false
      this.showTimeWidget = false

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
    }
  }
}
</script>
