<template>
  <view class="video-slider-container">
    <view class="loading" v-if="loading">
      <image
        src="/static/theater/loadaing.gif"
        mode="aspectFit"
        class="loading-icon"
      ></image>
    </view>
    <view
      class="slider-wrapper"
      ref="sliderWrapper"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchCancel"
    >
      <view
        class="slider-item"
        v-for="(item, idx) in visibleItems"
        :key="`video-${item.realIndex}`"
        :style="getItemStyle(idx)"
        :data-index="item.realIndex"
      >
        <VideoPlayer
          :src="item.url"
          :videoId="`video-${item.realIndex}`"
          :loading="getVideoLoadingStatus(item.realIndex)"
          @loadedmetadata="onVideoLoadedMetadata(item.realIndex)"
          @canplay="onVideoCanPlay(item.realIndex)"
          @play="onVideoPlay(item.realIndex)"
          @pause="onVideoPause(item.realIndex)"
          @playing="onVideoPlaying(item.realIndex)"
          @waiting="onVideoWaiting(item.realIndex)"
          @progress="onVideoProgress(item.realIndex)"
          @error="onVideoError(item.realIndex)"
          :ref="(el) => setVideoRef(el, idx)"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue'
import VideoPlayer from './VideoPlayer.vue'

const props = defineProps({
  vodList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

// 状态管理
const state = ref({
  currentIndex: 0,
  isDown: false,
  isAnimating: false,
  needCheck: true,
  canSlide: false,
  start: { x: 0, y: 0, time: 0 },
  move: { x: 0, y: 0 },
  wrapper: { width: 0, height: 0 },
})

const sliderWrapper = ref(null)
const videoRefs = ref({}) // 改为对象，使用realIndex作为key
const playStatus = ref({})
const videoLoadingStatus = reactive({}) // 单个视频的加载状态
const virtualTotal = 5 // 虚拟列表总数
const judgeValue = 20 // 判断滑动的最小距离

// 计算可见项目
const visibleItems = computed(() => {
  if (!props.vodList.length) return []

  const items = []
  const half = Math.floor(virtualTotal / 2)
  let start = Math.max(0, state.value.currentIndex - half)
  let end = Math.min(props.vodList.length, start + virtualTotal)

  // 如果接近末尾，调整start
  if (end === props.vodList.length) {
    start = Math.max(0, end - virtualTotal)
  }

  for (let i = start; i < end; i++) {
    if (props.vodList[i]) {
      // 确保每个视频都有初始的loading状态
      if (!(i in videoLoadingStatus)) {
        videoLoadingStatus[i] = false
      }
      items.push({
        ...props.vodList[i],
        realIndex: i,
      })
    }
  }

  return items
})

// 获取项目样式
const getItemStyle = (idx) => {
  const item = visibleItems.value[idx]
  if (!item) return {}

  // 简化逻辑：始终使用相同的计算方式
  const offset =
    (item.realIndex - state.value.currentIndex) * state.value.wrapper.height
  const translateY = offset + state.value.move.y

  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: `translate3d(0, ${translateY}px, 0)`,
    zIndex: item.realIndex === state.value.currentIndex ? 2 : 1,
    opacity: Math.abs(item.realIndex - state.value.currentIndex) <= 1 ? 1 : 0.6,
    transitionProperty: 'transform',
    transitionDuration: state.value.isAnimating ? '150ms' : '0ms',
    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }
}

// 获取视频loading状态
const getVideoLoadingStatus = (realIndex) => {
  const status = videoLoadingStatus[realIndex]
  console.log('status', status)
  return status || false
}

// 触摸开始
const onTouchStart = (e) => {
  if (state.value.isAnimating) return

  const touch = e.touches[0]
  state.value.isDown = true
  state.value.needCheck = true
  state.value.canSlide = false
  state.value.start.x = touch.clientX
  state.value.start.y = touch.clientY
  state.value.start.time = Date.now()
  state.value.move.x = 0
  state.value.move.y = 0
}

// 触摸移动
const onTouchMove = (e) => {
  if (!state.value.isDown) return

  const touch = e.touches[0]
  state.value.move.x = touch.clientX - state.value.start.x
  state.value.move.y = touch.clientY - state.value.start.y

  // 检测滑动方向
  if (state.value.needCheck) {
    if (
      Math.abs(state.value.move.x) > judgeValue ||
      Math.abs(state.value.move.y) > judgeValue
    ) {
      // 判断是否为垂直滑动
      const angle = Math.abs(state.value.move.x) / Math.abs(state.value.move.y)
      state.value.canSlide = angle <= 1 // 垂直滑动
      state.value.needCheck = false
    }
  }

  if (state.value.canSlide) {
    const isNext = state.value.move.y < 0
    const canNext = !(
      (state.value.currentIndex === 0 && !isNext) ||
      (state.value.currentIndex === props.vodList.length - 1 && isNext)
    )

    if (canNext) {
      e.preventDefault()
      e.stopPropagation()
    } else {
      // 在边界时添加阻尼效果
      const damping = 0.3
      if (state.value.currentIndex === 0 && !isNext) {
        state.value.move.y = state.value.move.y * damping
      } else if (
        state.value.currentIndex === props.vodList.length - 1 &&
        isNext
      ) {
        state.value.move.y = state.value.move.y * damping
      }
    }
  }
}

// 触摸结束
const onTouchEnd = (e) => {
  if (!state.value.isDown) return

  state.value.isDown = false

  if (state.value.canSlide) {
    const isNext = state.value.move.y < 0
    const canNext = !(
      (state.value.currentIndex === 0 && !isNext) ||
      (state.value.currentIndex === props.vodList.length - 1 && isNext)
    )

    if (canNext) {
      const endTime = Date.now()
      let gapTime = endTime - state.value.start.time
      const distance = Math.abs(state.value.move.y)

      // 判断是否成功滑动
      if (distance < 20) gapTime = 1000 // 距离太短
      if (distance > state.value.wrapper.height / 3) gapTime = 100 // 距离够长

      if (gapTime < 150 || distance > state.value.wrapper.height / 3) {
        // 执行切换：立即改变索引，让视频立即"归位"
        if (isNext) {
          state.value.currentIndex++
        } else {
          state.value.currentIndex--
        }

        // 不使用动画，立即重置位置
        state.value.move.y = 0
        state.value.isAnimating = false
      } else {
        // 回弹到原位置
        state.value.isAnimating = true
        state.value.move.y = 0
        // 使用setTimeout确保回弹动画完成
        setTimeout(() => {
          state.value.isAnimating = false
        }, 150)
      }
    } else {
      // 在边界时回弹
      state.value.isAnimating = true
      state.value.move.y = 0
      // 使用setTimeout确保回弹动画完成
      setTimeout(() => {
        state.value.isAnimating = false
      }, 150)
    }
  } else {
    // 如果不是有效滑动，立即重置
    state.value.move.x = 0
    state.value.move.y = 0
  }
}

// 触摸取消
const onTouchCancel = (e) => {
  state.value.isDown = false
  state.value.move.x = 0
  state.value.move.y = 0
}

// 设置视频引用 - 使用realIndex作为key
const setVideoRef = (el, idx) => {
  const item = visibleItems.value[idx]
  if (item && el) {
    // 避免重复设置相同的引用
    if (videoRefs.value[item.realIndex] !== el) {
      videoRefs.value[item.realIndex] = el
      console.log(
        `Set video ref for realIndex ${item.realIndex}, visibleIdx ${idx}`
      )
    }
  } else if (item && !el) {
    // 如果元素被销毁，清理引用
    if (videoRefs.value[item.realIndex]) {
      delete videoRefs.value[item.realIndex]
      console.log(`Cleared video ref for realIndex ${item.realIndex}`)
    }
  }
}

// 清理不在可见范围内的视频引用
const cleanupVideoRefs = () => {
  const visibleIndexes = visibleItems.value.map((item) =>
    item.realIndex.toString()
  )
  Object.keys(videoRefs.value).forEach((realIdx) => {
    if (!visibleIndexes.includes(realIdx)) {
      const video = videoRefs.value[realIdx]
      if (video && typeof video.pause === 'function') {
        try {
          video.pause()
          playStatus.value[realIdx] = false
        } catch (error) {
          console.warn(`Failed to pause video ${realIdx}:`, error)
        }
      }
      delete videoRefs.value[realIdx]
      console.log(`Cleaned up video ref for realIndex ${realIdx}`)
    }
  })
}

// 安全的视频操作函数
const safeVideoOperation = (realIndex, operation) => {
  const video = videoRefs.value[realIndex]
  if (!video) {
    console.warn(`No video ref found for realIndex ${realIndex}`)
    return false
  }

  try {
    if (operation === 'play' && typeof video.play === 'function') {
      video.play()
      playStatus.value[realIndex] = true
      // 播放成功后，清除loading状态
      setTimeout(() => {
        videoLoadingStatus[realIndex] = false
      }, 1000) // 给视频1秒时间开始播放
      return true
    } else if (operation === 'pause' && typeof video.pause === 'function') {
      video.pause()
      playStatus.value[realIndex] = false
      return true
    }
  } catch (error) {
    console.error(`Failed to ${operation} video ${realIndex}:`, error)
    // 如果操作失败，也清除loading状态
    videoLoadingStatus[realIndex] = false
  }
  return false
}

// 视频加载事件处理
const onVideoLoadedMetadata = (realIndex) => {
  console.log('onVideoLoadedMetadata', realIndex)
  videoLoadingStatus[realIndex] = true
}

const onVideoCanPlay = (realIndex) => {
  console.log('onVideoCanPlay', realIndex)
  videoLoadingStatus[realIndex] = false
}

const onVideoPause = (realIndex) => {
  console.log('onVideoPause', realIndex)
  playStatus.value[realIndex] = false
}

const onVideoPlay = (realIndex) => {
  console.log('onVideoPlay', realIndex)
  videoLoadingStatus[realIndex] = false
  playStatus.value[realIndex] = true

  // 暂停所有其他视频
  Object.keys(videoRefs.value).forEach((realIdx) => {
    if (realIdx != realIndex) {
      safeVideoOperation(realIdx, 'pause')
    }
  })
}

const onVideoPlaying = (realIndex) => {
  console.log('onVideoPlaying', realIndex)
  videoLoadingStatus[realIndex] = false
  playStatus.value[realIndex] = true
}

const onVideoWaiting = (realIndex) => {
  console.log('onVideoWaiting', realIndex)
  videoLoadingStatus[realIndex] = true
}

const onVideoProgress = (realIndex) => {
  console.log('onVideoProgress', realIndex)
  // progress事件表示正在加载，可以根据需要设置loading状态
}

const onVideoError = (realIndex) => {
  console.log('onVideoError', realIndex)
  videoLoadingStatus[realIndex] = false
}

// 获取wrapper尺寸的函数
const getWrapperSize = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery()
    query
      .select('.slider-wrapper')
      .boundingClientRect((data) => {
        if (data && data.width && data.height) {
          state.value.wrapper.width = data.width
          state.value.wrapper.height = data.height
          console.log('Wrapper dimensions set:', data.width, 'x', data.height)
          resolve(true)
        } else {
          console.log('Failed to get wrapper dimensions, retrying...')
          resolve(false)
        }
      })
      .exec()
  })
}

// 播放第一个视频
const playFirstVideo = async () => {
  console.log('=== playFirstVideo Debug Info ===')
  console.log('currentIndex:', state.value.currentIndex)
  console.log('vodList.length:', props.vodList.length)

  // 确保wrapper高度已设置
  if (state.value.wrapper.height === 0) {
    const success = await getWrapperSize()
    if (!success) {
      console.warn('Wrapper height still 0, delaying playFirstVideo')
      setTimeout(() => playFirstVideo(), 200)
      return
    }
  }

  console.log(
    'visibleItems:',
    visibleItems.value.map((item) => ({
      realIndex: item.realIndex,
      title: item.title || `Video ${item.realIndex}`,
      offset:
        (item.realIndex - state.value.currentIndex) *
        state.value.wrapper.height,
    }))
  )
  console.log('videoRefs keys:', Object.keys(videoRefs.value))
  console.log('wrapper height:', state.value.wrapper.height)

  const currentRealIndex = state.value.currentIndex

  // 预先设置loading状态
  videoLoadingStatus[currentRealIndex] = true

  const video = videoRefs.value[currentRealIndex]

  console.log(`Looking for video at realIndex ${currentRealIndex}:`, video)

  // 检查当前应该显示的视频是否在视口中
  const currentItem = visibleItems.value.find(
    (item) => item.realIndex === currentRealIndex
  )
  if (currentItem) {
    const visibleIdx = visibleItems.value.indexOf(currentItem)
    const offset =
      (currentItem.realIndex - state.value.currentIndex) *
      state.value.wrapper.height
    console.log(
      `Current item found at visibleIdx ${visibleIdx}, offset: ${offset}`
    )
  } else {
    console.error(
      `Current item with realIndex ${currentRealIndex} not found in visibleItems`
    )
  }

  if (video && typeof video.play === 'function') {
    // 暂停所有其他视频
    Object.keys(videoRefs.value).forEach((realIdx) => {
      if (realIdx != currentRealIndex) {
        safeVideoOperation(realIdx, 'pause')
      }
    })

    setTimeout(() => {
      const success = safeVideoOperation(currentRealIndex, 'play')
      if (success) {
        console.log(`First video playing at realIndex ${currentRealIndex}`)
      }
    }, 150)
  } else {
    console.error(`Video ref not found for realIndex ${currentRealIndex}`)
    // 如果直接找不到，尝试延迟重试
    setTimeout(() => {
      const success = safeVideoOperation(currentRealIndex, 'play')
      if (success) {
        console.log('Retry successful, playing video')
      } else {
        // 如果播放失败，重置loading状态
        videoLoadingStatus[currentRealIndex] = false
      }
    }, 500)
  }
}

// 监听可见项目变化，清理无效引用
watch(
  () => visibleItems.value,
  (newItems, oldItems) => {
    if (oldItems && oldItems.length > 0) {
      // 延迟清理，确保新的引用已经设置
      setTimeout(() => {
        cleanupVideoRefs()
      }, 100)
    }
  },
  { deep: true }
)

// 监听当前索引变化
watch(
  () => state.value.currentIndex,
  (newIndex) => {
    console.log(`Index changed to ${newIndex}`)

    // 预先设置新视频的loading状态
    videoLoadingStatus[newIndex] = true

    // 延迟执行，确保新的视频引用已经设置
    setTimeout(() => {
      const video = videoRefs.value[newIndex]
      console.log(`Video ref for index ${newIndex}:`, video)

      if (video && typeof video.play === 'function') {
        // 暂停所有其他视频
        Object.keys(videoRefs.value).forEach((realIdx) => {
          if (realIdx != newIndex) {
            safeVideoOperation(realIdx, 'pause')
          }
        })

        // 播放当前视频
        setTimeout(() => {
          const success = safeVideoOperation(newIndex, 'play')
          if (success) {
            console.log(`Playing video at index ${newIndex}`)
          } else {
            // 如果播放失败，重置loading状态
            videoLoadingStatus[newIndex] = false
          }
        }, 50)
      } else {
        console.error(`No video ref found for index ${newIndex}`)
        // 如果找不到视频引用，重置loading状态
        videoLoadingStatus[newIndex] = false
      }
    }, 150)
  }
)

// 监听视频列表变化
watch(
  () => props.vodList,
  async (newList, oldList) => {
    console.log('vodList changed:', newList.length, 'videos')

    // 为新的视频初始化loading状态
    newList.forEach((_, index) => {
      if (!(index in videoLoadingStatus)) {
        videoLoadingStatus[index] = false
      }
    })

    // 只有在从空列表变为有内容时才调用playFirstVideo
    // 避免与onMounted重复调用
    if (newList.length > 0 && (!oldList || oldList.length === 0)) {
      // 确保wrapper已经初始化
      if (state.value.wrapper.height > 0) {
        setTimeout(() => {
          console.log('Calling playFirstVideo from vodList watch')
          playFirstVideo()
        }, 800)
      } else {
        // 如果wrapper还没初始化，先获取尺寸
        const success = await getWrapperSize()
        if (success) {
          setTimeout(() => {
            console.log(
              'Calling playFirstVideo from vodList watch (after getting size)'
            )
            playFirstVideo()
          }, 800)
        } else {
          // 如果还是获取不到，等待更长时间
          setTimeout(async () => {
            const retrySuccess = await getWrapperSize()
            if (retrySuccess) {
              console.log(
                'Calling playFirstVideo from vodList watch (delayed retry)'
              )
              playFirstVideo()
            }
          }, 1200)
        }
      }
    }
  },
  { immediate: true }
)

// 组件挂载
onMounted(() => {
  console.log('Component mounted')

  const initWrapper = async () => {
    const success = await getWrapperSize()
    if (success) {
      // 如果已经有视频列表，立即尝试播放
      if (props.vodList.length > 0) {
        setTimeout(() => {
          console.log('Calling playFirstVideo from onMounted')
          playFirstVideo()
        }, 500)
      }
    } else {
      console.log('Failed to get wrapper size, retrying in 200ms')
      setTimeout(initWrapper, 200)
    }
  }

  nextTick(() => {
    initWrapper()
  })
})

// 设置当前索引
const setCurrentIndex = (index) => {
  if (index >= 0 && index < props.vodList.length) {
    state.value.currentIndex = index
  }
}

// 暴露方法
defineExpose({
  playFirstVideo,
  currentIndex: computed(() => state.value.currentIndex),
  setCurrentIndex,
})
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
    will-change: transform;
    backface-visibility: hidden;
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
