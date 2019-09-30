<template lang="pug">

  div.wrap-module-conversation
    item-preview-header(
      ref="preview_header"
      @initConversation="initConversation"
      @togglePreview="togglePreview").mb
    div(ref="bubbleWrap").wrap-message-bubbles
      item-conversation-bubble(
        v-for="item in messageBubbles"
        :id="item.id"
        :content="item"
        :icon="project.botIcon")
    div.wrap-user-input
      item-conversation-input-free-text(
        :placeholder="placeholder"
        :nextEvent="nextEventOfFreeText"
        :currentEvent="currentEvent"
        @fireEventOfConversation="fireEventOfConversation"
        @sendMessage="sendMessage"
        @resetInputFreeText="resetInputFreeText")
      item-conversation-input-selection(
        v-if="selections[0]"
        :selections="selections"
        :currentEvent="currentEvent"
        ref="user_input_selection"
        @fireEventOfConversation="fireEventOfConversation"
        @resetSelections="resetSelections"
        @sendMessage='sendMessage')

</template>

<style lang="scss">

$inputHeihgt: 100px;

.wrap-module-conversation {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  background: #F7F7F7;
  .wrap-message-bubbles {
    width: 90%;
    height: calc(100% - 160px);
    /*height: calc(100% - #{$inputHeihgt});*/
    margin: 0 auto;
    overflow: scroll;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
  .wrap-message-bubbles::-webkit-scrollbar {
    display: none;
  }
  .wrap-user-input {
    width: 100%;
    height: $inputHeihgt;
    border-top: solid rgba(0,0,0,0.4) .5px;
  }
}

</style>

<script>
import db from "../firebaseInit"
import { createNamespacedHelpers } from "vuex"

import entity from "../entity"

import ItemPreviewHeader from "../item/ItemPreviewHeader"
import ItemConversationBubble from "../item/ItemConversationBubble"

import ItemConversationInputFreeText from "../item/ItemConversationInputFreeText"
import ItemConversationInputSelection from "../item/ItemConversationInputSelection"
import { setTimeout } from 'timers';

const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
)


export default {
  components: {
    ItemPreviewHeader,
    ItemConversationBubble,
    ItemConversationInputFreeText,
    ItemConversationInputSelection,
  },
  props: {
    project: {
      type: Object,
      required: true,
    },
    /*scenario: {
      type: Array,
      required: true,
    },*/
  },
  data() {
    return {
      messageBubbles: [],
      selections: [],
      placeholder: 'Message',
      nextEventOfFreeText: '',
      currentEvent: ''
    }
  },
  computed: {
    ...mapState([
      'customVars'
    ]),
  },
  watch: {
    messageBubbles (newBubble) {
      setTimeout(this.scrollToButtom, 10)
    },
    selections () {
      setTimeout(this.scrollToButtom, 10)
    }
  },
  created: function(){
    // debugger
  },
  mounted: async function(){
    // はじめのノードをscenarioArrayから取得して表示しようとしているところ

    console.log('module-conversation (scenarioArray)', this.scenarioArray)

    try {
      this.initConversation()
    } catch( e ) {
      console.log("cannot init convarsation")
    }

    //var content = this.scenarioArray[0];
    //this.messageBubbles.push(content);

  },
  updated: function(){
    
  },
  methods: {
    update(){
      this.project = this.project
    },
    initConversation(){
      this.messageBubbles = []
      this.selections = []

      var firstNode = entity.getFirstNode(this.scenarioArray)
      this.fireEventOfConversation(firstNode.id)
    },
    resetSelections(){
      this.selections = []
    },
    sendMessage(content){
      this.messageBubbles.push(content)
    },
    fireEventOfConversation(eventId){
      
      var event = entity.getContent(this.scenarioArray, eventId)

      if(!event) return

      this.nextEventOfFreeText = ''
      this.placehoder = 'Message'

      var sleep = msec => new Promise(resolve => setTimeout(resolve, msec))
      
      switch(event.type){
        case 'normal':
          
          (async () => {
            await sleep(1200)

            this.sendMessage(event)

            $('.focused').removeClass('focused')
            var node = document.getElementById(event.id)
            if(node) node.classList.add('focused')
            
            if(event.conditions) {
              var matchedCondition = entity.getMatchedCondition(this.scenarioArray, event.conditions, this.customVars)
              this.fireEventOfConversation(matchedCondition.next)
            }
          })()

        break

        case 'selection':
          
          (async () => {
            await sleep(1200)

            this.sendMessage(event)

            $('.focused').removeClass('focused')
            var node = document.getElementById(event.id)
            if(node) node.classList.add('focused')

            await sleep(400)
            this.selections = event.selections

            if(event.conditions) {
              var matchedCondition = entity.getMatchedCondition(this.scenarioArray, event.conditions, this.customVars)
              this.fireEventOfConversation(matchedCondition.next)
            }
          })()

        break

        case 'openquestion':

          (async () => {
            await sleep(1200)

            this.sendMessage(event)

            $('.focused').removeClass('focused')
            var node = document.getElementById(event.id)
            if(node) node.classList.add('focused')

            await sleep(400)
            
            this.placeholder = event.expectedAnswer

            if(event.conditions) {
              var matchedCondition = entity.getMatchedCondition(this.scenarioArray, event.conditions, this.customVars)
              this.nextEventOfFreeText = matchedCondition.next
            }
          })()

        break

        case 'media':
          
          (async () => {
            await sleep(1200)

            this.sendMessage(event)
            setTimeout(this.scrollToButtom, 800)

            $('.focused').removeClass('focused')
            var node = document.getElementById(event.id)
            if(node) node.classList.add('focused')
            
            if(event.conditions) {
              var matchedCondition = entity.getMatchedCondition(this.scenarioArray, event.conditions, this.customVars)
              this.fireEventOfConversation(matchedCondition.next)
            }
          })()

        break

        case 'goto':

          (async () => {
            // await sleep(1200)
            this.fireEventOfConversation(event.toId)
            // if(event.conditions) {
            //   var matchedCondition = entity.getMatchedCondition(this.scenarioArray, event.conditions, this.customVars)
            //   this.fireEventOfConversation(matchedCondition.next)
            // }
          })()

        break
      }

      this.currentEvent = event.id
    },
    resetInputFreeText () {
      this.placeholder = 'Message'
      this.nextEventOfFreeText = ''
    },
    scrollToButtom () {
      if (this.$refs.bubbleWrap) {
        var bubbleWrap = this.$refs.bubbleWrap
        bubbleWrap.scrollTop = bubbleWrap.scrollHeight //(bubbleWrap.scrollHeight - bubbleWrap.offsetHeight)
      }
    },
    togglePreview () {
      this.$emit("togglePreview")
    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
      'customVars'
    ]),
  }
};
</script>
