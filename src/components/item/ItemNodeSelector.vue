<template lang="pug">

  div.wrap-item#nodeSelector
    div.wrap-selectors
      div(v-for='item in selection').selector
        p(@click='callAddNode(item.type)').px12.py8 {{item.label}}
    
</template>

<style lang="scss">

.wrap-item {
  background: #FFF;
  position: absolute;
  border-radius: 12px;
  box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
  .wrap-selectors {
    .selector {
      cursor: pointer;
      p {
        margin: 0;
        text-align: center;
        color: #FF9A0A;
      }
    }
  }
}

</style>

<script>

export default {
  name: 'ItemNodeSelector',
  components: {
    
  },
  data() {
    return {
      selection: [],
      position: {},
      dragStartedPosition: {},
      dragStartedId: '',
    }
  },
  created: function(){

    this.selection = [
      {label: 'Message', type: 'normal'},//method: this.callAddSimpleMessage},
      {label: 'Question', type: 'selection'}//method: this.addSelectionMessage},
    ];

    //this.position = {x: 100, y: 49964};

  },
  mounted: function(){
    
    d3.select('#nodeSelector')
      .style('top', `${this.position.y}px`)
      .style('left', `${this.position.x}px`);

    // 多分これやっちゃいけないやつ
    window.updatePosition = this.updatePosition;

  },
  methods: {
    callAddNode(type){

      switch(type){
        case 'normal':
          this.$emit('addNormalMessage', this.position, this.dragStartedPosition, this.dragStartedId);
        break;
        case 'selection':
          this.$emit('addSelectionMessage', this.position, this.dragStartedPosition, this.dragStartedId);
        break;
      }

      //this.$emit('addLine', this.dragStartPosition, this.position);

      $('#nodeSelector').hide();
      $('#lineForPreview').hide();

    },
    updatePosition(position, fromPosition, fromId){
      $('#nodeSelector').show();

      var selector = document.getElementById('nodeSelector');

      this.position = position;
      this.dragStartedPosition = fromPosition;
      this.dragStartedId = fromId;
      //this.position.y -= selector.clientHeight/2;

      d3.select('#nodeSelector', this.position)
        .style('top', `${this.position.y - selector.clientHeight/2}px`)
        .style('left', `${this.position.x}px`);

      $('.focused').removeClass('focused');
    }
  }
};

</script>
