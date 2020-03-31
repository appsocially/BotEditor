<template lang="pug">
  ItemNodeWrapper(ref="node" :content="content" @onResizeNode="onResizeNode").px12.pt10.pb8
    div.wrap-item-node-tmp
      div.wrap-item-content
        div.wrap-title.pb4
          AtomFlexibleTextarea(
            ref="title"
            :textId="content.id"
            :text="content.title"
            :width="160"
            :content="content")
        div.wrap-text.pt4
          AtomFlexibleTextarea(
            ref="text"
            :textId="content.id"
            :text="content.text"
            :width="160"
            :content="content")
        div.wrap-email-icon.f.fm
          v-icon(size="18px" color="#2a2a2a").mr2 notifications_active
          span Notification
      div.wrap-starter.f.fh
        AtomConnectStarterV2(:nodeId="content.id")
</template>

<style lang="scss" scoped>
.wrap-item-node-tmp {
  position: relative;
  background: #fff;
  .wrap-title {
    border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
  }
  .wrap-starter {
    position: absolute;
    top: -0px;
    left: calc(100% + 14px);
    width: 18px;
    height: 100%;
  }
  .wrap-email-icon {
    position: absolute;
    top: -30px;
    right: 0;
    span {
      font-size: 12px;
      font-weight: bold;
    }
  }
}
</style>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")
import ItemNodeWrapper from "@/components/item/ItemNodeWrapper"
import AtomNodeWindow from "@/components/atom/AtomNodeWindow"
import AtomConnectStarterV2 from "@/components/atom/AtomConnectStarterV2"
import AtomFlexibleTextarea from "@/components/atom/AtomFlexibleTextarea"

export default {
  components: {
    ItemNodeWrapper,
    AtomNodeWindow,
    AtomConnectStarterV2,
    AtomFlexibleTextarea
  },
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      
    }
  },
  methods: {
    ...mapActions([
      'updateNode'
    ]),
    onResizeNode (gapSize) {
      if (gapSize.height !== 0) {
        var newPos = {
          x: this.content.gui.position.x,
          y: this.content.gui.position.y - gapSize.height/2
        }
      }
    }    
  }
}
</script>
