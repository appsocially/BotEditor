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
export default {
  props: {
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
      textareaStyle: null
    }
  },
  watch: {
    valueText (newText, oldText) {
      this.$nextTick(this.changeSize)
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
      this.$emit("onDelete", this.content)
    }
  }
}
</script>
