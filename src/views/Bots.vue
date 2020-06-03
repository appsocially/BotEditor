<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div.wrap-bots-page.py48
      util-header(:label='label' :leftIcon="headerLeft" :rightIcon="headerRight" :othersList="othersList")
      div.wrapper.mt40
        div.wrap-projects.py40
          h2.mb20 {{this.$t("open_bots.title")}}
          div.f.flex-between.flex-wrap
            div(v-for="item in projects").card-wrapper
              item-bot-format-card(:project="item")

</template>

<style lang="scss" scoped>

.wrap-bots-page {
  .wrap-projects {
    width: 90%;
    max-width: 640px;
    margin: 0 auto;
    h2 {
      font-size: 16px;
    }
    .card-wrapper {
      width: 49%;
    }
  }
}

</style>

<script>
import Auth from '@/components/auth'
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions } = createNamespacedHelpers(
 "auth"
)

import db from "../components/firebaseInit"

import UtilHeader from "../components/util/UtilHeader"
import ItemBotFormatCard from "../components/item/ItemBotFormatCard"

export default {
  name: 'Canvas',
  components: {
    Auth,
    UtilHeader,
    ItemBotFormatCard
  },
  data() {
    return {
      label: '',
      projects: [],
      botName: '',
      inputBotName: '',
      letCreate: true,
      headerLeft: {
        //to: "/openbots"
        to: "/top"
      },
      headerRight: [
        {
          // label: this.$t("navigation.my_bots"),
          icon: "home",
          to: "/top"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "inbox",
          to: "/inbox"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "group",
          to: "/team"
        },
        {
          // label: this.$t("navigation.team"),
          icon: "local_grocery_store",
          to: "/store"
        }
        // {
        //   label: this.$t("navigation.open_bots"),
        //   to: "/openbots"
        // }
      ],
      othersList: [
        {
          label: this.$t("navigation.service_terms"),
          to: "/service-terms"
        },
        {
          label: this.$t("navigation.privacy_policy"),
          to: "/privacy-policy"
        },
        {
          label: this.$t("navigation.sign_out"),
          to: "/sign-in"
        }
      ]
    }
  },
  created: async function(){
    
    this.projects = await db.collection("projects")
      .orderBy("editedAt", "desc")
      .where('publishedAsFormat', '==', true)
      //.where('author', '==', 'pc28zrjHf3gzOQ4kaYrhCVpDO3X2')
      .get().then(function(q) {
        return q.docs.map(function(doc){
          var data = doc.data()
          data.id = doc.id

          var time = data.editedAt.toDate()
          data.time = moment(time).format("YYYY-MM-DD HH:mm")

          return data;
        })
      })
  },
  methods: {
    ...mapActions([
      ''
    ]),
    onLoggedIn () {

    },
    onFailedAuthentication () {

    }
  },
  watch: {
    botName: function(newVal, oldVal){
      this.inputBotName = newVal
    }
  },
  computed: {
    ...mapState([
      'uid',
    ]),
  }
}
</script>
