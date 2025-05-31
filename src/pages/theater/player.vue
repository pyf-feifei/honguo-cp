<template>
  <view
    class="player-container"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- 顶部栏 -->
    <view class="top-bar">
      <view class="back-icon" @click="uni.navigateBack()">
        <u-icon name="arrow-left" color="#FFFFFF" size="24"></u-icon>
      </view>
      <text class="episode">第{{ currentIndex + 1 }}集</text>
      <view class="rate-container" @click="changeRate">
        <text class="rate">{{ playRate }}x</text>
      </view>
    </view>

    <!-- 视频播放器 -->
    <video
      id="myVideo"
      :src="vodList[currentIndex]?.url"
      :controls="false"
      :autoplay="true"
      :show-center-play-btn="true"
      :enable-progress-gesture="true"
      :playback-rate="playRate"
      :show-loading="true"
      :enable-play-gesture="true"
      :vslide-gesture="true"
      :vslide-gesture-in-fullscreen="true"
      object-fit="contain"
      class="video"
      @ended="onVideoEnd"
    />

    <!-- 播放控制层 -->
    <view class="video-controls" v-if="showControls" @click="toggleControls">
      <view class="play-btn" @click.stop="togglePlay">
        <text
          class="iconfont"
          :class="isPlaying ? 'icon-pause' : 'icon-play'"
        ></text>
      </view>
    </view>

    <!-- 右侧互动按钮 -->
    <view class="side-actions">
      <view class="action-item">
        <view class="action-icon like" @click="handleLike">
          <image
            :src="
              isLiked ? '/static/theater/loved.svg' : '/static/theater/love.svg'
            "
            class="action-image"
          ></image>
        </view>
        <text class="action-count">394</text>
      </view>
      <view class="action-item">
        <view class="action-icon star" @click="handleCollect">
          <image
            src="/static/theater/collected.svg"
            class="action-image"
          ></image>
        </view>
        <text class="action-text">追剧</text>
      </view>
      <view class="action-item">
        <view class="action-icon comment" @click="handleComment">
          <image src="/static/theater/message.svg" class="action-image"></image>
        </view>
        <text class="action-count">8</text>
      </view>
      <view class="action-item">
        <view class="action-icon share" @click="handleShare">
          <image
            src="/static/theater/share-white-full.png"
            class="action-image"
          ></image>
        </view>
        <text class="action-text">分享</text>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="bottom-info">
      <view class="info">
        <text class="tag">永久免费</text>
        <text class="title">{{ bookName }}</text>
        <view class="desc-container">
          <text class="desc">{{
            introduction ||
            '林忧，原本拥有一个精彩的人生；研发出了跨时代的科技量子AI...'
          }}</text>
          <text class="expand">展开</text>
        </view>
      </view>
      <view class="episode-nav">
        <text class="current-episode"
          >第{{ currentIndex + 1 }}集：全{{ vodList.length }}集</text
        >
        <view class="choose-btn" @click="showPicker = true">选集</view>
      </view>
    </view>

    <!-- 选集弹窗 -->
    <u-popup v-model="showPicker" mode="bottom" border-radius="20" height="60%">
      <view class="episode-popup">
        <view class="popup-header">
          <text class="popup-title">选集</text>
          <text class="popup-close" @click="showPicker = false">×</text>
        </view>
        <scroll-view scroll-y class="episode-scroll">
          <view class="episode-list">
            <view
              v-for="(item, idx) in vodList"
              :key="idx"
              :class="['episode-item', { active: idx === currentIndex }]"
              @click="changeEpisode(idx)"
            >
              {{ idx + 1 }}
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 响应式状态
const bookName = ref('')
const introduction = ref('')
const vodList = ref([])
const currentIndex = ref(0)
const showPicker = ref(false)
const playRate = ref(1.0)
const isPlaying = ref(true)
const showControls = ref(false)
const videoContext = ref(null)
const isLiked = ref(false)

// 获取参数
onLoad((query) => {
  bookName.value = query.bookName
  introduction.value = query.introduction
  fetchVodList()
})

onMounted(() => {
  // 初始化视频上下文
  videoContext.value = uni.createVideoContext('myVideo')
})

// 请求API
const fetchVodList = async () => {
  const res = await uni.request({
    url: `https://libretv.is-an.org/proxy/https://www.iqiyizyapi.com/api.php/provide/vod?ac=videolist&wd=${encodeURIComponent(
      bookName.value
    )}`,
    method: 'GET',
  })
  if (res.data?.list?.length) {
    // 解析分集
    const vod = res.data.list[0]
    vodList.value = vod.vod_play_url.split('#').map((item) => {
      const [title, url] = item.split('$')
      return { title, url }
    })
  }
}

// 切换集数
const changeEpisode = (idx) => {
  currentIndex.value = idx
  showPicker.value = false
  isPlaying.value = true
}

// 切换倍速
const changeRate = () => {
  const rates = [1.0, 1.5, 2.0]
  const idx = rates.indexOf(playRate.value)
  playRate.value = rates[(idx + 1) % rates.length]
}

// 播放控制
const togglePlay = () => {
  if (isPlaying.value) {
    videoContext.value.pause()
  } else {
    videoContext.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 显示/隐藏控制层
const toggleControls = () => {
  showControls.value = !showControls.value
  if (showControls.value) {
    setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

// 视频播放结束
const onVideoEnd = () => {
  if (currentIndex.value < vodList.value.length - 1) {
    currentIndex.value++
  }
}

// 上下滑切换集
let startY = 0
const onTouchStart = (e) => {
  startY = e.touches[0].clientY
}
const onTouchEnd = (e) => {
  const deltaY = e.changedTouches[0].clientY - startY
  if (deltaY < -50 && currentIndex.value < vodList.value.length - 1) {
    currentIndex.value++
  } else if (deltaY > 50 && currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 新增互动功能
const handleLike = () => {
  isLiked.value = !isLiked.value
  console.log('点击了喜欢按钮')
}

const handleCollect = () => {
  console.log('点击了追剧按钮')
}

const handleComment = () => {
  console.log('点击了评论按钮')
}

const handleShare = () => {
  console.log('点击了分享按钮')
}
</script>

<style lang="scss">
.player-container {
  position: relative;
  width: 100vw;
  height: calc(
    100vh - var(--window-top)
  ); // 减去状态栏和导航栏的总高度
  background: #000;
  overflow: hidden;

  /* 顶部栏样式 */
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    z-index: 10;
    padding: 16rpx 30rpx 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5),
      rgba(0, 0, 0, 0)
    );
    box-sizing: border-box; /* 添加这一行 */
    .back-icon {
      width: 32rpx;
      height: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .episode {
      font-size: 32rpx;
      font-weight: 500;
    }

    .rate-container {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;

      .rate {
        font-size: 28rpx;
      }
    }
  }

  /* 视频播放器样式 */
  .video {
    width: 100vw;
    height: 100%;
    background: #000;
    object-fit: contain;
  }

  /* 播放控制层 */
  .video-controls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;

    .play-btn {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      justify-content: center;
      align-items: center;

      .iconfont {
        font-size: 60rpx;
        color: #fff;
      }
    }
  }

  /* 右侧互动按钮 */
  .side-actions {
    position: absolute;
    right: 30rpx;
    bottom: 300rpx;
    display: flex;
    flex-direction: column;
    z-index: 10;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 50rpx;

      .action-icon {
        width: 90rpx;
        height: 90rpx;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10rpx;

        .action-image {
          width: 50rpx;
          height: 50rpx;
        }
      }

      .action-count,
      .action-text {
        font-size: 24rpx;
        color: #fff;
      }
    }
  }

  /* 底部信息 */
  .bottom-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 30rpx;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
    z-index: 10;
    box-sizing: border-box; /* 添加这一行 */

    .info {
      margin-bottom: 30rpx;

      .tag {
        display: inline-block;
        font-size: 24rpx;
        color: #fff;
        background: #07c160;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        margin-bottom: 16rpx;
      }

      .title {
        font-size: 40rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 16rpx;
        display: block;
      }

      .desc-container {
        display: flex;
        align-items: center;
        .desc {
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.8);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          /* 移除 white-space: nowrap */
          display: -webkit-box;
          -webkit-line-clamp: 2; /* 限制为两行 */
          -webkit-box-orient: vertical;
          line-height: 1.3; /* 添加适当的行高 */
        }

        .expand {
          font-size: 28rpx;
          color: #07c160;
          margin-left: 10rpx;
        }
      }
    }

    .episode-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .current-episode {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.8);
      }

      .choose-btn {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        border-radius: 30rpx;
        padding: 12rpx 30rpx;
        font-size: 28rpx;
      }
    }
  }

  /* 选集弹窗 */
  .episode-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1px solid #eee;

      .popup-title {
        font-size: 32rpx;
        font-weight: bold;
      }

      .popup-close {
        font-size: 40rpx;
        color: #999;
      }
    }

    .episode-scroll {
      flex: 1;
      height: 0;

      .episode-list {
        display: flex;
        flex-wrap: wrap;
        padding: 30rpx;

        .episode-item {
          width: 80rpx;
          height: 80rpx;
          line-height: 80rpx;
          text-align: center;
          margin: 10rpx;
          border-radius: 16rpx;
          background: #f5f5f5;
          color: #333;
          font-size: 28rpx;

          &.active {
            background: #07c160;
            color: #fff;
            font-weight: bold;
          }
        }
      }
    }
  }
}

/* 引入字体图标 */
@font-face {
  font-family: 'iconfont';
  src: url('https://at.alicdn.com/t/font_2331152_v7qbmiwvvs.ttf')
    format('truetype');
}

.iconfont {
  font-family: 'iconfont';
}

.icon-play:before {
  content: '\e731';
}
.icon-pause:before {
  content: '\e67a';
}
</style>
