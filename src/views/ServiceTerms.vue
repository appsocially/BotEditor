<template lang="pug">

  div.wrap-terms-content
    util-header(:leftIcon="headerLeft")
    div.terms-content
     iframe(src="/service_terms.html")

</template>

<style lang="scss">

.wrap-terms-content {
  .terms-content {
    margin: 0 auto;
    width: 90%;
    max-width: 1080px;
    padding-top: 48px;
    iframe {
      border: none;
      width: 100%;
      height: calc(100vh - 48px);
    }
  }
}

</style>

<script>
import UtilHeader from "../components/util/UtilHeader"

export default {
  components: {
    UtilHeader
  },
  data() {
    return {
      headerLeft: {
        to: "/top"
      }
    }
  },
  created: function(){
    
  }
};
</script>
