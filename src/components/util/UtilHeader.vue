<template lang="pug">

  div.wrap-util
    div.util-content.f.flex-between
      div.icon-left.f.fm
        span test-l
      div.label.f.fm
        span {{label}}
      div.icon-right.f.fm
        span test-r

</template>

<style lang="scss">

.wrap-util {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 48px;
  border-bottom: solid .6px rgba(0,0,0,0.2);
  background: #f8f8f8;
  .util-content {
    margin: 0 auto;
    width: 90%;
    max-width: 1048px;
    height: 100%;
  }
}

</style>

<style src="../../plugins/meltline.css"></style>

<script>
export default {
  name: 'UtilHeader',
  props: ['label'],
  data() {
    return {
      project: 'test',
    }
  },
};
</script>
