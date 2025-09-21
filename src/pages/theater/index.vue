<template>
  <view class="container">
    <!-- 固定在顶部的搜索框和筛选项 -->
    <view class="fixed-header">
      <!-- 顶部搜索框和数据源选择器 -->
      <view class="search-section">
        <view class="search-box">
          <u-search
            v-model="searchKeyword"
            placeholder="搜索短剧"
            :show-action="false"
            @search="onSearch"
            @custom="onSearch"
            @clear="onClearSearch"
            @change="onSearchChange"
          ></u-search>
        </view>

        <!-- 数据源选择器 -->
        <DataSourceSelector
          v-model="currentDataSource"
          @change="onDataSourceChange"
          class="data-source-selector"
        />
      </view>

      <!-- 顶部筛选项，使用自定义样式替代u-tabs -->
      <scroll-view scroll-x class="filters" show-scrollbar="false">
        <view
          v-for="(item, index) in filters"
          :key="item.id"
          class="filter-item"
          :class="{ active: activeFilterIndex === index }"
          @click="onTabsChange(index)"
        >
          {{ item.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 可滚动的内容区域 -->
    <scroll-view
      scroll-y
      class="scroll-content"
      @scrolltolower="onLoadMore"
      :lower-threshold="100"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      refresher-threshold="45"
      refresher-default-style="black"
      refresher-background="#f5f5f5"
    >
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <u-loading-icon size="30" color="#ff4d4f"></u-loading-icon>
        <text class="loading-text">正在加载短剧列表...</text>
      </view>

      <!-- 错误状态 -->
      <view v-else-if="loadError" class="error-container">
        <text class="error-icon">⚠️</text>
        <text class="error-text">{{ errorMessage || '加载失败' }}</text>
        <view class="retry-btn" @click="fetchData">
          <text class="retry-text">点击重试</text>
        </view>
      </view>

      <!-- 空数据状态 -->
      <view
        v-else-if="!loading && filteredBooks.length === 0"
        class="empty-container"
      >
        <text class="empty-icon">📺</text>
        <text class="empty-text">{{
          searchKeyword
            ? `没有找到“${searchKeyword}”相关的短剧`
            : '暂无短剧数据'
        }}</text>
        <view v-if="searchKeyword" class="retry-btn" @click="onClearSearch">
          <text class="retry-text">查看全部短剧</text>
        </view>
      </view>

      <!-- 书籍列表 -->
      <view
        v-else
        v-for="book in filteredBooks"
        :key="book.bookId"
        class="book-card"
        @click="goToPlayer(book)"
      >
        <view class="cover-container">
          <image
            :src="book.coverWap || '/static/logo.png'"
            class="cover"
            mode="aspectFill"
          />
          <text class="chapter-count" v-if="book.totalChapterNum"
            >全{{ book.totalChapterNum }}集</text
          >
        </view>
        <view class="info">
          <view class="title-row">
            <text class="book-title">{{ book.bookName }}</text>
            <text class="status" v-if="book.statusDesc">{{
              book.statusDesc
            }}</text>
          </view>
          <text class="follow"
            ><text class="follow-num">{{ book.followCount }}</text
            >人<i class="tag-hot">在追</i></text
          >
          <view class="actors" v-if="book.actors && book.actors.length > 0">
            <text class="actors-label">主演：</text>
            <text
              class="actor-name"
              v-for="(actor, index) in book.actors"
              :key="index"
            >
              {{ actor }}<text v-if="index < book.actors.length - 1">、</text>
            </text>
          </view>
          <view class="tags">
            <text
              v-for="typeId in book.bookTypeThree"
              :key="typeId"
              class="tag"
              >{{ getTypeName(typeId) }}</text
            >
          </view>
          <text class="intro">{{ book.introduction }}</text>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view
        v-if="!loading && filteredBooks.length > 0"
        class="load-more-container"
      >
        <view v-if="loadingMore" class="loading-more">
          <u-loading-icon size="24" color="#ff4d4f"></u-loading-icon>
          <text class="loading-more-text">正在加载更多...</text>
        </view>
        <view v-else-if="!hasMore" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import * as cheerio from 'cheerio'
import { batchFetchCoverImages } from '../../utils/fetchCoverImage.js'
import { dataSourceManager } from '../../api/dataSources.js'
import { DataParser, dataCache } from '../../utils/dataParser.js'
import DataSourceSelector from '../../components/DataSourceSelector/index.vue'

export default {
  components: {
    DataSourceSelector,
  },
  data() {
    return {
      books: [],
      bookTypeMap: {},
      filters: [{ id: 0, name: '全部' }],
      activeFilter: 0,
      activeFilterIndex: 0,
      searchKeyword: '', // 添加搜索关键词
      statusBarHeight: 0, // 初始化状态栏高度
      headerHeight: 0, // 固定头部的实际高度
      loading: false, // 加载状态
      loadError: false, // 加载错误状态
      errorMessage: '', // 错误信息
      searchTimer: null, // 搜索防抖定时器
      currentPage: 1, // 当前页码
      loadingMore: false, // 加载更多状态
      hasMore: true, // 是否还有更多数据
      currentSearchKeyword: '', // 当前搜索关键词（用于分页一致性）
      fetchingCovers: false, // 是否正在获取封面图片
      currentDataSource: 'djzyw', // 当前数据源
      currentRequest: null, // @@@当前请求对象 - 用于取消请求
      requestId: 0, // @@@请求ID - 用于标识当前请求
      refreshing: false, // 下拉刷新状态
      coverRequestId: 0, // @@@封面请求ID - 用于取消封面请求
    }
  },
  computed: {
    filteredBooks() {
      let result = this.books

      // 按分类筛选（搜索关键词通过API处理）
      if (this.activeFilter !== 0) {
        result = result.filter((book) =>
          book.bookTypeThree.includes(this.activeFilter)
        )
      }

      return result
    },
  },
  beforeDestroy() {
    // 清理定时器
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    }
  },
  async created() {
    // 获取状态栏高度和系统信息
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0
    // 计算固定头部的总高度（状态栏 + 搜索框 + 筛选栏 + padding）
    // 优化后：搜索框约60rpx + 筛选栏约40rpx + padding 20rpx = 120rpx（约60px）
    this.headerHeight = this.statusBarHeight + 60 // px单位

    this.fetchData()
  },
  methods: {
    // @@@重构数据获取方法 - 使用数据源管理器
    async fetchData(page = 1, keyword = '', isLoadMore = false) {
      // @@@参数验证和类型转换 - 确保page是数字
      const pageNum = typeof page === 'number' ? page : parseInt(page) || 1
      const searchKeyword =
        typeof keyword === 'string'
          ? keyword
          : keyword || this.searchKeyword || ''

      // @@@生成新的请求ID
      const currentRequestId = ++this.requestId

      // 如果是新搜索，重置分页状态
      if (!isLoadMore) {
        this.loading = true
        this.loadError = false
        this.errorMessage = ''
        this.currentPage = 1
        this.hasMore = true
        this.currentSearchKeyword = searchKeyword
      } else {
        // 加载更多时使用loadingMore
        this.loadingMore = true
      }

      try {
        // 检查缓存
        const cacheKey = dataCache.generateKey(
          this.currentDataSource,
          this.currentSearchKeyword,
          pageNum
        )
        const cachedData = dataCache.get(cacheKey)

        if (cachedData && !isLoadMore) {
          this.handleDataSuccess(cachedData, isLoadMore, pageNum)
          return
        }

        // 使用数据源管理器获取数据
        const result = await dataSourceManager.fetchData(
          this.currentSearchKeyword,
          pageNum
        )

        // @@@检查请求是否已被取消
        if (currentRequestId !== this.requestId) {
          return
        }

        // 缓存数据
        dataCache.set(cacheKey, result)

        this.handleDataSuccess(result, isLoadMore, pageNum)
      } catch (error) {
        // @@@检查请求是否已被取消
        if (currentRequestId !== this.requestId) {
          return
        }

        this.handleDataError(error, isLoadMore)
      }
    },

    // @@@处理数据成功 - 统一数据处理逻辑
    handleDataSuccess(result, isLoadMore, page) {
      if (!isLoadMore) {
        this.loading = false
      } else {
        this.loadingMore = false
      }

      const processedBooks = DataParser.filterValidBooks(result.books)

      if (isLoadMore) {
        // 加载更多：追加数据
        if (processedBooks.length > 0) {
          this.books = [...this.books, ...processedBooks]
          this.currentPage = page
        } else {
          this.hasMore = false
        }
      } else {
        // 新搜索：替换数据
        this.books = processedBooks
        this.currentPage = 1
      }

      // 更新分页状态
      this.hasMore = result.hasMore

      // 获取封面图片
      this.fetchBookCovers()

      // 更新筛选条件（保持原有逻辑）
      this.updateFilters()
    },

    // @@@处理数据错误 - 统一错误处理逻辑
    handleDataError(error, isLoadMore) {
      console.error('数据获取失败:', error)

      if (!isLoadMore) {
        this.loading = false
        this.loadError = true
        this.errorMessage = '网络请求失败，请检查网络连接'
      } else {
        this.loadingMore = false
        uni.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000,
        })
      }
    },

    // @@@更新筛选条件 - 保持原有筛选逻辑
    updateFilters() {
      const filters = [{ id: 0, name: '全部' }]
      // 根据当前数据源更新筛选条件
      if (this.currentDataSource === 'panhub') {
        filters.push({ id: 1, name: '短剧' })
      }
      this.filters = filters
    },
    getTypeName(id) {
      return this.bookTypeMap[id] || ''
    },
    onTabsChange(index) {
      // 添加安全检查，确保filters[index]存在
      if (index >= 0 && index < this.filters.length) {
        this.activeFilterIndex = index
        this.activeFilter = this.filters[index].id
        // 筛选功能通过计算属性filteredBooks实现
      }
    },
    onSearch(event) {
      // 立即触发搜索请求（回车或点击搜索按钮时）
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
      // @@@修复参数传递 - 确保传递正确的参数类型
      this.fetchData(1, this.searchKeyword)
    },
    onSearchChange() {
      // 输入时防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }

      // 如果搜索框为空，立即加载全部数据
      if (!this.searchKeyword) {
        this.fetchData(1, '')
        return
      }

      // 设置500ms防抖
      this.searchTimer = setTimeout(() => {
        this.fetchData(1, this.searchKeyword)
      }, 500)
    },
    goToPlayer(book) {
      uni.navigateTo({
        url: `/src/pages/theater/player?bookName=${encodeURIComponent(
          book.bookName
        )}&introduction=${encodeURIComponent(book.introduction)}`,
      })
    },
    onClearSearch() {
      // 清空搜索时重新加载全部数据
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
      this.searchKeyword = ''
      this.fetchData(1, '')
    },

    // @@@数据源切换处理 - 处理数据源切换事件
    async onDataSourceChange(newSource) {
      // @@@取消当前请求 - 通过增加请求ID来取消
      this.requestId++

      // @@@停止正在进行的封面图片获取请求
      this.coverRequestId++
      this.fetchingCovers = false

      // @@@清除封面图片缓存
      const { coverCache } = await import('../../utils/coverCache.js')
      coverCache.clearAll()

      // 更新数据源
      this.currentDataSource = newSource

      // @@@确保数据源管理器也切换到新数据源
      dataSourceManager.switchSource(newSource)

      // 清空当前数据
      this.books = []
      this.hasMore = true
      this.currentPage = 1

      // 重新获取数据
      this.fetchData(1, this.currentSearchKeyword)
    },
    onLoadMore() {
      // 加载更多
      // 检查：正在加载中、没有更多数据、正在初始加载
      if (this.loadingMore || !this.hasMore || this.loading) {
        return
      }

      // 计算下一页页码
      const nextPage = this.currentPage + 1

      // 调用fetchData加载下一页
      this.fetchData(nextPage, this.currentSearchKeyword, true)
    },

    // @@@下拉刷新处理
    async onRefresh() {
      // 检查是否正在加载中，避免冲突
      if (this.loading || this.loadingMore) {
        this.refreshing = false
        return
      }

      // 设置刷新状态
      this.refreshing = true

      try {
        // @@@停止正在进行的封面图片获取请求
        this.coverRequestId++
        this.fetchingCovers = false

        // @@@清除封面图片缓存
        const { coverCache } = await import('../../utils/coverCache.js')
        coverCache.clearAll()

        // 清空缓存，强制重新获取数据
        dataCache.clear()

        // 重置分页状态
        this.currentPage = 1
        this.hasMore = true

        // 重新获取第一页数据
        await this.fetchData(1, this.currentSearchKeyword, false)

        // 显示刷新成功提示
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500,
        })
      } catch (error) {
        console.error('下拉刷新失败:', error)

        // 显示刷新失败提示
        uni.showToast({
          title: '刷新失败',
          icon: 'error',
          duration: 2000,
        })
      } finally {
        // 结束刷新状态
        this.refreshing = false
      }
    },
    async fetchBookCovers() {
      if (this.fetchingCovers || this.books.length === 0) {
        return
      }

      // @@@生成封面请求ID
      const currentCoverRequestId = ++this.coverRequestId
      this.fetchingCovers = true

      try {
        // @@@使用实时更新的批量获取封面图片函数
        await batchFetchCoverImages(this.books, (updatedBook, index) => {
          // @@@检查请求是否已被取消
          if (currentCoverRequestId !== this.coverRequestId) {
            return
          }

          // @@@立即更新单个书籍的封面图片
          this.$set(this.books, index, updatedBook)
        })

        // @@@检查请求是否已被取消
        if (currentCoverRequestId !== this.coverRequestId) {
          return
        }
      } catch (error) {
        console.error('获取封面图片失败:', error)
      } finally {
        // @@@只有在请求ID匹配时才重置状态
        if (currentCoverRequestId === this.coverRequestId) {
          this.fetchingCovers = false
        }
      }
    },
  },
}
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
  padding: 10rpx 20rpx; /* 减少上下内边距 */
  padding-top: calc(v-bind(statusBarHeight) * 1px + 10rpx); /* 添加状态栏高度 */
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}
.scroll-content {
  flex: 1;
  margin-top: calc(v-bind(headerHeight) * 1px); /* 为固定头部留出空间 */
  padding: 10rpx 0 20rpx 0; /* 减少顶部padding */
  height: calc(100vh - v-bind(headerHeight) * 1px); /* 减去头部高度 */
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}
.search-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.search-box {
  flex: 1;
  padding: 0;

  ::v-deep .u-search {
    height: 60rpx !important; /* 减少搜索框高度 */
    padding: 0 20rpx !important;
  }

  ::v-deep .u-search__content {
    height: 60rpx !important;
    line-height: 60rpx !important;
  }

  ::v-deep .u-search__content__input {
    font-size: 28rpx !important;
  }
}

.data-source-selector {
  flex-shrink: 0;
}
.filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0; /* 移除底部间距 */
  overflow-x: auto;
  white-space: nowrap;
  background: #fff;
  border-radius: 8rpx;
  padding: 4rpx 0; /* 减少上下内边距 */
  height: 50rpx; /* 设置固定高度 */
}
.filter-item {
  display: inline-flex;
  align-items: center;
  font-size: 24rpx; /* 减小字体 */
  color: #666;
  padding: 6rpx 16rpx; /* 减少内边距 */
  margin-right: 8rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  height: 36rpx; /* 设置固定高度 */
  line-height: 1;
}
.filter-item.active {
  color: #fff;
  background: #ff4d4f;
  font-weight: 600;
}
.book-card {
  display: flex;
  flex-direction: row;
  margin: 0 20rpx 24rpx 20rpx; /* 减少底部间距 */
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
}
.cover-container {
  position: relative;
  margin: 16rpx;
}
.cover {
  width: 140rpx;
  height: 186rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
.chapter-count {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 18rpx;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 2rpx 6rpx;
  border-radius: 0 0 8rpx 0;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16rpx 16rpx 16rpx 0; /* 添加右边距 */
  min-width: 0;
}
.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.book-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-right: 16rpx;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status {
  font-size: 22rpx;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
  border-radius: 6rpx;
  padding: 0 8rpx;
  margin-left: 8rpx;
}
.follow {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-bottom: 8rpx;
}
.follow-num {
  font-weight: 600;
}
.tag-hot {
  background: #ffeaea;
  color: #ff4d4f;
  border-radius: 4rpx;
  font-size: 20rpx;
  padding: 0 6rpx;
  margin-left: 4rpx;
}
.actors {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.actors-label {
  color: #999;
  margin-right: 8rpx;
}
.actor-name {
  color: #333;
  font-weight: 500;
}
.tags {
  margin-bottom: 8rpx;
}
.tag {
  display: inline-block;
  font-size: 20rpx;
  color: #ff7a00;
  background: #fff6e5;
  border-radius: 4rpx;
  padding: 0 10rpx;
  margin-right: 8rpx;
  margin-bottom: 4rpx;
}
.intro {
  font-size: 24rpx;
  color: #888;
  margin-top: 4rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 加载状态样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
}

// 错误状态样式
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 30rpx;
}

.retry-btn {
  background: #ff4d4f;
  padding: 16rpx 40rpx;
  border-radius: 30rpx;
  cursor: pointer;
}

.retry-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

// 空数据状态样式
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  text-align: center;
}

// 加载更多样式
.load-more-container {
  padding: 20rpx 0 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
}

.loading-more-text {
  margin-left: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.no-more {
  padding: 20rpx 0;
}

.no-more-text {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}

// 下拉刷新样式优化
.scroll-content {
  // 确保下拉刷新区域有足够的空间
  padding-top: 0;
}
</style>
