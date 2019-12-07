<template lang="pug">
  div.wrap-module-preview-header.f.fm.flex-right.px4
    v-icon(
      @click="$emit('reloadPreview')"
      size="18px"
      color='#2a2a2a') refresh
    v-icon(
      @click="$emit('togglePreview')"
      size="18px"
      color='#2a2a2a') close

</template>

<style lang="scss" scoped>
.wrap-module-preview-header {
  width: 100%;
  height: 28px;
  background: #FFEB52;
}
</style>

<script>

export default {
  async created () {
    
  },
  methods: {
    
  }
}
</script>
