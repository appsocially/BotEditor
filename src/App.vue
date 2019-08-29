<template>
  <v-app>
    <!--v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Vuetify</span>
        <span class="font-weight-light">MATERIAL DESIGN</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
      >
        <span class="mr-2">Latest Release</span>
      </v-btn>
    </v-toolbar-->
    <div id='nowLoading'>
      <div class='wrap-now-loading f fh'>
        <span>Now Loading...</span>
      </div>
    </div>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<style lang="scss">

#nowLoading {
  display: none;
  width: 100%;
  height: 100%;
  background: #FFF;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  .wrap-now-loading {
    width: 100%;
    height: 100%;
  }
}

</style>

<script>

export default {
  name: "App",
  components: {
  },
  data() {
    return {
      //
    };
  },
  created: function(){
    if(location.hash!=''){
      var urlWithoutHash = location.href.split('#')[0] + location.href.split('#')[1];
      location.href = urlWithoutHash;
    }
  }
};
</script>
