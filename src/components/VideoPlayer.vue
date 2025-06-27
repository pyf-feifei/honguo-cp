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
      <cover-view
        class="click-overlay"
        @click="onVideoClick"
        v-if="!isDragging"
      ></cover-view>

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

      <!-- 自定义进度条 - 简化实现 -->
      <cover-view
        class="progress-bar"
        :class="{
          show: showProgressBar,
          dragging: isDragging,
          paused: !isPlaying,
        }"
        @click="onProgressClick"
      >
        <!-- 进度条背景 -->
        <cover-view class="progress-bg"></cover-view>

        <!-- 进度条填充 -->
        <cover-view
          class="progress-line"
          :style="{ width: progressPercent + '%' }"
        ></cover-view>

        <!-- 进度点 -->
        <cover-view
          class="progress-point"
          :style="{ left: progressPercent + '%' }"
          @touchstart="onProgressTouchStart"
          @touchmove="onProgressTouchMove"
          @touchend="onProgressTouchEnd"
        ></cover-view>

        <!-- 时间显示 - 只在拖拽时显示 -->
        <cover-view class="time-display" v-if="isDragging">
          <cover-text class="current-time">{{
            formatTime(currentTime)
          }}</cover-text>
          <cover-text class="duration">
            / {{ formatTime(duration) }}</cover-text
          >
        </cover-view>
      </cover-view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref, computed, onMounted, useAttrs, watch } from 'vue'
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
const isDragging = ref(false)
const progressWidth = ref(300) // 进度条宽度，单位rpx
const progressRect = ref({}) // 进度条矩形信息

// 计算进度百分比
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  const percent = (currentTime.value / duration.value) * 100
  return Math.min(100, Math.max(0, percent))
})

// 计算进度点的X坐标
const progressX = computed(() => {
  if (duration.value === 0) return 0
  const percent = currentTime.value / duration.value
  // 减去进度点自身宽度的一半，确保中心对齐
  const maxX = progressWidth.value - 24 // 24rpx是进度点的宽度
  return percent * maxX
})

// 计算是否显示进度条
const showProgressBar = computed(() => {
  // 视频时长大于15秒，或者正在拖拽，或者视频暂停时显示进度条
  return duration.value > 15 || isDragging.value || !isPlaying.value
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

    // 获取进度条宽度
    getProgressBarWidth()
  }, 100)
})

// 获取进度条宽度
const getProgressBarWidth = () => {
  const query = uni.createSelectorQuery()
  query
    .select('.progress-bar')
    .boundingClientRect((data) => {
      if (data) {
        progressRect.value = data
        // 转换为rpx单位
        progressWidth.value = data.width * 2 // 假设设备像素比为2
        console.log('Progress bar info:', {
          width: data.width,
          widthRpx: progressWidth.value,
          rect: data,
        })
      }
    })
    .exec()
}

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
  if (!isDragging.value && e.detail) {
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

// 进度条点击事件
const onProgressClick = (e) => {
  if (duration.value === 0) return

  // 获取点击位置相对于进度条的百分比
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.detail.x - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const newTime = percent * duration.value

  console.log('Progress click:', {
    x: x,
    width: rect.width,
    percent: percent.toFixed(3),
    newTime: formatTime(newTime),
  })

  currentTime.value = newTime

  // 设置视频时间
  if (videoContext.value) {
    videoContext.value.seek(newTime)
  }
}

// 进度条拖拽事件
const onProgressTouchStart = (e) => {
  console.log('Progress touch start')
  e.stopPropagation()
  isDragging.value = true

  // 暂停视频
  if (isPlaying.value) {
    pause()
  }
}

const onProgressTouchMove = (e) => {
  if (!isDragging.value || duration.value === 0) return
  e.stopPropagation()

  // 简单的拖拽处理
  const touch = e.touches[0]
  const rect = progressRect.value

  if (rect && rect.width > 0) {
    const x = touch.clientX - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    const newTime = percent * duration.value

    console.log('Progress drag:', {
      x: x,
      percent: percent.toFixed(3),
      newTime: formatTime(newTime),
    })

    currentTime.value = newTime
  }
}

const onProgressTouchEnd = (e) => {
  if (!isDragging.value) return
  console.log('Progress touch end')
  e.stopPropagation()

  // 设置视频时间
  if (videoContext.value && currentTime.value >= 0) {
    console.log('Seeking to:', formatTime(currentTime.value))
    videoContext.value.seek(currentTime.value)
  }

  // 延迟结束拖拽状态并恢复播放
  setTimeout(() => {
    isDragging.value = false
    play()
  }, 100)
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
    object-fit: contain;
  }

  .click-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
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

  .progress-bar {
    position: absolute;
    bottom: 20rpx;
    left: 5%;
    width: 90%;
    height: 60rpx;
    z-index: 20;
    opacity: 0;
    transition: opacity 0.3s;

    &.show {
      opacity: 0.8;
    }

    &.paused {
      opacity: 1;
    }

    &.dragging {
      opacity: 1;
    }

    .progress-bg {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 4rpx;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2rpx;
      transform: translateY(-50%);
      transition: height 0.3s;
    }

    .progress-line {
      position: absolute;
      top: 50%;
      left: 0;
      height: 4rpx;
      background: #fff;
      border-radius: 2rpx;
      transform: translateY(-50%);
      transition: width 0.1s, height 0.3s;
    }

    .progress-point {
      position: absolute;
      top: 50%;
      width: 24rpx;
      height: 24rpx;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.3);
      transform: translate(-50%, -50%);
      transition: left 0.1s;
      z-index: 1;
    }

    &.show,
    &.paused,
    &.dragging {
      .progress-bg {
        height: 8rpx;
      }

      .progress-line {
        height: 8rpx;
      }

      .progress-point {
        width: 24rpx;
        height: 24rpx;
      }
    }

    .time-display {
      position: absolute;
      bottom: 80rpx;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 15rpx 30rpx;
      border-radius: 20rpx;
      font-size: 28rpx;
      white-space: nowrap;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);

      .duration {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>
