<template lang="pug">

  div.wrap-item#nodeSelector
    div.wrap-selectors
      div(v-for='item in selection').selector
        p(@click='callAddNode(item.type)').px12.py8 {{item.label}}
    
</template>

<style lang="scss">

.wrap-item {
  z-index: 101;
  background: #FF9A0A;
  position: absolute;
  min-width: 116px;
  border-radius: 12px;
  box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
  .wrap-selectors {
    .selector {
      cursor: pointer;
      p {
        margin: 0;
        text-align: center;
        color: #FFF;
        font-weight: 500;
        letter-spacing: 0.6px;
      }
    }
  }
}

</style>

<script>
import { setTimeout } from 'timers';

export default {
  name: 'ItemNodeSelector',
  components: {
    
  },
  data() {
    return {
      selection: [],
      position: {},
      dragStartedPosition: {},
      dragStartedId: '',
    }
  },
  created: function(){

    // this.selection = [
    //   {label: 'Message', type: 'normal'},
    //   {label: 'Selection', type: 'selection'},
    //   {label: 'Open Question', type: 'openquestion'},
    //   {label: 'Go To', type: 'goto'},
    // ]

    this.initializeSelection()

  },
  watch: {
    selection () {
      this.$nextTick(this.adjustPosition)
    }
  },
  mounted: function(){
    
    d3.select('#nodeSelector')
      .style('top', `${this.position.y}px`)
      .style('left', `${this.position.x}px`)

    // 多分これやっちゃいけないやつ
    window.updateSelectorPosition = this.updatePosition

  },
  methods: {
    initializeSelection() {
      this.selection = [
        {label: this.$t("canvas.nodes.node_selector.normal.label"), type: 'normal'},
        {label: this.$t("canvas.nodes.node_selector.question.label"), type: 'to_question'},
        {label: this.$t("canvas.nodes.node_selector.media.label"), type: 'media'},
        {label: this.$t("canvas.nodes.node_selector.action.label"), type: 'to_action'}      ]
    },
    callAddNode(type){

      switch(type){
        case 'normal':
          this.$emit('addNormalMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'selection':
          this.$emit('addSelectionMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'multipleselection':
          this.$emit('addMultipleSelectionMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'openquestion':
          this.$emit('addOpenQuestionMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'media':
          this.$emit('addMediaMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'to_action':
          this.selection = [
            {label: this.$t("canvas.nodes.node_selector.action.go_to.label"), type: 'goto'},
            {label: this.$t("canvas.nodes.node_selector.action.send_email.label"), type: 'send_email'}
          ]
          this.$nextTick(this.adjustPosition)
        break
        case 'goto':
          this.$emit('selectToNodeByGoTo', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'send_email':
          this.$emit('addActionSendEmailNode', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'to_question':
          this.selection = [
            {label: this.$t("canvas.nodes.node_selector.question.open_question.label"), type: 'openquestion'},
            {label: this.$t("canvas.nodes.node_selector.question.selection.label"), type: 'selection'},
            {label: this.$t("canvas.nodes.node_selector.question.multiple_selection.label"), type: 'multipleselection'},
            {label: this.$t("canvas.nodes.node_selector.question.selection_others1.label"), type: 'selection_others1'}
          ]
          this.$nextTick(this.adjustPosition)
        break
        case 'selection_others1':
          this.selection = [
            {label: this.$t("canvas.nodes.node_selector.question.email.label"), type: 'ask_email'},
            {label: this.$t("canvas.nodes.node_selector.question.phone_number.label"), type: 'ask_phone_number'},
            {label: this.$t("canvas.nodes.node_selector.question.date.label"), type: 'to_ask_date_list'},
            // {label: this.$t("canvas.nodes.node_selector.question.selection_others2.label"), type: 'selection_others2'}
          ]
        break
        case 'ask_email':
          this.$emit('addAskEmailMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'ask_phone_number':
          this.$emit('addAskPhoneNumberMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'to_ask_date_list':
          this.selection = [
            {label: this.$t("canvas.nodes.node_selector.question.date_only.label"), type: 'ask_date'},
            {label: this.$t("canvas.nodes.node_selector.question.date_and_time.label"), type: 'ask_date_and_time'},
          ]
        break
        case 'ask_date':
          this.$emit('addAskDateMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        case 'ask_date_and_time':
          this.$emit('addAskDateAndTimeMessage', this.position, this.dragStartedPosition, this.dragStartedId)
          this.hideSelf()
          this.initializeSelection()
        break
        // case 'to_action':
        //   this.$nextTick(this.adjustPosition)
        // break
        // case 'to_media':
        //   this.$nextTick(this.adjustPosition)
        // break
      }

      //this.$emit('addLine', this.dragStartPosition, this.position)

    },
    hideSelf() {
      $('#nodeSelector').hide()
      $('#lineForPreview').hide()
    },
    updatePosition(position, fromPosition, fromId){
      $('#nodeSelector').show()

      this.position = position
      this.dragStartedPosition = fromPosition
      this.dragStartedId = fromId

      this.adjustPosition()
    },
    adjustPosition(){
      var selector = document.getElementById('nodeSelector')

      d3.select('#nodeSelector', this.position)
        .style('top', `${this.position.y - selector.clientHeight/2}px`)
        .style('left', `${this.position.x}px`)

      $('.focused').removeClass('focused')
    }
  }
};

</script>
