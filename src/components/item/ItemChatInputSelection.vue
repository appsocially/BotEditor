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
        background: #3880ff;
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
      'team'
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
      await this.addMessage({
        text: selection.label,
        uid: this.uid,
        teamId: this.team.id,
        roomId: this.room.id
      })

      if (this.handledCuntumVariable && this.handledCuntumVariable.handleType === 'selection') {
        await this.setCustomVar({
          value: selection.label,
          customVariable: this.handledCuntumVariable,
          teamId: this.team.id,
          roomId: this.room.id,
          uid: this.uid
        })
      }

      // If there is matched condition, trigger next event.
      var conditions = selection.conditions
      if (conditions) {
        var nextEvent = await this.getNextEventByConditions(conditions)
        if (nextEvent) {
          this.onEvent({
            nodeId: nextEvent,
            uid: this.room.assignedUid,
            teamId: this.team.id,
            roomId: this.room.id
          })
        }
      }
    }
  }
}
</script>
