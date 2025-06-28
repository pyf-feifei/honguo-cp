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
    <view class="video-wrapper">
      <video
        :id="videoId"
        :src="src"
        v-bind="attrs"
        class="video-player"
        :controls="false"
        :show-center-play-btn="false"
        :show-play-btn="false"
        :show-fullscreen-btn="false"
        :enable-progress-gesture="false"
        :enable-play-gesture="false"
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @canplay="onCanPlay"
        @waiting="onWaiting"
        @error="onError"
      >
        <slot></slot>
      </video>

      <!-- 点击区域覆盖层 - 用于捕获单击事件 -->
      <cover-view class="click-overlay" @click="onVideoClick"></cover-view>

      <!-- 加载状态 -->
      <cover-image
        :src="'/static/theater/loadaing.gif'"
        class="video-loading-icon"
        v-if="loading"
      ></cover-image>

      <!-- 自定义播放按钮 - 暂停时显示 -->
      <cover-image
        :src="'/static/theater/play.png'"
        class="play-button"
        v-if="!isPlaying && !loading"
        @click="onPlayButtonClick"
      ></cover-image>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted, useAttrs } from 'vue'
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

// 发射事件
const emit = defineEmits([
  'play',
  'pause',
  'timeupdate',
  'loadedmetadata',
  'canplay',
  'waiting',
  'error',
])

// 视频状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

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

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

// 视频事件处理
const onPlay = () => {
  console.log('Video play event triggered')
  isPlaying.value = true
  emit('play')
}

const onPause = () => {
  console.log('Video pause event triggered')
  isPlaying.value = false
  emit('pause')
}

const onTimeUpdate = (e) => {
  if (e.detail) {
    const newTime = e.detail.currentTime || 0
    const newDuration = e.detail.duration || duration.value

    currentTime.value = newTime
    if (newDuration > 0) {
      duration.value = newDuration
    }
  }
  emit('timeupdate', e)
}

const onLoadedMetadata = (e) => {
  console.log('Video metadata loaded:', e.detail)
  if (e.detail && e.detail.duration) {
    duration.value = e.detail.duration
  }
  emit('loadedmetadata', e)
}

const onCanPlay = (e) => {
  console.log('Video can play')
  emit('canplay', e)
}

const onWaiting = (e) => {
  console.log('Video waiting')
  emit('waiting', e)
}

const onError = (e) => {
  console.log('Video error:', e)
  emit('error', e)
}

// 视频点击事件 - 通过cover-view捕获，可以暂停和播放
const onVideoClick = (e) => {
  console.log('Video clicked, isPlaying:', isPlaying.value)
  e.stopPropagation()

  // 切换播放状态
  if (isPlaying.value) {
    pause()
  } else {
    play()
  }
}

// 播放按钮点击事件
const onPlayButtonClick = (e) => {
  console.log('Play button clicked')
  e.stopPropagation()
  play()
}

// 视频方法
const play = () => {
  console.log('VideoPlayer play called, videoContext:', !!videoContext.value)
  if (videoContext.value) {
    videoContext.value.play()
  } else {
    console.error('VideoContext not available for play')
  }
}

const pause = () => {
  console.log('VideoPlayer pause called, videoContext:', !!videoContext.value)
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
  isPlaying: computed(() => isPlaying.value),
})
</script>

<style lang="scss" scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  .video-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-player {
    width: 100%;
    height: 100%;
    background: #000;
    object-fit: contain; /* 保持比例 */
  }

  .click-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: transparent;
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
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;
    width: 120rpx;
    height: 120rpx;
    opacity: 0.9;
    transition: opacity 0.3s;

    &:active {
      opacity: 0.7;
    }
  }
}
</style>
