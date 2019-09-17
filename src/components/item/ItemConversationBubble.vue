<template lang="pug">

  div(:class='reverse').wrap-item-conversation-bubble.f.mt12.mb14
    div(:class='fadeIn').wrap-bot-icon.mt2
      img(:src="icon")
    div(ref="bubble" :class='fadeIn').wrap-bubble.mr8.px8.py6
      span.text {{bubbleValue}}
      
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
    display: inline-block;
    background: #F0F0F0;
    border-radius: 6px;
    word-break: break-all;

    transition: all 400ms ease;
    top: 40px;
    opacity: 0;
    .text {
      
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
    background: #FFEB52;
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
    },
    icon: {
      type: String,
      required: false
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

    this.detectURL(this.content.text)

    var sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
    (async () => {
      await sleep(200)
      this.fadeIn = 'fade-in'
    })();
    
  },
  methods: {
    replaceCustomVar (text) {
      var resultText
      
      if (text.match(/\${[A-Za-z0-9]+}/)){ // customVarの文字列かどうか
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
    },
    detectURL (text) {
      // URLの文字列かどうか
      const regex = /https*(:\/\/[-_.!~*¥'()a-zA-Z0-9;\/?:¥@&=+¥$,%#]+)/

      if(text.match(regex)){
        var span = document.createElement("span")
        var textArrayWithoutURL = text.split(text.match(regex)[0])

        var splitAllRegex = (text) => {


        }

        var textArray = [text]

        while (true) {
          if (textArray[textArray.length-1].match(regex)) {
            var splitPointURL = textArray[textArray.length-1].match(regex)[0]
            var bottomTextArray = textArray[textArray.length-1].split(splitPointURL)
			
            bottomTextArray.splice(1, 0, splitPointURL)
			
            textArray.pop()
            textArray = textArray.concat(bottomTextArray)
          } else {
            break
          }
        }

        var resultHTML = ""
        for (var i=0; i<textArray.length; i++) {
          if (textArray[i].match(regex)) {
            resultHTML += `<a href="${textArray[i]}" target="brank">${textArray[i]}</a>`
          } else {
            resultHTML += textArray[i]
          }
        }
        resultHTML = `<span class="text">${resultHTML}</span>`
        
        this.$refs.bubble.innerHTML = resultHTML
        
        // var checkNotParsedURL = (html) => {
        //   if(html.split("</a>")[1].match(regex)) return true
        //   return false
        // }

        // var html = `<span class="text px8 py6">${textArrayWithoutURL[0]}<a href="${text.match(regex)[0]}" target="brank">${text.match(regex)[0]}</a>${textArrayWithoutURL[1]}</span>`
        // while(true){
        //   if(checkNotParsedURL(html)){

        //   } else {
        //     break
        //   }
        // }

        // var html = `<span class="text px8 py6">${textArrayWithoutURL[0]}<a href="${text.match(regex)[0]}" target="brank">${text.match(regex)[0]}</a>${textArrayWithoutURL[1]}</span>`
        // this.$refs.bubble.innerHTML = html
        
      }

      
    }
  }
};
</script>
