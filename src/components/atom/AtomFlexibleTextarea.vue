<template lang="pug">
  
  div.wrap-atom-flexible-text
    textarea(
      ref="textarea"
      :style="textareaStyle"
      v-model="valueText"
      @keydown.enter.exact.prevent="enter"
      @keydown.delete="onDelete"
    )
    span(ref="hiddenText" :style="`width: ${width}px;`").hidden-text {{valueText}}
    div(:style="textareaStyle").box
    
</template>

<style lang="scss" scoped>
.wrap-atom-flexible-text {
  position: relative;
  textarea {
    position: absolute;
    left: 0;
    top: 0;
    resize: none;
    outline: none;
    min-width: 10px;
    min-height: 20px;
  }
  .hidden-text {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    visibility: hidden;
    // max-width: 180px;
  }
  .box {
    min-height: 20px;
  }
}
</style>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapActions: mapActionsScenario } = createNamespacedHelpers("scenario")

export default {
  props: {
    textId: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    content: {
      type: Object,
      default: null
    },
    width: {
      type: Number,
      default: 180
    }
  },
  data() {
    return {
      valueText: null,
      textarea: null,
      hiddenText: null,
      textareaStyle: null,
      letSaveNode: false,
      timer: null
    }
  },
  watch: {
    valueText (newText, oldText) {
      this.$nextTick(this.changeSize)
      
      if (this.letSaveNode) {
        clearTimeout(this.timer)
        this.timer = setTimeout(this.saveNode, 1000)        
      }
      this.letSaveNode = true
    }
  },
  created: function() {
    this.valueText = this.text
  },
  mounted: function() {
    this.textarea = this.$refs.textarea
    this.hiddenText = this.$refs.hiddenText
    this.changeSize()
  },
  methods: {
    ...mapActionsScenario([
      'updateNode'
    ]),
    changeSize () {
      this.textareaStyle = `
        width: ${this.hiddenText.offsetWidth + 2}px;
        height: ${this.hiddenText.offsetHeight}px;
        `
    },
    enter () {
      this.$emit("onEnter", this.content)
    },
    onDelete () {
      this.$emit("onDelete", this.textId)
    },
    saveNode () {
      // このテキストがcontent.textでなければ、selections[i].labelにvalueを入れる
      if (this.content.id === this.textId) {
        this.content.text = this.valueText
      } else {
        this.content.selections = this.content.selections.map(s => {
          if (this.textId === s.id) s.label = this.valueText
          return s
        })
      }
      this.updateNode(this.content)
    }
  }
}
</script>
