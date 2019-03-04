<template lang="pug">

  div.wrap-item
    div.wrap-text.f.fm.px16.pt5.pb4
      span.text {{content.text}}
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    
</template>

<style lang="scss">

.wrap-item {
  /*overflow: visible;*/
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;
  .wrap-text {
    position: relative;
    .text {
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

import AtomConnectStarter from "../atom/AtomConnectStarter";

export default {
  name: 'ItemNodeSimpleMessage',
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
