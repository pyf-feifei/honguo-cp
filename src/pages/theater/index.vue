<template>
  <view class="container">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="搜索短剧"
        @confirm="handleSearch"
      />
    </view>

    <!-- 分类标签 -->
    <scroll-view class="tags-scroll" scroll-x>
      <view class="tags">
        <view
          v-for="tag in tags"
          :key="tag"
          :class="['tag', { active: selectedTags.includes(tag) }]"
          @tap="toggleTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </scroll-view>

    <!-- 短剧列表 -->
    <scroll-view
      class="drama-list"
      scroll-y
      @scrolltolower="loadMore"
      :style="{ height: scrollHeight + 'px' }"
    >
      <view
        v-for="drama in dramaList"
        :key="drama.id"
        class="drama-item"
        @tap="goToDetail(drama.id)"
      >
        <image class="cover" :src="drama.cover" mode="aspectFill" />
        <view class="info">
          <text class="title">{{ drama.title }}</text>
          <view class="tags">
            <text v-for="tag in drama.tags" :key="tag" class="tag">{{
              tag
            }}</text>
          </view>
          <view class="stats">
            <text class="play-count"
              >{{ formatNumber(drama.playCount) }}次播放</text
            >
            <text class="episode-count">{{ drama.totalEpisodes }}集</text>
          </view>
          <view class="vip-tag" v-if="drama.isVip">VIP</view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="loading">加载中...</view>
      <view class="no-more" v-if="noMore">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { dramaApi } from '../../api'

export default {
  data() {
    return {
      searchKeyword: '',
      tags: ['全部', '都市', '爱情', '职场', '古装', '武侠', '江湖'],
      selectedTags: ['全部'],
      dramaList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      scrollHeight: 0,
    }
  },

  onLoad() {
    // 计算滚动区域高度
    const systemInfo = uni.getSystemInfoSync()
    this.scrollHeight = systemInfo.windowHeight - uni.upx2px(180) // 减去搜索栏和标签栏的高度

    this.loadDramaList()
  },

  methods: {
    // 加载短剧列表
    async loadDramaList() {
      if (this.loading || this.noMore) return

      this.loading = true
      try {
        const params = {
          tags: this.selectedTags.includes('全部') ? [] : this.selectedTags,
          keyword: this.searchKeyword,
        }

        const list = await dramaApi.getDramaList(params)

        if (this.page === 1) {
          this.dramaList = list
        } else {
          this.dramaList = [...this.dramaList, ...list]
        }

        this.noMore = list.length < this.pageSize
        this.page++
      } catch (error) {
        console.error('加载短剧列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        this.loading = false
      }
    },

    // 切换标签
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        if (tag === '全部') {
          this.selectedTags = ['全部']
        } else {
          this.selectedTags = this.selectedTags.filter((t) => t !== '全部')
          this.selectedTags.push(tag)
        }
      } else {
        this.selectedTags.splice(index, 1)
        if (this.selectedTags.length === 0) {
          this.selectedTags = ['全部']
        }
      }

      this.page = 1
      this.noMore = false
      this.loadDramaList()
    },

    // 搜索
    handleSearch() {
      this.page = 1
      this.noMore = false
      this.loadDramaList()
    },

    // 加载更多
    loadMore() {
      this.loadDramaList()
    },

    // 跳转到播放页面
    goToDetail(dramaId) {
      uni.navigateTo({
        url: `/pages/drama/play?dramaId=${dramaId}`,
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

.search-bar {
  padding: 20rpx;
  background-color: #fff;

  input {
    height: 72rpx;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
  }
}

.tags-scroll {
  background-color: #fff;
  white-space: nowrap;
  padding: 20rpx 0;

  .tags {
    display: inline-block;
    padding: 0 20rpx;

    .tag {
      display: inline-block;
      padding: 10rpx 30rpx;
      margin-right: 20rpx;
      background-color: #f5f5f5;
      border-radius: 30rpx;
      font-size: 28rpx;
      color: #666;

      &.active {
        background-color: #ff4d4f;
        color: #fff;
      }
    }
  }
}

.drama-list {
  padding: 20rpx;

  .drama-item {
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
}
</style>
