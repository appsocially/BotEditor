<template lang="pug">
  div(@click="toProfile").wrap-inbox-card.py8
    div.inbox-card-content.f.fm.flex-between
      div.f.fm
        div.wrap-icon.f.fh.mr12
          div.wrap-img.f.fh
            img(:src="user.iconURL")
        div.wrap-user-content
          span.name {{user.name}}
          span.sign-in-time {{latestSignInTimeStr}}
      div.wrap-lock
        v-icon(v-if="isLocked" size="16px" color="#FF9999") lock

</template>

<style lang="scss">
.wrap-inbox-card {
  width: 100%;
  border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
  .inbox-card-content {
    width: 92%;
    max-width: 620px;
    margin: 0 auto;
    .wrap-icon {
      .wrap-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        img {
          object-fit: cover;
        }
      }
    }
    .wrap-user-content {
      span {
        display: block;
      }
      .name {
        font-weight: bold;
      }
      .sign-in-time {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>

<script>
import moment from 'moment'
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth } = createNamespacedHelpers('auth')

export default {
  computed: {
    ...mapStateAuth([
      'currentTeam'
    ])
  },
  props: {
    user: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    cardsNum: {
      type: Number,
      required: true
    },
    lockCardsOver4: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      latestSignInTimeStr: null,
      isLocked: false
    }
  },
  created () {
    this.latestSignInTimeStr = moment.unix(this.user.latestSignInTime.seconds).format('lll')

    // If a user has no plan to list custom var
    console.log(this.lockCardsOver4)
    if (this.lockCardsOver4 && (this.cardsNum - this.index) >= 4) {
      this.isLocked = true
    }
  },
  methods: {
    toProfile () {
      if (this.isLocked) {
        var agree = confirm('You need update your plan to see more users who contact your bot. Will you update your plan?')
        if (agree) this.$emit('joinIndividualCRMPlan')
        return
      }
      this.$router.push(`/profile/${this.currentTeam}/${this.user.uid}`)
    }
  }
}
</script>
