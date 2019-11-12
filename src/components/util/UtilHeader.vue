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
        div(v-for="item in rightIcon" @click="onRight(item.to)").mr10
          span(v-if="item.label") {{item.label}}
          v-icon(v-if="item.icon") {{item.icon}}
        div(v-if="othersList").wrap-others
          // a(@click="toggleOthersList") {{$t("navigation.others")}}
          v-icon(@click="toggleOthersList" size="24") more_horizon
          div(v-if="showOthersList").others-list.px12.pb8
            a(v-for="item in othersList" @click="onInOthers(item.to)" :class="item.to.replace('/', '')").mt8 {{item.label}}

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
    width: 92%;
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
      .wrap-others {
        position: relative;
        width: 24px;
        .others-list {
          filter: drop-shadow(2px 1px 1px rgba(0, 0, 0, 0.2));
          background: #FFF;
          position: absolute;
          right: 0;
          top: 40px;
          border-radius: 3px;
          a {
            display: block;
            color: #2a2a2a;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
          }
          .sign-in {
            color: #FF9999;
          }
        }
      }
    }
  }
}

</style>

<style src="../../plugins/meltline.css"></style>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers(
 "auth"
)

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
    },
    othersList: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
      showOthersList: false
    }
  },
  created: function(){
    window.signOut = this.signOut;
  },
  methods: {
    ...mapActions([
      'signOut'
    ]),
    onLeft () {
      this.$router.push(`${this.leftIcon.to}`)
    },
    onRight (to) {
      this.$router.push(`${to}`)
    },
    async onInOthers (to) {
      if(to === "/sign-in") await this.signOut()
      this.$router.push(`${to}`)
    },
    toggleOthersList () {
      this.showOthersList = !this.showOthersList
    }
  }
};
</script>
