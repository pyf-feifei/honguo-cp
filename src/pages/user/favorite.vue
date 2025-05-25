<template>
  <view class="container">
    <!-- 收藏列表 -->
    <scroll-view
      class="favorite-list"
      scroll-y
      @scrolltolower="loadMore"
      :style="{ height: scrollHeight + 'px' }"
    >
      <view
        v-for="item in favoriteList"
        :key="item.id"
        class="favorite-item"
        @tap="goToDetail(item.drama.id)"
      >
        <image class="cover" :src="item.drama.cover" mode="aspectFill" />
        <view class="info">
          <text class="title">{{ item.drama.title }}</text>
          <view class="tags">
            <text v-for="tag in item.drama.tags" :key="tag" class="tag">{{
              tag
            }}</text>
          </view>
          <view class="stats">
            <text class="play-count"
              >{{ formatNumber(item.drama.playCount) }}次播放</text
            >
            <text class="episode-count">{{ item.drama.totalEpisodes }}集</text>
          </view>
          <view class="vip-tag" v-if="item.drama.isVip">VIP</view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="loading">加载中...</view>
      <view class="no-more" v-if="noMore">没有更多了</view>

      <!-- 空状态 -->
      <view class="empty" v-if="favoriteList.length === 0 && !loading">
        <image class="empty-icon" src="/static/icons/empty.svg" />
        <text class="empty-text">暂无收藏</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { favoriteApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

export default {
  data() {
    return {
      favoriteList: [],
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

    this.loadFavoriteList()
  },

  methods: {
    // 加载收藏列表
    async loadFavoriteList() {
      if (this.loading || this.noMore) return

      this.loading = true
      try {
        const list = await favoriteApi.getFavoriteList(this.userInfo.id)

        if (this.page === 1) {
          this.favoriteList = list
        } else {
          this.favoriteList = [...this.favoriteList, ...list]
        }

        this.noMore = list.length < this.pageSize
        this.page++
      } catch (error) {
        console.error('加载收藏列表失败:', error)
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
      this.loadFavoriteList()
    },

    // 跳转到详情页
    goToDetail(dramaId) {
      uni.navigateTo({
        url: `/pages/drama/detail?id=${dramaId}`,
      })
    },

    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },
  },
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.favorite-list {
  padding: 20rpx;

  .favorite-item {
    position: relative;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
    overflow: hidden;

    .cover {
      width: 100%;
      height: 400rpx;
    }

    .info {
      padding: 20rpx;

      .title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }

      .tags {
        margin-bottom: 10rpx;

        .tag {
          display: inline-block;
          padding: 4rpx 16rpx;
          margin-right: 10rpx;
          background-color: #f5f5f5;
          border-radius: 4rpx;
          font-size: 24rpx;
          color: #666;
        }
      }

      .stats {
        font-size: 24rpx;
        color: #999;

        .play-count {
          margin-right: 20rpx;
        }
      }

      .vip-tag {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        padding: 4rpx 16rpx;
        background-color: #ff4d4f;
        border-radius: 4rpx;
        font-size: 24rpx;
        color: #fff;
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
