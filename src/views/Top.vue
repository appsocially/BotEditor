<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div(slot-scope="{signOut}").wrap-top-page.py48
      util-header(:label='label' :leftIcon="headerLeft" :rightIcon="headerRight" :othersList="othersList")
      div.wrapper.mt80
        div.wrap-add-new-project.py20.f.flex-between
          div.wrap-input.px4
            input(v-model='botName' :placeholder='inputBotNamePlaceholder').px4.py8
          span(@click='createNewBot').create-button.px12.f.fh {{createBotLabel}}
        div.wrap-projects.mt20.pb40
          // Data Update for v2
          // span(@click="addConditionToAllNodes") update          
          item-project-card(v-for="item in projects" :project="item" @deleteProjectCard="deleteProjectCard")


</template>

<style lang="scss">

.wrap-top-page {
  .wrap-add-new-project {
    width: 90%;
    max-width: 540px;
    margin: 0 auto;
    .wrap-input {
      filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
      width: calc(100% - 90px);
      background: #FFF;
      input {
        width: 100%;
        outline: none;
        font-size: 16px;
      }
    }
    .create-button {
      cursor: pointer;
      width: 84px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      background: #ff9a0a;
      color: #fff;
      border-radius: 3px;
      filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
    }
  }
  .wrap-projects {
    width: 90%;
    max-width: 540px;
    margin: 0 auto;
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
import ItemProjectCard from "../components/item/ItemProjectCard"

export default {
  components: {
    Auth,
    UtilHeader,
    ItemProjectCard
  },
  data() {
    return {
      label: '',
      projects: [],
      botName: '',
      inputBotName: '',
      inputBotNamePlaceholder: this.$t("top.create_bot.placeholder"),
      createBotLabel: this.$t("top.create_bot.button_label"),
      letCreate: true,
      headerLeft: {
        to: "/openbots"
      },
      headerRight: [
        {
          label: this.$t("navigation.my_bots"),
          to: "/top"
        },
        {
          label: this.$t("navigation.open_bots"),
          to: "/openbots"
        }
      ],
      othersList: [
        {
          label: this.$t("navigation.service_terms"),
          to: "/service-terms"
        },
        {
          label: this.$t("navigation.plivacy_policy"),
          to: "/plivacy-policy"
        },
        {
          label: this.$t("navigation.sign_out"),
          to: "/sign-in"
        }
      ],
      // headerRight: {
      //   label: "My Bots",
      //   to: "/top"
      // },
    }
  },
  created: async function(){
    
  },
  methods: {
    ...mapActions([
      'signOut'
    ]),
    onFailedAuthentication() {
      //this.loggingIn = false;
      this.$router.push('sign-in')
    },
    async onLoggedIn({ onboardingData }) {

      // for debug
      window.signOut = this.signOut
      
      this.projects = await db.collection("projects")
        .orderBy("editedAt", "desc")
        .where('author', '==', this.uid)
        //.where('author', '==', 'pc28zrjHf3gzOQ4kaYrhCVpDO3X2')
        .get().then(function(doc) {
          return doc.docs.map(function(doc){
            var data = doc.data()
            data.id = doc.id

            var time = data.editedAt.toDate()
            data.time = moment(time).format("YYYY-MM-DD HH:mm")

            return data;
          })
        })
    },
    toCanvas(projectId){
      this.$router.push(`/canvas/${projectId}`)
    },
    async createNewBot(){
      if(this.inputBotName=='') return;

      if(this.letCreate){
        this.letCreate = false;

        $('#nowLoading').fadeIn(400);

        console.log(this.inputBotName);

        var userDoc = await db.collection('users').doc(this.uid).get();
        var user = userDoc.data();

        var projectObj = {
          author: user.uid,
          userName: user.name,
          botIcon: "https://firebasestorage.googleapis.com/v0/b/bot-editor-dev.appspot.com/o/public%2Fweak_ai.png?alt=media&token=fba07766-397a-41ba-a0b9-a225f6dc69c9",//user.photoUrl,
          title: this.inputBotName,
          discription: this.$t("top.create_bot.default_content.description"),//"No Discription",
          publishedAsFormat: false,
          createdAt: new Date(),
          editedAt: new Date(),
          nodeNum: 2
        }

        var id = await db.collection("projects")
          .add(projectObj)
          .then(function(data) {
            var id = data.id
            return id
          })

        await db.collection("projects").doc(id)
          .collection('scenario')
          .doc(`start-point-${id}`)
          .set({
            author: user.uid,
            id: `start-point-${id}`,
            type: 'start-point',
            nodeType: 'point',
            eventType: 'open_chat',
            conditions: [
              {
                id: `else-start-point-${id}`,
                next: `first-${id}`,
                type: "else"
              }
            ],
            // next: `first-${id}`,
            text: 'Start Point',
            num: 0,
            gui: {
              position: {x: 100, y: 100000/2}
              // topLineId: `line-start-point-${id}`
            }
          })

        await db.collection("projects").doc(id)
          .collection('scenario')
          .doc(`first-${id}`)
          .set({
            author: user.uid,
            id: `first-${id}`,
            type: 'normal',
            nodeType: 'single',
            text: 'Hello',
            num: 1,
            gui: {
              position: {x: 200, y: 100000/2-10}
            }
          })

        $('#nowLoading').fadeOut(400)

        this.$router.push(`/canvas/${id}`)
        //window.location.href = `./canvas/${id}`;
      } // if

    },
    async addConditionToAllNodes () {
      var ids = await db.collection("projects").get().then((q) => {
        return q.docs.map((e)=>{ return e.id })
      })
      
      for(var i=0; i<ids.length; i++){
        var nodes = await db.collection("projects").doc(ids[i])
          .collection("scenario").get()
          .then((q) => {
            return q.docs.map((e)=>{ return e.data() })
          })

        for(var n_i=0; n_i < nodes.length; n_i++){
          if(nodes[n_i].nodeType == "group"){
            var selections = nodes[n_i].selections
            for(var s_i=0; s_i < selections.length; s_i++){
              if(selections[s_i].next){
                selections[s_i].conditions = [
                  {
                    type: "else",
                    next: selections[s_i].next,
                    id: "else-"+selections[s_i].id
                  }
                ]
              }
            }
            db.collection("projects").doc(ids[i])
              .collection("scenario")
              .doc(nodes[n_i].id)
              .set({"selections": selections}, {merge: true})
          } else {
            if(nodes[n_i].next){
              nodes[n_i].conditions = [
                {
                  type: "else",
                  next: nodes[n_i].next,
                  id: "else-"+nodes[n_i].id
                }
              ]
              db.collection("projects").doc(ids[i])
                .collection("scenario")
                .doc(nodes[n_i].id)
                .set({"conditions": nodes[n_i].conditions}, {merge: true})
            }
          }
        }
        console.log("nodes", nodes)
      }
    },
    deleteProjectCard(id) {
      this.projects = this.projects.filter((e) => {
        return (e.id !== id)
      })
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
};
</script>
