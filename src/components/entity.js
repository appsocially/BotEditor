
var entity = {};

entity.getContent = function(scenario, id) {
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].id == id) return scenario[i];
  }

  return false;
};

entity.getStartPointNode = function(scenario) {
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].type == "start-point") return scenario[i];
  }
};

entity.getFirstNode = function(scenario) {
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].type == "start-point") {
      var matchedCondition = entity.getMatchedCondition(
        scenario,
        scenario[i].conditions
      );
      return entity.getContent(scenario, matchedCondition.next);
    }
  }
};

entity.getNormalNodes = function(scenario) {
  return scenarioArray.filter(function(content) {
    return content.type == "normal";
  });
};

entity.getSelectionNodes = function(scenario) {
  return scenarioArray.filter(function(content) {
    return content.type == "selection";
  });
};

entity.getOpenQuestionNodes = function(scenario) {
  return scenarioArray.filter(function(content) {
    return content.type == "openquestion";
  });
};

entity.getGoToNodes = function(scenario) {
  return scenarioArray.filter(function(content) {
    return content.type == "goto";
  });
};

entity.getNodesThatConnectTo = function(scenario, id) {
  var nodes = [];
  for (var i = 0; i < scenario.length; i++) {
    if (
      (scenario[i].nodeType == "single" || scenario[i].nodeType == "point") &&
      scenario[i].next == id
    ) {
      nodes.push(scenario[i]);
    }
    if (scenario[i].nodeType == "group") {
      var selections = scenario[i].selections;
      for (var j = 0; j < selections.length; j++) {
        if (selections[j].next == id) {
          nodes.push(selections[j]);
        }
      }
    }
  }
  return nodes;
};

entity.nodeHasNext = function(scenario, id) {
  for (var i = 0; i < scenario.length; i++) {
    if (
      (scenario[i].nodeType == "single" || scenario[i].nodeType == "point") &&
      scenario[i].id == id
    ) {
      return scenario[i].next ? true : false;
    }
    if (scenario[i].nodeType == "group" && scenario[i].id == id) {
      var selections = scenario[i].selections;
      for (var j = 0; j < selections.length; j++) {
        //if(selections[j].id == id){
        return selections[j].next ? true : false;
        //}
      }
    }
  }
};

entity.getNodesThatConnectFrom = function(scenario, id) {
  var nodes = [];
  for (var i = 0; i < scenario.length; i++) {
    if (
      (scenario[i].nodeType == "single" || scenario[i].nodeType == "point") &&
      scenario[i].id == id
    ) {
      if (scenario[i].next) nodes.push(scenario[i]);
    }
    if (scenario[i].nodeType == "group" && scenario[i].id == id) {
      var selections = scenario[i].selections;
      for (var j = 0; j < selections.length; j++) {
        if (selections[j].next) nodes.push(selections[j]);
      }
    }
  }

  return nodes;
};

entity.getEdgesThatConnectTo = function(scenario, id) {
  var edges = [];
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].nodeType == "single" || scenario[i].nodeType == "point") {
      if (scenario[i].conditions) {
        var targetConditions = scenario[i].conditions.filter(e => {
          return e.next == id;
        });
        targetConditions.map(e => {
          var c = e;
          c.fromNodeId = scenario[i].id;
          return c;
        });
        edges = edges.concat(targetConditions);
      }
    }
    if (scenario[i].nodeType == "group") {
      var selections = scenario[i].selections;
      for (var j = 0; j < selections.length; j++) {
        if (selections[j].conditions) {
          var targetConditions = selections[j].conditions.filter(e => {
            return e.next == id;
          });
          targetConditions.map(e => {
            var c = e;
            c.fromNodeId = selections[j].id;
            return c;
          });
          edges = edges.concat(targetConditions);
        }
      }
    }
  }
  return edges;
};

entity.getEdgesThatConnectFrom = function(scenario, id) {
  var edges = [];

  var targetNode = scenario.filter(e => {
    return id == e.id;
  })[0];

  if (targetNode.nodeType == "single" || targetNode.nodeType == "point") {
    if (targetNode.conditions) {
      var targetConditions = targetNode.conditions;
      targetConditions.map(e => {
        var c = e;
        c.fromNodeId = targetNode.id;
        return c;
      });
      edges = edges.concat(targetConditions);
    }
  }

  if (targetNode.nodeType == "group") {
    var selections = targetNode.selections;
    for (var j = 0; j < selections.length; j++) {
      if (selections[j].conditions) {
        var targetConditions = selections[j].conditions;
        targetConditions.map(e => {
          var c = e;
          c.fromNodeId = selections[j].id;
          return c;
        });
        edges = edges.concat(targetConditions);
      }
    }
  }

  return edges;
};

entity.getConditions = function(scenario, id) {
  var conditions = [];

  if (id.indexOf("selection") !== 0) {
    var targetNode = scenario.filter(e => {
      return id == e.id;
    })[0];

    if (targetNode.nodeType == "single" || targetNode.nodeType == "point") {
      if (targetNode.conditions) {
        conditions = targetNode.conditions.map(e => {
          var c = e;
          c.fromNodeId = targetNode.id;
          return c;
        });
      }
    }
  } else {
    var selectionGroupId = id.split("-")[0];
    var selections = scenario.filter(e => {
      return selectionGroupId == e.id
    })[0].selections;

    for (var j = 0; j < selections.length; j++) {
      if (selections[j].id === id && selections[j].conditions) {
        conditions = selections[j].conditions;
      }
    }
  }

  return conditions;
};

entity.getConditionByConditionId = function(scenario, id) {

  // return scenario.map((e) => {
  //   var condition
  //   if (e.nodeType === "single" || e.nodeType === "point") {
  //     if (e.conditions) {
  //       condition = e.conditions.filter((c) => {
  //         return (c.id === id)
  //       })[0]
  //     }
  //   } else if (e.nodeType === "selection") {
  //     for(var s_i=0; s_i < e.selections.length; s_i++){
  //       condition = e.selections[s_i].conditions.filter((c) => {
  //         return (c.id === id)
  //       })[0]
  //     }
  //   }
  //   return condition
  // })[0]

  var getMatchedConditions = (conditions, id) => {
    for (var i=0; i<conditions.length; i++) {
      if(conditions[i].id === id) return conditions[i]
    }
  }

  var condition
  for (var i=0; i < scenario.length; i++) {
    if (scenario[i].nodeType === "single" || scenario[i].nodeType === "point") {
      if (scenario[i].conditions){
        condition = getMatchedConditions(scenario[i].conditions, id)
        if (condition) return condition
      }
    } else if (scenario[i].nodeType === "group") {
      for (var s=0; s < scenario[i].selections.length; s++) {
        if (scenario[i].selections[s].conditions) {
          condition = getMatchedConditions(scenario[i].selections[s].conditions, id)
          if (condition) return condition
        }
      }
    }
  }
};

entity.getContentByConditionId = function(scenario, id) {
  var content;
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].nodeType === "single" || scenario[i].nodeType === "point") {
      if (scenario[i].conditions) {
        content = scenario[i].conditions.filter(e => {
          return e.id === id
        })[0]

        if (content) return scenario[i];
      }
    } else {
      var selections = scenario[i].selections;
      for (var s_i = 0; s_i < selections.length; s_i++) {
        if (selections[s_i].conditions) {
          content = selections[s_i].conditions.filter(e => {
            return e.id === id
          })[0]

          if (content) return selections[s_i];
        }
      }
    }
  }
}

entity.getNodeByConditionId = function(scenario, id) {
  var content;
  for (var i = 0; i < scenario.length; i++) {
    if (scenario[i].nodeType === "single" || scenario[i].nodeType === "point") {
      if (scenario[i].conditions) {
        content = scenario[i].conditions.filter(e => {
          return e.id === id;
        })[0];

        if (content) return scenario[i];
      }
    } else {
      var selections = scenario[i].selections;
      for (var s_i = 0; s_i < selections.length; s_i++) {
        if (selections[s_i].conditions) {
          content = selections[s_i].conditions.filter(e => {
            return e.id === id
          })[0]

          if (content) return scenario[i];
        }
      }
    }
  }
};

entity.getMatchedCondition = function(scenario, conditions, customVarsArray) {
  var matchedCondition
  var elseCondition = conditions.filter(e => {
    return e.type === "else";
  })[0]
  // debugger
  for (var i = 0; i < conditions.length; i++) {
    var conditionType = conditions[i].type;
    switch (conditionType) {
      case "custom_var":
        if (!conditions[i].option) break
        
        var customVar = customVarsArray.filter((e) => {
          return (conditions[i].option.customVarName === e.location)
        })[0]
        
        if (!customVar || !conditions[i].option) break

        var option = conditions[i].option
        switch(customVar.varType) {
          case "String":
            if (option.operator === "contains") {
              var operationStr = `'${customVar.value}'.indexOf('${option.comparedValue}') !== -1`
              if ( eval(operationStr) ) matchedCondition = conditions[i]
            } else {
              var operationStr = `'${customVar.value}' ${option.operator} '${option.comparedValue}'`
              if ( eval(operationStr) ) matchedCondition = conditions[i]
            }
          break
          case "Number":
            var operationStr = `${customVar.value} ${option.operator} ${option.comparedValue}`
            if ( eval(operationStr) ) matchedCondition = conditions[i]
          break
        }
        
      break
     
    }
  }

  if (!matchedCondition && elseCondition) return elseCondition
  if (!matchedCondition && !elseCondition) return {next: ""}
  return matchedCondition;
}

export default entity;
