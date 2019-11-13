<template lang="pug">
  div.wrap-home-member.py10
    div(v-if="member.type === 'bot' && botUser").member-content.f.flex-between
      div.wrap-left.f.fm
        div.wrap-icon.f.fh.mr12
          img(:src="botUser.iconURL")
        div.wrap-info
          div.f.fm
            span.line-clamp-1.mr8 {{botUser.name}}
            span.type.mr6 Bot
            span(v-if="isPrimary").is-primary (Primary)
          span.profile.line-clamp-1 {{botUser.profile}}
      div.wrap-right.f.fm
        // a(:href="botUser.scenarioURL" target="brank")
        div(@click="$router.push(`/canvas/${member.projectId}`)")
          v-icon account_tree

    div(v-if="member.type === 'human'").member-content.f.flex-between
      div.wrap-left.f.fm
        div.wrap-icon.f.fh.mr12
          img(:src="member.iconURL")
        div.wrap-info
          div.f.fm
            span.line-clamp-1.mr8 {{member.name}}
            span.type.mr6 Human
            span(v-if="isPrimary").is-primary (Primary)
          span.profile.line-clamp-1 {{member.profile}}
      div.wrap-right

</template>

<style lang="scss">
.wrap-home-member {
  border-bottom: solid 1px rgba(0, 0, 0, 0.1);
  .member-content {
    width: 90%;
    max-width: 480px;
    margin: 0 auto;
    .wrap-left {
      width: 80%;
      .wrap-icon {
        width: 48px;
        min-height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: solid 1px rgba(0, 0, 0, 0.1);
        img {
          object-fit: cover;
        }
      }
      .wrap-info {
        width: 70%;
        .type {
          font-size: 10px;
          color: #999;
        }
        .profile {
          font-size: 10px;
          color: #999;
        }
        .is-primary {
          font-size: 10px;
          color: #ff9a0a;
        }
      }
    }
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateTeam } = createNamespacedHelpers('team')
const { mapActions: mapActionsProject } = createNamespacedHelpers('project')
import { api } from "@/components/firebaseInit"

export default {
  props: {
    member: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      botUser: null,
      isPrimary: false
    }
  },
  computed: {
    ...mapStateTeam(['team', 'primaryUser'])
  },
  async created () {
    if (this.member.type === 'bot') {

      var project = await this.getProject(this.member.projectId)
      
      this.botUser = {
        author: this.member.author,
        team: this.team.id,
        type: this.member.type,
        name: project.title,
        profile: project.discription,
        iconURL: project.botIcon
      }

    }

    if (this.team.primary === this.member.uid) this.isPrimary = true
  },
  methods: {
    ...mapActionsProject([
      'getProject'
    ])
  }
}
</script>
