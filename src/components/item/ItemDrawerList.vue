<template lang="pug">

  div.wrap-item-drawer-list
    div(@click="toggleChild").wrap-title.f.fm.flex-between.px10
      span {{list.title}}
      v-icon(v-if="!showChild") keyboard_arrow_down
      v-icon(v-if="showChild") keyboard_arrow_up
    div(v-if="showChild").wrap-drawer-list-content
      div(v-if="list.type === 'custom_variable'").custom-vars
        div(v-for="item in customVars").var-list.pl24.pr10.pt12.pb4
          div(v-if="item.varType === 'String' || item.varType === 'Number' || item.varType === 'Date'")
            div.f.fm.flex-between
              span.var-title {{item.location + ` <${item.varType}>`}}
              v-icon(
                v-clipboard:copy="'${'+`${item.location}`+'}'"
                v-clipboard:success="onCopy"
                size="16px"
                color="#FF9A0A") file_copy
            div.wrap-value.py8
              span(v-if="!item.value") Null
              span(v-else) {{item.value}}
          div(v-if="item.varType === 'Array'").pb8
            div.f.fm.flex-between
              span.var-title {{item.location + ` <${item.varType}>`}}
              v-icon(
                v-clipboard:copy="'${'+`${item.location}`+'}'"
                v-clipboard:success="onCopy"
                size="16px"
                color="#FF9A0A") file_copy
            div.wrap-array-values.py8
              span(v-if="!item.value[0]") Null
              span(v-else v-for="element in item.value").array-value {{`- ${element}`}}
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
      .wrap-array-values {
        .array-value {
          display: block;
          font-size: 14px;
        }
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
const { mapState, mapActions, mapGetters } = createNamespacedHelpers("scenario")
const { mapState: mapStateScenarioForChat } = createNamespacedHelpers('scenarioForChat')
const { mapState: mapStateProject, mapActions: mapActionsProject } = createNamespacedHelpers("project")

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
      exportsItems: [this.$t("canvas.drawer.menu.exports.upil_label")],
      variableValue: ""
    }
  },
  computed: {
    ...mapState([
      'scenarioArray'
    ]),
    ...mapStateScenarioForChat([
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
        case this.$t("canvas.drawer.menu.exports.upil_label"):
          var validateUpil = window.lintScenarioForUPILOutput(this.scenarioArray)
          if(validateUpil.result === "success") {
            var upilText = window.exportScenarioAsUPIL(this.scenarioArray)
            this.download(`${this.project.title}.txt`, upilText)
          }else{
            alert(`Export Error ${validateUpil.errors[0]}`)
          }
        break
      }
    },
    download (filename, text) {
      var element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
      element.setAttribute('download', filename)

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
    },
    onCopy () {
      alert("Custom Var has been copied.")
    }
  }
}
</script>
