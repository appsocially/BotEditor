<template lang="pug">

  div(@click="toCanvas").wrap-project-card.px18.py16.mb14
    div.wrap-title.f.fm.flex-between.pb8.mb8
      div.f.fm
        div.wrap-icon.mr12
          img(:src="project.botIcon")
        span.title.line-clamp-1 {{project.title}}
      span.edit-time {{project.time}}
    div.wrap-discription
      span.line-clamp3 {{project.discription}}

</template>

<style lang="scss" scoped>

.wrap-project-card {
  background: #FFF;
  border-radius: 3px;
  filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
  cursor: pointer;
  .wrap-title {
    border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
    .wrap-icon {
      width: 48px;
      height: 48px;      
      border-radius: 50%;
      overflow: hidden;
      border: solid #999 1px;
      img {
        object-fit: cover;
        min-height: 100%;
        min-width: 100%;
      }
    }
    .title {
      font-size: 24px;
      max-width: 200px;
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
      this.$router.push(`/canvas/${this.project.id}`);
    }
  }
}
</script>
