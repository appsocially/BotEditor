
import entity from "./entity.js";


var exportECA = {};

// textをダウンロードする関数
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

//download("hello.txt","This is the content of my file :)");

var resultText = '';
var ruleNum;

var createTemplate = function(content){
  var templateText = '';
  switch(content.type){
    case 'normal':

      templateText = `CREATE TEMPLATE ${content.id} AS\n  TEXT \"${content.text}\"\nEND\n`;

    break;
    case 'selection':
      
      var headerText = `CREATE TEMPLATE ${content.id} AS\n`;
      var questionText = `  TEXT \"${content.text}\"\n`;
      var selectionText = '';
      for(var j=0; j<content.selections.length; j++){
        var selection = content.selections[j];
        selectionText += `  ACTION ${content.id}_action${j+1}\n`;
        selectionText += `    label \"${selection.label}\"\n`;
      }
      var footerText = 'END\n';

      templateText = (headerText + questionText + selectionText + footerText);

    break;
    case 'openquestion':

      var headerText = `CREATE TEMPLATE ${content.id} AS\n`;
      var questionText = `  TEXT \"${content.text}\"\n`;
      var actionText = '';
      actionText += `  ACTION ${content.id}_action1\n`;
      actionText += `    type \"input\"\n`;
      actionText += `    viewType \"text\"\n`;
      actionText += `  ACTION ${content.id}_action2\n`;
      actionText += `    label \"OK\"\n`;
      actionText += `    type \"send\"\n`;
      
      var footerText = 'END\n';

      templateText = (headerText + questionText + actionText + footerText);

    break;
  }

  return templateText;
}

var exportScenarioAsECA = function(scenarioArray){

  // テンプレートを全て作成する
  for(var i=0; i<scenarioArray.length; i++){
    var content = scenarioArray[i];
    var templateText = createTemplate(content);
    resultText += templateText + '\n';
  }


  // オートメーションルールを作成する
  ruleNum = 0;

  // はじめのdialog.openのルールを作成する
  var projectId = location.pathname.split('/')[2]; //riot.currentProject.id;
  var startPointEvent = entity.getContent(scenarioArray, `start-point-${projectId}`);
  var firstEventId = startPointEvent.next;

  var firstEvent = entity.getContent(scenarioArray, firstEventId);
  var firstEventRule = '';
  var headerOfFirstEvent = `CREATE RULE rule_${ruleNum} AS\n  ON Dialog.open\n`;
  var bodyEventOfFirst = ''; // = `  DO send_message(\"${firstEventId}\")`;
  var footerOfFirstEvent = `END\n`;
  ruleNum++;

  resultText += firstEventRule;

  // はじめのテンプレートから次のselectionかopenquestionまでを繋ぐ
  var currentEvent = firstEvent;

  if(currentEvent.id.indexOf('goTo')>=0){
    var gotoEvent = entity.getContent(scenarioArray, currentEvent.id);
    bodyEventOfFirst += `  DO send_message(\"${gotoEvent.toId}\")`;
    var currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
  }else{
    bodyEventOfFirst += `  DO send_message(\"${firstEventId}\")`;
  }

  while(true){
    
    if(currentEvent.type == 'selection' || currentEvent.type == 'openquestion' || !(currentEvent.next)){
      bodyEventOfFirst += '\n';
      break;
    }

    var nextId = currentEvent.next;
    
    if(nextId.indexOf('goTo')>=0){
      // gotoだった場合はtoIdのテンプレートを追加して、toIdのイベントの次の次をcurrentEventにする
      var gotoEvent = entity.getContent(scenarioArray, currentEvent.next);
      bodyEventOfFirst += ` THEN send_message(\"${gotoEvent.toId}\")`;
      currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
    }else{
      bodyEventOfFirst += ` THEN send_message(\"${currentEvent.next}\")`;
      currentEvent = entity.getContent(scenarioArray, nextId);
    }
    //bodyEventOfFirst += ` THEN send_message(\"${nextId}\")`;

    if(currentEvent.type == 'goto') currentEvent = entity.getContent(scenarioArray, currentEvent.toId);
  }

  resultText += (headerOfFirstEvent + bodyEventOfFirst + footerOfFirstEvent);
  resultText += '\n';

  // 全てのselections[i]から次のselectionEventかopenquestionEventもしくはnextがないnormalEventまでのautomationを追加する
  /* 
  CREATE RULE rule_1 AS
    ON Dialog.question.answered
    TO team
    IF response_match("template0_action1") DO send_message("template_1")
    ELIF response_match("template0_action2") DO send_message("template_2")
    ELIF response_match("template0_action3") DO send_message("template_3") THEN DO send_message("template_4")
  END
  */
  var allSelectionNodes = entity.getSelectionNodes(scenarioArray);
  for(var i=0; i<allSelectionNodes.length; i++){
    
    var headerOfSelectionRule = `CREATE RULE rule_${ruleNum} AS\n`;
    ruleNum++;
    headerOfSelectionRule += '  ON Dialog.question.answered\n';
    headerOfSelectionRule += '  TO team\n';

    var selectionsRule = '';

    var footerOfSelectionRule = `END\n`;

    var selections = allSelectionNodes[i].selections;
    for(var j=0; j<selections.length; j++){

      if(selections[j].next == undefined) break;
      
      if(j==0){ 
        selectionsRule += `  IF response_match(\"${allSelectionNodes[i].id}_action${j+1}\") `;
      }else{
        selectionsRule += `  ELIF response_match(\"${allSelectionNodes[i].id}_action${j+1}\") `;
      }
      
      // selection、openquestionもしくはnextがないイベントまでnextでつなげる
      // 直後にgoto nodeが来た場合の例外処理
      if(selections[j].next.indexOf('goTo')>=0){
        var gotoEvent = entity.getContent(scenarioArray, selections[j].next);
        selectionsRule += `DO send_message(\"${gotoEvent.toId}\")`;
        var currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
      }else{
        selectionsRule += `DO send_message(\"${selections[j].next}\")`;
        var currentEvent = entity.getContent(scenarioArray, selections[j].next);
      }

      while(true) {
        if(currentEvent.type == 'selection' || currentEvent.type == 'openquestion' || !(currentEvent.next)){
          selectionsRule += '\n';
          break;
        }

        if(currentEvent.next.indexOf('goTo')>=0){
          // gotoだった場合はtoIdのテンプレートを追加して、toIdのイベントの次の次をcurrentEventにする
          var gotoEvent = entity.getContent(scenarioArray, currentEvent.next);
          selectionsRule += ` THEN send_message(\"${gotoEvent.toId}\")`;
          currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
        }else{
          selectionsRule += ` THEN send_message(\"${currentEvent.next}\")`;
          currentEvent = entity.getContent(scenarioArray, currentEvent.next);
        }

      }

    } // for_j

    if(selectionsRule!=''){
      resultText += (headerOfSelectionRule + selectionsRule + footerOfSelectionRule);
      resultText += '\n';
    }
  } // for_i



  // 全てのopenquestionから次のselectionEventかopenquestionEventもしくはnextがないnormalEventまでのautomationを追加する
  /*
  CREATE RULE rule_2 AS
    ON Dialog.question.answered
    TO team
    IF response_match("open_question_template_1_action2") DO send_message("template_1")
  END
  */
  var allOpenQuestionNodes = entity.getOpenQuestionNodes(scenarioArray);
  for(var i=0; i<allOpenQuestionNodes.length; i++){

    if(allOpenQuestionNodes[i].next == undefined) break;

    // TO DO ここ共通化できるよね
    var headerOfSelectionRule = `CREATE RULE rule_${ruleNum} AS\n`;
    ruleNum++;
    headerOfSelectionRule += '  ON Dialog.question.answered\n';
    headerOfSelectionRule += '  TO team\n';

    var footerOfSelectionRule = `END\n`;

    var openquestionRule = `  IF response_match(\"${allOpenQuestionNodes[i].id}_action2\") `;

    // 直後にgoto nodeが来た場合の例外処理
    if(allOpenQuestionNodes[i].next.indexOf('goTo')>=0){
      var gotoEvent = entity.getContent(scenarioArray, allOpenQuestionNodes[i].next);
      openquestionRule += `DO send_message(\"${gotoEvent.toId}\")`;
      var currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
    }else{
      openquestionRule += `DO send_message(\"${allOpenQuestionNodes[i].next}\")`;
      var currentEvent = entity.getContent(scenarioArray, allOpenQuestionNodes[i].next);
    }

    while(true){
      if(currentEvent.type == 'selection' || currentEvent.type == 'openquestion' || currentEvent.next == undefined){
        openquestionRule += '\n';
        break;
      }
      
      if(currentEvent.next.indexOf('goTo')>=0){
        // gotoだった場合はtoIdのテンプレートを追加して、toIdのイベントの次の次をcurrentEventにする
        var gotoEvent = entity.getContent(scenarioArray, currentEvent.next);
        openquestionRule += ` THEN send_message(\"${gotoEvent.toId}\")`;
        currentEvent = entity.getContent(scenarioArray, gotoEvent.toId);
      }else{
        openquestionRule += ` THEN send_message(\"${currentEvent.next}\")`;
        var currentEvent = entity.getContent(scenarioArray, currentEvent.next);
      }

    }

    resultText += (headerOfSelectionRule + openquestionRule + footerOfSelectionRule);
    resultText += '\n';

  }


  console.log(resultText);

  download(`eca.text`, resultText);

  resultText = '';

}


// 今だけテスト用
window.exportScenarioAsECA = exportScenarioAsECA;

export default exportECA;


