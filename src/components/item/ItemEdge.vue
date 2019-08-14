<template lang="pug">

  svg(:id="`line-${content.id}`")
    
    
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
import { functions } from 'firebase';


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
  watch: {
    // content: function(newVal, oldVal){
    //   console.log("newVal", newVal)
    // },
    // content: {
    //   // the callback will be called immediately after the start of the observation
    //   immediate: true, 
    //   handler (val, oldVal) {
    //     // do your stuff
    //     console.log("ItemEdge Pos", val)
    //   }
    // }
  },
  created: function(){
    // debugger
    // console.log("ItemEdge created", this.content)
  },
  mounted: function(){
    this.draw()
  },
  // beforeDestroy: function(){
  //   var lines = d3.select('#lines')
  //   lines.select(`#line-${this.content.id}`).remove()
  // },
  // update: function(){
  //   console.log("ItemEdge updated", this.content.id)
  // },
  methods: {
    draw() {
      // console.log("ItemEdge draw", this.content.id)

      var id = this.content.id
      var from = this.content.from
      var to = this.content.to

      this.from = from
      this.to = to
      
      var data = [
        {
          source: {x: from.x, y: from.y},
          target: {x: to.x, y: to.y}
        }
      ]

      var diagonal = d3.svg.diagonal()

      var lines = d3.select('#lines')
      lines.select(`#line-${id}`).remove()
      lines.append('svg').attr("id", `line-${id}`)

      var dasharray = (this.content.id.split("-")[0] === "else")? "0 0": "6 6"

      var svg = d3.select('#lines').select(`#line-${id}`)
      var path = svg.selectAll("path").data(data).enter()
        .append("path")
        .attr("id", `line-${id}`)
        .attr("fill", "none")
        .attr("stroke", "#FF9A0A")
        .attr("stroke-dasharray", dasharray)
        .attr("d", diagonal)
    }
  }
};
</script>
