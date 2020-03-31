<template lang="pug">
  Auth(@loggedIn="loggedIn" @loginFailed="loginFailed")
    UtilHeader(:leftIcon="headerLeft" :rightIcon="headerRight" :othersList="othersList")
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
import db, { api } from '@/components/firebaseInit'

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
        to: "/top"
      },
      headerRight: [
        {
          // label: this.$t("navigation.my_bots"),
          icon: "home",
          to: "/top"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "inbox",
          to: "/inbox"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "group",
          to: "/team"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "local_grocery_store",
          to: "/store"
        }
      ],
      othersList: [
        {
          label: this.$t("navigation.service_terms"),
          to: "/service-terms"
        },
        {
          label: this.$t("navigation.privacy_policy"),
          to: "/privacy-policy"
        },
        {
          label: this.$t("navigation.sign_out"),
          to: "/sign-in"
        }
      ]
    }
  },
  computed: {
    ...mapStateAuth(['uid', 'isAnonymous']),
    ...mapStateTeam(['team']),
    ...mapStateRoom(['room'])
  },
  async created () {
    this.resetMessages()

    // window.addEventListener('beforeunload', this.sendEmailWithCustomVars, false)
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
      'setRoom',
      'resetMessages'
    ]),
    async loggedIn () {
      console.log('authed')
      this.afterLoggedIn()
    },
    async afterLoggedIn () {
      if (this.isAnonymous) {
        this.headerRight = []
        this.othersList = null

        // Anonymous UserのDocがない場合（過去にプレヴューでアノニマスログインをしていた場合）
        var userDoc = await db.collection("users").doc(this.uid).get()
        if (!userDoc.exists) {
          var user = await this.signInAnonymously()
          
          if (!this.team) await this.setTeam(this.$route.params.teamId)
          
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
        }
      }
      
      if (!this.team) await this.setTeam(this.$route.params.teamId)
      
      // when user access /chat/:teamId
      if (this.$route.params.uid === undefined) {
        // if user is anonymous
        if (this.isAnonymous) {
          if (!this.room) await this.setRoom({ anonymousUid: this.uid, teamId: this.team.id, primary: this.team.primary })
          this.$router.push(`/${this.$route.params.teamId}/${this.uid}`)
        }
      } else if (this.isAnonymous) {
        await this.setRoom({ anonymousUid: this.uid, teamId: this.team.id })
      } else if (!this.isAnonymous) {
        var anonymousUid = this.$route.params.uid
        await this.setRoom({ anonymousUid, teamId: this.team.id })
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
    // sendEmailWithCustomVars (e) {
    //   fetch(`${api}/sendEmailWithCustomVars`, {
    //     method: 'POST',
    //     mode: 'cors',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       uid: this.uid,
    //       teamId: this.team.id
    //     })
    //   })

    //   console.log("call sendEmailWithCustomVars")

    //   var confirmMessage = 'ページを離れますか？'
    //   e.returnValue = confirmMessage
    //   return confirmMessage
    // }
  }
}
</script>
