<template lang="pug">

  div(@click='focus' @mouseover='over' @mouseleave='leave' :class='scaleUp').wrap-item-node-simple-message
    div.wrap-text.f.fm.pl16.pr10.pt7.pb6
      span.text {{content.text}}
      textarea(v-model='message' :style='textareaStyle' @keydown='down' @keydown.enter.exact.prevent="addNewNode").text
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    div.wrap-num
      span {{content.num}}
    div.wrap-delete
      atom-delete-node(:content='content' ref='test' @callRemoveNormalMessageNode='callRemoveNormalMessageNode')
    
</template>

<style lang="scss">

.wrap-item-node-simple-message {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;
  .wrap-text {
    position: relative;
    .text {
      font-size: 14px;
      max-width: 140px;
      min-width: 30px;
      min-height: 16px;
      word-break: break-all;
      line-height: 1.2;
    }
    span {
      visibility: hidden;
      pointer-events: none;
    }
    textarea {
      resize: none;
      position: absolute;
      outline: none;
      overflow: hidden;
    }
    .wrap-starter {
      position: absolute;
      top: 0;
      left: 100%;
      width: 18px;
      height: 100%;
    }
  }
  .wrap-num {
    position: absolute;
    left: 2px;
    top: -22px;
    span {
      color: #AAA;
      font-size: 12px;
    }
  }
  .wrap-delete {
    display: none;
    position: absolute;
    right: 2px;
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
    this.message = this.content.text;

  },
  mounted: function(){

    var id = this.content.id;
    var pos = this.content.gui.position;
    var node = d3.select(`#${id}`)
      .data([{pos: pos, id: id}])
      .style('top', `${pos.y}px`)
      .style('left', `${pos.x}px`);

    node.call(nodeController.dragOnNode);


    this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8;
    this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight;

    this.textareaStyle = `width: ${this.nodeTextSize.width}px; height: ${this.nodeTextSize.height}px;`;

    
    var textarea = this.$el.children[0].children[1];
    textarea.select();

  },
  watch: {
    message: function(newVal, oldVal){
      
    }
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
    down(e){
      this.preNodeSize.height = this.$el.offsetHeight;

      this.content.text = e.target.value;

      //this.fixSize();
      setTimeout(this.fixSize, 10);
    },
    fixSize(){
      this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8;
      this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight;
      this.textareaStyle = `
        width: ${this.nodeTextSize.width}px;
        height: ${this.nodeTextSize.height}px;
        `;

      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height;
      this.content.gui.position.y -= gapOfHeight/2;

      var id = this.content.id;
      var pos = this.content.gui.position;
      var node = d3.select(`#${id}`)
        .data([{pos: pos, id: id}])
        .style('top', `${pos.y}px`)
        .style('left', `${pos.x}px`);

      if(gapOfHeight>0) this.$emit('loadAllEdges');
      //this.$emit('fixEdgeOfNormalNode', this.content);
    },
    addNewNode(){
      console.log('Add Single New Node');
    },
    focus(){
      $('.focused').removeClass('focused');
      this.$el.classList.add('focused');
    },
    callRemoveNormalMessageNode(id){
      this.$emit('removeNormalMessageNode',  id);
    }
  },
};
</script>
