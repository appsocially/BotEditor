<template lang="pug">
  div.wrap-module-profile
    div.wrap-user-profile.py30
      div.f.fc.mb8
        div.wrap-icon.f.fh
          img(:src="user.iconURL")
      span.name {{user.name}}
      div.f.fc.mt12
        div(@click="$router.push(`/inbox/${$route.params.teamId}/${$route.params.uid}`)").button-view-chat.f.fm.px10.py4
          v-icon(color="#FFF" size="14px").pt1.mr4 message
          span View Chat
    div(v-if="customVarsInRoom").wrap-custom-vars-list
      div(v-for="item in customVarsInRoom").wrap-custom-var.f.flex-bwteen.mb6
        div.mb4
          span.name.mr8.mb4 {{`${item.location} <${item.varType}>`}}
          span(v-if="item.varType === 'Array'") {{item.value.join(', ')}}
          span(v-else).value {{item.value}}
        // span {{moment.unix(item.createdAt).format('ll')}}
    div(v-if="customVarsInRoom && !customVarsInRoom[0]").f.fc
      span No Data

</template>

<style lang="scss">
.wrap-module-profile {
  width: 100%;
  .wrap-user-profile {
    .wrap-icon {
      width: 140px;
      height: 140px;
      min-height: 140px;
      overflow: hidden;
      border: solid 1px rgba(0, 0, 0, 0.2);
      border-radius: 50%;
    }
    .name {
      display: block;
      text-align: center;
      font-weight: bold;
    }
    .button-view-chat {
      border-radius: 3px;
      background: #ff9a0a;
      color: #FFF;
      font-size: 12px;
      font-weight: bold;
    }
  }
  .wrap-custom-vars-list {
    width: 92%;
    max-width: 340px;
    margin: 0 auto;
    .wrap-custom-var {
      span {
        display: block;
      }
      .name {
        font-size: 16px;
        font-weight: bold;
      }
      .value {
        font-size: 16px;
      }
    }
  }
}
</style>

<script>
import moment from 'moment'
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateRoom, mapActions: mapActionsRoom } = createNamespacedHelpers('room')

export default {
  components: {
  },
  computed: {
    ...mapStateRoom([
      'customVarsInRoom'
    ])
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data () {
    return {

    }
  },
  async created () {
    await this.loadCustomVarsInRoom({
      teamId: this.$route.params.teamId,
      roomId: this.$route.params.uid
    })
  },
  methods: {
    ...mapActionsRoom([
      'loadCustomVarsInRoom'
    ])
  }
}
</script>
