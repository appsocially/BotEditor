<template lang="pug">

  div.wrap-module-canvas#canvasWrapper
    div#canvas
      div#lines.wrap-lines
        //item-edge(v-for='item in edgesArray' :id='item.id' :key='item.id' :content='item')
        svg#lineForPreview
      item-node-selector(@addNormalMessage='addNormalMessage' @addSelectionMessage='addSelectionMessage')
      item-node-simple-message(v-for='item in normalMessageNodes' :id='item.id' :key='item.id' :content='item' @removeNormalMessageNode='removeNormalMessageNode' @loadAllEdges='loadAllEdges' @fixEdgeOfNormalNode='fixEdgeOfNormalNode').item-node-simple-message
      item-node-selection(v-for='item in selectionNodes' :id='item.id' :key='item.id' :content='item' @removeSelectionMessage='removeSelectionMessage' @loadAllEdges='loadAllEdges').item-node-selection

</template>

<style lang="scss">

.wrap-module-canvas {
  position: relative;
  top: 0;
  left: 0;
  margin-top: 48px;
  overflow: scroll;
  width: 100%;
  height: calc(100vh - 48px);
  #canvas {
    position: relative;
    width: 100000px;
    max-width: 100000px;
    height: 100000px;
    background: #F7F7F7;
    background-size: 52px 52px;
    background-image: linear-gradient(to right, rgba(100,100,100,0.1) 0.5px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,0.1) 0.3px, transparent 1px);
    .wrap-lines {
      position: relative;
      z-index: 101;
      pointer-events: none;
      width: 100%;
      height: 100%;
      svg {
        position: absolute;
        width: 100%;
        height: 100%;
        path {
          pointer-events: all;
          cursor: pointer;
        }
      }
    }
  }
  .wrap-preview {
    position: fixed;
    z-index: 200;
    right: 16px;
    bottom: 16px;
    width: 300px;
    height: 440px;
    filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
  }
}

</style>

<script>
import db from "../firebaseInit";
import { createNamespacedHelpers } from "vuex";

import entity from "../entity";

import ModuleConversation from "./ModuleConversation";

import ItemNodeSelector from "../item/ItemNodeSelector";
import ItemNodeSimpleMessage from "../item/ItemNodeSimpleMessage";
import ItemNodeSelection from "../item/ItemNodeSelection";

import ItemEdge from "../item/ItemEdge";

const { mapState, mapActions, mapGetters } = createNamespacedHelpers(
 "scenario"
);


export default {
  name: 'ModuleCanvas',
  components: {
    ModuleConversation,
    ItemNodeSelector,
    ItemNodeSimpleMessage,
    ItemNodeSelection,
    ItemEdge
  },
  props: {
    project: {
      type: Object,
      required: true,
    },
    /*scenarioArray: {
      type: Array,
      required: true,
    },*/
  },
  data() {
    return {
      normalMessageNodes: [],
      selectionNodes: [],
      lines: [],
      edgesArray: [],
      completeLoadingLine: false,
    }
  },
  created: async function(){

    await this.loadScenarioByProjectId(this.projectId);
    console.log('module-canvas (scenarioArray)', this.scenarioArray);


    // これ多分やっちゃいけないやつ
    window.scenarioArray = this.scenarioArray;
    window.connectNode = this.connectNodeForNodeController;


    this.normalMessageNodes = this.scenarioArray.filter(function(content){
      return content.type == 'normal';
    });

    this.selectionNodes = this.scenarioArray.filter(function(content){
      return content.type == 'selection';
    });

  },
  mounted: function(){

  },
  updated: function(){
    
    if(!this.completeLoadingLine){
      this.loadAllEdges();
      this.completeLoadingLine = true;

      // startNodeのところまでスクロール
      var canvasWrapper = document.querySelector('#canvasWrapper');
      canvasWrapper.scrollTop = 200;
      canvasWrapper.scrollTop = 100000/2 - window.innerHeight/2;
    }
    //this.edgesArray = pointsBetweenNodes;

  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId',
      'pushContentToScenario',
      'connectSingleNode',
      'connectGroupNode',
      'connectNode',
      'deleteNode',
      'disconnectNode'
    ]),
    update(){
      this.project = this.project;
    },
    loadAllEdges(){
      var scenario = this.scenarioArray;
      var points = [];
      for(var i=0; i<scenario.length; i++){
        if(scenario[i].nodeType=='single' && scenario[i].next){
          points = points.concat(this.getCoordinatesOfSingleNode(scenario[i]));
        }else if(scenario[i].nodeType=='group'){
          points = points.concat(this.getCoordinatesOfGroupNode(scenario[i]));
        } // if
      } // for

      var pointsBetweenNodes = points; 
      
      for(var i=0; i<pointsBetweenNodes.length; i++){
        var points = pointsBetweenNodes[i];
        this.addEdge(points.from, points.to, points.id);
      }
    },
    addEdge(from, to, id){

      var data = [
        {
          source: {x: from.x, y: from.y},
          target: {x: to.x, y: to.y}
        }
      ];

      var diagonal = d3.svg.diagonal();

      var lines = d3.select('#lines');
      lines.select(`#line-${id}`).remove();
      lines.append('svg').attr("id", `line-${id}`);

      var svg = d3.select('#lines').select(`#line-${id}`);
      var path = svg.selectAll("path").data(data).enter()
        .append("path")
        .attr("id", `line-${id}`)
        .attr("fill", "none")
        .attr("stroke", "#FF9A0A")
        .attr("d", diagonal);
      
    },
    /*removeLine(id){
      
    },*/
    getCoordinatesOfSingleNode(event){

      var points = [];

      var node = document.getElementById(event.id);
      var nextNode = document.getElementById(event.next);

      var from = {};
      var to = {};

      var startPointOffset = 9;

      if(node&&nextNode){
        from.x = node.offsetLeft + node.clientWidth + startPointOffset;
        from.y = node.offsetTop + node.clientHeight/2;

        to.x = nextNode.offsetLeft;
        to.y = nextNode.offsetTop + nextNode.clientHeight/2;

        points.push({
          from: from,
          to: to,
          id: event.id
        });
        //return {from: from, to: to, id: scenario[i].id};
      }

      return points;

    },
    getCoordinatesOfGroupNode(event){

      var points = [];

      var selections = event.selections;
      
      for(var j=0; j<selections.length; j++){
        if(selections[j].next){
          var from = {};
          var to = {};

          var childNode = document.getElementById(selections[j].id);
          var childNodePos = $(childNode).position();
          var parentNodePos = $(childNode).closest('.item-node-selection').position();
          var widthOffset = $(childNode).width();
          var heightOffset = $(childNode).height()/2;

          var startPointOffset = 9;


          if(parentNodePos&&childNodePos){
            from.x = parentNodePos.left + childNodePos.left + widthOffset + startPointOffset
            from.y = parentNodePos.top + childNodePos.top + heightOffset;

            var nextNode = document.getElementById(selections[j].next);

            to.x = nextNode.offsetLeft;
            to.y = nextNode.offsetTop + nextNode.clientHeight/2;

            points.push({
              from: from,
              to: to,
              id: selections[j].id,
            });
          }
        }

      } // for

      return points;

    },
    fixEdgeOfNormalNode(event){

      var points = this.getCoordinatesOfSingleNode(event);
      if(points[0]) this.addEdge(points[0].from, points[0].to, points[0].id);

    },
    connectNodeForNodeController(fromId, toId){
      this.connectNode(fromId, toId);
      this.loadAllEdges();
    },
    addNormalMessage(position, dragStartedPosition, dragStartedId){

      this.project.nodeNum++;

      var topOffset = 15;

      var content = {
        author: 'test',
        id: `simpleTmp${this.project.nodeNum}`,
        type: 'normal',
        nodeType: 'single',
        num: this.project.nodeNum,
        text: 'Normal Message',
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          },
        }
      };

      this.normalMessageNodes.push(content);

      this.addEdge(dragStartedPosition, position, dragStartedId);

      this.pushContentToScenario(content);

      // ノードがselectionだった場合
      this.connectNode({fromId: dragStartedId, toId: content.id});
      /*
      if(dragStartedId.indexOf('selection')>-1){
        this.connectNode({fromId: dragStartedId, toId: content.id});
      }else{
        this.connectNode({fromId: dragStartedId, toId: content.id});
      }
      */

    },
    removeNormalMessageNode(id){
      for(var i=0; i<this.normalMessageNodes.length; i++){
        if(this.normalMessageNodes[i].id==id) this.normalMessageNodes.splice(i,1);
      }
      this.deleteNode(id);
      this.disconnectNode(id);
    },
    addSelectionMessage(position, dragStartedPosition, dragStartedId){

      this.project.nodeNum++;

      var topOffset = 53;

      var content = {
        author: 'test',
        id: `selectionTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'selection',
        nodeType: 'group',
        text: 'What is your choice?',//+idRand,
        addedSelectionsCounter : 1,
        selections: [
          {label: 'Selection', id: `selectionTmp${this.project.nodeNum}-selection0`},
          {label: 'Selection', id: `selectionTmp${this.project.nodeNum}-selection1`},
        ],
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          },
        },
      };

      this.selectionNodes.push(content);

      this.addEdge(dragStartedPosition, position, dragStartedId);

      this.pushContentToScenario(content);

      // ノードがselectionだった場合
      if(dragStartedId.indexOf('selection')>-1){
        this.connectGroupNode({fromId: dragStartedId, toId: content.id});
      }else{
        this.connectSingleNode({fromId: dragStartedId, toId: content.id});
      }

    },
    removeSelectionMessage(id){
      for(var i=0; i<this.selectionNodes.length; i++){
        if(this.selectionNodes[i].id==id) this.selectionNodes.splice(i,1);
      }
      this.deleteNode(id);
      this.disconnectNode(id);
    },
  },
  computed: {
    ...mapState([
      'scenarioArray',
    ]),
    projectId() {
      return this.project.id;
    }
  }
};
</script>
