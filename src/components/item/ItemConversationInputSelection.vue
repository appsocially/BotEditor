<template lang="pug">

  div.wrap-item-conversation-selection.f.flex-wrap.px8.py10
    div(v-for='item in selections').selection.mr6.mt6.mb12
      span(@click='callNextEvent(item.label, item.id)').px12.py8 {{item.label}}

</template>

<style lang="scss">

.wrap-item-conversation-selection {
  width: 100%;
  height: 100%;
  overflow: scroll;
  .selection {
    display: inline-block;
    span {
      color: #2a2a2a;
      background: #FFEB52;
      border-radius: 12px;
      font-size: 14px;
      letter-spacing: .4px;
      cursor: pointer;
    }
  }
}

</style>

<script>

import entity from "../entity"

import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
)

export default {
  name: 'ItemConversationInputSelection',
  components: {

  },
  props: {
    selections: {
      type: Array,
      required: true,
    },
    currentEvent: {
      type: String,
      required: false
    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
      'customVars'
    ])
  },
  created: function(){
    
  },
  mounted: function(){
    
  },
  update: function(){

  },
  methods: {
    ...mapActions([
      'insertValueIntoCustomVar'
    ]),
    callNextEvent(label, id){
      this.$emit('resetSelections')

      var conditions = entity.getConditions(this.scenarioArray, id)
      var matchedCondition= entity.getMatchedCondition(this.scenarioArray, conditions, this.customVars)
      
      this.$emit('fireEventOfConversation', matchedCondition.next)
      
      var message = {
        text: label,
        reverse: 'flex-row-reverse',
      }
      this.$emit('sendMessage', message)

      this.insertValueIntoCustomVar({id: this.currentEvent.id, value: label})
    },
  }
};
</script>
