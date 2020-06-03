<template lang="pug">

  div(:style="drawerWidthStyle").wrap-module-drawer
    item-drawer-list(v-for="list in lists" :list="list")

</template>

<style lang="scss">

.wrap-module-drawer {
  overflow-y: scroll;
  display: block;
  // position: absolute;
  // z-index: 105;
  width: 0;
  left: 0;
  /*width: 260px;*/
  height: calc(100vh - 48px);
  background: #FFF;
  border-right: solid 0.6px rgba(0, 0, 0, 0.2);

  transition: all 200ms ease-out;
}

</style>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
)

import ItemDrawerList from "@/components/item/ItemDrawerList"

export default {
  components: {
    ItemDrawerList
  },
  props: {
    showDrawer: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      drawerWidthStyle: "width: 0px;",
      lists: [
        {title: this.$t("canvas.drawer.menu.custom_variable.label"), type: "custom_variable"},
        {title: this.$t("canvas.drawer.menu.exports.label"), type: "exports"}
      ]
    }
  },
  computed: {
    // ...mapState([
    //   'customVars'
    // ]),
  },
  watch: {
    showDrawer (show) {
      this.drawerWidthStyle = (show)? "width: 340px" : "width: 0px;"     
    }
  },
  created: function(){
    
  },
  mounted: async function(){

  },
  methods: {
    update(){

    }
  },
  // computed: {
  //   ...mapState([
  //     'scenarioArray',
  //     'customVars'
  //   ]),
  // }
};
</script>
