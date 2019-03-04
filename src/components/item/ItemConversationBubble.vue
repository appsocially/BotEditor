<template lang="pug">

  div(:class='reverse').wrap-item-conversation-bubble.f.fm.mt12.mb14
    div(:class='fadeIn').wrap-bot-icon
      img(src='@/assets/logo.png')
    div(:class='fadeIn').wrap-bubble.mr8
      span.text.px10.py8 {{content.text}}
      
</template>

<style lang="scss">

.wrap-item-conversation-bubble {
  .wrap-bot-icon {
    width: 24px;
    height: 24px;
    overflow: hidden;
    border-radius: 50%;
    margin-right: 10px;

    transition: all 400ms ease;
    opacity: 0;
    img {
      height: 100%;
      object-fit: cover;
    }
  }
  .wrap-bubble {
    position: relative;
    max-width: 70%;

    transition: all 400ms ease;
    top: 40px;
    opacity: 0;
    .text {
      background: #F0F0F0;
      border-radius: 3px;
    }
  }

  .fade-in {
    top: 0px !important;
    opacity: 1.0 !important;
  }
}

.flex-row-reverse {
  .wrap-bot-icon {
    display: none;
  }
  .wrap-bubble {
    .text {
      background: #FFEB52;
    }
  }
}

</style>

<script>


export default {
  name: 'ItemConversationBubble',
  components: {

  },
  props: {
    content: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      //iconSrc: './assets/logo.png'
      reverse: '',
      fadeIn: '',
    }
  },
  created: function(){
    this.reverse = this.content.reverse;
  },
  mounted: function(){

    var sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
    (async () => {
      await sleep(200);
      this.fadeIn = 'fade-in';
    })();
    
  }
};
</script>
