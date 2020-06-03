<template lang="pug">
  div.wrap-home-profile
    div.wrap-icon.f.fc.mb12
      div.wrap-img.f.fh
        img(:src="team.iconURL")
    span.team-name.mb12 {{team.name}}
    div.wrap-qr.f.fc.mb4
      img(:src="qrSrc")
    div(v-clipboard:copy="teamURI"
      v-clipboard:success="onCopyTeamURI").wrap-uri.f.fh.mb24
      div.f
        v-icon(color="#999" size="16px").mr4 file_copy
        span.team-uri {{teamURI}}

</template>

<style lang="scss">
.wrap-home-profile {
  .wrap-icon {
    min-height: 140px;
    .wrap-img {
      width: 140px;
      border: solid 1px rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      overflow: hidden;
    }
  }
  .team-name {
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
  .wrap-qr {
    img {
      width: 140px;
    }
  }
  .wrap-uri {
    cursor: pointer;
    .team-uri {
      display: block;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: mapStateTeam } = createNamespacedHelpers('team')

var QRCode = require('qrcode')

export default {
  props: {
    team: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      teamURI: null,
      qrSrc: null
    }
  },
  computed: {
    ...mapStateTeam(['primaryUser'])
  },
  async created () {
    this.teamURI = `${location.origin}/${this.team.id}`
    this.qrSrc = await this.getImageQR(this.teamURI)
  },
  methods: {
    onCopyTeamURI () {
      alert('URL has been copied.')
    },
    getImageQR (url) {
      return new Promise(resolve => {
        QRCode.toDataURL(url)
          .then(url => {
            return resolve(url)
          })
      })
    }
  }
}
</script>
