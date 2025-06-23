<template>
  <view class="video-slider-container">
    <view
      class="slider-wrapper"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <view
        class="slider-item"
        v-for="(item, idx) in visibleItems"
        :key="item.id || item.url"
        :style="getItemStyle(idx)"
        :data-index="getItemIndex(idx)"
      >
        <VideoPlayer
          :src="item.url"
          :videoId="`video-${getItemIndex(idx)}`"
          :controls="false"
          :loop="true"
          :show-fullscreen-btn="false"
          :show-play-btn="false"
          :enable-progress-gesture="false"
          :object-fit="'contain'"
          :show-loading="false"
          @click="togglePlay(idx)"
          :ref="(el) => setVideoRef(el, idx)"
        >
          <!-- <slot :item="item" :idx="idx"> </slot> -->
        </VideoPlayer>
      </view>
    </view>
    <view class="loading" v-if="loading">
      <image
        src="/static/theater/loadaing.gif"
        mode="aspectFit"
        class="loading-icon"
      ></image>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import VideoPlayer from './VideoPlayer.vue'

const props = defineProps({
  vodList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
// 移除loadMore事件定义，因为不再需要

const currentIndex = ref(0)
const slideDistance = ref(0)
const isAnimating = ref(false)
const videoRefs = ref([])
const playStatus = ref({})

const preloadCount = 2 // 前后各2个

const visibleItems = computed(() => {
  if (!props.vodList.length) return []
  const items = []
  const startIdx = Math.max(0, currentIndex.value - preloadCount)
  const endIdx = Math.min(
    props.vodList.length - 1,
    currentIndex.value + preloadCount
  )
  for (let i = startIdx; i <= endIdx; i++) items.push(props.vodList[i])
  return items
})
const getItemIndex = (visibleIdx) =>
  Math.max(0, currentIndex.value - preloadCount) + visibleIdx
const getItemStyle = (idx) => {
  const realIndex = getItemIndex(idx)
  let translateY = (realIndex - currentIndex.value) * 100 + slideDistance.value
  return {
    transform: `translate3d(0, ${translateY}%, 0)`,
    zIndex: realIndex === currentIndex.value ? 2 : 1,
    opacity: Math.abs(realIndex - currentIndex.value) <= 1 ? 1 : 0.6,
    transition: isAnimating.value ? 'transform 0s, opacity 0.3s' : 'none',
  }
}

// 触摸事件
let touchStartY = 0
let touchStartTime = 0
let isSliding = false
const onTouchStart = (e) => {
  if (isAnimating.value) return
  touchStartY = e.touches[0].clientY
  touchStartTime = Date.now()
  isSliding = true
}
const onTouchMove = (e) => {
  if (!isSliding) return
  const deltaY = e.touches[0].clientY - touchStartY
  let damping = 0.8
  if (
    (currentIndex.value === 0 && deltaY > 0) ||
    (currentIndex.value === props.vodList.length - 1 && deltaY < 0)
  ) {
    damping = 0.4
  }
  slideDistance.value = Math.max(Math.min((deltaY * damping) / 4, 100), -100)
  e.preventDefault()
}
//
let slideTimer
const onTouchEnd = () => {
  if (!isSliding) return

  isSliding = false
  const deltaY = slideDistance.value
  const threshold = 10
  isAnimating.value = true
  // 清除之前的定时器
  if (slideTimer) {
    clearInterval(slideTimer)
  }
  if (deltaY > threshold && currentIndex.value > 0) {
    slideTimer = setInterval(() => {
      if (slideDistance.value < 100) {
        slideDistance.value++
      } else {
        slideDistance.value = 0
        currentIndex.value--
        clearInterval(slideTimer)
      }
    }, 2)
  } else if (
    deltaY < -threshold &&
    currentIndex.value < props.vodList.length - 1
  ) {
    console.log('slideDistance.value', slideDistance.value)

    slideTimer = setInterval(() => {
      if (slideDistance.value > -100) {
        slideDistance.value--
      } else {
        slideDistance.value = 0
        currentIndex.value++
        clearInterval(slideTimer)
      }
    }, 2)

    // 移除loadMore事件触发，因为player.vue已经完整获取了数据
  } else {
    if (slideDistance.value < 0) {
      slideTimer = setInterval(() => {
        if (slideDistance.value < 0) {
          slideDistance.value++
        } else {
          slideDistance.value = 0
          clearInterval(slideTimer)
        }
      }, 2)
    }
    if (slideDistance.value > 0) {
      slideTimer = setInterval(() => {
        if (slideDistance.value > 0) {
          slideDistance.value--
        } else {
          slideDistance.value = 0
          clearInterval(slideTimer)
        }
      }, 2)
    }
  }
  setTimeout(() => {
    isAnimating.value = false
  }, 100)
}

// 自动播放当前视频
watch(
  currentIndex,
  (newIndex) => {
    setTimeout(() => {
      console.log('visibleItems', visibleItems.value)
      console.log('videoRefs', videoRefs.value)

      // 先过滤掉 null 再遍历
      videoRefs.value.forEach((video, idx) => {
        if (video && typeof video.pause === 'function') {
          video.pause()
          const realIndex = getItemIndex(idx)
          playStatus.value[realIndex] = false
        }
      })

      nextTick(() => {
        const idx = visibleItems.value.findIndex(
          (_, i) => getItemIndex(i) === newIndex
        )
        if (
          idx !== -1 &&
          videoRefs.value[idx] &&
          typeof videoRefs.value[idx].play === 'function'
        ) {
          videoRefs.value[idx].play()
          playStatus.value[newIndex] = true
        }
      })
    }, 0)
  },
  { flush: 'post' }
)

// 监听视频列表变化，自动播放第一个
watch(
  () => props.vodList,
  (newList) => {
    if (newList.length) setTimeout(() => playFirstVideo(), 10)
  },
  { immediate: true }
)

const playFirstVideo = () => {
  if (videoRefs.value.length > 0) {
    // 先过滤掉 null 再遍历
    videoRefs.value.forEach((video, idx) => {
      if (video && typeof video.pause === 'function') {
        video.pause()
        const realIndex = getItemIndex(idx)
        playStatus.value[realIndex] = false
      }
    })

    const idx = visibleItems.value.findIndex(
      (_, i) => getItemIndex(i) === currentIndex.value
    )
    if (
      idx !== -1 &&
      videoRefs.value[idx] &&
      typeof videoRefs.value[idx].play === 'function'
    ) {
      videoRefs.value[idx].play()
      playStatus.value[currentIndex.value] = true
    }
  }
}

// 切换播放/暂停
const togglePlay = (idx) => {
  const realIndex = getItemIndex(idx)
  const video = videoRefs.value[idx]

  if (!video) return

  if (playStatus.value[realIndex]) {
    video.pause()
    playStatus.value[realIndex] = false
  } else {
    // 先过滤掉 null 再遍历
    videoRefs.value.forEach((v, i) => {
      if (v && typeof v.pause === 'function') {
        v.pause()
        const rIndex = getItemIndex(i)
        playStatus.value[rIndex] = false
      }
    })

    video.play()
    playStatus.value[realIndex] = true
  }
}

// 组件挂载后初始化
onMounted(() => {
  // 初始化播放状态，使用nextTick确保DOM已完全渲染
  nextTick(() => {
    playFirstVideo()
  })
})

// 暴露方法给父组件
defineExpose({
  playFirstVideo,
  getItemIndex,
  togglePlay,
  currentIndex,
})

// 用函数式 ref 绑定
function setVideoRef(el, idx) {
  videoRefs.value[idx] = el || null
}
</script>

<style lang="scss" scoped>
.video-slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;

  .slider-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .slider-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      opacity 1s ease;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .video-info {
    position: absolute;
    bottom: 80rpx;
    left: 30rpx;
    right: 30rpx;
    color: #fff;
    z-index: 10;

    .video-title {
      font-size: 32rpx;
      margin-bottom: 20rpx;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    }

    .video-controls {
      display: flex;
      align-items: center;

      .play-btn {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .control-icon {
          width: 60rpx;
          height: 60rpx;
        }
      }
    }
  }

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;

    .loading-icon {
      width: 160rpx;
      height: 160rpx;
    }
  }
}
</style>
