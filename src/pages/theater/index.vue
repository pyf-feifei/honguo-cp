<template>
  <view class="container">
    <!-- 固定在顶部的搜索框和筛选项 -->
    <view class="fixed-header">
      <!-- 顶部搜索框 -->
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

export default {
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
    fetchData(page = 1, keyword = '', isLoadMore = false) {
      // 如果是新搜索，重置分页状态
      if (!isLoadMore) {
        this.loading = true
        this.loadError = false
        this.errorMessage = ''
        this.currentPage = 1
        this.hasMore = true
        this.currentSearchKeyword = keyword || this.searchKeyword || ''
      } else {
        // 加载更多时使用loadingMore
        this.loadingMore = true
      }

      // 构建搜索URL
      const searchTerm = this.currentSearchKeyword || '%20'
      const url = `https://panhub.fun/s/${encodeURIComponent(
        searchTerm
      )}-${page}-1.html`
      uni.request({
        url: url,
        method: 'GET',
        success: (res) => {
          if (!isLoadMore) {
            this.loading = false
          } else {
            this.loadingMore = false
          }
          const html = res.data
          const $ = cheerio.load(html)
          const books = []
          $('.listBox .left .box .list .item').each((i, el) => {
            const title = $(el).find('.title').text().trim()
            const link = $(el).find('.title').attr('href')
            const time = $(el).find('.type.time').text().trim()
            const source = $(el).find('.type span').text().trim()
            books.push({
              bookId: link,
              bookName: title,
              coverWap: '/static/logo.png', // 占位图片
              introduction: `${source}`,
              totalChapterNum: '', // HTML中未提供
              followCount: Math.floor(Math.random() * 90000 + 10000), // 随机生成1万-10万的数据
              statusDesc: time,
              bookTypeThree: [],
            })
          })

          // 处理书籍数据
          const processedBooks = this.processBooks(books)

          if (isLoadMore) {
            // 加载更多：追加数据
            if (processedBooks.length > 0) {
              this.books = [...this.books, ...processedBooks]
              // 只有成功加载到数据时才更新页码
              this.currentPage = page
            } else {
              // 没有数据，不更新页码，标记为无更多数据
              this.hasMore = false
            }
          } else {
            // 新搜索：替换数据
            this.books = processedBooks
            // 新搜索时总是更新页码为1
            this.currentPage = 1
          }

          // 获取封面图片
          this.fetchBookCovers()

          // 判断是否还有更多数据
          // 如果返回的数据少于10条（一般每页的预期数量），说明可能没有更多了
          if (processedBooks.length < 10) {
            this.hasMore = false
          } else if (!isLoadMore) {
            // 新搜索时，如果有数据则认为可能还有更多
            this.hasMore = true
          }
          // 从返回的数据中提取筛选条件
          const filters = [{ id: 0, name: '全部' }]
          $('.screen .box a').each((i, el) => {
            const name = $(el).text().trim()
            if (name === '短剧') {
              filters.push({
                id: i,
                name: name,
              })
            }
          })
          this.filters = filters
        },
        fail: (err) => {
          if (!isLoadMore) {
            this.loading = false
            this.loadError = true
            this.errorMessage = '网络请求失败，请检查网络连接'
          } else {
            this.loadingMore = false
            // 加载更多失败时，只显示轻提示
            uni.showToast({
              title: '加载失败',
              icon: 'none',
              duration: 2000,
            })
          }
        },
        complete: () => {
          // 确保在任何情况下都关闭加载状态
          setTimeout(() => {
            this.loading = false
            this.loadingMore = false
          }, 300)
        },
      })
    },
    processBooks(books) {
      return books.map((book) => {
        const fullTitle = book.bookName
        let bookName = fullTitle
        let totalChapterNum = ''
        let actors = []

        const match = fullTitle.match(
          /^(?:\d+-\s*)?(.*?)\s*[（(](\d+)\s*集[)）](.*)$/
        )

        if (match) {
          bookName = match[1].trim()
          totalChapterNum = match[2].trim()
          const actorsString = match[3].trim()
          if (actorsString) {
            actors = actorsString
              .replace(/[＆&]/g, ' ')
              .split(/\s+/)
              .map((actor) => actor.trim())
              .filter(Boolean)
          }
        }

        return {
          ...book,
          bookName,
          totalChapterNum,
          actors,
        }
      })
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
    onSearch() {
      // 立即触发搜索请求（回车或点击搜索按钮时）
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
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
    async fetchBookCovers() {
      if (this.fetchingCovers || this.books.length === 0) {
        return
      }

      this.fetchingCovers = true
      console.log('开始获取书籍封面图片')

      try {
        // 使用批量获取封面图片的函数
        const booksWithCovers = await batchFetchCoverImages(this.books)

        // 更新书籍列表
        this.books = booksWithCovers
        console.log('获取封面图片完成')

        // 打印更新后的书籍列表
        console.log(
          '更新后的书籍列表:',
          this.books.map((book) => ({
            bookName: book.bookName,
            coverWap: book.coverWap,
          }))
        )
      } catch (error) {
        console.error('获取封面图片失败:', error)
      } finally {
        this.fetchingCovers = false
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
.search-box {
  margin-bottom: 10rpx; /* 减少底部间距 */
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
</style>
