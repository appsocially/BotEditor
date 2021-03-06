<template lang="pug">
  div(:class="{'is-preview-mode': isPreviewMode}").wrap-module-chat
    div(v-if="!isNowLoading && project").wrap-chat
      div(ref="messagesWrapper"
          :class="{'widget-is-active': widgetIsActive, 'is-ios-safari': iOSSafari}"
          ).wrap-messages.py8
        ItemChatMessage(v-for="message in messages" :message="message" :key="message")
      div(v-if="currentNode || !isAnonymous").wrap-input
        ItemChatInputDate(v-if="currentNode && (currentNode.type==='ask_date' || currentNode.type==='ask_date_and_time')")
        ItemChatInputText(v-else)
        div.wrap-input-widgets
          ItemChatInputSelection(@openWidgetInput="openWidgetInput" @closeWidgetInput="closeWidgetInput")
          ItemChatInputMultipleSelection(@openWidgetInput="openWidgetInput" @closeWidgetInput="closeWidgetInput")
    div(v-else).wrap-now-loading.f.fh
      v-progress-circular(indeterminate color="#2a2a2a")

</template>

<style lang="scss">
// $inputHeight: 40px;
// $widgetHeight: 120px;
// $safariToolBarHeight: 1;
.wrap-module-chat {
  background: #fff;
  position: relative;
  width: 100%;
  height: calc(100vh - (48px + 48px));
  overflow: hidden;
  .wrap-chat {
    position: relative;
    width: 100%;
    height: 100%;
    .wrap-messages {
      display: block;
      height: calc(100% - 40px);
      overflow-x: hidden;
      overflow-y: scroll;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      // overflow-scrolling: touch;
      &.widget-is-active {
        height: calc(100% - (40px + 120px));
      }
      &.is-ios-safari {
        height: calc(100% - (40px + 114px + 40px));
      }
    }
    .widget-is-active.is-ios-safari {
      height: calc(100% - (40px + 120px + 114px));
    }
    // .wrap-input {
    //   .wrap-input-widgets {
    //     height: 120px;
    //   }
    // }
  }
  .wrap-now-loading {
    width: 100%;
    height: 100%;
  }
  &.is-preview-mode {
    height: calc(100% - 28px);
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
import ItemChatMessage from '@/components/item/ItemChatMessage'
import ItemChatInputText from '@/components/item/ItemChatInputText'
import ItemChatInputDate from '@/components/item/ItemChatInputDate'
import ItemChatInputSelection from '@/components/item/ItemChatInputSelection'
import ItemChatInputMultipleSelection from '@/components/item/ItemChatInputMultipleSelection'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')
const { mapState: mapStateScenarioForChat, mapActions: mapActionsScenarioForChat } = createNamespacedHelpers('scenarioForChat')

const { mapState: mapStateScenario } = createNamespacedHelpers('scenario')
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers('project')

export default {
  components: {
    ItemChatMessage,
    ItemChatInputText,
    ItemChatInputDate,
    ItemChatInputSelection,
    ItemChatInputMultipleSelection
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isAnonymous',
      'teamsThatUserBelongs',
      'teamAsGuest'
    ]),
    ...mapStateTeam([
      'teamId',
      'memberUsers'
    ]),
    ...mapStateRoom([
      'messages',
      'assignedUser',
      'roomUsers'
    ]),
    ...mapStateScenarioForChat([
      'currentScenario',
      'currentNode',
      'customVars'
    ]),
    ...mapStateScenario([
      'scenarioArray'
    ]),
    ...mapStateProject([
      'project'
    ])
  },
  props: {
    team: {
      type: Object,
      default: null
    },
    room: {
      type: Object,
      default: null
    },
    isPreviewMode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollTimer: null,
      widgetIsActive: false,
      iOSSafari: false,
      isNowLoading: true
    }
  },
  watch: {
    messages (newMessages) {
      clearTimeout(this.scrollTimer)

      if (newMessages[0] && newMessages[newMessages.length - 1].type === 'media') {
        // mediaNode needs more delay
        // if I learn how to detect scrollHeight of element, this can be better.
        this.scrollTimer = setTimeout(this.scrollToBottom, 800)
      } else {
        this.scrollTimer = setTimeout(this.scrollToBottom, 200)
      }
    },
    widgetIsActive () {
      if (this.widgetIsActive) this.scrollTimer = setTimeout(this.scrollToBottom, 200)
    }
  },
  async created () {
    // detect IOS safari
    var ua = window.navigator.userAgent
    var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
    var webkit = !!ua.match(/WebKit/i)
    this.iOSSafari = iOS && webkit && !ua.match(/CriOS/i)

    if (this.isPreviewMode) {
      this.initForPreview()
      return true
    }

    // await this.loadMemberUsers(this.team.id)
    await this.setUserTeamOf(this.uid)
    await this.loadRoomUsers({ teamId: this.team.id, roomId: this.room.id })
    await this.loadAssignedUser(this.room.assignedUid)
    await this.loadProject(this.room.assignedUid)
    await this.loadCustomVars({ teamId: this.team.id, roomId: this.room.id })
    await this.handleMessages({ teamId: this.team.id, roomId: this.room.id })

    if (this.isAnonymous && this.teamAsGuest[0] && this.teamAsGuest.includes(this.team.id)) {
      if (this.assignedUser.type === 'bot') {
        this.startScenario()
      }
    // if the user doesn't belong team
    } else if (this.isAnonymous && !this.teamAsGuest.includes(this.uid)) {
      // permission error
      await this.updateUserTeamAsGuest({
        uid: this.uid,
        teamId: this.team.id
      })
      // old scenario don't have 'openchat'
      this.startScenario()
    } else if (!this.ymous) {

    }

    this.isNowLoading = false
  },
  methods: {
    ...mapActionsAuth([
      'setUserTeamOf',
      'updateUserTeamAsGuest'
    ]),
    ...mapActionsTeam([
      'loadCurrentTeamId',
      'setTeamId'
    ]),
    ...mapActionsRoom([
      'handleMessages',
      'loadAssignedUser',
      'loadRoomUsers',
      'loadBotUserForPreview',
      'loadHumanUserForPreview',
      'setHumanUserForPreview',
      'resetMessages'
    ]),
    ...mapActionsScenarioForChat([
      'loadScenarioOf',
      'getFirstEventOf',
      'onEvent',
      'loadCustomVars',
      'setScenarioForPreview',
      'deleteMessagesForPreview'
    ]),
    ...mapActionsProject([
      'loadProject'
    ]),
    async staario () {
      await this.loadScenarioOf(this.assignedUser.projectId)
      var firstEvent = await this.getFirstEventOf(this.currentScenario)
      this.onEvent({
        nodeId: firstEvent,
        uid: this.room.assignedUid,
        teamId: this.team.id,
        roomId: this.room.id
      })
    },
    async initForPreview () {
      this.isNowLoading = true

      if (this.$route.name === 'preview') {
        this.setTeamId(this.$route.params.teamId)
      } else {
        await this.loadCurrentTeamId(this.uid)
      }
      var projectId = this.$route.params.id
      var roomId = `${projectId}-${this.uid}`

      await this.loadCustomVars({
        teamId: this.teamId,
        roomId: roomId,
        isPreviewMode: true
      })
      await this.loadBotUserForPreview({
        projectId: projectId,
        teamId: this.teamId
      })
      if (this.$route.name === 'preview') {
        this.setHumanUserForPreview(this.uid)
      } else {
        await this.loadHumanUserForPreview(this.uid)
      }

      await this.handleMessages({
        teamId: this.teamId,
        roomId: roomId,
        isPreviewMode: true
      })

      this.setScenarioForPreview(this.scenarioArray)
      var firstEvent = await this.getFirstEventOf(this.currentScenario)

      this.onEvent({
        nodeId: firstEvent,
        uid: 'previewBot',
        teamId: this.teamId,
        roomId: roomId,
        isPreviewMode: true
      })

      this.isNowLoading = false
    },
    async reloadPreview () {
      if (this.isNowLoading) return

      this.isNowLoading = true

      var projectId = this.$route.params.id
      var roomId = `${projectId}-${this.uid}`

      await this.deleteMessagesForPreview({
        messages: this.messages,
        teamId: this.teamId,
        roomId: roomId
      })
      this.resetMessages()

      this.setScenarioForPreview(this.scenarioArray)
      var firstEvent = await this.getFirstEventOf(this.currentScenario)

      this.onEvent({
        nodeId: firstEvent,
        uid: 'previewBot',
        teamId: this.teamId,
        roomId: roomId,
        isPreviewMode: true
      })

      this.isNowLoading = false
    },
    scrollToBottom () {
      var messagesWrapper = this.$refs.messagesWrapper
      if (messagesWrapper) {
        messagesWrapper.scrollTop = (messagesWrapper.scrollHeight - messagesWrapper.offsetHeight)
      }
    },
    openWidgetInput () {
      this.widgetIsActive = true
    },
    closeWidgetInput () {
      this.widgetIsActive = false
    }
  }
}
</script>
