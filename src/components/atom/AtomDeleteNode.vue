<template lang="pug">

  span(@click='deleteNode').wrap-atom-delete Delete

</template>

<style lang="scss">

.wrap-atom-delete {
  font-size: 11px;
  color: #ff0300;
  cursor: pointer;
}

</style>

<script>

import entity from "../entity";

export default {
  name: 'AtomDeleteNode',
  components: {
  },
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      
    }
  },
  created: function(){

  },
  mounted: function(){

  },
  methods: {
    deleteNode(){
      console.log('Delete This Node::', this.content.id);

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

      switch(this.content.type){
        case 'normal':
          this.$emit('callRemoveNormalMessageNode', this.content.id);
        break;
        case 'selection':
          this.$emit('callRemoveSelectionMessage', this.content.id);
        break;
        case 'openquestion':
          this.$emit('callRemoveOpenQuestionNode', this.content.id);
        break;
        case 'goto':
          this.$emit('callRemoveGoToNode', this.content.id);
        break;
      }
      

    },
    removeLine(id){
      d3.select('#lines').select(`#line-${id}`).remove();
    }
  },
};
</script>
