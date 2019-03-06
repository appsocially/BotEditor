<template lang="pug">

  div.wrap-item-conversation-selection.f.flex-wrap.px8.py10
    div(v-for='item in selections').selection.mr6.mt6.mb12
      span(@click='callNextEvent(item.label, item.next)').px12.py8 {{item.label}}

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


export default {
  name: 'ItemConversationInputSelection',
  components: {

  },
  props: {
    selections: {
      type: Array,
      required: true,
    },
  },
  created: function(){
    console.log(this.selections);
  },
  mounted: function(){
    
  },
  update: function(){

  },
  methods: {
    callNextEvent(label, id){
      this.$emit('resetSelections');
      this.$emit('fireEventOfConversation', id);

      var message = {
        text: label,
        reverse: 'flex-row-reverse',
      };
      this.$emit('sendMessage', message);
    },
  }
};
</script>
