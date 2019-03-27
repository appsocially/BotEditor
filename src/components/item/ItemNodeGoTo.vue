<template lang="pug">

  div(@click='focus' @mouseover='over' @mouseleave='leave' :class='scaleUp').wrap-item-node-go-to.node
    div.wrap-to-num.f.fh
      span {{content.text}}
    div.wrap-delete
      atom-delete-node(:content='content' @callRemoveGoToNode='callRemoveGoToNode')
    
</template>

<style lang="scss">

.wrap-item-node-go-to {
  background: #FFF;
  position: absolute;
  border-radius: 30px;
  width: 46px;
  height: 46px;
  z-index: 100;
  .wrap-to-num {
    width: 100%;
    height: 100%;
  }
  
  .wrap-delete {
    display: none;
    position: absolute;
    left: 9px;
    top: -22px;
  }

  &.focused {
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    .wrap-delete {
      display: block;
    }
  }

  transition: transform 400ms ease, z-index 400ms ease, box-shadow 200ms ease;
  &.scale-up {
    transform: scale(1.05);
    z-index: 201;
  }
}

</style>

<script>

import nodeController from "../nodeController";

import AtomConnectStarter from "../atom/AtomConnectStarter";
import AtomDeleteNode from "../atom/AtomDeleteNode";

import entity from "../entity";

export default {
  name: 'ItemNodeSimpleMessage',
  components: {
    AtomConnectStarter,
    AtomDeleteNode,
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
      message: '',
      nodeTextSize: {},
      preNodeSize: {},
      textareaStyle: '',
      scaleUp: '',
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

    node.call(nodeController.dragOnNode);

  },
  methods: {
    over(){
      if(window.isDragingConnector){
        this.scaleUp = 'scale-up';
        window.isHoveringOnNode = true;
        window.nodeHovering = this.content;
      }
    },
    leave(){
      this.scaleUp = '';
      window.isHoveringOnNode = false;
      window.nodeHovering = '';
    },
    focus(){
      $('.focused').removeClass('focused');
      this.$el.classList.add('focused');
      $('#previewLineForGoTo').addClass('show');

      var toNode = entity.getContent(window.scenarioArray, this.content.toId);
      this.showPreviewLineForGoTo(
        this.content.gui.position,
        toNode.gui.position,
        this.content.toId
      );
    },
    callRemoveGoToNode(id){
      this.$emit('removeGoToNode', id);
      $('#previewLineForGoTo').removeClass('show');
    },
    showPreviewLineForGoTo(from, to, toId){
      var toNode = document.getElementById(toId);

      var data = [
        {
          source: {x: from.x+46, y: from.y+23},
          target: {x: to.x, y: to.y+toNode.offsetHeight/2}
        }
      ];

      var diagonal = d3.svg.diagonal();

      var svg = d3.select('#previewLineForGoTo');
      svg.selectAll("path").remove();
      svg.selectAll("path").data(data).enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#FFEB52")
        .attr("stroke-width", 2)
        .attr("d",diagonal);

    },
  },
};
</script>
