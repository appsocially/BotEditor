<template lang="pug">

  div(:class='reverse').wrap-item-conversation-bubble.f.fm.mt12.mb14
    div(:class='fadeIn').wrap-bot-icon
      img(src='@/assets/logo.png')
    div(:class='fadeIn').wrap-bubble.mr8
      span.text.px8.py6 {{bubbleValue}}
      
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
      display: inline-block;
      background: #F0F0F0;
      border-radius: 3px;
      font-size: 12px;
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
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
)

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
      bubbleValue: ''
    }
  },
  computed: {
    ...mapState([
      'customVars'
    ]),
  },
  created: function(){
    this.reverse = this.content.reverse
    this.bubbleValue = this.replaceCustomVar(this.content.text)
  },
  mounted: function(){

    var sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
    (async () => {
      await sleep(200);
      this.fadeIn = 'fade-in';
    })();
    
  },
  methods: {
    replaceCustomVar (text) {
      var resultText
      
      if (text.match(/\${[A-Za-z0-9]+}/)){
        while (true) {
          var containedCustomVarName = text.match(/\${[A-Za-z0-9]+}/)[0].split("{")[1].split("}")[0]
          var matchedCustomVar = this.customVars.filter((e) => {
            return (e.location === containedCustomVarName)
          })[0]
          if (matchedCustomVar) {
            // カスタム変数が宣言されていた場合
            var replaceValue = matchedCustomVar.value? matchedCustomVar.value: "null"
          } else {
            // カスタム変数が宣言されていなかった場合
            var replaceValue = "null"
          }
          resultText = text.replace(/\${[A-Za-z0-9]+}/, replaceValue)

          if (!resultText.match(/\${[A-Za-z0-9]+}/)) break
        }
      } else {
        resultText = text
      }

      return resultText
    }
  }
};
</script>
