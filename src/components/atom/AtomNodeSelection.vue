<template lang="pug">

  div.wrap-atom-selection
    div.wrap-label.px8.pt4.pb5.mb5
      span.label {{content.label}}
      textarea(v-model='message' :style='textareaStyle' @keydown='down' @keydown.enter.exact.prevent).label
      div.wrap-starter.f.fh
        atom-connect-starter(:nodeId='content.id' :id='starterId')
    
</template>

<style lang="scss">

.wrap-atom-selection {
  display: block;
  width: 100%;
  .wrap-label {
    position: relative;
    background: #FFEB52;
    border-radius: 4px;
    .label {
      font-size: 14px;
      width: 130px;
      min-height: 16px;
      word-break: break-all;
      line-height: 1.2;
      top: 6px;
      left: 8px;
    }
    span {
      display: block;
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
}

</style>

<script>

import nodeController from "../nodeController";

import AtomConnectStarter from "./AtomConnectStarter";

export default {
  name: 'AtomNodeSelection',
  components: {
    AtomConnectStarter,
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
    }
  },
  created: function(){

    this.starterId = `connectStarter-${this.content.id}`;
    this.message = this.content.label;

  },
  mounted: function(){

    this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8;
    this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight;

    this.textareaStyle = `
      height: ${this.nodeTextSize.height}px;
      `;

    
    var textarea = this.$el.children[0].children[1];
    textarea.select();


  },
  methods: {
    down(e){
      this.preNodeSize.height = this.$el.offsetHeight;

      this.content.label = e.target.value;

      //this.fixSize();
      setTimeout(this.fixSize, 10);
    },
    fixSize(){
      this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8;
      this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight;
      this.textareaStyle = `
        height: ${this.nodeTextSize.height}px;
        `;

      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height;
      
      console.log('gapOfHeight::', gapOfHeight);

      /*
      this.content.gui.position.y -= gapOfHeight/2;

      var id = this.content.id;
      var pos = this.content.gui.position;
      var node = d3.select(`#${id}`)
        .data([{pos: pos, id: id}])
        .style('top', `${pos.y}px`)
        .style('left', `${pos.x}px`);
      */

      if(gapOfHeight!=0) this.$emit('loadAllEdges');
    },
    addNewNode(){
      console.log('Add Single New Node');
    }
  },
};
</script>
