<template>
  <view
    class="player-container"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- 视频播放器 -->
    <VideoPlayer
      v-if="vodList.length"
      ref="videoPlayerRef"
      :src="vodList[currentIndex]?.url"
      :videoId="'myVideo'"
      :autoplay="false"
      :playback-rate="playRate"
      :enable-progress-gesture="true"
      :show-progress="true"
      :show-loading="false"
      :vslide-gesture="true"
      :vslide-gesture-in-fullscreen="true"
      @ended="onVideoEnd"
      @play="onVideoPlay"
      @pause="onVideoPause"
      :controls="false"
      :show-play-btn="false"
      :show-center-play-btn="false"
      play-btn-position="center"
      :enable-play-gesture="true"
      :play-strategy="3"
    >
      <!-- 顶部栏 -->
      <cover-view class="top-bar">
        <cover-view class="episode">第{{ currentIndex + 1 }}集</cover-view>
        <cover-view class="rate-container" @click="changeRate">
          <cover-view class="rate">{{ playRate }}x</cover-view>
        </cover-view>
      </cover-view>
      <!-- 播放控制层 -->
      <cover-view
        class="video-controls"
        v-if="showControls"
        @click="toggleControls"
      >
        <cover-view class="play-btn" @click.stop="togglePlay">
          <!-- 使用静态图片作为图标 -->
          <!-- <cover-image
            :src="
              isPlaying
                ? '/static/theater/pause.png'
                : '/static/theater/play.png'
            "
            class="play-pause-icon"
          ></cover-image> -->
        </cover-view>
      </cover-view>
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
          <cover-view class="action-icon comment" @click="handleComment">
            <cover-image
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
      <!-- 底部信息 -->
      <cover-view class="bottom-info">
        <cover-view class="info">
          <cover-view class="tag">永久免费</cover-view>
          <cover-view class="title">{{ bookName }}</cover-view>
          <cover-view class="desc-container">
            <cover-view class="desc">{{
              introduction || '暂无描述'
            }}</cover-view>
            <cover-view class="expand">展开</cover-view>
          </cover-view>
        </cover-view>
        <cover-view class="episode-nav">
          <cover-view class="current-episode"
            >第{{ currentIndex + 1 }}集：全{{ vodList.length }}集</cover-view
          >
          <cover-view class="choose-btn" @click="handleChooseEpisode">
            <cover-view>选集</cover-view>
          </cover-view>
        </cover-view>
      </cover-view>
    </VideoPlayer>

    <!-- 底部栏 -->
    <view class="bottom-bar">
      <view class="bottom-logo">
        <image src="/static/theater/logo.png" mode="aspectFit"></image>
        <text>520U剧场</text>
      </view>
    </view>

    <!-- 选集弹窗 -->
    <u-popup v-model:show="showPicker" mode="bottom" round="16">
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
import VideoPlayer from '@/src/components/VideoPlayer.vue'
// 引入 uviewplus 图标，如果项目还没有安装uviewplus，需要先安装
// import { Uicon } from 'uview-plus'; // 如果是按需引入

// 响应式状态
const bookName = ref('')
const introduction = ref('')
const vodList = ref([])
const currentIndex = ref(0)
const showPicker = ref(true)
const playRate = ref(1.0)
const isPlaying = ref(false)
const showControls = ref(false)
const videoPlayerRef = ref(null)
const isLiked = ref(false)

// 处理选集点击事件
const handleChooseEpisode = () => {
  console.log('点击了选集按钮')
  showPicker.value = true
}

// 获取参数
onLoad((query) => {
  bookName.value = decodeURIComponent(query.bookName)
  introduction.value = decodeURIComponent(query.introduction)
  fetchVodList()
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
  if (videoPlayerRef.value) {
    if (isPlaying.value) {
      videoPlayerRef.value.pause()
    } else {
      videoPlayerRef.value.play()
    }
    // isPlaying.value 的状态由 onVideoPlay 和 onVideoPause 事件回调更新，这里不再手动设置
  }
}

// 显示/隐藏控制层
const toggleControls = () => {
  showControls.value = !showControls.value
  if (showControls.value) {
    // 如果希望点击控制层空白区域时，如果视频是暂停状态则播放，可以取消下面这行注释
    if (!isPlaying.value && videoPlayerRef.value) {
      videoPlayerRef.value.play()
    }
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

// 视频播放事件处理
const onVideoPlay = () => {
  isPlaying.value = true
}

// 视频暂停事件处理
const onVideoPause = () => {
  isPlaying.value = false
}
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
  width: 100vw;
  height: calc(
    100vh - var(--window-top) - 100rpx
  ); /* 减去状态栏、导航栏和底部栏的总高度 */
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
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
    background: rebeccapurple;
    .play-btn {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      // background: rgba(255, 255, 255, 0.2); // 可以调整或移除背景
      display: flex;
      justify-content: center;
      align-items: center;

      // .iconfont { // 旧的iconfont样式可以移除或注释掉
      //   font-size: 60rpx;
      //   color: #fff;
      // }
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
      margin-bottom: 16rpx;

      .action-icon {
        width: 90rpx;
        height: 90rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10rpx;

        .action-image {
          width: 64rpx;
          height: 64rpx;
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
        font-size: 24rpx;
        color: #fff;
        background: #07c160;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        margin-bottom: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        text-align: center; /* 添加这一行 */
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
        text-align: center;
        /* 添加以下属性实现文字垂直居中 */
        display: flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
      }
    }
  }

  /* 选集弹窗 */
  .episode-popup {
    max-height: 100%;
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
      max-height: 50vh;
      .episode-list {
        // display: flex;
        // flex-wrap: wrap;
        padding: 30rpx;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-gap: 16rpx;
        .episode-item {
          text-align: center;
          border-radius: 16rpx;
          background: #f5f5f5;
          color: #333;
          font-size: 28rpx;
          aspect-ratio: 1 / 1; // 添加这一行，设置宽高比为1:1
          display: flex;
          align-items: center;
          justify-content: center;
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

/* 底部栏样式 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx; /* 底部栏高度 */
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center; /* 添加这一行，使内容水平居中 */
  padding: 0 30rpx;
  box-sizing: border-box;
  z-index: 10;

  .bottom-logo {
    display: flex;
    align-items: center;
    justify-content: center; /* 添加这一行，使内容水平居中 */

    image {
      width: 48rpx;
      height: 48rpx;
      margin-right: 10rpx;
    }

    text {
      color: #fff;
      font-size: 28rpx;
    }
  }
}
</style>
