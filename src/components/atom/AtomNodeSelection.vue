<template lang="pug">

  div.wrap-atom-selection
    div.wrap-label.px8.pt4.pb5.mb5
      span.label {{content.label}}
      textarea(
        v-model='message'
        :style='textareaStyle'
        @keyup='up'
        @keydown.enter.exact.prevent
        @keyup.delete="upDelete"
        @keydown.delete="downDelete").label
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
import { createNamespacedHelpers } from "vuex"
import nodeController from "../nodeController"
import AtomConnectStarter from "./AtomConnectStarter"
import { setTimeout } from 'timers';

const { mapState, mapActions } = createNamespacedHelpers(
 "scenario"
)

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
      timer: {},
      upDeleteText: '',
      downDeleteText: ''
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
      `

    var textarea = this.$el.children[0].children[1]
    textarea.select()

  },
  methods: {
    ...mapActions([
      'deleteOneSelection'
    ]),
    up (e) {
      this.preNodeSize.height = this.$el.offsetHeight

      this.content.label = e.target.value

      this.$nextTick(this.fixSize)

       // コンテンツのセーブ
      clearTimeout(this.timer)
      this.timer = setTimeout(this.updateNode, 400)
    },
    upDelete (e) {
      this.upDeleteText = e.target.value
      if (this.upDeleteText === "" && this.downDeleteText === "") {
        // deleteThisSelection
        if (this.content.conditions) {
          for(var i=0; i < this.content.conditions.length; i++ ){
            this.removeLine(this.content.conditions[i].id)
          }
        }
        this.deleteOneSelection(this.content.id)
        this.fixSize()
      }

      clearTimeout(this.timer)
      this.timer = setTimeout(this.updateNode, 400)
    },
    downDelete (e) {
      this.downDeleteText = e.target.value
    },
    fixSize () {
      this.nodeTextSize.width = this.$el.children[0].firstChild.offsetWidth + 8
      this.nodeTextSize.height = this.$el.children[0].firstChild.offsetHeight
      this.textareaStyle = `
        height: ${this.nodeTextSize.height}px
        `
      var gapOfHeight = this.$el.offsetHeight - this.preNodeSize.height
      
      // this.loadAllEdges()
      setTimeout(this.loadAllEdges, 10)
    },
    loadAllEdges () {
      this.$parent.loadAllEdges()
      // this.$emit('loadAllEdges') // これだとなぜか効かない
    },
    removeLine(id){
      d3.select('#lines').select(`#line-${id}`).remove();
    },
    addNewNode () {
      console.log('Add Single New Node')
    },
    updateNode () {
      this.$emit("updateNodeContent")
    }
  },
};
</script>
