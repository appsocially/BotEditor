<template lang="pug">
  div(v-if="user" :class="isMine").wrap-item-message.f.flex-wrap.mb6
    div(:class="bubbleActive").wrap-icon.f.fh.mt16
      img(:src="user.iconURL")
    div.wrap-message-content
      span(:class="bubbleActive").name {{user.name}}
      div.wrap-bubble
        div(v-if="message.type === 'media'").wrap-media
          div(v-if="message.mediaType === 'image'").wrap-img.f.fh
            img(:src="message.mediaURI")
        span(v-else :class="bubbleActive" ref="bubble").bubble.px10.py8 {{renderedText}}
</template>

<style lang="scss">
.wrap-item-message {
  width: 95%;
  max-width: 620px;
  margin: 0 auto;
  &.mine {
    flex-flow: row-reverse;
    .wrap-icon {
      margin-left: 5px;
    }
  }
  .wrap-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    overflow: hidden;
    border: solid 1px rgba(0, 0, 0, 0.2);
    margin-right: 5px;

    transition: all 200ms ease-out;
    opacity: 0;
    img {
      object-fit: cover;
    }
    &.active {
      opacity: 1;
    }
  }
  .wrap-message-content {
    max-width: 75%;
    .name {
      display: block;
      font-size: 10px;
      color: #999;

      transition: all 200ms ease-out;
      transform: translateY(10px);
      opacity: 0;
      &.active {
        transform: translateY(0px);
        opacity: 1;
      }
    }
    .wrap-bubble {
      .wrap-media {
        .wrap-img {
          width: 100%;
          max-width: 220px;
          overflow: hidden;
          border-radius: 12px;
          img {
            object-fit: cover;
          }
        }
      }
      .bubble {
        display: inline-block;
        font-size: 12px;
        border-radius: 6px;
        background: #f0f0f0;

        transition: all 200ms ease-out;
        transform: translateY(10px);
        opacity: 0;
        &.active {
          transform: translateY(0px);
          opacity: 1;
        }
      }
    }
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateProject } = createNamespacedHelpers('project')
const { mapState: mapStateScenarioForChat } = createNamespacedHelpers('scenarioForChat')
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      user: null,
      isMine: 'not-mine',
      bubbleActive: 'not-active',
      renderedText: null,
      messageUser: null
    }
  },
  computed: {
    ...mapStateAuth([
      'uid'
    ]),
    ...mapStateProject([
      'project'
    ]),
    ...mapStateScenarioForChat([
      'customVars'
    ]),
    ...mapStateTeam([
      'team'
    ]),
    ...mapStateRoom([
      'roomUsers',
      'botUserForPreview',
      'humanUserForPreview'
    ])
  },
  async created () {
    // オペレーターからみた時にチームユーザーを右にしようとしてるところ
    if (this.$route.name === "inbox") {
      this.messageUser = this.roomUsers.filter(e => { return (e.uid === this.message.createdBy) })[0]
      if (this.messageUser) {
        // このメッセージの作成者がチームに所属していれば
        if (this.messageUser.team) {
          this.isMine = 'mine'
        }
      }
    }

    if (this.message.createdBy === this.uid) this.isMine = 'mine'

    this.renderedText = this.replaceCustomVar(this.message.text)
  },
  async mounted () {
    // for Preview
    if (this.$route.name === "canvas" 
        || this.$route.name === "preview"
        || this.$route.name === "preview_chat") {
      if (this.message.createdBy ===  "previewBot") {
        this.user = this.botUserForPreview
      } else {
        this.user = this.humanUserForPreview
      }
    } else {
      this.user = await this.getRoomUserById(this.message.createdBy)
    }
    
    setTimeout(() => {
      this.bubbleActive = 'active'
      this.detectURL(this.message.text)
    }, 800)
  },
  methods: {
    ...mapActionsRoom([
      'getRoomUserById'
    ]),
    replaceCustomVar (text) {
      var resultText

      if (text && text.match(/\${[A-Za-z0-9]+}/)) { // customVarの文字列かどうか
        resultText = text
        while (true) {
          var containedCustomVarName = resultText.match(/\${[A-Za-z0-9]+}/)[0].split('{')[1].split('}')[0]
          var matchedCustomVar = this.customVars.filter((e) => {
            return (e.location === containedCustomVarName)
          })[0]
          if (matchedCustomVar) {
            // カスタム変数が宣言されていた場合
            var replaceValue = matchedCustomVar.value ? matchedCustomVar.value : 'null'
          } else {
            // カスタム変数が宣言されていなかった場合
            var replaceValue = 'null'
          }
          resultText = resultText.replace(/\${[A-Za-z0-9]+}/, replaceValue)

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

      if (text && text.match(regex)) {
        var span = document.createElement('span')
        var textArrayWithoutURL = text.split(text.match(regex)[0])

        var splitAllRegex = (text) => {

        }

        var textArray = [text]

        while (true) {
          if (textArray[textArray.length - 1].match(regex)) {
            var splitPointURL = textArray[textArray.length - 1].match(regex)[0]
            var bottomTextArray = textArray[textArray.length - 1].split(splitPointURL)

            bottomTextArray.splice(1, 0, splitPointURL)

            textArray.pop()
            textArray = textArray.concat(bottomTextArray)
          } else {
            break
          }
        }

        var resultHTML = ''
        for (var i = 0; i < textArray.length; i++) {
          if (textArray[i].match(regex)) {
            resultHTML += `<a href="${textArray[i]}" target="brank">${textArray[i]}</a>`
          } else {
            resultHTML += textArray[i]
          }
        }
        resultHTML = `<span class="text">${resultHTML}</span>`

        this.$refs.bubble.innerHTML = resultHTML
      }
    }
  }
}
</script>
