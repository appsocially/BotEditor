<template lang="pug">

  ItemNodeWrapper(:content="content")
    div.wrap-item-node-tmp
      h2 multiple selection

</template>

<style lang="scss" scoped>
.wrap-item-node-tmp {
  
}
</style>

<script>
import ItemNodeWrapper from "@/components/item/ItemNodeWrapper"

export default {
  components: {
    ItemNodeWrapper
  },
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      
    }
  },
  created: function() {
    
  },
  mounted: function() {
    
  },
  methods: {
   
  }
}
</script>
