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

      var p2 = {
        x: from.x + (to.x - from.x)/2,
        y: from.y + (to.y - from.y)/2
      }

      var mp_f_p2 = {
        x: from.x + (p2.x - from.x)/2,
        y: from.y + (p2.y - from.y)/2
      }
      var cross_p1 = {
        x: p2.x,
        y: from.y
      }
      var p1 = {
        x: mp_f_p2.x + (cross_p1.x - mp_f_p2.x)/2,
        y: mp_f_p2.y + (cross_p1.y - mp_f_p2.y)/2
      }

      var mp_p2_t = {
        x: p2.x + (to.x - p2.x)/2,
        y: p2.y + (to.y - p2.y)/2
      }
      var cross_p2 = {
        x: p2.x,
        y: to.y
      }
      var p3 = {
        x: cross_p2.x + (mp_p2_t.x - cross_p2.x)/2,
        y: cross_p2.y + (mp_p2_t.y - cross_p2.y)/2
      }

      var lineData = [from, p1, p2, p3, to]

      var path = svg.selectAll("path").data(data).enter()
        .append("path")
        .on("click", this.onEdge)
        .attr("id", `line-${id}`)
        .attr("fill", "none")
        .attr("stroke", "#FF9A0A")
        .attr("stroke-dasharray", dasharray)
        .attr("d", d3.svg.line()
          .x(function(d) { return d.x })
          .y(function(d) { return d.y })
          .interpolate('bundle')(lineData))

    },
    removeLine() {
      var id = this.content.id
      var lines = d3.select('#lines')
      lines.select(`#line-${id}`).remove()
    },
    onEdge(data) {
      $('.node-window-active').removeClass('node-window-active')
      this.$emit("openEdgeWindow", this.content)
    },
    callRemoveEdge() {
      
    }
  }
};
</script>
