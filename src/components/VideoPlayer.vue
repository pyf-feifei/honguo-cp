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
      <cover-image
        :src="'/static/theater/loadaing.gif'"
        class="video-loading-icon"
        v-if="loading"
      ></cover-image>
    </video>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, onMounted, useAttrs, watch } from 'vue'
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
  loading: {
    type: Boolean,
    default: false,
  },
})

// 视频上下文
const videoContext = ref(null)
// #ifdef H5
const plarPlayerRef = ref(null)
// #endif

// 初始化视频上下文
onMounted(() => {
  // 延迟初始化，确保DOM已完全渲染
  setTimeout(() => {
    // #ifdef H5
    videoContext.value = plarPlayerRef.value
    // #endif
    // #ifndef H5
    videoContext.value = uni.createVideoContext(props.videoId)
    // #endif
    console.log(
      'VideoPlayer initialized, videoId:',
      props.videoId,
      'context:',
      videoContext.value
    )
  }, 100)
})

// 视频方法
const play = () => {
  console.log('VideoPlayer play called, videoContext:', videoContext.value)
  if (videoContext.value) {
    videoContext.value.play()
  } else {
    console.error('VideoContext not available for play')
  }
}

const pause = () => {
  console.log('VideoPlayer pause called, videoContext:', videoContext.value)
  if (videoContext.value) {
    videoContext.value.pause()
  } else {
    console.error('VideoContext not available for pause')
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

  .video-loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    pointer-events: none;
    width: 160rpx;
    height: 160rpx;
    color: white;
  }
}
</style>
