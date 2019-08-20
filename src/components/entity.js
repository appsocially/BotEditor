
var entity = {};

entity.getContent = function(scenario, id){
  for(var i=0; i<scenario.length; i++){
    if(scenario[i].id == id) return scenario[i];
  }

  return false;
}

entity.getStartPointNode = function(scenario){
  for(var i=0; i<scenario.length; i++){
    if(scenario[i].type == "start-point") return scenario[i];
  }
}

entity.getFirstNode = function(scenario){
  for(var i=0; i<scenario.length; i++){
    if(scenario[i].type == "start-point") return entity.getContent(scenario, scenario[i].next);
  }
}

entity.getNormalNodes = function(scenario){
  return scenarioArray.filter(function(content){
    return content.type == 'normal';
  });
}

entity.getSelectionNodes = function(scenario){
  return scenarioArray.filter(function(content){
    return content.type == 'selection';
  });
}

entity.getOpenQuestionNodes = function(scenario){
  return scenarioArray.filter(function(content){
    return content.type == 'openquestion';
  });
}

entity.getGoToNodes = function(scenario){
  return scenarioArray.filter(function(content){
    return content.type == 'goto';
  });
}

entity.getNodesThatConnectTo = function(scenario, id){
  var nodes = [];
  for (var i = 0; i < scenario.length; i++) {
    if ((scenario[i].nodeType == 'single' || scenario[i].nodeType=='point') && scenario[i].next == id) {
      nodes.push(scenario[i]);
    }
    if(scenario[i].nodeType == 'group'){
      var selections = scenario[i].selections;
      for(var j=0; j<selections.length; j++){
        if(selections[j].next == id){
          nodes.push(selections[j]);
        }
      }
    }
  }
  return nodes;
}

entity.nodeHasNext = function(scenario, id){
  for (var i = 0; i < scenario.length; i++) {
    if((scenario[i].nodeType == 'single' || scenario[i].nodeType=='point') && scenario[i].id==id){
     
      return (scenario[i].next) ? true : false;

    }
    if(scenario[i].nodeType == 'group' && scenario[i].id==id){
      var selections = scenario[i].selections;
      for(var j=0; j<selections.length; j++){
        //if(selections[j].id == id){
          return (selections[j].next) ? true : false;
        //}
      }

    }
  }
}

entity.getNodesThatConnectFrom = function(scenario, id){
  var nodes = [];
  for (var i = 0; i < scenario.length; i++) {
    if((scenario[i].nodeType == 'single' || scenario[i].nodeType=='point') && scenario[i].id==id){
      if(scenario[i].next) nodes.push(scenario[i]);
    }
    if(scenario[i].nodeType == 'group' && scenario[i].id==id){
      var selections = scenario[i].selections;
      for(var j=0; j<selections.length; j++){
        if(selections[j].next) nodes.push(selections[j]);
      }
    }
  }

  return nodes;
}

entity.getEdgesThatConnectTo = function(scenario, id){
  var edges = [];
  for (var i = 0; i < scenario.length; i++) {
    if(scenario[i].nodeType == 'single' || scenario[i].nodeType=='point'){
      if(scenario[i].conditions){
        var targetConditions = scenario[i].conditions.filter((e) => {return (e.next==id)})
        targetConditions.map((e) => { 
          var c = e
          c.fromNodeId = scenario[i].id
          return c
        })
        edges = edges.concat(targetConditions)
      }
    }
    if(scenario[i].nodeType == 'group'){
      var selections = scenario[i].selections;
      for(var j=0; j<selections.length; j++){
        if(selections[j].conditions){
          var targetConditions = selections[j].conditions.filter((e) => {return (e.next==id)})
          targetConditions.map((e) => { 
            var c = e
            c.fromNodeId = selections[j].id
            return c
          })
          edges = edges.concat(targetConditions)
        }
      }
    }
  }
  return edges;
}

entity.getEdgesThatConnectFrom = function(scenario, id){
  var edges = []
  
  var targetNode = scenario.filter((e) => {
    return (id == e.id)
  })[0]
  
  if(targetNode.nodeType == 'single' || targetNode.nodeType=='point'){
    if(targetNode.conditions){
      var targetConditions = targetNode.conditions
      targetConditions.map((e) => { 
        var c = e
        c.fromNodeId = targetNode.id
        return c
      })
      edges = edges.concat(targetConditions)
    }
  }
  
  if(targetNode.nodeType == 'group'){
    var selections = targetNode.selections;
    for(var j=0; j<selections.length; j++){
      if(selections[j].conditions){
        var targetConditions = selections[j].conditions
        targetConditions.map((e) => { 
          var c = e
          c.fromNodeId = selections[j].id
          return c
        })
        edges = edges.concat(targetConditions)
      }
    }
  }

  return edges;
}

entity.getConditions = function(scenario, id){
  var conditions = []
  
  if(id.indexOf("selection") !== 0){
    var targetNode = scenario.filter((e) => {
      return (id == e.id)
    })[0]
    
    if(targetNode.nodeType == 'single' || targetNode.nodeType=='point'){
      if(targetNode.conditions){
        conditions = targetNode.conditions.map((e) => { 
          var c = e
          c.fromNodeId = targetNode.id
          return c
        })
      }
    }
  } else {
    var selectionGroupId = id.split("-")[0]
    var selections = scenario.filter((e) => {
      return (selectionGroupId == e.id)
    })[0].selections

    for(var j=0; j<selections.length; j++){
      if(selections[j].id === id && selections[j].conditions){
        conditions = selections[j].conditions
      }
    }
  }  

  return conditions;
}

entity.getContentByConditionId = function(scenario, id){

  var content
  for(var i=0; i<scenario.length; i++){
    if(scenario[i].nodeType === "single" || scenario[i].nodeType === "point"){
      if(scenario[i].conditions){
        content = scenario[i].conditions.filter((e) => {
          return (e.id === id)
        })[0]

        if(content) return scenario[i]
      }
    } else {
      var selections = scenario[i].selections
      for(var s_i=0; s_i < selections.length; s_i++){
        if(selections[s_i].conditions){
          content = selections[s_i].conditions.filter((e) => {
            return (e.id === id)
          })[0]

          if(content) return selections[s_i]
        }
      }
    }
  }

}

export default entity;