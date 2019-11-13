<template lang="pug">
  Auth(:on-failed-authentication="onFailedAuthentication")
    UtilHeader(:leftIcon="headerLeft" :rightIcon="headerRight" :othersList="othersList")
    div.wrap-home
      ModuleInbox(v-if="uid")

</template>

<style lang="scss">
.wrap-home {
  width: 100%;
  min-height: 100vh;
  padding: 48px 0px;
}
</style>

<script>
import Auth from '@/components/auth'

import UtilHeader from '@/components/util/UtilHeader'
import ModuleInbox from '@/components/module/ModuleInbox'

import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')

export default {
  components: {
    Auth,
    UtilHeader,
    ModuleInbox
  },
  computed: {
    ...mapStateAuth([
      'uid'
    ])
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
        // {
        //   label: this.$t("navigation.open_bots"),
        //   to: "/openbots"
        // }
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
  methods: {
    onFailedAuthentication () {
      this.$router.push('/sign-in')
    }
  }
}
</script>
