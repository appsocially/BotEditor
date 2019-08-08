<template lang="pug">

  Auth(:on-failed-authentication="onFailedAuthentication" @loggedIn="onLoggedIn")
    div(slot-scope="{signOut}").wrap-top-page.py48
      util-header(:label='label')
      //module-projects
      div.wrapper.mt80
        div.wrap-add-new-project.py20.f.flex-between
          div.wrap-input.px4
            input(v-model='botName' placeholder='Bot Name').px4.py8
          span(@click='createNewBot').create-button.px12.f.fh Create Bot
        div.wrap-projects.mt20.pb40
          // span(@click="addConditionToAllNodes") update
          div(v-for='item in projects' @click='toCanvas(item.id)').project.mb12.f.fh
            div
              span.title.mb18 {{item.title}}
              span.name.mb2 {{item.userName}}
              span.created-at Edited at {{item.time}}


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
      background: #FFEB52;
      color: #2A2A2A;
      border-radius: 3px;
      filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
    }
  }
  .wrap-projects {
    width: 90%;
    max-width: 540px;
    margin: 0 auto;
    .project {
      width: 100%;
      height: 180px;
      background: #FFF;
      border-radius: 3px;
      filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
      cursor: pointer;
      .title {
        font-size: 16px;
      }
      span {
        display: block;
        font-size: 12px;
        text-align: center;
      }
    }
  }  
}

</style>

<script>
import Auth from '@/components/auth';
import { createNamespacedHelpers } from "vuex";
const { mapState, mapActions } = createNamespacedHelpers(
 "auth"
);

import db from "../components/firebaseInit";

import UtilHeader from "../components/util/UtilHeader";

export default {
  name: 'Canvas',
  components: {
    Auth,
    UtilHeader
  },
  data() {
    return {
      label: 'Scenarios',
      projects: [],
      botName: '',
      inputBotName: '',
      letCreate: true,
    }
  },
  created: async function(){
    
  },
  methods: {
    ...mapActions([
      ''
    ]),
    onFailedAuthentication() {
      //this.loggingIn = false;
      this.$router.push('sign-in');
    },
    async onLoggedIn({ onboardingData }) {
      
      this.projects = await db.collection("projects")
        .orderBy("editedAt", "desc")
        .where('author', '==', this.uid)
        //.where('author', '==', 'pc28zrjHf3gzOQ4kaYrhCVpDO3X2')
        .get().then(function(doc) {
          return doc.docs.map(function(doc){
            var data = doc.data();
            data.id = doc.id;

            var time = data.editedAt.toDate();
            data.time = moment(time).format("YYYY-MM-DD HH:mm");

            return data;
          });
        });
    },
    toCanvas(projectId){
      this.$router.push(`/canvas/${projectId}`);
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
          userIcon: user.photoUrl,
          title: this.inputBotName,
          createdAt: new Date(),
          editedAt: new Date(),
          nodeNum: 2,
        };

        var id = await db.collection("projects")
          .add(projectObj)
          .then(function(data) {
            var id = data.id
            return id;
          });

        await db.collection("projects").doc(id)
          .collection('scenario')
          .doc(`start-point-${id}`)
          .set({
            author: user.uid,
            id: `start-point-${id}`,
            type: 'start-point',
            nodeType: 'point',
            next: `first-${id}`,
            text: 'Start Point',
            num: 0,
            gui: {
              position: {x: 100, y: 100000/2},
              topLineId: `line-start-point-${id}`
            }
          });

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
          });

        $('#nowLoading').fadeOut(400);

        this.$router.push(`/canvas/${id}`);
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
                    next: selections[s_i].next
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
                  next: nodes[n_i].next
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
    }
    /*deleteBot() {

    }*/
  },
  watch: {
    botName: function(newVal, oldVal){
      this.inputBotName = newVal;
    }
  },
  computed: {
    ...mapState([
      'uid',
    ]),
  }
};
</script>
