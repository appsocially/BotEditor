<template lang="pug">
  div.wrap-item-input-text.py4
    div.wrap-input.f.fm.flex-between
      div.wrap-textarea.f.fm.pr8
        textarea(:placeholder="placeholder" v-model="value").px6.py2
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
const { mapState: mapStateScenario, mapActions: mapActionsScenario } = createNamespacedHelpers('scenarioForChat')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')
const { mapState: mapStateTeam } = createNamespacedHelpers('team')

export default {
  data () {
    return {
      value: '',
      placeholder: 'Type text here.',
      iconColor: '#999'
    }
  },
  watch: {
    async currentNode (newNode) {
      if (newNode.type === 'openquestion') {
        this.placeholder = await this.getPlaceholderTextOf(newNode.id)
      } else {
        this.placeholder = 'Type text here.'
      }
    },
    value (newValue) {
      this.iconColor = (newValue === '') ? '#999' : '#3880ff'
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
      'getPlaceholderTextOf',
      'setCustomVar'
    ]),
    async sendMessage () {
      if (this.value === '') return
      await this.addMessage({
        text: this.value,
        uid: this.uid,
        teamId: this.team.id,
        roomId: this.room.id
      })

      if (!this.isAnonymous) return

      if (this.handledCuntumVariable && this.handledCuntumVariable.handleType === 'openquestion') {
        await this.setCustomVar({
          value: this.value,
          customVariable: this.handledCuntumVariable,
          teamId: this.team.id,
          roomId: this.room.id,
          uid: this.uid
        })
      }

      this.value = ''

      // If there is matched condition, trigger next event.
      var conditions = await this.getNodeConditions(this.currentNode.id)
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
