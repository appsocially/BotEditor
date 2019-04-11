<template lang="pug">

  <p>test</p>

</template>

<script>

export default {
  name: 'Index',
  components: {
    
  },
  data() {
    return {
      
    }
  },
  created: function(){
    this.$router.push('/sign-in'); 
  }
};
</script>
