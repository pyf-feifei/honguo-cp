<template>
  <view class="container">
    <!-- 历史列表 -->
    <scroll-view
      class="history-list"
      scroll-y
      @scrolltolower="loadMore"
      :style="{ height: scrollHeight + 'px' }"
    >
      <view
        v-for="item in historyList"
        :key="item.id"
        class="history-item"
        @tap="goToPlayer(item)"
      >
        <image class="cover" :src="item.drama.cover" mode="aspectFill" />
        <view class="info">
          <text class="title">{{ item.drama.title }}</text>
          <text class="episode-title">{{ item.episode.title }}</text>
          <view class="progress">
            <progress
              :percent="(item.progress / item.episode.duration) * 100"
              stroke-width="4"
              activeColor="#ff4d4f"
              backgroundColor="#f5f5f5"
            />
            <text class="progress-text"
              >{{ formatDuration(item.progress) }}/{{
                formatDuration(item.episode.duration)
              }}</text
            >
          </view>
          <text class="time">{{ formatTime(item.createTime) }}</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="loading">加载中...</view>
      <view class="no-more" v-if="noMore">没有更多了</view>

      <!-- 空状态 -->
      <view class="empty" v-if="historyList.length === 0 && !loading">
        <image class="empty-icon" src="/static/icons/empty.svg" />
        <text class="empty-text">暂无观看历史</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { historyApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

export default {
  data() {
    return {
      historyList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      scrollHeight: 0,
    }
  },

  setup() {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)
    return { userInfo }
  },

  onLoad() {
    // 计算滚动区域高度
    const systemInfo = uni.getSystemInfoSync()
    this.scrollHeight = systemInfo.windowHeight

    this.loadHistoryList()
  },

  methods: {
    // 加载历史列表
    async loadHistoryList() {
      if (this.loading || this.noMore) return

      this.loading = true
      try {
        const list = await historyApi.getHistoryList(this.userInfo.id)

        if (this.page === 1) {
          this.historyList = list
        } else {
          this.historyList = [...this.historyList, ...list]
        }

        this.noMore = list.length < this.pageSize
        this.page++
      } catch (error) {
        console.error('加载历史列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        this.loading = false
      }
    },

    // 加载更多
    loadMore() {
      this.loadHistoryList()
    },

    // 跳转到播放页
    goToPlayer(item) {
      uni.navigateTo({
        url: `/pages/drama/player?id=${item.episode.id}`,
      })
    },

    // 格式化时长
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // 格式化时间
    formatTime(date) {
      const now = new Date()
      const diff = now - new Date(date)

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      } else if (diff < 2592000000) {
        return Math.floor(diff / 86400000) + '天前'
      } else {
        return new Date(date).toLocaleDateString()
      }
    },
  },
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.history-list {
  padding: 20rpx;

  .history-item {
    display: flex;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .cover {
      width: 200rpx;
      height: 300rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }

      .episode-title {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 20rpx;
      }

      .progress {
        margin-bottom: 20rpx;

        .progress-text {
          font-size: 24rpx;
          color: #999;
          margin-top: 10rpx;
        }
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .loading,
  .no-more {
    text-align: center;
    padding: 20rpx;
    color: #999;
    font-size: 28rpx;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
