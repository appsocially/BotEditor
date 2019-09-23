<template lang="pug">

  div(ref='dragDiv'
      :style='{top: `${content.gui.position.y}px`, left: `${content.gui.position.x}px`}'
      @click='focus'
      @mouseover='over'
      @mouseleave='leave'
      :class='scaleUp'
      :data-num='content.num'
      :data-id='content.id').wrap-item-node-media.node
    div.wrap-uploader
      atom-media-uploader(
        :imgId="content.id"
        :existingImg="content.mediaURI"
        @updateNodeContent="updateNodeContent")
    div.wrap-starter.f.fh
      atom-connect-starter(:nodeId='content.id' :id='starterId')
    div.wrap-num
      span {{content.num}}
    div.wrap-node-window.f.fc
      atom-node-window(:content='content' ref="toolWindow" @delete='callRemoveMediaNode')
    
</template>

<style lang="scss">

.wrap-item-node-media {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;

  width: 120px;
  height: 120px;
  .wrap-uploader {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
  }
  .wrap-starter {
    position: absolute;
    top: 0;
    left: 100%;
    width: 18px;
    height: 100%;
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

  .wrap-node-window {
    z-index: 101;
    position: absolute;
    bottom: 0px;
    top: calc(100% + 10px);
    width: 100%;
  }

  &.focused {
    z-index: 102 !important;
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
import AtomNodeWindow from "../atom/AtomNodeWindow"
import AtomMediaUploader from "../atom/AtomMediaUploader"

const { mapMutations } = createNamespacedHelpers(
 "edges"
);

export default {
  components: {
    AtomConnectStarter,
    AtomNodeWindow,
    AtomMediaUploader
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

    this.starterId = `connectStarter-${this.content.id}`
    this.message = this.content.text

  },
  mounted: function(){

    var id = this.content.id
    var pos = this.content.gui.position
    var node = d3.select(`#${id}`)
      .data([{pos: pos, id: id}])
      .style('top', `${pos.y}px`)
      .style('left', `${pos.x}px`)

    const coordinate = this.getCoordinates()
    this.set({
      id: this.content.id,
      next: this.content.next,
      ...coordinate
    })

    node.call(nodeController.dragOnNode)

    const node = d3.select(this.$refs.dragDiv)

  },
  methods: {
    ...mapMutations([
      'set'
    ]),
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
    updateNodeContent(uploadedImage){
      var newContent = this.content
      newContent.mediaURI = uploadedImage
      this.$emit('updateNode', newContent)
    },
    focus(){
      $('.focused').removeClass('focused')
      this.$el.classList.add('focused')
      $('#previewLineForGoTo').removeClass('show')

      $('.node-window-active').removeClass('node-window-active')
      this.$refs.toolWindow.$el.classList.add("node-window-active")
    },
    callRemoveMediaNode(id){
      this.$emit('removeMediaNode',  id)
    }
  },
}
</script>
