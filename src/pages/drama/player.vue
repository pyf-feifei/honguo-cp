<template>
  <view class="container">
    <!-- 视频播放器 -->
    <video
      class="video-player"
      :src="episode.videoUrl"
      :controls="true"
      :show-fullscreen-btn="true"
      :show-play-btn="true"
      :show-progress="true"
      :enable-progress-gesture="true"
      :show-center-play-btn="true"
      :object-fit="'contain'"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
    ></video>

    <!-- 剧集信息 -->
    <view class="episode-info">
      <text class="title">{{ episode.title }}</text>
      <text class="drama-title">{{ drama.title }}</text>
    </view>

    <!-- 剧集列表 -->
    <scroll-view class="episode-list" scroll-y>
      <view
        v-for="item in episodes"
        :key="item.id"
        :class="['episode-item', { active: item.id === episode.id }]"
        @tap="switchEpisode(item)"
      >
        <text class="episode-title">{{ item.title }}</text>
        <view class="episode-status">
          <text v-if="item.isVip" class="vip-tag">VIP</text>
          <text v-else-if="item.price > 0" class="price-tag"
            >{{ item.price }}金币</text
          >
          <text v-else class="free-tag">免费</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { dramaApi, episodeApi, historyApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

export default {
  data() {
    return {
      drama: null,
      episode: null,
      episodes: [],
      currentTime: 0,
    }
  },

  setup() {
    const userStore = useUserStore()
    const { userInfo, isLogin } = storeToRefs(userStore)
    return { userInfo, isLogin }
  },

  onLoad(options) {
    const { id } = options
    this.loadEpisodeDetail(id)
  },

  methods: {
    // 加载剧集详情
    async loadEpisodeDetail(episodeId) {
      try {
        const episode = await episodeApi.getEpisodeDetail(episodeId)
        if (episode) {
          this.episode = episode
          this.loadDramaDetail(episode.dramaId)
          this.loadEpisodes(episode.dramaId)
          if (this.isLogin) {
            this.updateProgress()
          }
        }
      } catch (error) {
        console.error('加载剧集详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      }
    },

    // 加载短剧详情
    async loadDramaDetail(dramaId) {
      try {
        const drama = await dramaApi.getDramaDetail(dramaId)
        if (drama) {
          this.drama = drama
        }
      } catch (error) {
        console.error('加载短剧详情失败:', error)
      }
    },

    // 加载剧集列表
    async loadEpisodes(dramaId) {
      try {
        const episodes = await episodeApi.getEpisodeList(dramaId)
        this.episodes = episodes
      } catch (error) {
        console.error('加载剧集列表失败:', error)
      }
    },

    // 切换剧集
    switchEpisode(episode) {
      if (episode.isVip && !this.isLogin) {
        uni.showToast({
          title: '开通VIP即可观看',
          icon: 'none',
        })
        return
      }

      if (episode.price > 0 && !this.isLogin) {
        uni.showModal({
          title: '提示',
          content: `观看需要支付${episode.price}金币，是否继续？`,
          success: (res) => {
            if (res.confirm) {
              this.loadEpisodeDetail(episode.id)
            }
          },
        })
        return
      }

      this.loadEpisodeDetail(episode.id)
    },

    // 更新播放进度
    onTimeUpdate(e) {
      this.currentTime = e.detail.currentTime
      if (this.isLogin) {
        this.updateProgress()
      }
    },

    // 播放结束
    onEnded() {
      if (this.isLogin) {
        this.updateProgress(this.episode.duration)
      }
    },

    // 更新观看进度
    async updateProgress(progress = this.currentTime) {
      try {
        await historyApi.updateProgress(
          this.userInfo.id,
          this.drama.id,
          this.episode.id,
          progress
        )
      } catch (error) {
        console.error('更新观看进度失败:', error)
      }
    },
  },
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #000;
}

.video-player {
  width: 100%;
  height: 422rpx;
}

.episode-info {
  padding: 30rpx;
  background-color: #fff;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .drama-title {
    font-size: 28rpx;
    color: #666;
  }
}

.episode-list {
  height: calc(100vh - 422rpx - 120rpx);
  background-color: #fff;

  .episode-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &.active {
      background-color: #f5f5f5;
    }

    .episode-title {
      font-size: 28rpx;
      color: #333;
    }

    .episode-status {
      .vip-tag,
      .price-tag,
      .free-tag {
        padding: 6rpx 20rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
      }

      .vip-tag {
        background-color: #ff4d4f;
        color: #fff;
      }

      .price-tag {
        background-color: #ffd700;
        color: #333;
      }

      .free-tag {
        background-color: #f5f5f5;
        color: #666;
      }
    }
  }
}
</style>
