<template lang="pug">
  Auth(@loggedIn="loggedIn" @loginFailed="loginFailed")
    UtilHeader(:leftIcon="headerLeft")
    div.wrap-chat
      ModuleChat(v-if="team && room" :team="team" :room="room")

</template>

<style lang="scss" scoped>
.wrap-chat {
  width: 100%;
  min-height: calc(100vh - 48px);
  padding-top: 48px;
}
</style>

<script>
import { firebase } from '@/components/firebaseInit'

import Auth from '@/components/auth'

import UtilHeader from '@/components/util/UtilHeader'
import ModuleChat from '@/components/module/ModuleChat'

import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')

export default {
  components: {
    Auth,
    UtilHeader,
    ModuleChat
  },
  data () {
    return {
      headerLeft: {
        //to: "/openbots"
        to: "/sign-up"
      }
    }
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isAnonymous'
      // 'teamsThatUserBelongs'
    ]),
    ...mapStateTeam([
      'team'
    ]),
    ...mapStateRoom([
      'room'
    ])
  },
  async created () {
    
  },
  methods: {
    ...mapActionsAuth([
      'signInAnonymously',
      'createAnonymousUser'
    ]),
    ...mapActionsTeam([
      'setTeam'
    ]),
    ...mapActionsRoom([
      'createRoom',
      'setRoom'
    ]),
    async loggedIn () {
      console.log('authed')
      this.afterLoggedIn()
    },
    async afterLoggedIn () {
      if (!this.team) await this.setTeam(this.$route.params.teamId)

      // when user access /chat/:teamId
      if (this.$route.params.uid === undefined) {
        // if user is anonymous
        if (this.isAnonymous) {
          if (!this.room) await this.setRoom({ anonymousUid: this.uid, teamId: this.team.id })
          this.$router.push(`/${this.$route.params.teamId}/${this.uid}`)
        }
      } else {
        await this.setRoom({ anonymousUid: this.uid, teamId: this.team.id })
      }
    },
    async loginFailed () {
      console.log('unauthed')
      // if path: '/chat/:teamId'
      if (this.$route.params.uid === undefined) {
        // create room
        var user = await this.signInAnonymously()

        if (!this.team) await this.setTeam(this.$route.params.teamId)
        
        // create Chatroom
        await this.createRoom({
          anonymousUid: user.uid,
          teamId: this.$route.params.teamId,
          assignedUid: this.team.primary
        })

        await this.createAnonymousUser({
          uid: user.uid,
          teamId: this.team.id,
          roomId: this.room.id
        })

        // this.$router.push(`/chat/${this.$route.params.teamId}/${user.uid}`)
      }
    }
  }
}
</script>
