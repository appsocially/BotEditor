<template lang="pug">

  div(@click='focus' @mouseover='over' @mouseleave='leave' :class='scaleUp' :data-num='content.num' :data-id='content.id').wrap-item-node-open-question.node
    div.wrap-text.f.fm.px10.pt10.pb6
      span.text {{message}}
      textarea(v-model='message' :style='textareaStyle' @keydown='down' @keydown.enter.exact.prevent="addNewNode").text
    div.wrap-expected-answer.f.fm.px10.pt6.pb10
      span.expected-answer {{expectedAnswerModel}}
      textarea(v-model='expectedAnswerModel' :style='textareaStyleOfExpectedAnswer' @keydown='downOnExpectedAnswer' @keydown.enter.exact.prevent="addNewNode").expected-answer
    div.wrap-starter.f.fh
      atom-connect-starter(:nodeId='content.id' :id='starterId')
    div.wrap-num
      span {{content.num}}
    // div.wrap-delete
      atom-delete-node(:content='content' ref='test' @callRemoveOpenQuestionNode='callRemoveOpenQuestionNode')
    div.wrap-node-window.f.fc
      atom-node-window(:content='content' ref="toolWindow" @delete='callRemoveOpenQuestionNode')


</template>

<style lang="scss">

.wrap-item-node-open-question {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  z-index: 100;
  .wrap-text {
    position: relative;
    border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
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
  }
  .wrap-expected-answer {
    position: relative;
    .expected-answer {
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
      color: #999;
      resize: none;
      position: absolute;
      outline: none;
      overflow: hidden;
    }
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

import nodeController from "../nodeController";

import AtomConnectStarter from "../atom/AtomConnectStarter";
import AtomDeleteNode from "../atom/AtomDeleteNode";
import AtomNodeWindow from "../atom/AtomNodeWindow";

export default {
  name: 'ItemNodeOpenQuestion',
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
      expectedAnswerModel: '',
      nodeTextSize: {},
      nodeExpectedAnswerSize: {},
      textareaStyle: '',
      textareaStyleOfExpectedAnswer: '',
      preNodeSize: {},
      scaleUp: '',
      timer: {},
    }
  },
  created: function(){

    this.starterId = `connectStarter-${this.content.id}`;
    this.message = this.content.text;
    this.expectedAnswerModel = this.content.expectedAnswer;

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

    this.nodeExpectedAnswerSize.width = this.$el.children[1].firstChild.offsetWidth + 8;
    this.nodeExpectedAnswerSize.height = this.$el.children[1].firstChild.offsetHeight;
    this.textareaStyleOfExpectedAnswer = `width: ${this.nodeExpectedAnswerSize.width}px; height: ${this.nodeExpectedAnswerSize.height}px;`;
    
    var textarea = this.$el.children[0].children[1];
    textarea.select();

  },
  watch: {
    message: function(newVal, oldVal){
      
    },
    expectedAnswerModel: function(newVal, oldVal){
      
    },
  },
  methods: {
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
      this.timer = setTimeout(this.updateNodeContent, 800)
    },
    fixSize(){
      this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8
      this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight
      this.textareaStyle = `
        width: ${this.nodeTextSize.width}px
        height: ${this.nodeTextSize.height}px
        `

      var gapOfWidth = this.$el.offsetWidth - this.preNodeSize.width
      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height

      console.log(gapOfWidth)

      this.content.gui.position.y -= gapOfHeight/2

      var id = this.content.id
      var pos = this.content.gui.position
      var node = d3.select(`#${id}`)
        .data([{pos: pos, id: id}])
        .style('top', `${pos.y}px`)
        .style('left', `${pos.x}px`)

      // 線を再描画
      if(gapOfWidth!=0 || gapOfHeight>0) this.$emit('loadAllEdges')
      //this.$emit('fixEdgeOfNormalNode', this.content)
    },
    downOnExpectedAnswer(e){
      this.preNodeSize.height = this.$el.offsetHeight

      this.content.expectedAnswer = e.target.value

      this.$nextTick(this.fixSizeOfExpectedAnswer)

      // コンテンツのセーブ
      clearTimeout(this.timer)
      this.timer = setTimeout(this.updateNodeContent, 800)
    },
    fixSizeOfExpectedAnswer(){
      this.nodeExpectedAnswerSize.width = this.$el.children[1].firstChild.offsetWidth + 8
      this.nodeExpectedAnswerSize.height = this.$el.children[1].firstChild.offsetHeight
      this.textareaStyleOfExpectedAnswer = `
        width: ${this.nodeExpectedAnswerSize.width}px;
        height: ${this.nodeExpectedAnswerSize.height}px;
        `;

      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height
      this.content.gui.position.y -= gapOfHeight/2

      var id = this.content.id
      var pos = this.content.gui.position
      var node = d3.select(`#${id}`)
        .data([{pos: pos, id: id}])
        .style('top', `${pos.y}px`)
        .style('left', `${pos.x}px`)

      // 線を再描画
      if(gapOfHeight>0) this.$emit('loadAllEdges')
      //this.$emit('fixEdgeOfNormalNode', this.content)
    },
    updateNodeContent(){
      this.$emit('updateNode',  this.content)
    },
    addNewNode(){
      console.log('Add Single New Node')
    },
    focus(){
      $('.focused').removeClass('focused')
      this.$el.classList.add('focused')
      $('#previewLineForGoTo').removeClass('show')

      $('.node-window-active').removeClass('node-window-active')
      this.$refs.toolWindow.$el.classList.add("node-window-active")
    },
    callRemoveOpenQuestionNode(id){
      this.$emit('removeOpenQuestionNode',  id)
    }
  },
};
</script>
