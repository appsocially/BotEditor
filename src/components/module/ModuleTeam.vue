<template lang="pug">
  Auth(@loggedIn="loggedIn" :on-failed-authentication="onFailedAuthentication")
    div.wrap-module-team.pt40
      ItemTeamProfile(v-if="team" :team="team").mb40
      // div.wrap-member
        ItemTeamMember(v-for="member in memberUsers" v-if="member.type === 'bot'"
          :member="member"
          :key="member.uid")
        ItemTeamMember(v-for="member in memberUsers"
          v-if="member.type === 'human' && !member.isAnonymous"
          :member="member"
          :key="member.uid")
        span(@click="logout") Sign Out

</template>

<style lang="scss">
.wrap-module-team {
  width: 100%;
  min-height: 100vh;
  .wrap-member {
    border-top: solid 1px rgba(0, 0, 0, 0.1);
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
import Auth from '@/components/auth'
import ItemTeamProfile from '@/components/item/ItemTeamProfile'
// import ItemTeamMember from '@/components/item/ItemTeamMember'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

export default {
  components: {
    Auth,
    ItemTeamProfile,
    // ItemTeamMember
  },
  computed: {
    ...mapStateAuth(['uid']),
    ...mapStateTeam(['team', 'memberUsers'])
  },
  methods: {
    ...mapActionsAuth(['signOut']),
    ...mapActionsTeam(['loadCurrentTeam']),
    logout () {
      this.signOut()
      setTimeout(() => {
        this.$router.push('/sign-in')
      }, 400)
    },
    loggedIn () {
      this.loadCurrentTeam(this.uid)
    },
    onFailedAuthentication () {
      this.$router.push('/sign-in')
    }
  }
}
</script>
