<template lang="pug">

  div.wrap-canvas-page
    util-header(:label='label')
    module-canvas(v-if='!!project && !!scenario' :project='project')
    //module-canvas(v-if='!!project && !!scenarioArray' :project='project' :scenarioArray='scenarioArray')
    div.wrap-preview
      //item-preview-header
      module-conversation(v-if='!!project && !!scenario' :project='project')
      //module-conversation(v-if='!!project' :project='project')


</template>

<style lang="scss">

.wrap-canvas-page {

  .wrap-preview {
    position: fixed;
    z-index: 200;
    right: 16px;
    bottom: 16px;
    width: 300px;
    height: 440px;
    filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
    overflow: hidden;
    border-radius: 3px;
  }

}

</style>

<script>
import db from "../components/firebaseInit";
import { createNamespacedHelpers } from "vuex";

const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
);

import UtilHeader from "../components/util/UtilHeader";
import ModuleCanvas from "../components/module/ModuleCanvas";
import ModuleConversation from "../components/module/ModuleConversation";

import ItemPreviewHeader from "../components/item/ItemPreviewHeader";

export default {
  name: 'Canvas',
  components: {
    UtilHeader,
    ModuleCanvas,
    ModuleConversation,
    ItemPreviewHeader
  },
  //props: ['labels', 'projects'],
  data() {
    return {
      label: 'Label Test',
      project: null,
      //scenarioArray: null,
      scenario: null,
    }
  },
  created: async function(){

    var projectId = this.$route.params.id;

    var project = await db.collection("projects")
      .doc(projectId)
      .get()
      .then(function(doc) {
        var data = doc.data()
        data.id = doc.id;
        return data;
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
      });

    console.log('canvas', project);
    this.label = project.title;
    this.project = project;

    await this.loadScenarioByProjectId(projectId);
    this.scenario = this.scenarioArray;

    //var test = await this.loadScenarioByProjectId(projectId);
   
    /*
    var scenarioArray = await db.collection("projects")
      .doc(projectId)
      .collection('scenario')
      .get()
      .then(function(doc) {
        return doc.docs.map(function(doc){
          return doc.data();
        });
      }); 

    this.scenarioArray = scenarioArray;
    */

    //console.log('module-canvas (scenarioArray)', this.scenarioArray);

  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId',
      'pushContentToScenario',
      'connectSingleNode',
      'connectGroupNode'
    ]),
  },
  computed: {
    ...mapState([
      'scenarioArray',
    ]),
  }
};
</script>
