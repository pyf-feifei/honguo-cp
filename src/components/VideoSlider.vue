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
          @click="togglePlay(idx)"
          :ref="(el) => setVideoRef(el, idx)"
        >
          <view class="video-info">
            <view class="video-title">{{ item.title }}</view>
            <view class="video-controls">
              <view class="play-btn" @click.stop="togglePlay(idx)">
                <image
                  :src="
                    playStatus[getItemIndex(idx)]
                      ? '/static/theater/pause.png'
                      : '/static/theater/play.png'
                  "
                  mode="aspectFit"
                  class="control-icon"
                ></image>
              </view>
            </view>
          </view>
        </VideoPlayer>
      </view>
    </view>
    <view class="loading" v-if="loading">
      <image
        src="/static/theater/loading1.gif"
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
  
  // 计算z-index，确保当前项和相邻项在最上层
  const zIndex = realIndex === currentIndex.value ? 10 : 
               Math.abs(realIndex - currentIndex.value) === 1 ? 5 : 1
  
  // 计算不透明度，使相邻项半透明，远离项更透明
  const opacity = realIndex === currentIndex.value ? 1 : 
                Math.abs(realIndex - currentIndex.value) === 1 ? 0.8 : 0.6
  
  // 为动画添加缓动效果
  const transition = isAnimating.value ? 
    'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s' : 'none'
  
  return {
    transform: `translate3d(0, ${translateY}%, 0)`,
    zIndex,
    opacity,
    transition,
    willChange: isAnimating.value ? 'transform, opacity' : 'auto'
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
const onTouchEnd = () => {
  if (!isSliding) return
  isSliding = false
  const deltaY = slideDistance.value
  const threshold = 15
  isAnimating.value = true
  
  // 使用动画效果平滑过渡
  const animateSlide = (direction) => {
    const step = direction === 'up' ? 10 : -10 // 根据方向决定步进值
    const targetDistance = direction === 'up' ? 100 : -100 // 目标距离
    const interval = 16 // 动画间隔时间(ms)
    let animationTimer = null
    
    const animate = () => {
      slideDistance.value += step
      
      // 根据方向检查是否达到目标
      const isComplete = direction === 'up' 
        ? slideDistance.value >= targetDistance 
        : slideDistance.value <= targetDistance
        
      if (!isComplete) {
        animationTimer = setTimeout(animate, interval)
      } else {
        // 动画完成后，更新索引
        if (direction === 'up') {
          currentIndex.value--
        } else {
          currentIndex.value++
        }
        
        // 重置滑动距离
        slideDistance.value = 0
        
        // 延迟一段时间后关闭动画状态
        setTimeout(() => {
          isAnimating.value = false
        }, 50)
      }
    }
    
    // 清除可能存在的动画计时器
    if (animationTimer) {
      clearTimeout(animationTimer)
    }
    
    // 开始动画
    animate()
  }
  
  if (deltaY > threshold && currentIndex.value > 0) {
    // 向上滑动，显示上一个视频
    animateSlide('up')
  } else if (deltaY < -threshold && currentIndex.value < props.vodList.length - 1) {
    // 向下滑动，显示下一个视频
    animateSlide('down')
  } else {
    // 如果滑动距离不够，回弹到原位
    const startDistance = slideDistance.value
    const startTime = Date.now()
    const duration = 300
    let animationTimer = null
    
    const animateReset = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      slideDistance.value = startDistance * (1 - easeProgress)
      
      if (progress < 1) {
        animationTimer = setTimeout(animateReset, 16)
      } else {
        slideDistance.value = 0
        setTimeout(() => {
          isAnimating.value = false
        }, 50)
      }
    }
    
    // 清除可能存在的动画计时器
    if (animationTimer) {
      clearTimeout(animationTimer)
    }
    
    // 开始回弹动画
    animateReset()
  }
}

// 自动播放当前视频
watch(currentIndex, (newIndex) => {
  // 先暂停所有视频
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
})

// 监听视频列表变化，自动播放第一个
watch(
  () => props.vodList,
  (newList) => {
    if (newList.length) setTimeout(() => playFirstVideo(), 300)
  },
  { immediate: true }
)

const playFirstVideo = () => {
  if (videoRefs.value.length > 0) {
    // 先暂停所有视频
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
    // 如果当前视频正在播放，则暂停它
    video.pause()
    playStatus.value[realIndex] = false
  } else {
    // 如果当前视频已暂停，先暂停所有视频，再播放当前视频
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
})

// 用函数式 ref 绑定
function setVideoRef(el, idx) {
  if (el) {
    videoRefs.value[idx] = el
  } else {
    // 组件卸载时清理
    videoRefs.value[idx] = null
  }
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
      opacity 0.3s ease;
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
      width: 100rpx;
      height: 100rpx;
    }
  }
}
</style>
