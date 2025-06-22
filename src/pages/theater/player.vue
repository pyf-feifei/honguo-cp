<template>
  <view class="player-container">
    <VideoSlider ref="videoSliderRef" :vodList="vodList" :loading="loading">
      <template
        v-slot:default="{ item, idx, playStatus, togglePlay, getItemIndex }"
      >
        <!-- 右侧互动按钮 -->
        <cover-view class="side-actions">
          <cover-view class="action-item">
            <cover-view class="action-icon like" @click="handleLike">
              <cover-image
                :src="
                  isLiked
                    ? '/static/theater/loved.png'
                    : '/static/theater/love.png'
                "
                class="action-image"
              ></cover-image>
            </cover-view>
            <cover-view class="action-count">394</cover-view>
          </cover-view>
          <cover-view class="action-item">
            <cover-view class="action-icon star" @click="handleCollect">
              <cover-image
                src="/static/theater/collected.png"
                class="action-image"
              ></cover-image>
            </cover-view>
            <cover-view class="action-text">追剧</cover-view>
          </cover-view>
          <cover-view class="action-item">
            <cover-view class="action-icon comment">
              <cover-image
                @click="handleComment"
                src="/static/theater/message.png"
                class="action-image"
              ></cover-image>
            </cover-view>
            <cover-view class="action-count">8</cover-view>
          </cover-view>
          <cover-view class="action-item">
            <cover-view class="action-icon share" @click="handleShare">
              <cover-image
                src="/static/theater/share-white-full.png"
                class="action-image"
              ></cover-image>
            </cover-view>
            <cover-view class="action-text">分享</cover-view>
          </cover-view>
        </cover-view>
      </template>
    </VideoSlider>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import VideoSlider from '../../components/VideoSlider.vue'

// 视频列表数据
const vodList = ref([])
const loading = ref(false)
const bookName = ref('')
const videoSliderRef = ref(null)
const isLiked = ref(false)

const handleLike = () => {
  isLiked.value = !isLiked.value
}
const handleCollect = () => {
  // 追剧逻辑
  uni.showToast({
    title: '追剧成功',
    icon: 'none',
  })
}
const handleComment = () => {
  openCommentPopup()
}
const handleShare = () => {
  // 分享逻辑
  uni.showToast({
    title: '分享',
    icon: 'none',
  })
}

const openCommentPopup = () => {
  const subNVue = uni.getSubNVueById('scommentPopup')
  console.log('subNVue', subNVue)

  if (subNVue) {
    subNVue.show('slide-in-bottom', 250)
  }
}

// onLoad 获取页面参数
onLoad((query) => {
  bookName.value = query.bookName
    ? decodeURIComponent(query.bookName)
    : '未知剧名'
  console.log('bookName.value', bookName.value)

  fetchVodList()
})
// 获取视频列表数据
const fetchVodList = async () => {
  // 如果已经有数据，则不再重复请求
  if (vodList.value.length > 0) return

  loading.value = true
  try {
    const res = await uni.request({
      url: `https://www.iqiyizyapi.com/api.php/provide/vod?ac=videolist&wd=${encodeURIComponent(
        bookName.value
      )}`,
      method: 'GET',
    })
    console.log('res', res)

    if (res.data?.list?.length) {
      // 解析分集
      const vod = res.data.list[0]
      const newEpisodes = vod.vod_play_url.split('#').map((item) => {
        const [title, url] = item.split('$')
        return { title, url }
      })
      console.log('newEpisodes', newEpisodes)

      // 添加到现有列表，避免重复
      if (vodList.value.length === 0) {
        vodList.value = newEpisodes
        // 首次加载数据后，使用nextTick确保DOM已更新，然后尝试播放第一个视频
        setTimeout(() => {
          if (videoSliderRef.value) {
            console.log('调用VideoSlider组件的playFirstVideo方法')
            videoSliderRef.value.playFirstVideo()
          }
        }, 500)
      }
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取视频列表
onMounted(() => {
  // onLoad已经处理了数据加载，这里可以添加其他初始化逻辑
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
</style>
