<template lang="pug">

  div.wrap-atom-condition-content
    div(v-if="conditionTypeValue === 'else'").wrap-condition-content.py8
      // p else
    div(v-if="conditionTypeValue === 'custom_var'").wrap-condition-content.py8
      v-select(:items="customVarNames" :label="customVarInputLabel" v-model="customVarNameValue" @change="changeVarName")
      v-select(:items="operators" :label="operatorSelectorLabel" v-model="operatorValue" @change="saveOption")
      v-text-field(:label="valueInputLabel" v-model="comparedValue" @change="saveOption")

</template>

<style lang="scss">

.wrap-atom-condition-content {
  .wrap-condition-content {
    /*border-top: solid rgba(0,0,0,0.2) 1px;*/
  }
}

</style>

<script>

import entity from "../entity"

import { createNamespacedHelpers } from "vuex"
import { setTimeout } from 'timers'
const { mapState, mapActions } = createNamespacedHelpers("scenario")
const { mapState: mapStateScenarioForChat } = createNamespacedHelpers('scenarioForChat')

import AtomConditionContent from "../atom/AtomConditionContent"
import { functions } from 'firebase'

export default {
  name: 'AtomNodeWindow',
  components: {
    AtomConditionContent
  },
  props: {
    content: {
      type: Object,
      required: true,
    },
    conditionTypeValue: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // conditionTypes: ["else", "custom_var"]
      customVarInputLabel: this.$t("canvas.tool_window.condition.settings.operation.custom_var_name"),
      operatorSelectorLabel: this.$t("canvas.tool_window.condition.settings.operation.operator"),
      valueInputLabel: this.$t("canvas.tool_window.condition.settings.operation.value"),
      operators: [],
      operatorValue: "==",
      customVarNameValue: "",
      comparedValue: ""
    }
  },
  computed: {
    ...mapState([
      'scenarioArray'
      // 'customVars'
    ]),
    ...mapStateScenarioForChat([
      'customVars'
    ]),
    customVarNames: function() {
      return this.customVars.map((e) => {
        return e.location
      })
    }
  },
  watch: {
    customVarNameValue (newVal, oldVal) {
      var customVar = this.customVars.filter((e) => {
        return (newVal === e.location)
      })[0]
      switch(customVar.varType) {
        case "String":
          this.operators = ["==", "!=", "contains"]
        break
        case "Number":
          this.operators = ["==", "!=", ">", "<", ">=", "<="]
        break
      }
    }
  },
  created: function() {
    
  },
  mounted: function() {
    
  },
  methods: {
    ...mapActions([
      'setConditionOption'
    ]),
    updateDefaultOption() {
      var condition = entity.getConditionByConditionId(this.scenarioArray, this.content.id)
      
      switch(this.conditionTypeValue){
        case "custom_var":
          if (condition && condition.option) {
            this.operatorValue = condition.option.operator
            this.customVarNameValue = condition.option.customVarName 
            this.comparedValue = condition.option.comparedValue
          } else {
            this.operatorValue = "=="
            this.customVarNameValue = ""
            this.comparedValue = ""
          }
        break
      }
    },
    changeVarName() {
      this.operatorValue = "=="
      this.comparedValue = ""

      this.saveOption()
    },
    saveOption() {
      var option
      switch(this.conditionTypeValue){
        case "custom_var":
          option = {
            customVarName: this.customVarNameValue,
            operator: this.operatorValue,
            comparedValue: this.comparedValue
          }
        break
      }
      this.setConditionOption({
        option: option,
        conditionId: this.content.id
      })
    }
  }
};
</script>
