<template lang="pug">

  div(ref='dragDiv' :style='{top: `${content.gui.position.y}px`, left: `${content.gui.position.x}px`}' @click='focus' @mouseover='over' @mouseleave='leave' :class='scaleUp' :data-num='content.num' :data-id='content.id').wrap-item-node-simple-message.node
    div.wrap-text.f.fm.pl16.pr16.pt7.pb6
      span.text {{content.text}}
      textarea(v-model='message' :style='textareaStyle' @keydown='down' @keydown.enter.exact.prevent="addNewNode").text
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    div.wrap-num
      span {{content.num}}
    // div.wrap-delete
      atom-delete-node(:content='content' @callRemoveNormalMessageNode='callRemoveNormalMessageNode')
    div.wrap-node-window.f.fc
      atom-node-window(:content='content' ref="toolWindow" @delete='callRemoveNormalMessageNode')
    
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

  .wrap-node-window {
    position: absolute;
    bottom: 0px;
    top: calc(100% + 10px);
    width: 100%;
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

import { createNamespacedHelpers } from "vuex"

import nodeController from "../nodeController"

import AtomConnectStarter from "../atom/AtomConnectStarter"
import AtomDeleteNode from "../atom/AtomDeleteNode"
import AtomNodeWindow from "../atom/AtomNodeWindow"

const { mapMutations } = createNamespacedHelpers(
 "edges"
);

export default {
  name: 'ItemNodeSimpleMessage',
  components: {
    AtomConnectStarter,
    AtomDeleteNode,
    AtomNodeWindow
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
      timer: {},
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

    const coordinate = this.getCoordinates();
    this.set({
      id: this.content.id,
      next: this.content.next,
      ...coordinate
    });

    node.call(nodeController.dragOnNode);

    const node = d3.select(this.$refs.dragDiv);
    //node.call(this.setUpDrag());


    this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8;
    this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight;

    this.textareaStyle = `width: ${this.nodeTextSize.width}px; height: ${this.nodeTextSize.height}px;`;

    
    var textarea = this.$el.children[0].children[1];
    textarea.select();


  },
  methods: {
    ...mapMutations([
      'set'
    ]),
    // setUpDrag(){
    //   return d3.behavior.drag()
    //     .origin(function(d) { 
    //       return d; 
    //     })
    //     //.on("dragstart", dragstartedOnNode)
    //     .on("drag", (d) => {
          
          
    //       this.content.gui.position.x += d3.event.dx;
    //       this.content.gui.position.y += d3.event.dy;
    //     })
    //     .on("dragend", (d) => {
    //       const coordinate = this.getCoordinates();
    //       this.set({
    //         id: this.content.id,
    //         next: this.content.next,
    //         ...coordinate
    //       });
    //     });

    // },
    getCoordinates(){

      const node = this.$refs.dragDiv

      const startPointOffset = 9
      
      const left = {
        x: node.offsetLeft,
        y: node.offsetTop + node.clientHeight/2
      }

      const right = {
        x: node.offsetLeft + node.clientWidth,
        y: node.offsetTop + node.clientHeight/2
      }

      const coordinate = {left: left, right: right}

      return coordinate

    },
    over(){
      if(window.isDragingConnector){
        this.scaleUp = 'scale-up'
        window.isHoveringOnNode = true
        window.nodeHovering = this.content
      }
    },
    leave(){
      this.scaleUp = ''
      window.isHoveringOnNode = false
      window.nodeHovering = ''
    },
    down(e){
      this.preNodeSize.width = this.$el.offsetWidth
      this.preNodeSize.height = this.$el.offsetHeight

      this.content.text = e.target.value

      this.$nextTick(this.fixSize)

      // コンテンツのセーブ
      clearTimeout(this.timer)
      this.timer = setTimeout(this.updateNodeContent, 400)

    },
    fixSize(){
      this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8
      this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight
      this.textareaStyle = `
        width: ${this.nodeTextSize.width}px;
        height: ${this.nodeTextSize.height}px;
        `;

      var gapOfWidth = this.$el.offsetWidth - this.preNodeSize.width
      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height

      this.content.gui.position.y -= gapOfHeight/2

      var id = this.content.id
      var pos = this.content.gui.position
      var node = d3.select(`#${id}`)
        .data([{pos: pos, id: id}])
        .style('top', `${pos.y}px`)
        .style('left', `${pos.x}px`)

      if(gapOfWidth!=0 || gapOfHeight>0) this.$emit('loadAllEdges')
      //this.$emit('fixEdgeOfNormalNode', this.content);
    },
    updateNodeContent(){
      this.$emit('updateNode',  this.content)
    },
    focus(){
      $('.focused').removeClass('focused')
      this.$el.classList.add('focused')
      $('#previewLineForGoTo').removeClass('show')

      $('.node-window-active').removeClass('node-window-active')
      this.$refs.toolWindow.$el.classList.add("node-window-active")
    },
    callRemoveNormalMessageNode(id){
      this.$emit('removeNormalMessageNode',  id)
    },
    addNewNode(){
      console.log("add")
    }
  },
};
</script>
