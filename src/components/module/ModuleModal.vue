<template lang="pug">

  div(@click="onOverlay").wrap-modal.f.fh
    div(@click="onWindow" :class="windowActive").module-content
      div.wrap-settings-content.px20.py12
        h3.mb12 {{this.$t("canvas.settings.title")}}
        item-img-uploader(:existingImg="project.botIcon" :imgId="project.id" ref="imgUploader")
        v-text-field(:label="projectTitleLabel" :value="project.title" v-model="projectTitle" color="#FF9A0A")
        v-textarea(name="input-7-1" :label="projectDescriptionLabel" v-model="projectDescription" rows="3" color="#FF9A0A")
        div.wrap-color-picker.mb28
          h4.mb8 Color
          div.f.fm.pl2.mb8
            div(:style="`background: ${themeColor.hex};`").color-preview.mr4
            span {{this.themeColor.hex}}
          Compact(v-model="themeColor").pl2
        //- v-color-picker(v-model="themeColor")
        v-switch(v-model="switchPublishedAsFormat" color="#FF9A0A" :label="togglePublishLabel").switch
        div.mb24
          h4.mb8 {{this.$t("canvas.settings.bot_url.title")}}
          div(v-clipboard:copy="copyMessage" v-clipboard:success="onCopy").wrap-url.f.fm
            v-icon.mr6 file_copy
            span.line-clamp-1 {{copyMessage}}
        // div.mb30
          h4.mb8 {{this.$t("canvas.settings.embed_code.title")}}
          //div.wrap-embed-code.f.fm
          div(v-clipboard:copy="embedCode" v-clipboard:success="onCopy").wrap-embed-code.f.fm
            v-icon.mr6 file_copy
            span.line-clamp-1 {{embedCode}}
            //input(type="text" :value="embedCode" readonly).embed-code.line-clamp-1
        div.wrap-save-button.f.fc.pb12
          span(@click="onSave").save-button.px4.pt7.pb6.f.fh {{this.$t("canvas.settings.save_label")}}

</template>

<style lang="scss" scoped>

.wrap-modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  .module-content {
    display: block;
    margin: 0 auto;
    background: #FFF;
    border-radius: 3px;

    transition: all 400ms ease-out;
    transform: scale(0.0);
    opacity: 0.0;
    .wrap-settings-content {
      min-width: 280px;
      max-width: 500px;
      max-height: 90%;
      overflow: scroll;
    }
    h3 {
      text-align: center;
    }
    h4 {
      font-size: 12px;
      font-weight: normal;
      color:rgba(0,0,0,0.54);
    }
    .wrap-color-picker {
      .color-preview {
        cursor: pointer;
        width: 24px;
        height: 24px;
        border-radius: 6px;
      }
    }
    .switch {
      margin-top: 0;
    }
    .wrap-url {
      cursor: pointer;
      i {
        // color: #FF9A0A;
        width: 20px;
        font-size: 20px;
      }
      span {
      // color: #FF9A0A;
      }
    }
    .wrap-embed-code {
      cursor: pointer;
      i {
        // color: #FF9A0A;
        width: 20px;
        font-size: 20px;
      }
      .embed-code {
        width: 100%;
        outline: none;
        // color: #FF9A0A;
      }
    }
    .wrap-save-button {
      width: 100%;
      .save-button {
        cursor: pointer;
        width: 72px;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        background: #FF9A0A;
        color: #fff;
        border-radius: 3px;
        filter: drop-shadow(2px 1px 1px rgba(0,0,0,0.2));
      }
    }
  }
  .window-active {
    transform: scale(1.0);
    opacity: 1.0;
  }
}

</style>


<script>
import { createNamespacedHelpers } from "vuex"
const { mapState: mapStateTeam, mapActions: mapActionsTeam } = createNamespacedHelpers("team")

import { functions } from 'firebase'
import { Compact } from 'vue-color'
import ItemImgUploader from '@/components/item/ItemImgUploader'

export default {
  components: {
    ItemImgUploader,
    Compact
  },
  props: {
    // showModal: {
    //   type: Boolean,
    //   required: true,
    // },
    project: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      windowActive: "",
      projectTitle: "",
      projectTitleLabel: this.$t('canvas.settings.project.title_label'),
      projectDescription: "",
      projectDescriptionLabel: this.$t('canvas.settings.project.description_label'),
      togglePublishLabel: this.$t('canvas.settings.toggle_publish_label'),
      copyMessage: "",
      embedCode: "",
      switchPublishedAsFormat: false,
      themeColor: {
        hex: "#FF9A0A",
        hsl: { h: 0, s: 0, l: 38, a: 1 },
        hsv: { h: 0.098, s: 0.9608, v: 1, a: 1 },
        rgba: { r: 255, g: 154, b: 10, a: 1 },
        a: 1
      }
    }
  },
  computed: {
    ...mapStateTeam([
      'teamId'
    ])
  },
  created: function () {
    this.projectTitle = this.project.title
    if (this.project.themeColor) this.themeColor = this.project.themeColor
    this.switchPublishedAsFormat = (this.project.pulishedAsFormat)? this.project.pulishedAsFormat: false
    this.projectDescription = (this.project.discription)? this.project.discription: "About this bot..."
    this.copyMessage = `${location.origin}/preview/${this.$route.params.id}/${this.teamId}`

    this.embedCode = `<iframe src="${location.origin}/preview/${this.$route.params.id}/${this.teamId}" width="320px" height="620px"></iframe>`
  },
  mounted: function () {
    //this.nextTick(this.activateWindow)
    setTimeout(this.activateWindow, 1)
  },
  methods: {
    activateWindow () {
      this.windowActive = "window-active"
    },
    toggleSettings () {
      this.$emit('toggleModal')
    },
    onOverlay () {
      this.$emit('toggleModal')
    },
    onWindow (e) {
      e.stopPropagation()
    },
    onSave () {
      this.$emit("updateProject", {
        botIcon: this.$refs.imgUploader.getImgUrl(),
        title: this.projectTitle,
        discription: this.projectDescription,
        themeColor: this.themeColor,
        pulishedAsFormat: this.switchPublishedAsFormat
      })
    },
    onCopy () {
      alert(this.$t("canvas.settings.bot_url.on_copy"))
    },
    onEmbedCode () {
      alert(this.$t("canvas.settings.embed_code.on_copy"))
    },
  }
};
</script>
