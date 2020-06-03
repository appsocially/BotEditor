<template lang="pug">
  transition
    div(v-if="selections[0]").wrap-item-input-multiple-selection.pt8
      div.wrap-selections
        //- div(v-for="item in selections" @click="onSelection(item)").selection
          v-checkbox(
            v-model="item.checked"
            :label="item.label"
            color="#FF9A0A").ma-0.pa-0
        div(v-for="item in selections").selection.mr6.mb6
          span(@click="onSelection(item, $event)"
            :class="{'is-active': item.checked}"
            :style="`border-color: ${themeColor}; color: ${themeColor};`").px12.py8 {{item.label}}
        div.wrap-send-button.f.fc.mt8.pb12
          div(:style="`background: ${themeColor};`").button.f.fm.px12.py8
            span(@click="onSend"
              :style="`color: ${textColor};`").mr8 Send
            v-icon(color="#FFF"
              size="18px"
              :style="`color: ${textColor};`") send
</template>

<style lang="scss" scoped>
.wrap-item-input-multiple-selection {
  width: 100%;
  height: 120px;
  border-top: solid 0.6px rgba(0, 0, 0, 0.2);
  overflow: scroll;
  .wrap-selections {
    width: 95%;
    max-width: 620px;
    margin: 0 auto;
    max-height: 100%;
    .selection {
      display: inline-block;
      span {
        display: block;
        // color: #FF9A0A;
        // border: solid #FF9A0A 0.8px;
        border: solid 0.8px;
        background: #FFF;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        &.is-active {
          color: #fff;
          // background: #FF9A0A;
        }
      }
    }
  }
  .wrap-send-button {
    .button {
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      // background: #FF9A0A;
      color: #fff;
      border-radius: 3px;
      filter: drop-shadow(2px 1px 1px rgba(0, 0, 0, 0.2));
      i {
        width: 12px;
      }
    }
  }
}
</style>

<style lang="scss">
// .v-input--checkbox {
//   .v-input__slot {
//     margin-bottom: 6px !important;
//   }
//   .v-messages {
//     display: none !important;
//   }
//   label {
//     font-size: 12px !important;
//   }
// }
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
      selections: [],
      themeColor: "#FF9A0A",
      textColor: "#fff"
    }
  },
  watch: {
    async currentNode (newNode) {
      if (newNode.type === 'multipleselection') {
        var selections = await this.getSelectionsOf(newNode.id)
        this.selections = selections.map(e => {
          e.checked = false
          return e
        })
        this.$emit('openWidgetInput')
      } else {
        this.selections = []
        this.$emit('closeWidgetInput')
      }
    }
  },
  computed: {
    ...mapStateAuth(['uid']),
    ...mapStateScenario(['currentNode', 'handledCuntumVariable']),
    ...mapStateProject(['project']),
    ...mapStateTeam(['team', 'teamId']),
    ...mapStateRoom(['room', 'messages'])
  },
  async created () {
    this.user = await this.getRoomUserById(this.uid)
    if (this.project.themeColor) {
      this.themeColor = this.project.themeColor.hex
      this.textColor = this.blackOrWhite(this.themeColor)
    }
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
      'getSelectionsOf',
      'setCustomVar'
    ]),
    onSelection (selection, event) {
      if (selection.checked) {
        event.target.style.background = "#FFF"
        event.target.style.color = this.themeColor
      } else {
        event.target.style.background = this.themeColor
        event.target.style.color = "#FFF"
      }
      this.selections = this.selections.map(e => {
        if (e.id === selection.id) e.checked = !e.checked
        return e
      })
    },
    async onSend () {
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

      var checkedSelections = this.selections.filter(e => { return e.checked })
      var text = checkedSelections.map(e => { return e.label }).join(", ")
      var messageObj = {
        text: text,
        uid: this.uid,
        teamId: teamId,
        roomId: roomId
      }
      if (isPreviewMode) messageObj.isPreviewMode = true
      
      await this.addMessage(messageObj)

      if (this.handledCuntumVariable && this.handledCuntumVariable.handleType === 'multipleselection') {
        var value = checkedSelections.map(e => { return e.label })
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

      // If there is matched condition, trigger next event.
      var conditions = this.currentNode.conditions
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
    blackOrWhite (hexcolor) {
      var r = parseInt( hexcolor.substr( 1, 2 ), 16 ) ;
      var g = parseInt( hexcolor.substr( 3, 2 ), 16 ) ;
      var b = parseInt( hexcolor.substr( 5, 2 ), 16 ) ;

      return ( ( ( (r * 299) + (g * 587) + (b * 114) ) / 1000 ) < 128 ) ? "#fff" : "#2a2a2a"
    }
  }
}
</script>
