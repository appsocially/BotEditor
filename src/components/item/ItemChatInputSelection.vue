<template lang="pug">
  transition
    div(v-if="selections[0]").wrap-item-input-selection.pt8
      div.wrap-selections.f.flex-wrap
        div(v-for="item in selections").selection.mr6.mb6
          span(@click="onSelection(item)").px12.py8 {{item.label}}
</template>

<style lang="scss">
.wrap-item-input-selection {
  width: 100%;
  height: 120px;
  border-top: solid 0.6px rgba(0, 0, 0, 0.2);
  .wrap-selections {
    width: 95%;
    max-width: 620px;
    margin: 0 auto;
    overflow: scroll;
    max-height: 100%;
    .selection {
      display: inline-block;
      span {
        display: block;
        background: #FF9A0A;
        color: #fff;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
      }
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
      selections: []
    }
  },
  watch: {
    async currentNode (newNode) {
      if (newNode.type === 'selection') {
        this.selections = await this.getSelectionsOf(newNode.id)
        this.$emit('openWidgetInput')
      } else {
        this.selections = []
        this.$emit('closeWidgetInput')
      }
    }
  },
  computed: {
    ...mapStateAuth([
      'uid'
    ]),
    ...mapStateScenario([
      'currentNode',
      'handledCuntumVariable'
    ]),
    ...mapStateTeam([
      'team',
      'teamId'
    ]),
    ...mapStateRoom([
      'room'
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
      'getSelectionsOf',
      'setCustomVar'
    ]),
    async onSelection (selection) {
      // For Preview
      var isPreviewMode = false
      if (this.$route.name === "canvas" 
        　|| this.$route.name === "preview"
        　|| this.$route.name === "preview_chat") {
        var projectId = this.$route.params.id
        var teamId = this.teamId
        var roomId = projectId

        isPreviewMode = true
      } else {
        var teamId = this.team.id
        var roomId = this.room.id
      }

      var messageObj = {
        text: selection.label,
        uid: this.uid,
        teamId: teamId,
        roomId: roomId
      }
      if (isPreviewMode) messageObj.isPreviewMode = true
      
      await this.addMessage(messageObj)

      if (this.handledCuntumVariable && this.handledCuntumVariable.handleType === 'selection') {
        var customVarObj = {
          value: selection.label,
          customVariable: this.handledCuntumVariable,
          teamId: teamId,
          roomId: roomId,
          uid: this.uid
        }
        if (isPreviewMode) customVarObj.isPreviewMode = true
        await this.setCustomVar(customVarObj)
      }

      // If there is matched condition, trigger next event.
      var conditions = selection.conditions
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
