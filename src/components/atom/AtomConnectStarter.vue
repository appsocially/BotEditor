<template lang="pug">

  div.wrap-atom
    
</template>

<style lang="scss">

.wrap-atom {
  display: block;
  width: 8px;
  height: 8px;
  background: #FF9A0A;
  border-radius: 50%;
  cursor: pointer;
  z-index: 102;
}

</style>

<script>

import nodeController from "../nodeController";

export default {
  name: 'AtomConnectStarter',
  props: {
    nodeId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      //starterId: '',
    }
  },
  created: function(){

  },
  mounted: function(){

    var starterId = `connectStarter-${this.nodeId}`;
    var elem = document.getElementById(starterId);
    var pos = {};
    var connectStarter = d3.select(`#${starterId}`).data([
      {nodeId: this.nodeId, starterId: starterId},
    ]);

    connectStarter.call(nodeController.dragOnConnectStarter);
  }
};
</script>
