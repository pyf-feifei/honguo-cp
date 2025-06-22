<template>
  <view class="video-player-container">
    <!-- H5端 -->
    <!-- #ifdef H5 -->
    <PlarPlayer ref="plarPlayerRef" :src="src" v-bind="attrs">
      <slot></slot>
    </PlarPlayer>
    <!-- #endif -->

    <!-- 非H5端 -->
    <!-- #ifndef H5 -->
    <video :id="videoId" :src="src" v-bind="attrs" class="video-player">
      <slot></slot>
    </video>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, onMounted, useAttrs } from 'vue'
// #ifdef H5
import Hls from 'hls.js'
import PlarPlayer from './PlarPlayer/index.vue'
// #endif

// 获取所有传入的属性
const attrs = useAttrs()

// 只定义必要的props
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    default: 'videoPlayer',
  },
})

// 视频上下文
const videoContext = ref(null)
// #ifdef H5
const plarPlayerRef = ref(null)
// #endif

// 初始化视频上下文
onMounted(() => {
  // #ifdef H5
  videoContext.value = plarPlayerRef.value
  // #endif
  // #ifndef H5
  videoContext.value = uni.createVideoContext(props.videoId)
  // #endif
})

// 视频方法
const play = () => {
  if (videoContext.value) {
    videoContext.value.play()
  }
}

const pause = () => {
  if (videoContext.value) {
    videoContext.value.pause()
  }
}

const seek = (position) => {
  if (videoContext.value) {
    videoContext.value.seek(position)
  }
}

const stop = () => {
  if (videoContext.value) {
    videoContext.value.stop()
  }
}

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  seek,
  stop,
  videoContext,
})
</script>

<style lang="scss" scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  .video-player {
    width: 100%;
    height: 100%;
    background: #000;
    object-fit: contain;
    position: relative;
  }
}
</style>
