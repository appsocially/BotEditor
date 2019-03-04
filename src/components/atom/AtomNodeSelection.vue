<template lang="pug">

  div.wrap-atom-selection
    div.wrap-label.px8.pt4.pb3.mb4
      span.label {{content.label}}
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    
</template>

<style lang="scss">

.wrap-atom-selection {
  display: inline;
  width: 100%;
  .wrap-label {
    position: relative;
    background: #FFEB52;
    border-radius: 4px;
    .label {
      font-size: 14px;
    }
    .wrap-starter {
      position: absolute;
      top: 0;
      left: 100%;
      width: 18px;
      height: 100%;
    }
    
  }
}

</style>

<script>

import nodeController from "../nodeController";

import AtomConnectStarter from "./AtomConnectStarter";

export default {
  name: 'AtomNodeSelection',
  components: {
    AtomConnectStarter,
  },
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      starterId: ''
    }
  },
  created: function(){

    this.starterId = `connectStarter-${this.content.id}`;

  },
  mounted: function(){

    //console.log(nodeController);

    /*
    var id = this.content.id;
    var pos = this.content.gui.position;
    var node = d3.select(`#${id}`)
      .data([{pos: pos, id: id}])
      .style('top', `${pos.y}px`)
      .style('left', `${pos.x}px`);

    node.call(nodeController.dragOnNode);
    */
    
  }
};
</script>
