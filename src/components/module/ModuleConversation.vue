<template lang="pug">

  div.wrap-module-conversation
    item-preview-header(ref='preview_header' @initConversation='initConversation')
    div.wrap-message-bubbles
      item-conversation-bubble(v-for='item in messageBubbles' :id='item.id' :key='item.id' :content='item')
    div.wrap-user-input
      item-conversation-input-selection(v-if='selections[0]' :selections='selections' ref='user_input_selection' @fireEventOfConversation='fireEventOfConversation' @resetSelections='resetSelections' @sendMessage='sendMessage')


</template>

<style lang="scss">

$inputHeihgt: 100px;

.wrap-module-conversation {
  position: relative;
  display: block;
  width: 100%;
  height: calc(100% - 26px);
  background: #F7F7F7;
  .wrap-message-bubbles {
    width: 90%;
    height: calc(100% - #{$inputHeihgt});
    margin: 0 auto;
    overflow: scroll;
  }
  .wrap-user-input {
    width: 100%;
    height: $inputHeihgt;
    border-top: solid rgba(0,0,0,0.4) .5px;
  }
}

</style>

<script>
import db from "../firebaseInit";
import { createNamespacedHelpers } from "vuex";

import entity from "../entity";

import ItemPreviewHeader from "../item/ItemPreviewHeader";
import ItemConversationBubble from "../item/ItemConversationBubble";
import ItemConversationInputSelection from "../item/ItemConversationInputSelection";


const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
);


export default {
  name: 'ModuleConversation',
  components: {
    ItemPreviewHeader,
    ItemConversationBubble,
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
    }
  },
  created: function(){
    
  },
  mounted: async function(){
    // はじめのノードをscenarioArrayから取得して表示しようとしているところ

    console.log('module-conversation (scenarioArray)', this.scenarioArray);

    this.initConversation();

    //var content = this.scenarioArray[0];
    //this.messageBubbles.push(content);

  },
  updated: function(){
    
  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId'
    ]),
    update(){
      this.project = this.project;
    },
    initConversation(){
      this.messageBubbles = [];
      this.selections = [];
      this.fireEventOfConversation(`first-${this.project.id}`);
    },
    resetSelections(){
      this.selections = [];
    },
    sendMessage(content){
      this.messageBubbles.push(content);
    },
    fireEventOfConversation(eventId){
      
      var event = entity.getContent(this.scenarioArray, eventId);
      if(!event) return;

      var sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

      switch(event.type){
        case 'normal':
          
          (async () => {
            await sleep(1200);
            this.sendMessage(event);

            var nextId = event.next;
            this.fireEventOfConversation(nextId);
          })();

        break;

        case 'selection':
          
          (async () => {
            await sleep(1200);
            this.sendMessage(event);

            await sleep(400);
            this.selections = event.selections;

            var nextId = event.next;
            this.fireEventOfConversation(nextId);
          })();

        break;
      }

    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
    ]),
    
  }
};
</script>
