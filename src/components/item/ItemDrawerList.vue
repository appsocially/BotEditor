<template lang="pug">

  div.wrap-item-drawer-list
    div(@click="toggleChild").wrap-title.f.fm.flex-between.px10
      span {{list.title}}
      v-icon(v-if="!showChild") keyboard_arrow_down
      v-icon(v-if="showChild") keyboard_arrow_up
    div(v-if="showChild").wrap-drawer-list-content
      div(v-if="list.type === 'custom_variable'").custom-vars
        div(v-for="item in customVars").var-list.pl24.pr10.pt12.pb4
          span.var-title {{item.location + ` <${item.varType}>`}}
          v-text-field(label="Value" :value="item.value" placeholder="Null" @keyup="upField(item.location ,$event)")
        // そもそもここで変種できる必要あるかな？
        //div(v-for="item in customVars").var-list.pl20.pr10.pt12
          v-text-field(label="Name" :value="item.location").pt8
          v-select(:items="varTypes" label="Type" :value="item.varType")
          v-text-field(label="Value" :value="item.value" placeholder="Null")
      div(v-if="list.type === 'exports'").exports
        div(v-for="li in exportsItems" @click="exportScenario(li)").exports-list.pl24.pr10.py12
          span {{li}}

</template>

<style lang="scss">

.wrap-item-drawer-list {
  cursor: pointer;

  transition: all 200ms ease-out;
  .wrap-title {
    width: 100%;
    min-width: 160px;
    height: 48px;
    background: #FFF;
    border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
  }
  .wrap-drawer-list-content {
    /*background: #F8F8F8;*/
    .var-list {
      border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
      .var-title {
        font-size: 16px;
      }
      // .custom-vars {
      //   border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
      //   .var-name {
      //     font-size: 16px;
      //   }
      //   .v-input {
      //     margin: 0;
      //     padding: 0;
      //   }        
      // }
    }
    .exports {
      .exports-list {
        cursor: pointer;
        border-bottom: solid 0.6px rgba(0, 0, 0, 0.2);
        span {
          color: #ff9a0a;
        }
      }
    }
  }
}

</style>

<script>
import { createNamespacedHelpers } from "vuex"
const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
)
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers(
 "project"
)

import exportUPIL from "../exportUPIL"
import lintScenario from "../lintScenario"

export default {
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showChild: false,
      varTypes: ['String', 'Number'],
      exportsItems: ["Export for Upil"],
      variableValue: ""
    }
  },
  computed: {
    ...mapState([
      'scenarioArray',
      'customVars'
    ]),
    ...mapStateProject([
      'project'
    ]),
  },
  watch: {
    
  },
  created: function(){
    
  },
  mounted: async function(){

  },
  methods: {
    ...mapActions([
      'insertValueIntoCustomVar'
    ]),
    toggleChild () {
      this.showChild = !this.showChild
    },
    upField (id, event) {
      this.insertValueIntoCustomVar({id: id, value: event.target.value})
    },
    exportScenario (target) {
      switch(target){
        case "Export for Upil":
          var validateUpil = window.lintScenarioForUPILOutput(this.scenarioArray)
          if(validateUpil.result === "success") {
            var upilText = window.exportScenarioAsUPIL(this.scenarioArray)
            this.download (`${this.project.title}.txt`, upilText)
          }
        break
      }
    },
    download (filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }
};
</script>
