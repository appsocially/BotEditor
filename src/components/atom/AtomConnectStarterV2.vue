<template lang="pug">

  div(:id="`connectStarter-${nodeId}`").wrap-atom-connect-starter
    
</template>

<style lang="scss">

.wrap-atom-connect-starter {
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
import entity from "../entity"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")

export default {
  props: {
    nodeId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      from: null
    }
  },
  created: function(){

  },
  mounted: function(){

    var connectStarter = d3.select(`#connectStarter-${this.nodeId}`).data([
      {nodeId: this.nodeId, starterId: `connectStarter-${this.nodeId}`}
    ])

    var dragOnConnectStarter = d3.behavior.drag()
      .origin(function(d) { return d })
      .on("dragstart", this.dragstartedOnConnectStarter)
      .on("drag", this.dragmoveOnConnectStarter)
      .on("dragend", this.dragendedOnConnectStarter)

    connectStarter.call(dragOnConnectStarter)

    // var starterId = `connectStarter-${this.nodeId}`
    // var elem = document.getElementById(starterId)
    // var pos = {}

    // var connectStarter = d3.select(`#${starterId}`).data([
    //   {nodeId: this.nodeId, starterId: starterId},
    // ])
    // connectStarter.call(nodeController.dragOnConnectStarter)
    
  },
  methods: {
    ...mapActions([
      'connectNode'
    ]),
    dragstartedOnConnectStarter (d) {
      d3.event.sourceEvent.stopPropagation()
      window.isDragingConnector = true
      $('#lineForPreview').show()

      var nodePos = $(`#${this.$parent.$el.id}`).position()
      
      this.from = {
        x: Math.round(nodePos.left + this.$parent.$el.offsetWidth + 8),
        y: Math.round(nodePos.top + this.$parent.$el.offsetHeight/2)
      }
      this.to = {
        x: Math.round(nodePos.left + this.$parent.$el.offsetWidth + 8),
        y: Math.round(nodePos.top + this.$parent.$el.offsetHeight/2)
      }
    },
    dragmoveOnConnectStarter (d) {
      this.to.x += d3.event.dx
      this.to.y += d3.event.dy

      console.log(this.to)

      var data = [
        {
          source: {x: this.from.x, y: this.from.y},
          target: {x: this.to.x, y: this.to.y}
        }
      ];

      var diagonal = d3.svg.diagonal()

      var svg = d3.select('#lineForPreview')
      svg.selectAll("path").remove()

      var from = this.from
      var to = this.to

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
        .attr("fill", "none")
        .attr("stroke", "#FF9A0A")
        .attr("d", d3.svg.line()
        .x(function(d) { return d.x })
        .y(function(d) { return d.y })
        .interpolate('bundle')(lineData))
    },
    dragendedOnConnectStarter (d) {
      window.isDragingConnector = false;

      if(!window.isHoveringOnNode){
        // 多分これやっちゃいけないやつ
        window.updateSelectorPosition(this.to, this.from, d.nodeId);
      } else {
        $('#lineForPreview').hide()
        
        var fromNodeEdges = entity.getConditions(window.scenarioArray, d.nodeId)
        var elseEdge = fromNodeEdges.filter((e) => { return (e.type === "else") })[0]

        if(elseEdge) {
          var uniqueStr = Math.random().toString(36).slice(-4)
          this.connectNode({fromId: this.nodeId, toId: window.nodeHovering.id, condition: "default", id: `default-${uniqueStr}-${d.nodeId}`})
        } else {
          this.connectNode({fromId: this.nodeId, toId: window.nodeHovering.id, condition: "else", id: `else-${d.nodeId}`})
        }

        var moduleCanvas = this.$parent.$parent.$parent
        moduleCanvas.loadNodesArray()

        var to = {
          x: $(`#${window.nodeHovering.id}`).position().left,
          y: $(`#${window.nodeHovering.id}`).position().top + $(`#${window.nodeHovering.id}`).height()/2
        }
        
        setTimeout(window.loadAllEdges, 10)
      }
    }
  }
}
</script>
