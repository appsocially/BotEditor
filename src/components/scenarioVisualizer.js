
var scenarioVisualizer = {};

// ノードを読み込む
scenarioVisualizer.loadNode = function(pos, content, nodeType){
  
  var canvas = d3.select('#canvas');

  /*
  canvas.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 100)
    .style('fill','rgba(0, 0, 0, 0.8)');
  */

  switch(nodeType){
    case 'normal':
      /*
      console.log('normalNode', content);
      canvas.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 100)
        .style('fill','rgba(0, 0, 0, 0.8)');
      */

    break;

    case 'start-point':
      // startNodeのところまでスクロール
      var canvasWrapper = document.querySelector('#canvasWrapper');
      canvasWrapper.scrollTop = pos.x;
      canvasWrapper.scrollTop = pos.y - window.innerHeight/2;
    break;
  }

}


scenarioVisualizer.loadAllNode = function(scenarioArray){
  
  for(var i=0; i<scenarioArray.length; i++){
    var content = scenarioArray[i];
    var pos = content.gui.position;
    scenarioVisualizer.loadNode(pos, content, content.type);
  }

}

/*
scenarioVisualizer.getLinePositions = function(scenarioArray){

}
*/


export default scenarioVisualizer;