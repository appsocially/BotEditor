
//import itemNodeSelector from "./item/ItemNodeSelector";
/*
import { createNamespacedHelpers } from "vuex";
const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
);
*/

import entity from "./entity.js";

var nodeController = {};
nodeController.self = this;

nodeController.dragOnNode = d3.behavior.drag()
  .origin(function(d) { 
    console.log(d);
    return d; 
  })
  .on("dragstart", dragstartedOnNode)
  .on("drag", dragmoveOnNode)
  .on("dragend", dragendedOnNode);
  
function dragstartedOnNode(d) {
  d3.event.sourceEvent.stopPropagation();
}

function dragmoveOnNode(d) {
  
  d.pos.x += d3.event.dx;
  d.pos.y += d3.event.dy;
  d3.select(this) //thisは対象のノード
    .style('top', `${d.pos.y}px`)
    .style('left', `${d.pos.x}px`);

  // topLineの座標を変更
  /*
  if(entity.nodeHasNext(window.scenarioArray, d.id)){

    var svg = d3.select(`#line-${d.id}`);
    var path = svg.selectAll("path");
    svg.remove();

    var data = path[0][0].__data__;

    data.source.x += d3.event.dx;
    data.source.y += d3.event.dy;

    drawLine(data.source, data.target, d.id);
  }
  */

  // var connectedNodes = entity.getNodesThatConnectFrom(window.scenarioArray, d.id);
  
  // for(var i=0; i<connectedNodes.length; i++){
  //   var node = connectedNodes[i];
  //   var id = node.id;

  //   var svg = d3.select(`#line-${node.id}`);
  //   var path = svg.selectAll("path");

  //   if(path[0] && path[0][0]){
  //     var data = path[0][0].__data__;

  //     path.remove();

  //     data.source.x += d3.event.dx;
  //     data.source.y += d3.event.dy;

  //     window.updateEdge(data.source, data.target, id);
  //     // drawLine(data.source, data.target, id);
  //   }

  // 対象のノードにつながっているlineの座標を変更
  // var connectedNodes = entity.getNodesThatConnectTo(window.scenarioArray, d.id);
  
  // for(var i=0; i<connectedNodes.length; i++){
  //   var node = connectedNodes[i];
  //   var id = node.id;

  //   var svg = d3.select(`#line-${id}`);
  //   var path = svg.selectAll("path");
  //   path.remove();

  //   if(path[0] && path[0][0]){
  //     var data = path[0][0].__data__;

  //     data.target.x += d3.event.dx;
  //     data.target.y += d3.event.dy;

  //     window.updateEdge(data.source, data.target, id);
  //     // drawLine(data.source, data.target, id);
  //   }
  // }

  var connectedEdges = entity.getEdgesThatConnectTo(window.scenarioArray, d.id);
  
  for(var i=0; i<connectedEdges.length; i++){

    var id = connectedEdges[i].id
    
    var svg = d3.select(`#line-${id}`)
    var path = svg.selectAll("path")

    if(path[0] && path[0][0]){
      var data = path[0][0].__data__

      path.remove()

      data.target.x += d3.event.dx
      data.target.y += d3.event.dy

      window.updateEdge(data.source, data.target, id)
      // drawLine(data.source, data.target, id);
    }
  }

  // 対象のノードから繋がってるedgeの始点を変更
  var growingEdges = entity.getEdgesThatConnectFrom(window.scenarioArray, d.id);
  
  for(var i=0; i<growingEdges.length; i++){
    var id = growingEdges[i].id
    var svg = d3.select(`#line-${id}`)
    var path = svg.selectAll("path")

    if(path[0] && path[0][0]){
      var data = path[0][0].__data__

      path.remove()

      data.source.x += d3.event.dx
      data.source.y += d3.event.dy

      window.updateEdge(data.source, data.target, id)
    }
  }

  // 対象のノードにつながっているlineの座標を変更
  // var connectedNodes = entity.getNodesThatConnectTo(window.scenarioArray, d.id);
  
  // for(var i=0; i<connectedNodes.length; i++){
  //   var node = connectedNodes[i];
  //   var id = node.id;

  //   var svg = d3.select(`#line-${id}`);
  //   var path = svg.selectAll("path");
  //   path.remove();

  //   if(path[0] && path[0][0]){
  //     var data = path[0][0].__data__;

  //     data.target.x += d3.event.dx;
  //     data.target.y += d3.event.dy;

  //     window.updateEdge(data.source, data.target, id);
  //     // drawLine(data.source, data.target, id);
  //   }
  // }

}

function dragendedOnNode(d) {
  console.log('\nDrag Ended');
  
  window.updateNodePosition(d.id, d.pos);
}



nodeController.dragOnConnectStarter = d3.behavior.drag()
  .origin(function(d) {
    return d;
  })
  .on("dragstart", dragstartedOnConnectStarter)
  .on("drag", dragmoveOnConnectStarter)
  .on("dragend", dragendedOnConnectStarter);

function dragstartedOnConnectStarter(d) {
  d3.event.sourceEvent.stopPropagation();

  window.isDragingConnector = true;

  $('#lineForPreview').show();

  // ノードがselectionだった場合
  if(d.nodeId.indexOf('selection') > -1 && !(d.nodeId.indexOf('multipleSelection') > -1)){
    var childNodePos = $(`#${d.nodeId}`).position();
    var parentNodePos = $(`#${d.nodeId}`).closest('.item-node-selection').position();
    var widthOffset = $(`#${d.nodeId}`).width();
    var heightOffset = $(`#${d.nodeId}`).height()/2;

    this.from = {
      x: parentNodePos.left + childNodePos.left + widthOffset + 9,
      y: parentNodePos.top + childNodePos.top + heightOffset,
    };
    this.to = {
      x: parentNodePos.left + childNodePos.left + widthOffset + 9,
      y: parentNodePos.top + childNodePos.top + heightOffset,
    };

    console.log(this.from);
  }　else　{
    var nodePos = $(`#${d.nodeId}`).position();
    var starterWraperPos = $(`#${d.starterId}`).parent().position();
    var offset = $(`#${d.starterId}`).parent().height()/2;

    var pointOffset = 9
    // var pointOffset = (d.nodeId.indexOf('multipleSelection') > -1)? 18 : 9 

    this.from = {
      x: Math.round(nodePos.left + starterWraperPos.left + pointOffset),
      y: Math.round(nodePos.top + starterWraperPos.top + offset)
    };

    this.to = {
      x: Math.round(nodePos.left + starterWraperPos.left + pointOffset),
      y: Math.round(nodePos.top + starterWraperPos.top + offset)
    };
  }

  // console.log('Drag Started:', this.to);

}

function dragmoveOnConnectStarter(d) {

  this.to.x += d3.event.dx;
  this.to.y += d3.event.dy;

  //console.log(this.to);

  var data = [
    //{source: this.from, target: this.to}
    {
      source: {x: this.from.x, y: this.from.y},
      target: {x: this.to.x, y: this.to.y}
    }
  ];

  var diagonal = d3.svg.diagonal();

  var svg = d3.select('#lineForPreview');
  svg.selectAll("path").remove();
  // svg.selectAll("path").data(data).enter()
  //   .append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "#FF9A0A")
  //   .attr("d",diagonal);

  var from = this.from
  var to = this.to

  var p2 = {
    x: from.x + (to.x - from.x)/2,
    y: from.y + (to.y - from.y)/2
  }

  var mp_f_p2 = {
    x: from.x + (p2.x - from.x)/2,
    y: from.y + (p2.y - from.y)/2
  }
  var cross_p1 = {
    x: p2.x,
    y: from.y
  }
  var p1 = {
    x: mp_f_p2.x + (cross_p1.x - mp_f_p2.x)/2,
    y: mp_f_p2.y + (cross_p1.y - mp_f_p2.y)/2
  }

  var mp_p2_t = {
    x: p2.x + (to.x - p2.x)/2,
    y: p2.y + (to.y - p2.y)/2
  }
  var cross_p2 = {
    x: p2.x,
    y: to.y
  }
  var p3 = {
    x: cross_p2.x + (mp_p2_t.x - cross_p2.x)/2,
    y: cross_p2.y + (mp_p2_t.y - cross_p2.y)/2
  }

  var lineData = [from, p1, p2, p3, to]
  
  var path = svg.selectAll("path").data(data).enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#FF9A0A")
    .attr("d", d3.svg.line()
      .x(function(d) { return d.x })
      .y(function(d) { return d.y })
      .interpolate('bundle')(lineData))

}

function dragendedOnConnectStarter(d) {
  window.isDragingConnector = false;

  if(!window.isHoveringOnNode){
    // 多分これやっちゃいけないやつ
    window.updateSelectorPosition(this.to, this.from, d.nodeId);
  } else {
    $('#lineForPreview').hide();
    
    var fromNodeEdges = entity.getConditions(window.scenarioArray, d.nodeId)
    var elseEdge = fromNodeEdges.filter((e) => {
      return (e.type === "else")
    })[0]

    if(elseEdge){
      var uniqueStr = Math.random().toString(36).slice(-4)
      window.connectNode({fromId: d.nodeId, toId: window.nodeHovering.id, condition: "default", id: `default-${uniqueStr}-${d.nodeId}`});
    } else {
      window.connectNode({fromId: d.nodeId, toId: window.nodeHovering.id, condition: "else", id: `else-${d.nodeId}`});
    }

    var to = {
      x: $(`#${window.nodeHovering.id}`).position().left,
      y: $(`#${window.nodeHovering.id}`).position().top + $(`#${window.nodeHovering.id}`).height()/2
    }

    // console.log("d.nodeId", d.nodeId)
    // window.updateEdge(this.from, to, d.nodeId)
    
    setTimeout(window.loadAllEdges, 10)
    // window.addEdge(this.from, to, d.nodeId)
    // window.loadAllEdges()
  }
}

// function drawLine(from, to, id){
//   var data = [
//     {
//       source: {x: from.x, y: from.y},
//       target: {x: to.x, y: to.y}
//     }
//   ];
  
//   var diagonal = d3.svg.diagonal();

//   var lines = d3.select('#lines');
//   lines.append('svg').attr("id", `line-${id}`);

//   var svg = d3.select('#lines').select(`#line-${id}`);
//   svg.remove();
//   svg = d3.select('#lines').select(`#line-${id}`);

//   var path = svg.selectAll("path").data(data).enter()
//     .append("path")
//     .attr("id", `line-${id}`)
//     .attr("fill", "none")
//     .attr("stroke", "#FF9A0A")
//     .attr("d", diagonal);
// }


export default nodeController;

