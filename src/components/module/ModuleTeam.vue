<template lang="pug">
  Auth(@loggedIn="loggedIn" :on-failed-authentication="onFailedAuthentication")
    div.wrap-module-team.pt40
      ItemTeamProfile(v-if="team" :team="team").mb20
      div(v-if="team").wrap-export-button.f.fc.mb20
        div.export-button.f.fm
          v-progress-circular(v-if="isExporting" color="#999" :size="20" indeterminate).mr4
          v-icon(v-else size="20px" color="#999").mr4 vertical_align_bottom
          span(@click="exportChatLog").button-export Export Chat Log
      div.wrap-member
        ItemTeamMember(v-for="member in memberUsers" v-if="member.type === 'bot'"
          :member="member"
          :key="member.uid")
        ItemTeamMember(v-for="member in memberUsers"
          v-if="member.type === 'human' && !member.isAnonymous"
          :member="member"
          :key="member.uid")
        // span(@click="logout") Sign Out

</template>

<style lang="scss">
.wrap-module-team {
  width: 100%;
  min-height: 100vh;
  .wrap-export-button {
    .export-button {
      cursor: pointer;
      span {
        color: #999;
      }
    }
  }
  .wrap-member {
    border-top: solid 1px rgba(0, 0, 0, 0.1);
  }
}
</style>

<script>
import moment from 'moment'
import db from '@/components/firebaseInit'
import { createNamespacedHelpers } from 'vuex'
import Auth from '@/components/auth'
import ItemTeamProfile from '@/components/item/ItemTeamProfile'
import ItemTeamMember from '@/components/item/ItemTeamMember'
const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers('team')

export default {
  components: {
    Auth,
    ItemTeamProfile,
    ItemTeamMember
  },
  data () {
    return {
      isExporting: false
    }
  },
  computed: {
    ...mapStateAuth(['uid']),
    ...mapStateTeam(['team', 'memberUsers'])
  },
  methods: {
    ...mapActionsAuth(['signOut']),
    ...mapActionsTeam(['loadCurrentTeam']),
    // logout () {
    //   this.signOut()
    //   setTimeout(() => {
    //     this.$router.push('/sign-in')
    //   }, 400)
    // },
    loggedIn () {
      this.loadCurrentTeam(this.uid)
    },
    onFailedAuthentication () {
      this.$router.push('/sign-in')
    },
    async exportChatLog () {
      if (this.isExporting) return true

      this.isExporting = true
      var rooms = await db.collection("teams")
        .doc(this.team.id)
        .collection("rooms")
        .get()
        .then(q => {
          return q.docs.map(d => {
            var room = d.data()
            room.id = d.id
            return room
          })
        })
      
      var dataToExport = [["roomId", "createdAt", "createdBy", "text", "tmpId", "templateType"]]
      for (var i = 0; i < rooms.length; i++) {
        var messages = await db.collection("teams")
          .doc(this.team.id)
          .collection("rooms")
          .doc(rooms[i].id)
          .collection("messages")
          .orderBy("createdAt", "asc")
          .get()
          .then(q => {
            return q.docs.map(d => {
              return d.data()
            })
          })
        for (var j = 0; j < messages.length; j++) {
          var nodeId = (messages[j].nodeId)? messages[j].nodeId : "guest_input"
          var text = (messages[j].text)? messages[j].text.split(",").join(" ") : ""
          var row = [
            rooms[i].id,
            moment(messages[j].createdAt.toDate()).format('YYYY-MM-DD hh:mm'),
            messages[j].createdBy,
            text,
            nodeId,
            messages[j].type
          ]
          dataToExport.push(row)
        }
        // dataToExport.push([])
      }
      this.csvExport(dataToExport)

      this.isExporting = false
    },
    csvExport(arrData) {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += [
        // Object.keys(arrData[0]).join(","),
        ...arrData.map(item => Object.values(item).join(","))
      ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "")
      
      const data = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", data)
      link.setAttribute("download", moment(new Date()).format('YYYY-MM-DD_hh-mm'))
      link.click()
    }
  }
}
</script>
