<template lang="pug">
  Auth(:on-failed-authentication="onFailedAuthentication")
    UtilHeader(:leftIcon="headerLeft" :rightIcon="headerRight" :othersList="othersList")
    div.wrap-profile
      ModuleProfile(v-if="user" :user="user")

</template>

<style lang="scss">
.wrap-profile {
  width: 100%;
  min-height: 100vh;
  padding: 48px 0px;
}
</style>

<script>
import Auth from '@/components/auth'

import UtilHeader from '@/components/util/UtilHeader'
import ModuleProfile from '@/components/module/ModuleProfile'

import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

export default {
  components: {
    Auth,
    UtilHeader,
    ModuleProfile
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'isAnonymous'
    ])
  },
  data () {
    return {
      user: null,
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
  async created () {
    this.user = await this.getUserByUid(this.$route.params.uid)
  },
  methods: {
    ...mapActionsTeam([
      'getUserByUid'
    ]),
    onFailedAuthentication () {
      this.$router.push('/sign-in')
    }
  }
}
</script>
