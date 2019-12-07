<template lang="pug">

  div(@click="onToolWindow").wrap-atom-node-window
    // div.wrap-triangle
      div.triangle
    div.window
      div(v-for="item in lists" :key="item.id" :class="item.id").menu
        v-icon {{item.icon}}
        span(@click="item.func") {{item.label}}
        div(v-if="item.id === 'show-custom-vars' && showCustomVar" :class="String(showCustomVar)").child-list
          div(v-if="hasCustomVar")
            div.wrap-id.pt8
              v-text-field(
                :label="customVarInputLabel"
                :value="content.customVariable.location"
                v-model="customVarLocationValue"
                ref="varNameInput")
            div.wrap-selector
              v-select(:items="varTypes" :label="customVarSelectorLabel" :value="content.customVariable.varType" v-model="customVarTypeValue")
          div(v-else).wrap-no-custom-var
            span.no-var.mb10 {{noCustomActionSentence}}
            div.f.fc
              span(@click="createVar").button-add {{noCustomVarAdd}}
          div.child-triangle
        //div(v-if="item.id === 'show-custom-action' && showCustomAction" :class="String(showCustomAction)").child-list
          div(v-if="hasCustomAction")
            div.wrap-id.pt8
              v-text-field(:label="customActionInputLabel" :value="content.customAction" v-model="customActionValue")
          div(v-else).wrap-no-custom-var
            span.no-var.mb10 {{noCustomActionSentence}}
            div.f.fc
              span(@click="createAction").button-add {{noCustomActionAdd}}
          div.child-triangle
      
</template>

<style lang="scss">

.wrap-atom-node-window {
  // .wrap-triangle {
  //   position: absolute;
  //   width: 100%;
  //   display: flex;
  //   justify-content: center;
  //   top: -9px;
  //   .triangle {
  //     border-right: 8px solid transparent;
  //     border-bottom: 10px solid #FFF;
  //     border-left: 8px solid transparent;
  //   }
  // }
  .window {
    max-width: 200px;
    background: #FFF;
    border-radius: 3px;
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    .menu {
      position: relative;
      overflow: visible;
      display: flex;
      align-items: center;
      margin: 0 auto;
      padding: 10px 14px 8px 12px;
      cursor: pointer;
      i {
        color: #ff9a0a;
        font-size: 18px;
        margin-right: 8px;
        width: 16px;
      }
      span {
        color: #ff9a0a;
        text-align: center;
        display: block;
        white-space: nowrap;
      }
      .child-list {
        display: flex;
        position: absolute;
        width: 200px;
        left: calc(100% + 14px);
        top: 0;
        padding: 12px 16px 12px 16px;
        border-radius: 3px;
        background: #FFF;
        box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
        transition: all 400ms ease;
        opacity: 0.0;
        transform: translateX(0px);
        .wrap-id {
          width: 160px;
          margin-right: 8px;
        }
        .wrap-selector {
          width: 100px;
        }
        .child-triangle {
          position: absolute;
          top: 12px;
          right: 100%;
          border-top: 8px solid transparent;
          border-right: 10px solid #FFF;
          border-bottom: 8px solid transparent;
        }
        .wrap-no-custom-var {
          .no-var {
            text-align: center;
            color: #999;
            font-size: 12px;
            white-space: normal;
          }
          .button-add {
            text-align: center;
            background: #ff9a0a;
            padding: 8px 14px;
            border-radius: 8px;
            color: #FFF;
            font-size: 10px;
            cursor: pointer;
          }
        }
        &.true {
          opacity: 1.0 !important;
        }
      }
    }
    .delete-node {
      border-top: solid rgba(0,0,0,0.2) 0.4px;
      i {
        color: #F99;
      }
      span {
        color: #F99;
      }
    }
  }

  /* animation */
  transition: all 200ms linear;
  transform: scale(0.0);
  opacity: 0.0;
  &.node-window-active {
    transform: scale(1.0) !important;
    opacity: 1.0 !important;
  }
}

</style>

<script>

import entity from "../entity"

import { createNamespacedHelpers } from "vuex";
import { setTimeout } from 'timers';
const { mapState, mapActions } = createNamespacedHelpers(
 "scenario"
)

export default {
  name: 'AtomNodeWindow',
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      lists: [],
      windowStatus: '',
      showCustomVar: false,
      showCustomAction: false,
      hasCustomVar: false,
      hasCustomAction: false,
      varTypes: ['String', 'Number'],
      customVarLocationValue: '',
      customVarTypeValue: '',
      customActionValue: '',
      timer: {},
      noCustomVarSentence: this.$t("canvas.tool_window.node.custom_var.no_content.sentence"),
      noCustomVarAdd: this.$t("canvas.tool_window.node.custom_var.no_content.add"),
      noCustomActionSentence: this.$t("canvas.tool_window.node.custom_action.no_content.sentence"),
      noCustomActionAdd: this.$t("canvas.tool_window.node.custom_action.no_content.add"),
      customVarInputLabel: this.$t("canvas.tool_window.node.custom_var.content.input_label"),
      customVarSelectorLabel: this.$t("canvas.tool_window.node.custom_var.content.type_label"),
      customActionInputLabel: this.$t("canvas.tool_window.node.custom_action.content.input_label")
    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
    ])
  },
  created: function(){
    
    switch(this.content.type){
      case 'normal':
        this.lists = [
          // {
          //   label: this.$t("canvas.tool_window.node.custom_action.label"),
          //   icon: 'add_comment',
          //   id: 'show-custom-action',
          //   func: this.toggleCustomActionMenu
          // },
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'selection':
        this.lists = [
          {
            label: this.$t("canvas.tool_window.node.custom_var.label"),
            icon: 'monetization_on',
            id: 'show-custom-vars',
            func: this.toggleCuostomVarMenu
          },
          // {
          //   label: this.$t("canvas.tool_window.node.custom_action.label"),
          //   icon: 'add_comment',
          //   id: 'show-custom-action',
          //   func: this.toggleCustomActionMenu
          // },
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'multipleselection':
        this.lists = [
          {
            label: this.$t("canvas.tool_window.node.custom_var.label"),
            icon: 'monetization_on',
            id: 'show-custom-vars',
            func: this.toggleCuostomVarMenu
          },
          // {
          //   label: this.$t("canvas.tool_window.node.custom_action.label"),
          //   icon: 'add_comment',
          //   id: 'show-custom-action',
          //   func: this.toggleCustomActionMenu
          // },
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ]

        this.varTypes = ['Array']
      break;

      case 'openquestion':
        this.lists = [
          {
            label: this.$t("canvas.tool_window.node.custom_var.label"),
            icon: 'monetization_on',
            id: 'show-custom-vars',
            func: this.toggleCuostomVarMenu
          },
          // {
          //   label: this.$t("canvas.tool_window.node.custom_action.label"),
          //   icon: 'add_comment',
          //   id: 'show-custom-action',
          //   func: this.toggleCustomActionMenu
          // },
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'media':
        this.lists = [
          // {
          //   label: this.$t("canvas.tool_window.node.custom_action.label"),
          //   icon: 'add_comment',
          //   id: 'show-custom-action',
          //   func: this.toggleCustomActionMenu
          // },
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'goto':
        this.lists = [
          {
            label: this.$t("canvas.tool_window.node.delete.label"),
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;
    }

    if(this.content.customVariable) {
      this.customVarLocationValue = this.content.customVariable.location
      this.customVarTypeValue = this.content.customVariable.varType
      this.hasCustomVar = true
    }
    if(this.content.customAction) {
      this.customActionValue = this.content.customAction
      this.hasCustomAction = true
    }
  },
  mounted: function(){

  },
  watch: {
    showToolWindow(newVal, oldVal){
      this.windowStatus = (newVal)? 'active' : ''
    },
    customVarLocationValue(newVal, oldVal){

      // invalidな変数名を検知
      try {
        if(newVal !== "") eval(`var ${newVal}`)
        if(newVal !== oldVal && oldVal !== "" && newVal !== ""){
          clearTimeout(this.timer)
          this.timer = setTimeout(this.updateVar, 1000)
        }
      } catch(e) {
        console.log("invalid")
        this.$nextTick(() => { this.customVarLocationValue = this.content.customVariable.location })
        return
      }

      
    },
    customVarTypeValue(newVal, oldVal){
      if(newVal !== oldVal && oldVal !== ""){
        clearTimeout(this.timer)
        this.timer = setTimeout(this.updateVar, 1000)
      }
    },
    customActionValue(newVal, oldVal){
      if(newVal !== oldVal && oldVal !== ""){
        clearTimeout(this.timer)
        this.timer = setTimeout(this.updateAction, 1000)
      }
    }
  },
  methods: {
    ...mapActions([
      'updateCustomVar',
      'addCustomVar',
      'updateCustomAction',
      'addCustomAction'
    ]),
    onToolWindow(e) {
      e.stopPropagation()
    },
    activateWindow() {
      this.windowStatus = 'active'
    },
    toggleCuostomVarMenu() {
      this.showCustomAction = false
      this.showCustomVar = !this.showCustomVar
    },
    toggleCustomActionMenu() {
      this.showCustomVar = false
      this.showCustomAction = !this.showCustomAction
    },
    createVar() {
      this.addCustomVar({
        nodeId: this.content.id,
        location: `cv${this.content.num}`,
        varType: this.varTypes[0]
      })
      this.customVarLocationValue = this.content.customVariable.location
      this.customVarTypeValue = this.content.customVariable.varType
      this.hasCustomVar = true
    },
    updateVar() {
      this.updateCustomVar({
        nodeId: this.content.id,
        location: this.customVarLocationValue, // this.content.customVariable.location,
        varType: this.customVarTypeValue // this.content.customVariable.varType
      })
      console.log("Current Var Name", this.content.customVariable.location)
    },
    createAction() {
      this.addCustomAction({
        nodeId: this.content.id,
        customAction: `ca${this.content.num}`
      })
      this.customActionValue = this.content.customAction
      this.hasCustomAction = true
    },
    updateAction() {
      this.updateCustomAction({
        nodeId: this.content.id,
        customAction: this.customActionValue
      })
    },
    deleteNode(e) {
      e.stopPropagation()

      // 繋がっているエッジをcanvasから削除
      var connectedNodes = entity.getNodesThatConnectTo(this.scenarioArray, this.content.id)
      for(var i=0; i<connectedNodes.length; i++){
        this.removeLine(connectedNodes[i].id)
        // disconnect
        
      }

      if(this.content.nodeType == 'single') {
        this.removeLine(this.content.id)
      }else{
        var selections = this.content.selections
        for(var i=0; i<selections.length; i++){
          this.removeLine(selections[i].id)
        }
      }

      this.$emit("delete", this.content.id)
    },
    removeLine(id){
      d3.select('#lines').select(`#line-${id}`).remove();
    }
  }
};
</script>
