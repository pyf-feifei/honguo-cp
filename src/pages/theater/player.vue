<template>
  <view class="player-page-container">
    <swiper
      v-if="displayVodList.length > 0"
      class="video-swiper"
      :current="swiperCurrentIndex"
      :vertical="true"
      :circular="false"
      @change="onSwiperChange"
      @animationfinish="onSwiperAnimationFinish"
    >
      <swiper-item
        v-for="(item, index) in displayVodList"
        :key="item.id || item.url || index"
        class="swiper-item-container"
      >
        <view class="video-wrapper">
          <!-- 封面图 -->
          <image
            v-if="!item.playing && item.vod_pic && item.showCover"
            :src="item.vod_pic"
            class="video-cover"
            mode="aspectFill"
            @click="() => manualPlay(index)"
          />
          <!-- 播放按钮 -->

          <VideoPlayer
            :ref="(el) => (videoPlayerRefs[item.id] = el)"
            :src="item.url"
            :video-id="item.id"
            :autoplay="false"
            :controls="true"
            :show-play-btn="true"
            :enable-play-gesture="treu"
            :show-center-play-btn="true"
            :show-fullscreen-btn="false"
            :enable-progress-gesture="false"
            :object-fit="'contain'"
            :poster="item.vod_pic"
            :play-strategy="2"
            :show-loading="false"
            @play="() => onVideoPlay(item.originalIndex)"
            @pause="() => onVideoPause(item.originalIndex)"
            @ended="() => onVideoEnded(item.originalIndex)"
            @error="(e) => onVideoError(item.originalIndex, e)"
            @loadedmetadata="() => onLoadedMetadata(item.originalIndex)"
            class="video-instance"
          >
            <cover-view
              v-if="!item.playing && !item.loading"
              class="play-button-overlay"
              @click="() => manualPlay(index)"
            >
              <cover-image
                src="/static/theater/play.png"
                class="play-icon"
              ></cover-image>
            </cover-view>
          </VideoPlayer>
          <!-- <cover-view class="video-overlay-content">
              <cover-view class="top-info">
                <cover-view class="episode-name">{{
                  item.title || `第 ${item.originalIndex + 1} 集`
                }}</cover-view>
              </cover-view>
              <cover-view class="bottom-info">
                <cover-view class="video-title">{{ bookName }}</cover-view>
                <cover-view class="video-description">{{
                  item.description || introduction || '暂无简介'
                }}</cover-view>
              </cover-view>
            </cover-view> -->
          <cover-view v-if="item.loading" class="loading-indicator">
            <cover-view class="loader"></cover-view>
          </cover-view>
        </view>
      </swiper-item>
    </swiper>
    <view
      v-else-if="isLoadingVodList && fullVodList.length === 0"
      class="loading-container"
    >
      <text>加载中...</text>
    </view>
    <view
      v-else-if="!isLoadingVodList && fullVodList.length === 0"
      class="empty-container"
    >
      <text>暂无视频资源</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import VideoPlayer from '@/src/components/VideoPlayer.vue'

const bookName = ref('')
const introduction = ref('')
const fullVodList = ref([]) // 存储从API获取的完整视频列表
const displayVodList = ref([]) // 当前在swiper中渲染的视频列表
const swiperCurrentIndex = ref(0) // Swiper的当前视图索引 (相对于displayVodList)
const activeVideoOriginalIndex = ref(0) // 实际播放视频在fullVodList中的索引
const videoPlayerRefs = ref({})
const isLoadingVodList = ref(true)
const isLoadingMore = ref(false)

const ITEMS_PER_LOAD = 3 // 每次加载/预加载的视频数量
const PRELOAD_THRESHOLD = 1 // 滑动到距离底部多少个时开始预加载下一批

// onLoad 获取页面参数
onLoad((query) => {
  bookName.value = query.bookName
    ? decodeURIComponent(query.bookName)
    : '未知剧名'
  introduction.value = query.introduction
    ? decodeURIComponent(query.introduction)
    : ''
  fetchVodList()
})

const fetchVodList = async () => {
  isLoadingVodList.value = true
  try {
    const res = await uni.request({
      url: `https://libretv.is-an.org/proxy/https://www.iqiyizyapi.com/api.php/provide/vod?ac=videolist&wd=${encodeURIComponent(
        bookName.value
      )}`,
      method: 'GET',
    })

    if (res.data?.list?.length) {
      const vod = res.data.list[0]
      const playUrlString = vod.vod_play_url
      if (playUrlString) {
        fullVodList.value = playUrlString.split('#').map((itemStr, index) => {
          const parts = itemStr.split('$')
          const title = parts[0] || `第 ${index + 1} 集`
          const url = parts[1]
          const vod_pic = vod.vod_pic || ''
          return {
            title,
            url,
            vod_pic,
            playing: false,
            loaded: false,
            id: `video-${index}`, // 唯一ID
            originalIndex: index, // 在fullVodList中的原始索引
            showCover: true,
            loading: false,
            hasError: false,
          }
        })
        loadMoreVideos() // 初始加载第一批
      } else {
        console.error('No play URLs found')
        fullVodList.value = []
      }
    } else {
      console.error('Failed to fetch video list or list is empty', res)
      fullVodList.value = []
    }
  } catch (error) {
    console.error('Error fetching video list:', error)
    fullVodList.value = []
  } finally {
    isLoadingVodList.value = false
  }
}

const loadMoreVideos = () => {
  if (isLoadingMore.value) return
  if (displayVodList.value.length >= fullVodList.value.length) return // 没有更多了

  isLoadingMore.value = true
  const currentLength = displayVodList.value.length
  const nextItems = fullVodList.value.slice(
    currentLength,
    currentLength + ITEMS_PER_LOAD
  )

  // 为新加载的视频项的 videoPlayerRefs 创建占位符
  nextItems.forEach((item) => {
    if (!videoPlayerRefs.value[item.id]) {
      videoPlayerRefs.value[item.id] = null
    }
  })

  displayVodList.value.push(...nextItems)

  nextTick(() => {
    isLoadingMore.value = false
    // 如果是初始加载且swiper在第一个，尝试播放
    if (
      currentLength === 0 &&
      displayVodList.value.length > 0 &&
      swiperCurrentIndex.value === 0
    ) {
      // 确保第一个视频状态正确，并尝试播放
      const firstVideo = displayVodList.value[0]
      if (firstVideo) {
        firstVideo.loading = true
        firstVideo.showCover = false
        setTimeout(() => {
          playVideo(0) // 播放 displayVodList 中的第一个
        }, 10)
      }
    }
  })
}

const playVideo = async (displayIndex) => {
  // 参数是 displayVodList 的索引
  if (displayIndex < 0 || displayIndex >= displayVodList.value.length) return

  const videoToPlay = displayVodList.value[displayIndex]
  if (!videoToPlay) return

  const originalIndexToPlay = videoToPlay.originalIndex

  // 停止其他所有正在播放的视频 (基于 displayVodList)
  displayVodList.value.forEach((video, dIndex) => {
    if (dIndex !== displayIndex && video.playing) {
      const player = videoPlayerRefs.value[video.id]
      if (player && typeof player.pause === 'function') {
        player.pause()
      }
      video.playing = false
      video.showCover = true
    }
  })

  // 停止 fullVodList 中其他可能在播放的视频（以防万一）
  fullVodList.value.forEach((video, fIndex) => {
    if (fIndex !== originalIndexToPlay && video.playing) {
      const player = videoPlayerRefs.value[video.id]
      if (player && typeof player.pause === 'function') {
        player.pause()
      }
      video.playing = false
      // fullVodList 中的 showCover 状态也应同步，但主要由 displayVodList 控制渲染
    }
  })

  // 播放当前视频
  const currentPlayer = videoPlayerRefs.value[videoToPlay.id]

  if (currentPlayer && typeof currentPlayer.play === 'function') {
    videoToPlay.loading = true
    videoToPlay.showCover = false
    videoToPlay.hasError = false
    // 同步状态到 fullVodList
    if (fullVodList.value[originalIndexToPlay]) {
      fullVodList.value[originalIndexToPlay].loading = true
      fullVodList.value[originalIndexToPlay].showCover = false
      fullVodList.value[originalIndexToPlay].hasError = false
    }

    try {
      await currentPlayer.play()
    } catch (e) {
      console.error(`Error playing video ${videoToPlay.id}:`, e)
      videoToPlay.loading = false
      videoToPlay.hasError = true
      videoToPlay.showCover = true
      if (fullVodList.value[originalIndexToPlay]) {
        fullVodList.value[originalIndexToPlay].loading = false
        fullVodList.value[originalIndexToPlay].hasError = true
        fullVodList.value[originalIndexToPlay].showCover = true
      }
    }
  } else {
    console.warn(
      `Video player for ${videoToPlay.id} not ready or play function missing.`
    )
    videoToPlay.loading = false
    videoToPlay.showCover = true
    if (fullVodList.value[originalIndexToPlay]) {
      fullVodList.value[originalIndexToPlay].loading = false
      fullVodList.value[originalIndexToPlay].showCover = true
    }
  }
  activeVideoOriginalIndex.value = originalIndexToPlay
}

const manualPlay = (displayIndex) => {
  const video = displayVodList.value[displayIndex]
  if (video && !video.playing) {
    playVideo(displayIndex)
  }
}

const onSwiperChange = (e) => {
  const newDisplayIndex = e.detail.current
  // swiperCurrentIndex.value = newDisplayIndex; // 由 animationfinish 更新

  const videoToStop = displayVodList.value[swiperCurrentIndex.value] // 上一个显示的视频
  if (videoToStop && videoToStop.playing) {
    const oldPlayer = videoPlayerRefs.value[videoToStop.id]
    if (oldPlayer && typeof oldPlayer.pause === 'function') {
      oldPlayer.pause()
    }
    videoToStop.playing = false
    videoToStop.showCover = true
    if (fullVodList.value[videoToStop.originalIndex]) {
      fullVodList.value[videoToStop.originalIndex].playing = false
      fullVodList.value[videoToStop.originalIndex].showCover = true
    }
  }

  // 标记新视频准备加载
  const videoToLoad = displayVodList.value[newDisplayIndex]
  if (videoToLoad) {
    videoToLoad.loading = true
    videoToLoad.showCover = false
    if (fullVodList.value[videoToLoad.originalIndex]) {
      fullVodList.value[videoToLoad.originalIndex].loading = true
      fullVodList.value[videoToLoad.originalIndex].showCover = false
    }
  }
}

const onSwiperAnimationFinish = (e) => {
  const newDisplayIndex = e.detail.current
  swiperCurrentIndex.value = newDisplayIndex
  playVideo(newDisplayIndex)

  // 检查是否需要加载更多视频
  if (newDisplayIndex >= displayVodList.value.length - 1 - PRELOAD_THRESHOLD) {
    loadMoreVideos()
  }
}

// originalIndex 是 fullVodList 中的索引
const updateVideoState = (originalIndex, stateChanges) => {
  if (originalIndex < 0 || originalIndex >= fullVodList.value.length) return

  const videoInFullList = fullVodList.value[originalIndex]
  Object.assign(videoInFullList, stateChanges)

  // 同步到 displayVodList (如果存在)
  const videoInDisplayList = displayVodList.value.find(
    (v) => v.originalIndex === originalIndex
  )
  if (videoInDisplayList) {
    Object.assign(videoInDisplayList, stateChanges)
  }
}

const onVideoPlay = (originalIndex) => {
  updateVideoState(originalIndex, {
    playing: true,
    loading: false,
    showCover: false,
  })
}

const onVideoPause = (originalIndex) => {
  updateVideoState(originalIndex, { playing: false })
  // 暂停时通常不主动显示封面，除非有特定逻辑
}

const onVideoEnded = (originalIndex) => {
  updateVideoState(originalIndex, { playing: false, showCover: true })

  const currentDisplayVideo = displayVodList.value.find(
    (v) => v.originalIndex === originalIndex
  )
  const currentDisplayIndex = displayVodList.value.indexOf(currentDisplayVideo)

  // 自动播放下一个 (如果存在于 displayVodList 中)
  if (
    currentDisplayIndex !== -1 &&
    currentDisplayIndex < displayVodList.value.length - 1
  ) {
    swiperCurrentIndex.value = currentDisplayIndex + 1
  } else if (
    currentDisplayIndex === displayVodList.value.length - 1 &&
    displayVodList.value.length < fullVodList.value.length
  ) {
    // 是当前显示列表的最后一个，但完整列表还有更多，尝试加载并播放
    loadMoreVideos() // 这会异步添加，可能需要调整逻辑以确保平滑过渡
    // 简单的处理：结束后如果能加载更多，用户需要手动滑一下
  } else {
    // 已经是最后一个视频 (在完整列表或当前加载批次中)
  }
}

const onVideoError = (originalIndex, errorEvent) => {
  console.error(
    `Video error at originalIndex ${originalIndex}:`,
    errorEvent.detail.errMsg
  )
  updateVideoState(originalIndex, {
    playing: false,
    loading: false,
    showCover: true,
    hasError: true,
  })
}

const onLoadedMetadata = (originalIndex) => {
  updateVideoState(originalIndex, { loading: false, loaded: true })
  // 如果当前视频是活动视频且没有播放，则尝试播放 (playVideo 会处理)
  // if (originalIndex === activeVideoOriginalIndex.value && !fullVodList.value[originalIndex].playing) {
  // }
}

watch(
  fullVodList,
  async (newList, oldList) => {
    if (newList.length > oldList.length) {
      // 仅在列表项增加时操作
      await nextTick()
      // 确保新增项的 videoPlayerRefs 引用被正确处理
      // (已在 loadMoreVideos 中预创建 null 引用)
    }
  },
  { deep: false }
) // 仅观察列表长度或引用变化，非深度
</script>

<style lang="scss" scoped>
/* SCSS样式 (与之前相同，保持嵌套结构) */
.player-page-container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  overflow: hidden;

  .video-swiper {
    width: 100%;
    height: 100%;

    .swiper-item-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #000;

      .video-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;

        .video-instance {
          width: 100%;
          height: 100%;
        }

        .video-cover {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #333;
          z-index: 5;
        }

        .play-button-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120rpx;
          height: 120rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          .play-icon {
            width: 80rpx;
            height: 80rpx;
          }
        }

        .loading-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 15;
          .loader {
            border: 8rpx solid #f3f3f3;
            border-top: 8rpx solid #3498db;
            border-radius: 50%;
            width: 80rpx;
            height: 80rpx;
            animation: spin 1s linear infinite;
          }
        }

        .video-overlay-content {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 20rpx;
          box-sizing: border-box;
          z-index: 2;
          pointer-events: none;

          .top-info {
            position: absolute;
            top: calc(var(--status-bar-height, 0px) + 20rpx);
            left: 20rpx;
            right: 20rpx;
            .episode-name {
              color: #fff;
              font-size: 32rpx;
              text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }
          }

          .bottom-info {
            color: #fff;
            padding-bottom: 100rpx;
            .video-title {
              font-size: 36rpx;
              font-weight: bold;
              margin-bottom: 10rpx;
              text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
            }
            .video-description {
              font-size: 28rpx;
              text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }

  .loading-container,
  .empty-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 32rpx;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
