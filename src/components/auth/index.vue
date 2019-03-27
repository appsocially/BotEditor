<template>
  <div>
    <slot :sign-out="signOut"/>
  </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
const { mapState, mapActions, mapMutations } = createNamespacedHelpers(
 "auth"
);

/*
const { mapState as mapStateScenario, mapActions as mapActionsScenario, mapGetters as mapGettersScenario} = createNamespacedHelpers(
 "scenario"
);
*/

export default {
  props: {
    onFailedAuthentication: {
      type: Function,
      required: true
    }
  },
  computed: {
    ...mapState(['uid', 'isLoggedIn', 'isAuthenticating', 'onboardingData'])
  },
  watch: {
    // Check if we should login again if authentication info changes
    isAuthenticating(isAuthenticating) {
      this.checkAuthStatus(isAuthenticating, this.isLoggedIn)
    },
    // Check if we should login again if isLoggedIn info changes
    isLoggedIn(isLoggedIn) {
      this.checkAuthStatus(this.isAuthenticating, isLoggedIn)
    }
  },
  created() {
    this.setupAuthStateHandler()
    // Check our auth status when we first start rendering
    this.checkAuthStatus(this.isAuthenticating, this.isLoggedIn)
  },
  methods: {
    ...mapMutations([
      'updateOnboardingData',
      'updateIsSigningOut',
      'updateAuthStatus'
    ]),
    ...mapActions(['setupAuthStateHandler', 'signOut', 'getUserData']),
    // Check if we need to login, or if we are logged in
    async checkAuthStatus(isAuthenticating, isLoggedIn) {
      if (!isAuthenticating && !isLoggedIn) {
        // Will probably redirect somewhere if can't log in
        this.onFailedAuthentication()
      } else if (isLoggedIn) {
        const data = await this.getUserData()
        this.$emit('loggedIn', data)
      }
    }
  }
}
</script>