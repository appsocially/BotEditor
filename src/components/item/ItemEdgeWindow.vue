<template lang="pug">

  div(@click="onToolWindow" :class="windowStatus" :style="positionStyle").wrap-item-edge-window
    div.wrap-line.f.fc
      div.line
        div.circle
    div.window.px12.py12
      span.window-title.mb12 Condition
      div.wrap-type-selector
        v-select(:items="conditionTypes" label="Type" v-model="conditionTypeValue" @change="changeType")

</template>

<style lang="scss">

.wrap-item-edge-window {
  position: absolute;
  z-index: 110;
  .wrap-line {
    width: 100%;
    height: 60px;
    .line {
      position: relative;
      display: block;
      width: 2px;
      height: 100%;
      background: #FF9A0A;
      .circle {
        position: absolute;
        top: -3px;
        left: calc(50% - 3px);
        display: block;
        width: 6px;
        height: 6px;
        background: #FF9A0A;
      }
    }
  }
  .window {
    max-width: 200px;
    background: #FFF;
    border-radius: 3px;
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    .window-title {
      display: block;
      text-align: center;
      font-size: 14px;
    }

  }

  /* animation */
  transition: all 200ms ease;
  transform: scale(0.0);
  opacity: 0.0;
  &.active {
    transform: scale(1.0) !important;
    opacity: 1.0 !important;
  }
}

</style>

<script>

import entity from "../entity"

import { createNamespacedHelpers } from "vuex"
import { setTimeout } from 'timers'
const { mapState, mapActions } = createNamespacedHelpers(
 "scenario"
)

export default {
  name: 'AtomNodeWindow',
  props: {
    // content: {
    //   type: Object,
    //   required: true,
    // }
  },
  data() {
    return {
      content: {},
      conditionTypes: ["else", "custom_var"],
      conditionTypeValue: "else",
      targetEdge: {},
      windowStatus: '',
      positionStyle: 'left: 0px; top: 0px;',
      timer: {}
    }
  },
  created: function(){
    
  },
  mounted: function(){

  },
  methods: {
    ...mapActions([
      
    ]),
    setContent(content) {
      this.content = content
      this.conditionTypeValue = this.content.id.split("-")[0]
      if(this.conditionTypeValue === "default"){
        this.conditionTypeValue = ""
      }
    },
    updatePosition(position) {
      const offsetX = 200/2
      const offsetY = 0/2
      this.positionStyle = `left: ${position.x - offsetX}px; top: ${position.y - offsetY}px;`
    },
    onToolWindow(e) {
      e.stopPropagation()
    },
    activateWindow() {
      this.windowStatus = 'active'
    },
    closeWindow() {
      this.windowStatus = ''
    },
    changeType() {
     this.$emit("updateEdgeType", this.conditionTypeValue, this.content)
    },
    toggleChildMenu() {
    
    },
    deleteEdge() {
    
    }
  }
};
</script>
