<template lang="pug">

  svg.wrap-item
    
    
</template>

<style lang="scss">

.wrap-item-edge {
  position: absolute;
  width: 100%;
  height: 100%;
  path {
    pointer-events: all;
    cursor: pointer;
  }
}

</style>

<script>

import nodeController from "../nodeController";


export default {
  name: 'ItemEdge',
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

    debugger
  },
  mounted: function(){

    /*
    var id = this.content.id;
    var from = this.content.from;
    var to = this.content.to;
    
    var data = [
      {
        source: {x: from.x, y: from.y},
        target: {x: to.x, y: to.y}
      }
    ];

    var diagonal = d3.svg.diagonal();

    var lines = d3.select('#lines');
    lines.select(`#line-${id}`).remove();
    lines.append('svg').attr("id", `line-${id}`);

    var svg = d3.select('#lines').select(`#line-${id}`);
    var path = svg.selectAll("path").data(data).enter()
      .append("path")
      .attr("id", `line-${id}`)
      .attr("fill", "none")
      .attr("stroke", "#FF9A0A")
      .attr("d", diagonal);
    */

  }
};
</script>
