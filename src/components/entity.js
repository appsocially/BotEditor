
var entity = {};

entity.getContent = function(scenario, id){

  for(var i=0; i<scenario.length; i++){
    if(scenario[i].id == id) return scenario[i];
  }

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

export default entity;