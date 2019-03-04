<template lang="pug">

  div.wrap-item-preview-header.f.flex-right
    div.wrap-preview-header-icons.f.flex-between.px4.py2
      v-icon(@click='callInitConversation' color='#2a2a2a') refresh
      
</template>

<style lang="scss">

.wrap-item-preview-header {
  width: 100%;
  height: 26px;
  background: #FFEB52;
  .wrap-preview-header-icons {
    i {
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

    }
  },
  created: function(){

  },
  mounted: function(){
    
  },
  methods: {
    callInitConversation(){
      console.log('reset');
      this.$emit('initConversation');
    }
  },
};
</script>
