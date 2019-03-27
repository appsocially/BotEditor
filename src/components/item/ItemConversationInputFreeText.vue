<template lang="pug">

  div.wrap-item-conversation-input-free-text.f.fm
    div.wrap-textarea.f.fm.flex-between.px8
      textarea(:placeholder='placeholder' v-model='freeText').pt2.pb1.px5.mr8
      div.wrap-icon.f.fh
        v-icon(@click='sendFreeText' color='#2a2a2a') send

</template>

<style lang="scss">

.wrap-item-conversation-input-free-text {
  width: 100%;
  height: 36px;
  border-top: solid rgba(0,0,0,0.4) .5px;
  .wrap-textarea {
    width: 100%;
    textarea {
      border: solid rgba(0,0,0,0.4) .5px;
      border-radius: 3px;
      width: 100%;
      height: 24px;
      outline: none;
      resize: none;
      font-size: 14px;
    }
    .wrap-icon {
      i {
        width: 14px;
        font-size: 18px;
        cursor: pointer;
      }
    }
  }
}

</style>

<script>

export default {
  name: 'ItemConversationInputFreeText',
  components: {
  },
  props: {
    placeholder: {
      type: String,
      required: true,
    },
    nextEvent: {
      type: String,
      required: false,
    }
  },
  data() {
    return {
      freeText: '',
    }
  },
  watch: {
    freeText: function(newVal, oldVal){
      this.freeText = newVal;
    }
  },
  created: async function(){

    // 自由文入力をつくってオープンクエスチョンがプレヴューできるようにしようとしてるところ

  },
  methods: {
    sendFreeText(){

      if(this.freeText=='') return;

      console.log('call:', this.nextEvent);

      if(this.nextEvent!=''){
        this.callNextEvent(this.freeText, this.nextEvent);
      }/*else{
        var message = {
          text: this.freeText,
          reverse: 'flex-row-reverse',
        };
        this.$emit('sendMessage', message);
      }*/

      var message = {
        text: this.freeText,
        reverse: 'flex-row-reverse',
      };
      this.$emit('sendMessage', message);

      this.freeText = '';
      //this.nextEvent = '';
    },
    callNextEvent(text, id){
      this.$emit('resetSelections');
      this.$emit('fireEventOfConversation', id);

      /*var message = {
        text: text,
        reverse: 'flex-row-reverse',
      };
      this.$emit('sendMessage', message);
      */

      this.$emit('resetInputFreeText');
    },
  },
  
};
</script>
