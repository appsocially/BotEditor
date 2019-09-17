<template lang="pug">

  div.wrap-img-uploader.py20
    div(@click="pickImg").uploaded-img.f.fc
      div.img-wrapper.f.fh
        img(v-show="uploadedImage" :src="uploadedImage")
      div.wrap-change-icon.f.fh
        v-icon cached
    input(type="file" v-on:change="onFileChange" ref="imgInput" style="display: none")
    canvas(id="imgCanvas" ref="imgCanvas" width="0" height="0" style="display: none")

</template>

<style lang="scss" scoped>

.wrap-img-uploader {
  .uploaded-img {
    position: relative;
    margin: 0 auto;
    width: 120px;
    height: 120px;
    .img-wrapper {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: solid #999 2px;
      img {
        object-fit: cover;
        min-height: 100%;
        min-width: 100%;
      }
    }
    .wrap-change-icon {
      position: absolute;
      width: 30px;
      height: 30px;
      right: 10px;
      bottom: 2px;
      background: #FF9A0A;
      border-radius: 50%;
      i {
        color: #2a2a2a;
        font-size: 18px;
      }
    }
  }
}

</style>


<script>
import { strage } from "@/components/firebaseInit"
// import { strage } from '@/components/utils/strage'
import { setTimeout } from "timers"

export default {
  props: {
    existingImg: {
      type: String,
      required: false
    },
    imgId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      uploadedImage: '',
    }
  },
  created () {
    console.log("strage", strage)
    if(this.existingImg) this.uploadedImage = this.existingImg
  },
  methods: {
    pickImg () {
      this.$refs.imgInput.click()
    },
    onFileChange (e) {
      let files = e.target.files || e.dataTransfer.files
      this.createImage(files[0])
    },
    // アップロードした画像を表示
    createImage (file) {
      // 画像リサイズ後の最大値の幅
      const THUMBNAIL_WIDTH = 200
      const THUMBNAIL_HEIGHT = 200

      // var imgCanvas = this.$refs.imgCanvas
      var image = new Image()
      var reader = new FileReader()
      reader.onload = (e) => {
        this.uploadedImage = e.target.result
        image.onload = () => {
          var width, height;
          if(image.width > image.height){
            // 横長の画像は横のサイズを指定値にあわせる
            var ratio = image.height/image.width
            width = THUMBNAIL_WIDTH
            height = THUMBNAIL_WIDTH * ratio
          } else {
            // 縦長の画像は縦のサイズを指定値にあわせる
            var ratio = image.width/image.height
            width = THUMBNAIL_HEIGHT * ratio
            height = THUMBNAIL_HEIGHT
          }
          var canvas = document.getElementById("imgCanvas")
          imgCanvas.setAttribute("width", width)
          imgCanvas.setAttribute("height", height)

          var ctx = canvas.getContext('2d')
          // canvasに既に描画されている画像をクリア
          ctx.clearRect(0,0,width,height)
          // canvasにサムネイルを描画
          ctx.drawImage(image,0,0,image.width,image.height,0,0,width,height)
        }
        // image.onload = this.createBase64
        image.src = e.target.result
        setTimeout(this.uploadImg, 400)
      }
      reader.readAsDataURL(file)
    },
    uploadImg () {
      var base64 = this.$refs.imgCanvas.toDataURL()
      
      // this.uploadedImage = base64

      // ストレージオブジェクト作成
      var storageRef = strage.ref()
      // ファイルのパスを設定
      var mountainsRef = storageRef.child(`icon/${this.imgId}.jpg`)
      // ファイルを適用してファイルアップロード開始
      // mountainsRef.put(this.imageFile).then(snapshot => {
      mountainsRef.putString(base64.split(',')[1], 'base64').then(snapshot => {
        snapshot.ref.getDownloadURL().then(downloadURL => {
          this.uploadedImage = downloadURL
          console.log('imageUrl', downloadURL)
        })
      })
    },
    getImgUrl () {
      return this.uploadedImage
    }
  }
}
</script>
