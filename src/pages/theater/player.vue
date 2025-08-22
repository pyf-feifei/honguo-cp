<template>
  <view class="player-container">
    <!-- 播放源切换按钮 -->
    <view
      class="source-selector"
      v-if="allVodSources.length > 0"
      @click="showSourcePicker = true"
    >
      <view class="source-btn">
        <text class="source-text">{{
          sourceNames[currentSourceIndex] || '选择源'
        }}</text>
        <up-icon name="arrow-down" color="#fff" size="12"></up-icon>
      </view>
    </view>

    <view class="slider-wrapper">
      <EpisodeSlider
        v-if="showSlider"
        ref="videoSliderRef"
        :video-list="vodList"
        :initial-index="0"
        @indexChange="handleIndexChange"
        @back="handleBack"
      />
    </view>

    <AdComponent :ad-list="adList" @adClick="handleAdClick" />
    <!-- 视频操作按钮 -->
    <!-- <VideoActions
      :video-item="currentVideo"
      :video-index="currentVideoIndex"
      :like-count="394"
      :comment-count="8"
      :liked="isLiked"
      :collected="isCollected"
      @like="handleLike"
      @collect="handleCollect"
      @comment="handleComment"
      @share="handleShare"
    /> -->

    <!-- 评论弹窗 -->
    <!-- <CommentPopup
      v-model="showCommentPopup"
      :video-data="currentVideo"
      :video-index="currentVideoIndex"
      @send="handleSendComment"
    /> -->

    <!-- 播放源选择弹窗 -->
    <up-action-sheet
      :show="showSourcePicker"
      :actions="sourceActions"
      title="选择播放源"
      :closeOnClickAction="true"
      :closeOnClickOverlay="true"
      @close="showSourcePicker = false"
      @select="handleSourceSelect"
      :round="20"
    ></up-action-sheet>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import EpisodeSlider from '../../components/EpisodeSlider/EpisodeSlider.vue'
import VideoActions from './com/VideoActions.vue'
import CommentPopup from './com/CommentPopup.vue'
import AdComponent from '../../components/AdComponent/index.vue'
import { API_SITES } from '../../config.js'

// 视频列表数据
const vodList = ref([])
const allVodSources = ref([]) // 所有播放源
const loading = ref(false)
const bookName = ref('')
const videoSliderRef = ref(null)
const showSlider = ref(true)
const isLiked = ref(false)
const isCollected = ref(false)
const currentVideoIndex = ref(0)
const showCommentPopup = ref(false)
const currentSourceIndex = ref(0) // 当前选中的播放源索引
const showSourcePicker = ref(false) // 显示播放源选择器
const adList = ref([])

// 处理广告点击
const handleAdClick = (ad) => {
  console.log('Ad clicked:', ad)
  // 在这里处理广告点击逻辑，例如跳转到指定页面
}

// 计算播放源名称列表
const sourceNames = computed(() => {
  return allVodSources.value.map((source) => source.sourceName || '未知源')
})

// 计算播放源选择器的动作列表
const sourceActions = computed(() => {
  return allVodSources.value.map((source, index) => ({
    name: source.sourceName || '未知源',
    color: index === currentSourceIndex.value ? '#2979ff' : '#303133',
    fontSize: '16',
    disabled: false,
  }))
})

// 计算当前视频数据
const currentVideo = computed(() => {
  return vodList.value[currentVideoIndex.value] || {}
})

const handleLike = (event) => {
  isLiked.value = event.liked
  // 可以在这里发送请求保存点赞状态
}

const handleCollect = (event) => {
  isCollected.value = event.collected
  // 可以在这里发送请求保存收藏状态
}

const handleComment = (event) => {
  showCommentPopup.value = true
}

const handleShare = (event) => {
  // 处理分享逻辑
  console.log('分享视频:', event)
}

const handleSendComment = (event) => {
  console.log('发送评论:', event.content)
  // 可以在这里发送请求保存评论
}

// 处理索引变化
const handleIndexChange = (index) => {
  currentVideoIndex.value = index
}

// 处理返回事件
const handleBack = () => {
  uni.navigateBack()
}

// 处理播放源选择
const handleSourceSelect = (item) => {
  const newIndex = allVodSources.value.findIndex(
    (source) => source.sourceName === item.name
  )
  if (newIndex !== -1 && newIndex !== currentSourceIndex.value) {
    currentSourceIndex.value = newIndex
    const newSource = allVodSources.value[newIndex]

    // 使用 v-if 强制重新渲染
    showSlider.value = false
    vodList.value = [] // 先清空数据

    nextTick(() => {
      vodList.value = newSource.data
      currentVideoIndex.value = 0
      showSlider.value = true // 重新显示组件

      uni.showToast({
        title: `切换至${newSource.sourceName}`,
        icon: 'none',
        duration: 1500,
      })
    })
  }
  showSourcePicker.value = false
}

// 删除原来的 openCommentPopup 函数，现在使用 CommentPopup 组件

// onLoad 获取页面参数
onLoad((query) => {
  bookName.value = query.bookName
    ? decodeURIComponent(query.bookName)
    : '未知剧名'

  fetchVodList()
})
// 获取视频列表数据
const fetchVodList = () => {
  if (vodList.value.length > 0) return
  loading.value = true
  let isFirstSourceLoaded = false

  const promises = Object.values(API_SITES).map((site) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await uni.request({
          url: `${site.api}?ac=videolist&wd=${encodeURIComponent(
            bookName.value
          )}`,
          method: 'GET',
        })
        // console.log(`${site.name}res`, res)
        console.log(`${site.name}`, res.data)
        if (res.data?.list?.length) {
          const vod = res.data.list[0] // 处理第一个结果
          const separator =
            vod.vod_play_note && vod.vod_play_note.trim() !== ''
              ? vod.vod_play_note
              : '$$'

          const playFromList = vod.vod_play_from
            ? vod.vod_play_from.split(separator)
            : ['default']
          const playUrlList = vod.vod_play_url
            ? vod.vod_play_url.split(separator)
            : []

          // 为每个播放源创建独立的数据项
          const sources = []
          for (let i = 0; i < playFromList.length; i++) {
            const playUrl = playUrlList[i]
            if (!playUrl) continue

            const episodes = playUrl
              .replace(/,+/g, '#')
              .replace(/\$\$\$/g, '#')
              .split('#')
              .map((item) => {
                if (!item.includes('$')) {
                  return null
                }
                const [title, url] = item.split('$')
                let videoType = 'hls' // 默认为 hls
                if (url) {
                  if (url.includes('.m3u8')) {
                    videoType = 'hls'
                  } else if (url.includes('.mp4')) {
                    videoType = 'mp4'
                  } else if (url.includes('.flv')) {
                    videoType = 'flv'
                  } else if (!url.includes('.')) {
                    videoType = 'mp4'
                  }
                }
                return {
                  title,
                  url,
                  vodPic: vod.vod_pic,
                  videoType,
                  sourceFrom: playFromList[i],
                }
              })
              .filter((e) => e && e.url)

            if (episodes.length > 0) {
              // 如果站点有多个播放源，添加编号
              const sourceName =
                playFromList.length > 1
                  ? `${site.name}-${playFromList[i]}`
                  : site.name

              sources.push({
                sourceName,
                data: episodes,
              })
            }
          }

          // 优先选择包含 m3u8 的源
          const m3u8Sources = sources.filter((s) =>
            s.data.some((e) => e.url.includes('.m3u8'))
          )
          const sortedSources = [
            ...m3u8Sources,
            ...sources.filter((s) => !m3u8Sources.includes(s)),
          ]

          if (sortedSources.length > 0) {
            resolve(sortedSources)
          } else {
            reject(new Error(`[${site.name}] No valid episodes found.`))
          }
        } else {
          reject(new Error(`[${site.name}] No data in response.`))
        }
      } catch (error) {
        reject(new Error(`[${site.name}] Request failed: ${error.message}`))
      }
    })
  })

  promises.forEach((promise) => {
    promise
      .then((results) => {
        // results 现在是一个数组，包含该站点的所有播放源
        if (Array.isArray(results)) {
          results.forEach((result) => {
            allVodSources.value.push(result)
            if (!isFirstSourceLoaded) {
              vodList.value = result.data
              currentSourceIndex.value = allVodSources.value.length - 1
              isFirstSourceLoaded = true
              console.log('First source loaded:', result)
            }
          })
        }
      })
      .catch((error) => {
        console.error(error.message)
      })
  })

  Promise.allSettled(promises).finally(() => {
    console.log('allVodSources', allVodSources)
    loading.value = false
    console.log('All sources processed:', allVodSources.value)
  })
}

// 组件挂载时获取视频列表
onMounted(() => {
  // onMounted is now empty, can be removed if not used for other things.
})
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}

.slider-wrapper {
  height: calc(100vh - 120rpx);
  background: rebeccapurple;
}

.source-selector {
  position: absolute;
  top: 40rpx;
  right: 20rpx;
  z-index: 999;

  .source-btn {
    display: flex;
    align-items: center;
    padding: 12rpx 24rpx;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 30rpx;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);

    .source-text {
      color: #fff;
      font-size: 28rpx;
      margin-right: 10rpx;
      font-weight: 500;
    }
  }

  &:active {
    opacity: 0.8;
  }
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

.side-actions {
  position: absolute;
  bottom: 25%;
  right: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    font-size: 28rpx;
    color: #fff;
    .action-icon {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 10rpx;
      .action-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.action-text {
  color: #fff;
  font-size: 14px;
  margin-top: 5px;
}
::v-deep .u-action-sheet__item-wrap {
  max-height: 50vh !important;
  overflow-y: auto !important;
}
</style>
