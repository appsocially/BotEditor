<template lang="pug">

  div.wrap-module-canvas#canvasWrapper
    div(:class="letEdit")#canvas
      div#lines.wrap-lines
        //item-edge(v-for='item in edgesArray' :id='item.id' :key='item.id' :content='item')
        svg#lineForPreview
        svg#previewLineForGoTo
        item-edge(v-for='item in edgesArray' :content='item' :ref='item.id' :key="item.key" @openEdgeWindow="openEdgeWindow")
        //item-edge(v-for='item in edges' :content='item')
      // 古いフォーマットのノード
      item-node-selector(
        @addNormalMessage='addNormalMessage'
        @addSelectionMessage='addSelectionMessage'
        @addMultipleSelectionMessage='addMultipleSelectionMessage'
        @addOpenQuestionMessage='addOpenQuestionMessage'
        @addAskEmailMessage='addAskEmailMessage'
        @addAskPhoneNumberMessage='addAskPhoneNumberMessage'
        @addAskDateMessage='addAskDateMessage'
        @addAskDateAndTimeMessage='addAskDateAndTimeMessage'
        @addMediaMessage='addMediaMessage'
        @addActionSendEmailNode='addActionSendEmailNode'
        @selectToNodeByGoTo='selectToNodeByGoTo')
      item-edge-window(ref="edgeWindow" @updateEdgeType="updateEdgeType")

      item-node-start-point(v-if='startPointNode' :content='startPointNode')
      item-node-simple-message(v-for='item in normalMessageNodes' :id='item.id' :key='item.id' :content='item' @updateNode='updateNode' @removeNormalMessageNode='removeNormalMessageNode' @loadAllEdges='loadAllEdges' @fixEdgeOfNormalNode='fixEdgeOfNormalNode').item-node-simple-message
      item-node-selection(v-for='item in selectionNodes' :id='item.id' :key='item.id' :content='item' @updateNode='updateNode' @removeSelectionMessage='removeSelectionMessage' @loadAllEdges='loadAllEdges').item-node-selection
      item-node-open-question(v-for='item in openQuestionNodes' :id='item.id' :key='item.id' :content='item' @updateNode='updateNode' @removeOpenQuestionNode='removeOpenQuestionNode' @loadAllEdges='loadAllEdges').item-node-open-question
      item-node-media(v-for='item in mediaNodes' :id='item.id' :key='item.id' :content='item' @updateNode='updateNode' @removeMediaNode='removeMediaNode' @loadAllEdges='loadAllEdges').item-node-media
      item-node-go-to(v-for='item in goToNodes' :id='item.id' :key='item.id' :content='item' @updateNode='updateNode' @removeGoToNode='removeGoToNode' @loadAllEdges='loadAllEdges').item-node-go-to

      // 新しいフォーマットのノード
      ItemNodeMultipleSelection(
        v-if="multipleSelectionNodes"
        v-for="node in multipleSelectionNodes"
        :content="node"
        @addOneSelectionInMultipleSelection="addOneSelectionInMultipleSelection"
        @removeOneSelectionInMultipleSelection="removeOneSelectionInMultipleSelection")
      ItemNodeAskEmail(
        v-if="askEmailNodes"
        v-for="node in askEmailNodes"
        :content="node")
      ItemNodeAskPhoneNumber(
        v-if="askPhoneNumberNodes"
        v-for="node in askPhoneNumberNodes"
        :content="node")
      ItemNodeAskDate(
        v-if="askDateNodes"
        v-for="node in askDateNodes"
        :content="node")
      ItemNodeAskDateAndTime(
        v-if="askDateAndTimeNodes"
        v-for="node in askDateAndTimeNodes"
        :content="node")
      ItemNodeActionSendEmail(
        v-if="actionSendEmailNodes"
        v-for="node in actionSendEmailNodes"
        :content="node")

      div(@click="closeToolWindows")#canvasBg
      div#modalOverlay

</template>

<style lang="scss">
.wrap-module-canvas {
  position: relative;
  top: 0;
  left: 0;
  overflow: scroll;
  width: 100%;
  height: calc(100vh - 48px);
  .not-let-edit {
    pointer-events: none;
  }
  #canvas {
    position: relative;
    width: 100000px;
    max-width: 100000px;
    height: 100000px;
    // background: #F7F7F7;
    // background-size: 52px 52px;
    // background-image: linear-gradient(to right, rgba(100,100,100,0.1) 0.5px, transparent 1px), linear-gradient(to bottom, rgba(100,100,100,0.1) 0.3px, transparent 1px);
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
        background: transparent;
        path {
          pointer-events: all;
          cursor: pointer;
        }
      }
      #previewLineForGoTo {
        display: none;
        path {
          cursor: default;
        }
      }
      .show {
        display: block;
      }
    }
    #canvasBg {
      position: absolute;
      left: 0;
      top: 0;
      width: 100000px;
      max-width: 100000px;
      height: 100000px;
      background: #f7f7f7;
      background-size: 52px 52px;
      background-image: linear-gradient(
          to right,
          rgba(100, 100, 100, 0.1) 0.5px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          rgba(100, 100, 100, 0.1) 0.3px,
          transparent 1px
        );
    }
    #modalOverlay {
      display: none;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
    }
  }
  .wrap-preview {
    position: fixed;
    z-index: 200;
    right: 16px;
    bottom: 16px;
    width: 300px;
    height: 440px;
    filter: drop-shadow(2px 1px 1px rgba(0, 0, 0, 0.2));
  }
}
</style>

<script>
import * as d3 from 'd3'

import { createNamespacedHelpers } from 'vuex'
import entity from '../entity'
// import exportECA from '../exportECA'

import Auth from '@/components/auth'
import ModuleConversation from './ModuleConversation'

import ItemNodeSelector from '../item/ItemNodeSelector'
import ItemEdgeWindow from '../item/ItemEdgeWindow'

// 古いフォーマットでつくったノード（リファクタせねば）
import ItemNodeStartPoint from '../item/ItemNodeStartPoint'
import ItemNodeSimpleMessage from '../item/ItemNodeSimpleMessage'
import ItemNodeSelection from '../item/ItemNodeSelection'
import ItemNodeOpenQuestion from '../item/ItemNodeOpenQuestion'
import ItemNodeMedia from '../item/ItemNodeMedia'
import ItemNodeGoTo from '../item/ItemNodeGoTo'

// 新しいフォーマットで作ったノード
import ItemNodeMultipleSelection from '../item/ItemNodeMultipleSelection'
import ItemNodeAskEmail from '../item/ItemNodeAskEmail'
import ItemNodeAskPhoneNumber from '../item/ItemNodeAskPhoneNumber'
import ItemNodeAskDate from '../item/ItemNodeAskDate'
import ItemNodeAskDateAndTime from '../item/ItemNodeAskDateAndTime'
import ItemNodeActionSendEmail from '../item/ItemNodeActionSendEmail'

import ItemEdge from '../item/ItemEdge'
// import { newExpression } from 'babel-types'
// import { isArray } from 'util'
// const { mapState: mapStateAuth, mapActions: mapActionsAuth } = createNamespacedHelpers('auth')
const { mapState: mapStateAuth } = createNamespacedHelpers('auth')
const { mapState, mapActions } = createNamespacedHelpers('scenario')
const { mapGetters: mapEdgesGetters } = createNamespacedHelpers('edges')

export default {
  name: 'ModuleCanvas',
  components: {
    Auth,
    ModuleConversation,
    ItemNodeStartPoint,
    ItemNodeSelector,
    ItemEdgeWindow,
    ItemNodeSimpleMessage,
    ItemNodeSelection,
    ItemNodeOpenQuestion,
    ItemNodeMedia,
    ItemNodeGoTo,
    ItemEdge,

    ItemNodeMultipleSelection,
    ItemNodeAskEmail,
    ItemNodeAskPhoneNumber,
    ItemNodeAskDate,
    ItemNodeAskDateAndTime,
    ItemNodeActionSendEmail
  },
  props: {
    project: {
      type: Object,
      required: true
    },
    letEdit: {
      type: String,
      required: true
    }
    /* scenarioArray: {
      type: Array,
      required: true,
    }, */
  },
  data () {
    return {
      startPointNode: null,
      normalMessageNodes: [],
      selectionNodes: [],
      openQuestionNodes: [],
      mediaNodes: [],
      goToNodes: [],
      edgesArray: [],
      completeLoadingLine: false,

      multipleSelectionNodes: [],
      askEmailNodes: [],
      askPhoneNumberNodes: [],
      askDateNodes: [],
      askDateAndTimeNodes: [],
      actionSendEmailNodes: []
    }
  },
  // watch: {
  //   edgesArray: function(newVal, oldVal){
  //     // this.loadAllEdges()
  //     if(JSON.stringify(newVal) !== JSON.stringify(oldVal)){
  //       console.log("watching!!!")
  //       this.loadAllEdges()
  //     }
  //   }
  // scenarioArray: function(newVal, oldVal){
  //   if(!this.completeLoadingLine && this.scenarioArray !== []){
  //     this.loadAllEdges()
  //     this.completeLoadingLine = true
  //     this.scrollToStartNode()
  //   }
  // }
  // },
  created: async function () {
    await this.loadScenarioByProjectId(this.$route.params.id)

    console.log('module-canvas (project)', this.project)
    console.log('module-canvas (scenarioArray)', this.scenarioArray)

    // これ多分やっちゃいけないやつ
    window.scenarioArray = this.scenarioArray
    window.project = this.project

    // 多分もっといい方法がありそう。
    window.addGoTo = this.addGoTo // itemSelectorで呼び出してる
    window.updateNodePosition = this.updateNodePosition // nodeController.jsで読んでる
    window.connectNode = this.connectNodeForNodeController

    window.loadAllEdges = this.loadAllEdges
    window.addEdge = this.addEdge
    window.updateEdge = this.updateEdge

    this.loadNodesArray()
  },
  updated: function () {
    if (!this.completeLoadingLine) {
      setTimeout(this.loadAllEdges, 400) // 権限のないキャンバスを見た時になぜかタイマーつけないとできない
      // this.loadAllEdges()
      this.completeLoadingLine = true
      this.scrollToStartNode()
    }
    // this.edgesArray = pointsBetweenNodes;
  },
  mounted: function () {

  },
  methods: {
    ...mapActions([
      'loadScenarioByProjectId',
      'pushContentToScenario',
      'connectSingleNode',
      'connectGroupNode',
      'connectNode',
      'updateNode',
      'deleteNode',
      'disconnectNode',
      'updateEdgeCondition'
    ]),
    loadNodesArray () {
      this.startPointNode = entity.getStartPointNode(this.scenarioArray)
      this.normalMessageNodes = entity.getNormalNodes(this.scenarioArray)
      this.selectionNodes = entity.getSelectionNodes(this.scenarioArray)
      this.openQuestionNodes = entity.getOpenQuestionNodes(this.scenarioArray)
      this.mediaNodes = entity.getMediaNodes(this.scenarioArray)
      this.goToNodes = entity.getGoToNodes(this.scenarioArray)

      this.multipleSelectionNodes = this.scenarioArray.filter((node) => { return node.type === 'multipleselection' })
      this.askEmailNodes = this.scenarioArray.filter((node) => { return node.type === 'ask_email' })
      this.askPhoneNumberNodes = this.scenarioArray.filter((node) => { return node.type === 'ask_phone_number' })
      this.askDateNodes = this.scenarioArray.filter((node) => { return node.type === 'ask_date' })
      this.askDateAndTimeNodes = this.scenarioArray.filter((node) => { return node.type === 'ask_date_and_time' })
      this.actionSendEmailNodes = this.scenarioArray.filter((node) => { return node.type === 'action_send_email' })
    },
    update () {
      this.project = this.project
    },
    loadAllEdges () {
      this.edgesArray = []

      var scenario = this.scenarioArray

      var points = []
      for (var i = 0; i < scenario.length; i++) {
        if (scenario[i].nodeType === 'single' || scenario[i].nodeType === 'point') { // && scenario[i].next){
          points = points.concat(this.getCoordinatesOfSingleNode(scenario[i]))
        } else if (scenario[i].nodeType === 'group') {
          points = points.concat(this.getCoordinatesOfGroupNode(scenario[i]))
        } // if
      } // for

      var pointsBetweenNodes = points

      for (let i = 0; i < pointsBetweenNodes.length; i++) {
        // var points = pointsBetweenNodes[i];
        this.addEdge(pointsBetweenNodes[i].from, pointsBetweenNodes[i].to, pointsBetweenNodes[i].id)
      }
      this.edgesArray = this.edgesArray
    },
    addEdge (from, to, id) {
      this.edgesArray.push({
        from: from,
        to: to,
        id: id
      })
      if (this.$refs[id] && this.$refs[id][0]) this.$refs[id][0].draw()
      // this.edgesArray = this.edgesArray
    },
    // セレクターからノードを追加した時に、そのノードを繋げるエッジを追加する
    addEdgeFromSelector (fromId, toId, dragStartedPosition, position) {
      var fromNodeEdges = entity.getConditions(this.scenarioArray, fromId)
      var elseEdge = fromNodeEdges.filter((e) => {
        return (e.type === 'else')
      })[0]

      if (elseEdge) {
        var uniqueStr = this.createRandomUniqueStr()
        this.connectNode({ fromId: fromId, toId: toId, condition: 'default', id: `default-${uniqueStr}-${fromId}` })
        this.addEdge(dragStartedPosition, position, `default-${uniqueStr}-${fromId}`)
      } else {
        this.connectNode({ fromId: fromId, toId: toId, condition: 'else', id: `else-${fromId}` })
        this.addEdge(dragStartedPosition, position, `else-${fromId}`)
      }
    },
    updateEdge (from, to, id) {
      for (var i = 0; i < this.edgesArray.length; i++) {
        if (this.edgesArray[i].id === id) {
          this.edgesArray[i].from = from
          this.edgesArray[i].to = to
          this.$refs[id][0].draw()
        }
      }
    },
    updateEdgeType (newType, edgeContent) {
      // すでに対象のnodeにelseが紐づいている場合、そのコンディションをdefaultに変更する
      if (newType === 'else') {
        var content = entity.getContentByConditionId(this.scenarioArray, edgeContent.id)

        var elseCondition = content.conditions.filter((e) => { return (e.id.split('-')[0] === 'else') })[0]
        if (elseCondition) {
          var targetEdgeContent = this.edgesArray.filter((e) => { return (elseCondition.id === e.id) })[0]
          this.updateEdgeType('default', targetEdgeContent)
        }
      }

      // nodeに紐づくconditionsの配列をアップデート

      this.$refs[edgeContent.id][0].removeLine()

      var idArray = edgeContent.id.split('-')

      // else以外からelseになる場合、idの部分（**-abcde-**）だけ消す
      if (/* newType === "else" && */idArray[0] !== 'else') {
        idArray = idArray.filter((e, i) => { return i !== 1 })
      }

      idArray[0] = (newType === 'else') ? 'else' : `${newType}-${this.createRandomUniqueStr()}`
      var newConditionId = idArray.join('-')

      this.updateEdgeCondition({ id: edgeContent.id, new_condition_id: newConditionId })

      this.edgesArray = this.edgesArray.map((e) => {
        if (edgeContent.id === e.id) {
          e.id = newConditionId
          return e
        } else {
          return e
        }
      })
    },
    removeEdge (id) {
      this.edgesArray = this.edgesArray.filter((e) => {
        return e.id !== id
      })
    },
    removeEdgesThatConnectNodeOf (nodeId) {
      var fromEdges = entity.getEdgesThatConnectFrom(this.scenarioArray, nodeId)
      var toEdges = entity.getEdgesThatConnectTo(this.scenarioArray, nodeId)
      var edgesToRemove = fromEdges.concat(toEdges).map((e) => {
        return e.id
        // return `${e.type}-${e.fromNodeId}`
      })
      for (var i = 0; i < edgesToRemove.length; i++) {
        var lines = d3.select('#lines')
        lines.select(`#line-${edgesToRemove[i]}`).remove()
      }
      this.edgesArray = this.edgesArray.filter((e) => {
        return (!edgesToRemove.includes(e.id))
      })
    },
    openEdgeWindow (content) {
      // this.$refs.edgeWindow.closeWindow()
      this.$refs.edgeWindow.updatePosition({
        x: (content.to.x + content.from.x) / 2,
        y: (content.to.y + content.from.y) / 2
      })
      this.$refs.edgeWindow.setContent(content)
      setTimeout(this.$refs.edgeWindow.activateWindow, 10)
    },
    closeToolWindows () {
      // eslint-disable-next-line no-undef
      $('.node-window-active').removeClass('node-window-active')
      this.$refs.edgeWindow.closeWindow()
    },
    getCoordinatesOfSingleNode (event) {
      var points = []

      var node = document.getElementById(event.id)

      if (event.conditions) {
        for (var i = 0; i < event.conditions.length; i++) {
          var nextNode = document.getElementById(event.conditions[i].next)

          var from = {}
          var to = {}

          const startPointOffset = event.type === 'start-point' ? -2 : 9

          if (node && nextNode) {
            from.x = node.offsetLeft + node.clientWidth + startPointOffset
            from.y = node.offsetTop + node.clientHeight / 2

            to.x = nextNode.offsetLeft
            to.y = nextNode.offsetTop + nextNode.clientHeight / 2

            points.push({
              from: from,
              to: to,
              id: event.conditions[i].id, // `${event.conditions[i].type}-${event.id}`,
              type: event.conditions[i].type
            })
            // return {from: from, to: to, id: scenario[i].id}
          }
        }
      } // event.conditions

      return points
    },
    getCoordinatesOfGroupNode (event) {
      var points = []

      var selections = event.selections

      for (var j = 0; j < selections.length; j++) {
        // if(selections[j].next){
        var conditions = selections[j].conditions
        if (conditions) {
          var from = {}

          var childNode = document.getElementById(selections[j].id)
          // eslint-disable-next-line no-undef
          var childNodePos = $(childNode).position()
          // eslint-disable-next-line no-undef
          var parentNodePos = $(childNode).closest('.item-node-selection').position()
          // eslint-disable-next-line no-undef
          var widthOffset = $(childNode).width()
          // eslint-disable-next-line no-undef
          var heightOffset = $(childNode).height() / 2

          var startPointOffset = 9

          if (parentNodePos && childNodePos) {
            from.x = parentNodePos.left + childNodePos.left + widthOffset + startPointOffset
            from.y = parentNodePos.top + childNodePos.top + heightOffset

            for (var k = 0; k < conditions.length; k++) {
              var nextNode = document.getElementById(conditions[k].next)

              if (nextNode) {
                var to = {}

                to.x = nextNode.offsetLeft
                to.y = nextNode.offsetTop + nextNode.clientHeight / 2

                points.push({
                  from: from,
                  to: to,
                  id: conditions[k].id, // `${conditions[k].type}-${selections[j].id}`,
                  type: conditions[k].type
                })
              }
            }
          }
        }
      } // for

      return points
    },
    fixEdgeOfNormalNode (event) {
      var points = this.getCoordinatesOfSingleNode(event)
      if (points[0]) this.addEdge(points[0].from, points[0].to, points[0].id)
    },
    connectNodeForNodeController (fromId, toId) {
      this.connectNode(fromId, toId)
      this.loadAllEdges()
    },
    updateNodePosition (id, pos) {
      var content = entity.getContent(this.scenarioArray, id)
      content.gui.position = pos
      this.updateNode(content)
    },
    addNormalMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 15

      var content = {
        author: this.uid,
        id: `simpleTmp${this.project.nodeNum}`,
        type: 'normal',
        nodeType: 'single',
        num: this.project.nodeNum,
        text: this.$t('canvas.nodes.normal.default_label'), // 'Normal Message',
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      // this.normalMessageNodes.push(content)

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)
    },
    removeNormalMessageNode (id) {
      this.normalMessageNodes = this.normalMessageNodes.filter(e => {
        return e.id !== id
      })
      this.removeEdgesThatConnectNodeOf(id)

      this.deleteNode(id)
      this.disconnectNode(id)
    },
    addSelectionMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 63

      var content = {
        author: this.uid,
        id: `selectionTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'selection',
        nodeType: 'group',
        text: this.$t('canvas.nodes.open_question.default_label'), // 'What is your choice?',//+idRand,
        addedSelectionsCounter: 1,
        selections: [
          { label: this.$t('canvas.nodes.selection.expected_answer_selection_1'), id: `selectionTmp${this.project.nodeNum}-selection0` },
          { label: this.$t('canvas.nodes.selection.expected_answer_selection_2'), id: `selectionTmp${this.project.nodeNum}-selection1` }
        ],
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }
      // this.selectionNodes.push(content)

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)

      /*
      // ノードがselectionだった場合
      if(dragStartedId.indexOf('selection')>-1){
        this.connectGroupNode({fromId: dragStartedId, toId: content.id});
      }else{
        this.connectSingleNode({fromId: dragStartedId, toId: content.id});
      }
      */
    },
    removeSelectionMessage (id) {
      this.selectionNodes = this.selectionNodes.filter(e => {
        return e.id !== id
      })
      this.removeEdgesThatConnectNodeOf(id)

      this.deleteNode(id)
      this.disconnectNode(id)
    },
    addMultipleSelectionMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 63

      var content = {
        author: this.uid,
        id: `multipleSelectionTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'multipleselection',
        nodeType: 'single',
        text: this.$t('canvas.nodes.open_question.default_label'), // 'What is your choice?',//+idRand,
        addedSelectionsCounter: 1,
        selections: [
          { label: this.$t('canvas.nodes.selection.expected_answer_selection_1'), id: `multipleSelectionTmp${this.project.nodeNum}-selection0` },
          { label: this.$t('canvas.nodes.selection.expected_answer_selection_2'), id: `multipleSelectionTmp${this.project.nodeNum}-selection1` }
        ],
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      // Canvas.vueでwatchしてるからいらなくなった
      // this.multipleSelectionNodes.push(content)

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)
    },
    addOneSelectionInMultipleSelection (nodeId) {
      for (var i = 0; i < this.multipleSelectionNodes.length; i++) {
        if (this.multipleSelectionNodes[i].id === nodeId) {
          this.multipleSelectionNodes[i].addedSelectionsCounter++
          var selectionObj = {
            id: `${nodeId}-multipleSelection${this.multipleSelectionNodes[i].addedSelectionsCounter}`,
            label: `Selection${this.multipleSelectionNodes[i].addedSelectionsCounter}`
          }
          this.multipleSelectionNodes[i].selections.push(selectionObj)
        }
      }
    },
    removeOneSelectionInMultipleSelection (selectionId, nodeId) {
      for (var i = 0; i < this.multipleSelectionNodes.length; i++) {
        if (this.multipleSelectionNodes[i].id === nodeId) {
          this.multipleSelectionNodes[i].selections = this.multipleSelectionNodes[i].selections.filter((selection) => {
            return (selection.id !== selectionId)
          })
        }
      }
    },
    addOpenQuestionMessage (position, dragStartedPosition, dragStartedId) {
      var topOffset = 33

      this.project.nodeNum++

      var content = {
        author: this.uid,
        id: `openquestionTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'openquestion',
        nodeType: 'single',
        text: this.$t('canvas.nodes.open_question.default_label'), // 'What is question?',//+idRand,
        expectedAnswer: this.$t('canvas.nodes.open_question.expected_answer_placeholder'), // 'type your answer...',
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      // this.openQuestionNodes.push(content);

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)
    },
    removeOpenQuestionNode (id) {
      this.openQuestionNodes = this.openQuestionNodes.filter(e => {
        return e.id !== id
      })
      this.removeEdgesThatConnectNodeOf(id)

      this.deleteNode(id)
      this.disconnectNode(id)
    },
    addAskEmailMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 20

      var content = {
        author: this.uid,
        id: `askEmailTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'ask_email',
        nodeType: 'single',
        text: this.$t('canvas.nodes.ask_email.default_label'),
        expectedAnswer: this.$t('canvas.nodes.ask_email.expected_answer_placeholder'),
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)
      this.pushContentToScenario(content)
    },
    addAskPhoneNumberMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 20

      var content = {
        author: this.uid,
        id: `askPhoneNumberTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'ask_phone_number',
        nodeType: 'single',
        text: this.$t('canvas.nodes.ask_phone_number.default_label'),
        expectedAnswer: this.$t('canvas.nodes.ask_phone_number.expected_answer_placeholder'),
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)
      this.pushContentToScenario(content)
    },
    addAskDateMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 20

      var content = {
        author: this.uid,
        id: `askDateTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'ask_date',
        nodeType: 'single',
        text: this.$t('canvas.nodes.ask_date.default_label'),
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)
      this.pushContentToScenario(content)
    },
    addAskDateAndTimeMessage (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 20

      var content = {
        author: this.uid,
        id: `askDateAndTimeTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'ask_date_and_time',
        nodeType: 'single',
        text: this.$t('canvas.nodes.ask_date_and_time.default_label'),
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)
      this.pushContentToScenario(content)
    },
    addMediaMessage (position, dragStartedPosition, dragStartedId) {
      var topOffset = 60

      this.project.nodeNum++

      var content = {
        author: this.uid,
        id: `mediaTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'media',
        nodeType: 'single',
        // text: 'No data',
        mediaType: 'image',
        mediaURI: 'https://firebasestorage.googleapis.com/v0/b/bot-editor-dev.appspot.com/o/public%2Fno-file.png?alt=media&token=7b5fec93-0838-496d-a70b-fee89334df17',
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      // this.mediaNodes.push(content)

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)
    },
    removeMediaNode (id) {
      this.mediaNodes = this.mediaNodes.filter(e => {
        return e.id !== id
      })
      this.removeEdgesThatConnectNodeOf(id)

      this.deleteNode(id)
      this.disconnectNode(id)
    },
    addActionSendEmailNode (position, dragStartedPosition, dragStartedId) {
      this.project.nodeNum++

      var topOffset = 30

      var content = {
        author: this.uid,
        id: `actionSendEmailTmp${this.project.nodeNum}`,
        num: this.project.nodeNum,
        type: 'action_send_email',
        nodeType: 'single',
        title: 'Title', // this.$t("canvas.nodes.ask_email.default_label"),
        text: 'Body of email',
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)
      this.pushContentToScenario(content)
    },

    // これはノード選択後に呼び出す
    addGoTo (position, dragStartedPosition, dragStartedId, targetId, targetNum) {
      var topOffset = 23

      this.project.nodeNum++

      var content = {
        author: this.uid,
        id: `goToTmp${this.project.nodeNum}`,
        toId: targetId,
        num: this.project.nodeNum,
        type: 'goto',
        nodeType: 'single',
        text: targetNum,
        gui: {
          position: {
            x: position.x,
            y: position.y - topOffset
          }
        }
      }

      // this.goToNodes.push(content)

      this.addEdgeFromSelector(dragStartedId, content.id, dragStartedPosition, position)

      this.pushContentToScenario(content)
    },
    removeGoToNode (id) {
      this.goToNodes = this.goToNodes.filter(e => {
        return e.id !== id
      })

      this.removeEdgesThatConnectNodeOf(id)

      this.deleteNode(id)
      this.disconnectNode(id)
    },
    selectToNodeByGoTo (position, dragStartedPosition, dragStartedId) {
      // 1. モーダルを出してノード選択モードにする。
      // 2. 各ノードのfocusメソッドでノード選択モードならGoToに紐づける。
      // eslint-disable-next-line no-undef
      $('#modalOverlay').fadeToggle(400)

      var nodes = document.getElementsByClassName('node')

      var nodeClickHandler = function (e) {
        var position = e.data.position
        var dragStartedPosition = e.data.dragStartedPosition
        var dragStartedId = e.data.dragStartedId

        var targetNum = parseInt(this.dataset.num)
        var targetId = this.dataset.id

        if (targetId) {
          window.addGoTo(position, dragStartedPosition, dragStartedId, targetId, targetNum)

          var nodes = document.getElementsByClassName('node')
          // eslint-disable-next-line no-undef
          $(nodes).off('click')

          // eslint-disable-next-line no-undef
          $('#modalOverlay').fadeToggle(400)
        }
      }

      // eslint-disable-next-line no-undef
      $(nodes).click({
        position: position,
        dragStartedPosition: dragStartedPosition,
        dragStartedId: dragStartedId
      }, nodeClickHandler)
    },
    scrollToStartNode () {
      // startNodeのところまでスクロール
      var canvasWrapper = document.querySelector('#canvasWrapper')
      if (canvasWrapper) {
        canvasWrapper.scrollLeft = 0
        canvasWrapper.scrollTop = 100000 / 2 - window.innerHeight / 2
      }
    },
    createRandomUniqueStr () {
      return Math.random().toString(36).slice(-4)
    }
  },
  computed: {
    ...mapState([
      'scenarioArray'
    ]),
    ...mapStateAuth([
      'uid'
    ]),
    ...mapEdgesGetters([
      'edges'
    ]),
    projectId () {
      return this.project.id
    }
  }
}
</script>
