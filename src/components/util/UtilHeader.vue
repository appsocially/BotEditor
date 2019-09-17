<template lang="pug">

  div.wrap-util
    div.util-content.f.flex-between
      div.icon-left.f.fm
        span(v-if="leftIcon && leftIcon.label" @click="onLeft") {{leftIcon.label}}
        a(v-else @click="onLeft").logo BotEditor
      div.icon-center.label.f.fc.fm
        span {{label}}
      div.icon-right.f.fm
        //a(v-if="rightIcon && rightIcon.label" @click="onRight") {{rightIcon.label}}
        //span(v-else)
        a(v-for="item in rightIcon" @click="onRight(item.to)").mr12 {{item.label}}

</template>

<style lang="scss" scoped>

.wrap-util {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 48px;
  border-bottom: solid .6px rgba(0,0,0,0.2);
  background: #f8f8f8;
  z-index: 1;
  .util-content {
    position: relative;
    margin: 0 auto;
    width: 90%;
    max-width: 1048px;
    height: 100%;
    .icon-left {
      .logo {
        font-weight: bold;
        font-size: 18px;
        color: #2a2a2a;
        letter-spacing: 0.4px;
        cursor: pointer;
      }
    }
    .icon-center {
      position: absolute;
      pointer-events: none;
      width: 100%;
      height: 100%;
    }
    .icon-right {
      a {
        color: #2a2a2a;
        font-weight: 500;
      }
    }
  }
}

</style>

<style src="../../plugins/meltline.css"></style>

<script>
export default {
  name: 'UtilHeader',
  props: {
    label: {
      type: String,
      required: false
    },
    rightIcon: {
      type: Array,
      required: false
    },
    leftIcon: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
    }
  },
  created: function(){
    window.signOut = this.signOut;
  },
  methods: {
    onLeft () {
      this.$router.push(`${this.leftIcon.to}`)
    },
    onRight (to) {
      this.$router.push(`${to}`)
    }
  }
};
</script>
