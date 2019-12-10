<template lang="pug">

  div(ref='dragDiv'
    :style='{top: `${content.gui.position.y}px`, left: `${content.gui.position.x}px`}'
    :class="{'scale-up': letScaleUp}"
    :id="content.id"
    @click="onClick"
    @mouseover="over"
    @mouseleave="leave"
    v-resize:throttle="onResize").wrap-item-node-wrapper
    div.node-wrapper
      slot
      div.wrap-num
        span {{content.num}}
      div.wrap-node-window.f.fc
        AtomNodeWindow(:content='content'
          ref="toolWindow"
          @delete='onDelete')

</template>

<style lang="scss" scoped>
.wrap-item-node-wrapper {
  background: #fff;
  position: absolute;
  border-radius: 12px;
  z-index: 101;
  cursor: pointer;
  .node-wrapper {
    position: relative;
    .wrap-num {
      position: absolute;
      left: 0px;
      top: -32px;
      span {
        color: #aaa;
        font-size: 12px;
      }
    }
    .wrap-node-window {
      position: absolute;
      bottom: 0px;
      top: calc(100% + 20px);
      width: 100%;
      z-index: 101;
    }
  }
  &.focused {
    z-index: 102 !important;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
  }
  transition: transform 400ms ease, z-index 400ms ease, box-shadow 200ms ease;
  &.scale-up {
    transform: scale(1.05);
    z-index: 201;
  }
}
</style>

<script>
import resize from 'vue-resize-directive'

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers("scenario")

import entity from "../entity"

import AtomNodeWindow from "@/components/atom/AtomNodeWindow"

export default {
  components: {
    AtomNodeWindow
  },
  directives: {
    resize
  },
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      preNodeSize: null,
      letScaleUp: false,
      nodeArrayNames: [
        "normalMessageNodes",
        "selectionNodes",
        "multipleSelectionNodes",
        "openQuestionNodes",
        "askEmailNodes",
        "mediaNodes",
        "goToNodes"
      ]
    }
  },
  mounted: function () {
    var id = this.content.id
    var pos = this.content.gui.position
    var node = d3
      .select(`#${id}`)
      .data([{ pos: pos, id: id }])
      .style("top", `${pos.y}px`)
      .style("left", `${pos.x}px`)

    var dragOnNode = d3.behavior.drag()
      .origin(function (d) { 
        // console.log(d)
        return d 
      })
      .on("dragstart", this.dragstartedOnNode)
      .on("drag", this.dragmoveOnNode)
      .on("dragend", this.dragendedOnNode)

    node.call(dragOnNode)
    node = d3.select(this.$refs.dragDiv)

    this.preNodeSize = {
      width: this.$refs.dragDiv.offsetWidth,
      height: this.$refs.dragDiv.offsetHeight
    }
  },
  methods: {
    ...mapActions([
      'deleteNode',
      'disconnectNode'
    ]),
    dragstartedOnNode (d) {
      // console.log('Drag Started')
      d3.event.sourceEvent.stopPropagation()
    },
    dragmoveOnNode (d) {
      d.pos.x += d3.event.dx
      d.pos.y += d3.event.dy
      d3.select(this.$refs.dragDiv) //thisは対象のノード
        .style('top', `${d.pos.y}px`)
        .style('left', `${d.pos.x}px`)

      var moduleCanvas = this.$parent.$parent

      // ノードに繋がっているエッジの終点を変更
      var connectedEdges = entity.getEdgesThatConnectTo(moduleCanvas.scenarioArray, d.id)
      for (var i=0; i<connectedEdges.length; i++) {
        var id = connectedEdges[i].id
        
        var svg = d3.select(`#line-${id}`)
        var path = svg.selectAll("path")

        if(path[0] && path[0][0]){
          var data = path[0][0].__data__

          path.remove()

          data.target.x += d3.event.dx
          data.target.y += d3.event.dy

          moduleCanvas.updateEdge(data.source, data.target, id)
        }
      }

      // ノードから繋がってるedgeの始点を変更
      var growingEdges = entity.getEdgesThatConnectFrom(window.scenarioArray, d.id);
      for(var i=0; i<growingEdges.length; i++) {
        var id = growingEdges[i].id
        var svg = d3.select(`#line-${id}`)
        var path = svg.selectAll("path")

        if(path[0] && path[0][0]){
          var data = path[0][0].__data__

          path.remove()

          data.source.x += d3.event.dx
          data.source.y += d3.event.dy

          moduleCanvas.updateEdge(data.source, data.target, id)
        }
      }
    },
    dragendedOnNode (d) {
      var moduleCanvas = this.$parent.$parent
      moduleCanvas.updateNodePosition(d.id, d.pos)
      // this.$parent.$emit("updateNodePosition", d.id, d.pos)
    },
    onClick () {
      $(".focused").removeClass("focused")
      this.$refs.dragDiv.classList.add("focused")

      $('.node-window-active').removeClass('node-window-active')
      this.$refs.toolWindow.$el.classList.add("node-window-active")
    },
    onResize () {
      if (this.preNodeSize.width !== this.$refs.dragDiv.offsetWidth || this.preNodeSize.height !== this.$refs.dragDiv.offsetHeight) {
        var widthGap = this.$refs.dragDiv.offsetWidth - this.preNodeSize.width
        var heightGap = this.$refs.dragDiv.offsetHeight - this.preNodeSize.height
        this.$emit("onResizeNode", { width: widthGap, height: heightGap })
      }

      // デフォルトでy座表は変更
      if (this.preNodeSize.height !== this.$refs.dragDiv.offsetHeight) {
        var id = this.content.id
        var newPos = {
          x: this.content.gui.position.x,
          y: this.content.gui.position.y - heightGap/2
        }
        d3.select(`#${id}`)
          .data([{pos: newPos, id: id}])
          .style('top', `${newPos.y}px`)
          .style('left', `${newPos.x}px`)
        
        var moduleCanvas = this.$parent.$parent
        var targetNode

        for (var i=0; i<this.nodeArrayNames.length; i++) {
          if (!targetNode) {
            targetNode = moduleCanvas[this.nodeArrayNames[i]].filter((node) => { return node.id === this.content.id })[0]
          }
        }
        
        targetNode.gui.position = newPos
      }

      this.preNodeSize = {
        width: this.$refs.dragDiv.offsetWidth,
        height: this.$refs.dragDiv.offsetHeight
      }
    },
    onDelete () {
      var moduleCanvas = this.$parent.$parent

      for (var i=0; i<this.nodeArrayNames.length; i++) {
        moduleCanvas[this.nodeArrayNames[i]] = moduleCanvas[this.nodeArrayNames[i]].filter((node) => { return node.id !== this.content.id })
      }

      moduleCanvas.removeEdgesThatConnectNodeOf(this.content.id)

      this.deleteNode(this.content.id)
      this.disconnectNode(this.content.id)
    },
    over() {
      if (window.isDragingConnector) {
        this.letScaleUp = true
        window.isHoveringOnNode = true
        window.nodeHovering = this.content
      }
    },
    leave() {
      this.letScaleUp = false
      window.isHoveringOnNode = false
      window.nodeHovering = null
    }
  }
}
</script>
