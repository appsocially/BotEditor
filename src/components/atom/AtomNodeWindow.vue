<template lang="pug">

  div.wrap-atom-node-window
    // div.wrap-triangle
      div.triangle
    div.window
      div(v-for="item in lists" :key="item.id" :class="item.id").menu
        v-icon {{item.icon}}
        span(@click="item.func") {{item.label}}
    
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
        list-style: none;
        display: block;
        white-space: nowrap;
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
      showCustomVar: false,
      varTypes: ['String', 'Boolean', 'Number'],
      windowStatus: ''
    }
  },
  created: function(){
    switch(this.content.type){
      case 'normal':
        this.lists = [
          {
            label: 'Delete Node',
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'selection':
        this.lists = [
          {
            label: 'Custom Var to get',
            icon: 'monetization_on',
            id: 'show-custom-vars',
            func: this.toggleCuostomVarMenu
          },
          {
            label: 'Delete Node',
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'openquestion':
        this.lists = [
          {
            label: 'Custom Var to get',
            icon: 'monetization_on',
            id: 'show-custom-vars',
            func: this.toggleCuostomVarMenu
          },
          {
            label: 'Delete Node',
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;

      case 'goto':
        this.lists = [
          {
            label: 'Delete Node',
            icon: 'delete',
            id: 'delete-node',
            func: this.deleteNode
          }
        ];
      break;
    }
  },
  mounted: function(){

  },
  watch: {
    showToolWindow(newVal, oldVal){
      this.windowStatus = (newVal)? 'active' : ''
    }
  },
  methods: {
    activateWindow() {
      this.windowStatus = 'active'
    },
    toggleCuostomVarMenu() {
      this.showCustomVar = !this.showCustomVar
    },
    deleteNode(e) {
      e.stopPropagation()

      // 繋がっているエッジをcanvasから削除
      var connectedNodes = entity.getNodesThatConnectTo(window.scenarioArray, this.content.id);
      for(var i=0; i<connectedNodes.length; i++){
        this.removeLine(connectedNodes[i].id);
        // disconnect
      }

      if(this.content.nodeType == 'single'){
        this.removeLine(this.content.id);
      }else{
        var selections = this.content.selections;
        for(var i=0; i<selections.length; i++){
          this.removeLine(selections[i].id);
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
