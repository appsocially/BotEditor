<template lang="pug">

  div.wrap-item-preview-header.f.flex-right
    div.wrap-preview-header-icons.f.flex-between.px4.py4
      v-icon(v-if="this.$route.name === 'canvas'" v-clipboard:copy="copyMessage" v-clipboard:success="onCopy" color="#2a2a2a") link
      v-icon(@click='callInitConversation' color='#2a2a2a') refresh
      v-icon(v-if="this.$route.name === 'canvas'" @click='toggleWindow' color='#2a2a2a') close
      
      
</template>

<style lang="scss">

.wrap-item-preview-header {
  width: 100%;
  height: 26px;
  background: #FFEB52;
  .wrap-preview-header-icons {
    i {
      width: 22px;
      font-size: 18px;
      cursor: pointer;
    }
  }
}

</style>

<script>


export default {
  name: 'ItemPreviewHeader',
  components: {

  },
  props: {
    
  },
  data() {
    return {
      copyMessage: ""
    }
  },
  created: function() {
    this.copyMessage = `${location.host}/preview/${this.$route.params.id}`
  },
  mounted: function() {
    
  },
  methods: {
    toggleWindow () {
      this.$emit("togglePreview")
    },
    onCopy () {
      alert("Preview Link has been copied.")
    },
    callInitConversation() {
      console.log('reset');
      this.$emit('initConversation');
    }
  },
};
</script>
