<template lang="pug">

  ItemNodeWrapper(ref="node" :content="content" @onResizeNode="onResizeNode").px12.pt10.pb8
    div.wrap-item-node-multiple-selection
      div.wrap-text.mb8
        AtomFlexibleTextarea(
          ref="text"
          :textId="content.id"
          :text="content.text"
          :width="160"
          :content="content"
        )
      div.wrap-selection
        div(v-for="selection in content.selections").selection.px4.py4.f.fm.mb8
          v-icon(size="16px" color="#2a2a2a").mr6 check_box
          AtomFlexibleTextarea(
            :textId="selection.id"
            :ref="selection.id"
            :text="selection.label"
            :width="120"
            :content="content"
            @onDelete="onDelete"
          )
      div.wrap-add-selection.f.fm
        span(@click="addSelection").pl4 + Add Selection
      div.wrap-starter.f.fh
        AtomConnectStarterV2(:nodeId="content.id")

</template>

<style lang="scss" scoped>
.wrap-item-node-multiple-selection {
  position: relative;
  background: #fff;
  .wrap-selection {
    .selection {
      background: #ffeb52;
    }
  }
  .wrap-add-selection {
    span {
      display: block;
      cursor: pointer;
      color: #FF9A0A;
      font-size: 14px;
    }
  }
  .wrap-starter {
    position: absolute;
    top: -0px;
    left: calc(100% + 14px);
    width: 18px;
    height: 100%;
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
      letDelete: false
    }
  },
  methods: {
    ...mapActions([
      'updateNode'
    ]),
    addSelection () {
      this.$emit("addOneSelectionInMultipleSelection", this.content.id)
      // this.updateNode(this.content)
    },
    onDelete (textId) {
      var currentValue = this.$refs[textId][0].valueText
      if (currentValue === "" && !this.letDelete) this.letDelete = true
      if (currentValue === "" && this.letDelete) {
        this.$emit("removeOneSelectionInMultipleSelection", textId, this.content.id)
        this.letDelete = false
      }
      this.updateNode(this.content)
    },
    onResizeNode (gapSize) {
      if (gapSize.height !== 0) {
        var newPos = {
          x: this.content.gui.position.x,
          y: this.content.gui.position.y - gapSize.height/2
        }
        // this.$emit("updateNodePosition", this.content.id, newPos)
      }
    }    
  }
}
</script>
