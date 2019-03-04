<template lang="pug">

  div.wrap-item
    div.wrap-text.f.fm.px16.pt7.pb6
      span.text {{content.text}}
    div.wrap-selections.px16.pb8
      atom-node-selection(v-for='item in selections' :id='item.id' :key='item.id' :content='item').atom-node-simple-message
      //div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    
</template>

<style lang="scss">

.wrap-item {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;
  .wrap-text {
    position: relative;
    .text {
      font-size: 14px;
    }
  }
}

</style>

<script>

import nodeController from "../nodeController";

import AtomNodeSelection from "../atom/AtomNodeSelection";
import AtomConnectStarter from "../atom/AtomConnectStarter";

export default {
  name: 'ItemNodeSelection',
  components: {
    AtomConnectStarter,
    AtomNodeSelection,
  },
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      selections: [],
    }
  },
  created: function(){

    this.selections = this.content.selections;

  },
  mounted: function(){

    //console.log(nodeController);

    var id = this.content.id;
    var pos = this.content.gui.position;
    var node = d3.select(`#${id}`)
      .data([{pos: pos, id: id}])
      .style('top', `${pos.y}px`)
      .style('left', `${pos.x}px`);

    node.call(nodeController.dragOnNode);
    
  }
};
</script>
