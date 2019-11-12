<template lang="pug">
  div.wrap-module-inbox
    div(v-if="guestUsers && lockCardsOver4 !== null")
      ItemInboxCard(
        v-for="(user, index) in guestUsers"
        :user="user"
        :key="user.uid"
        :index="index"
        :cardsNum="guestUsers.length"
        :lockCardsOver4="lockCardsOver4"
        @joinIndividualCRMPlan="joinIndividualCRMPlan")
</template>

<style lang="scss">
.wrap-module-inbox {
  width: 100%;
}
</style>

<script>
import ItemInboxCard from '@/components/item/ItemInboxCard'
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

import firebaseConfig, { api, stripeKey } from "@/components/config"
const stripe = Stripe(stripeKey)
const INDIVIDUAL_CUSTOMVAR_CRM_PLAN = 'INDIVIDUAL_CUSTOMVAR_CRM_PLAN'

export default {
  components: {
    ItemInboxCard
  },
  computed: {
    ...mapStateAuth([
      'uid',
      'currentTeam'
    ]),
    ...mapStateTeam([
      'team',
      'guestUsers'
    ])
  },
  data () {
    return {
      cards: [],
      lockCardsOver4: null
    }
  },
  async created () {
    await this.setUserTeamOf(this.uid)
    await this.setTeam(this.currentTeam)

    var userPlan = await this.getPlanOfUser(this.uid)

    var sessionIdInURLParam = this.getParam('session_id')
    
    // If user needs to set plan
    if (this.team.roomNum >= 4 && !sessionIdInURLParam && userPlan === 'BASIC_PLAN') {
      this.lockCardsOver4 = true
    } else {
      this.lockCardsOver4 = false
    }
    if (sessionIdInURLParam && sessionIdInURLParam !== 'error') {
      this.$router.push("/inbox")
      alert('Succeeded! Please continue to enjoy Chatcenter!')
    }

    await this.loadGuestUsers(this.currentTeam)
  },
  async mounted () {

  },
  methods: {
    ...mapActionsAuth([
      'setUserTeamOf',
      'getPlanOfUser',
      'updatePlanOfUser'
    ]),
    ...mapActionsTeam([
      'setTeam',
      'loadGuestUsers'
    ]),
    async joinIndividualCRMPlan () {
      // const api = 'http://localhost:5000/chatcenter-min-ui/us-central1'
      // const api = 'https://us-central1-chatcenter-min-ui.cloudfunctions.net'
      const response = await fetch(`${api}/getStripeSession`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          uid: this.uid,
          origin: location.origin,
          plan: INDIVIDUAL_CUSTOMVAR_CRM_PLAN
        })
      })
      
      var session = await response.json()
      
      stripe.redirectToCheckout({
        sessionId: session.id
      }).then(function (result) {
        console.log('result:', result)
      })
    },
    getParam (name, url) {
      if (!url) url = window.location.href
      name = name.replace(/[\[\]]/g, '\\$&')
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
      var results = regex.exec(url)
      if (!results) return null
      if (!results[2]) return ''
      return decodeURIComponent(results[2].replace(/\+/g, ' '))
    }
  }
}
</script>
