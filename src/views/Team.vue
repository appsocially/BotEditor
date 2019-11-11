<template lang="pug">
  Auth(:on-failed-authentication="onFailedAuthentication")
    UtilHeader
    div.wrap-home
      ModuleTeam

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
import ModuleTeam from '@/components/module/ModuleTeam'

export default {
  components: {
    Auth,
    UtilHeader,
    ModuleTeam
  },
  methods: {
    onFailedAuthentication () {
      this.$router.push('/sign-in')
    }
  }
}
</script>
