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
  .wrap-node-window {
    position: absolute;
    bottom: 0px;
    top: calc(100% + 10px);
    width: 100%;
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
      show: false
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
  beforeUpdate: function(){
    this.removeLine()
  },
  updated: function(){
    this.draw()
  },
  // beforeDestroy: function(){
  //   debugger
  //   this.removeLine()
  //
  //   // var lines = d3.select('#lines')
  //   // lines.select(`#line-${this.content.id}`).remove()
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
        .on("click", this.onEdge)
        .attr("id", `line-${id}`)
        .attr("fill", "none")
        .attr("stroke", "#FF9A0A")
        .attr("stroke-dasharray", dasharray)
        .attr("d", diagonal)

      // var midPoint = {
      //   x: from.x + (to.x - from.x)/4,
      //   y: from.y + (to.y - from.y)*3/4
      // }
      // var lineData = [from, midPoint, to]

      // var path = svg.selectAll("path").data(data).enter()
      //   .append("path")
      //   .on("click", this.onEdge)
      //   .attr("id", `line-${id}`)
      //   .attr("fill", "none")
      //   .attr("stroke", "#FF9A0A")
      //   .attr("stroke-dasharray", dasharray)
      //   .attr("d", d3.svg.line()
      //     .x(function(d) { return d.x; })
      //     .y(function(d) { return d.y; })
      //     .interpolate('basis')(lineData))

    },
    removeLine() {
      var id = this.content.id
      var lines = d3.select('#lines')
      lines.select(`#line-${id}`).remove()
    },
    onEdge() {
      $('.node-window-active').removeClass('node-window-active')
      this.$emit("openEdgeWindow", this.content)
    },
    callRemoveEdge() {
      
    }
  }
};
</script>
