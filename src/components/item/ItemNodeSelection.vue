<template lang="pug">

  div(@click='focus'  @mouseover='over' @mouseleave='leave' :class='scaleUp' :data-num='content.num' :data-id='content.id').wrap-item-node-selection.node
    div.wrap-text.f.fm.px16.pt7.pb6
      span.text {{content.text}}
      textarea(v-model='message' :style='textareaStyle' @keydown='down' @keydown.enter.exact.prevent).text
    div.wrap-selections.px16.pb2
      atom-node-selection(v-for='item in selections' :id='item.id' :key='item.id' :content='item' ref='item.id' @loadAllEdges='loadAllEdges').atom-node-simple-message
    div.wrap-add-selection.px16.pb4
      span(@click='addSelection').pl4 + Add Selection
    div.wrap-num
      span {{content.num}}
    div.wrap-delete
      atom-delete-node(:content='content' @callRemoveSelectionMessage='callRemoveSelectionMessage')

</template>

<style lang="scss">

.wrap-item-node-selection {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;
  width: 180px;
  .wrap-text {
    position: relative;
    .text {
      font-size: 14px;
      max-width: 150px;
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
  }
  .wrap-add-selection {
    span {
      display: block;
      cursor: pointer;
      color: #FF9A0A;
      font-size: 14px;
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

  transition: transform 400ms ease, z-index 400ms ease, box-shadow 200ms ease;
  &.scale-up {
    transform: scale(1.05);
    z-index: 201;
  }

  &.focused {
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    .wrap-delete {
      display: block;
    }
  }
}

</style>

<script>

import nodeController from "../nodeController";

import AtomNodeSelection from "../atom/AtomNodeSelection";
import AtomConnectStarter from "../atom/AtomConnectStarter";
import AtomDeleteNode from "../atom/AtomDeleteNode";

export default {
  name: 'ItemNodeSelection',
  components: {
    AtomConnectStarter,
    AtomNodeSelection,
    AtomDeleteNode
  },
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      selections: [],
      message: '',
      nodeTextSize: {},
      preNodeSize: {},
      textareaStyle: '',
      scaleUp: '',
    }
  },
  created: function(){

    this.selections = this.content.selections;
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

  },
  watch: {
    message: function(newVal, oldVal){
      
    }
  },
  methods: {
    addSelection(){
      var id = this.content.id;
      var count = this.content.addedSelectionsCounter++;

      var selectionContent = {
        id: `${id}-${count}`,
        label: 'Selection'
      };

      this.preNodeSize.height = this.$el.offsetHeight;

      this.content.selections.push(selectionContent);

      //this.fixSize();
      setTimeout(this.fixSize, 100);
    },
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
      setTimeout(this.fixSize, 100);
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

      if(gapOfHeight!=0) this.loadAllEdges();
    },
    loadAllEdges(){
      this.$emit('loadAllEdges');
    },
    focus(){
      $('.focused').removeClass('focused');
      this.$el.classList.add('focused');
      $('#previewLineForGoTo').removeClass('show');
    },
    callRemoveSelectionMessage(id){
      this.$emit('removeSelectionMessage', id);
    },
  },
};
</script>
