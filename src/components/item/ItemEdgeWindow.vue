<template lang="pug">

  div(@click="onToolWindow" :class="windowStatus" :style="positionStyle").wrap-item-edge-window
    div.wrap-line.f.fc
      div.line
        div.circle
    div.window.pt12
      span.window-title.mb12 Condition
      div.wrap-type-selector.px12
        v-select(:items="conditionTypes" label="Type" v-model="conditionTypeValue" @change="changeType")
      div.wrap-condition-content.px12
        atom-condition-content(ref="conditionContent" :conditionTypeValue='conditionTypeValue' :content='content')
      div(@click="onDisconnect").wrap-disconnect.f.fc.px12.py10
        div.f.fm.pr8
          v-icon.mr4.pb2 unfold_more
          span Disconnect

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
      font-weight: bold;
    }
    .wrap-disconnect {
      cursor: pointer;
      border-top: solid 0.6px rgba(0, 0, 0, 0.2);
      i {
        color: #F99;
        font-size: 20px;
        width: 10px;
      }
      span {
        color: #F99;
        text-align: center;
        font-weight: bold;
        display: block;
        white-space: nowrap;
      }
    }
  }

  /* animation */
  transition: transform 200ms ease, opacity 200ms ease;
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

import AtomConditionContent from "../atom/AtomConditionContent"

export default {
  components: {
    AtomConditionContent
  },
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
  computed: {
    ...mapState([
      'scenarioArray'
    ])
  },
  created: function(){
    
  },
  mounted: function(){

  },
  methods: {
    ...mapActions([
      'removeEdgeCondition'
    ]),
    setContent(content) {
      this.content = content
      this.conditionTypeValue = this.content.id.split("-")[0]
      if(this.conditionTypeValue === "default") this.conditionTypeValue = ""
      
      this.$nextTick(this.$refs.conditionContent.updateDefaultOption)
    },
    updatePosition(position) {
      const offsetX = this.$el.offsetWidth/2
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
      
    },
    onDisconnect () {
      this.removeEdgeCondition(this.content.id)
      this.removeLine(this.content.id)
      this.closeWindow()
    },
    removeLine(id){
      d3.select('#lines').select(`#line-${id}`).remove();
    }
  }
};
</script>
