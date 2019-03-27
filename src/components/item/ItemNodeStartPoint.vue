<template lang="pug">

  div(:data-num='content.num' :id='content.id' :data-id='content.id').wrap-item-node-simple-message.node
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')

</template>

<style lang="scss">

.wrap-item-node-simple-message {
  position: absolute;
  z-index: 100;
}

</style>

<script>

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
      starterId: '',
    }
  },
  created: function(){

    this.starterId = `connectStarter-${this.content.id}`;

  },
  mounted: function(){

    var id = this.content.id;
    var pos = this.content.gui.position;
    var node = d3.select(`#${id}`)
      .data([{pos: pos, id: id}])
      .style('top', `${pos.y}px`)
      .style('left', `${pos.x}px`);

  },
  methods: {
    
  },
};
</script>
