<template lang="pug">

  div(@click="toCanvas").wrap-project-card.mb14
    div.wrap-title.f.fc.pt24.pb8.mb8
      div
        div.wrap-icon.mb8
          img(:src="project.botIcon")
        span.bot-title.line-clamp-1 {{project.title}}
    div.wrap-discription.px18
      span.line-clamp-3 {{project.discription}}

</template>

<style lang="scss" scoped>

.wrap-project-card {
  background: #FFF;
  border-radius: 3px;
  filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
  cursor: pointer;
  height: 280px;
  .wrap-title {
    background: #FFEB52;
    .wrap-icon {
      margin: 0 auto;
      width: 120px;
      height: 120px;      
      border-radius: 50%;
      overflow: hidden;
      border: solid #999 1px;
      background: #FFF;
      img {
        object-fit: cover;
        min-height: 100%;
        min-width: 100%;
      }
    }
    .bot-title {
      /*display: block;*/
      text-align: center;
      font-size: 24px;
      width: 100%;
    }
    .edit-time {
      display: block;
    }
  }
}

</style>


<script>

export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      
    }
  },
  created () {
    
  },
  methods: {
    toCanvas () {
      this.$router.push(`/canvas/${this.project.id}`)
    }
  }
}
</script>
