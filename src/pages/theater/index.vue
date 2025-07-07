<template>
  <view class="container">
    <!-- 顶部搜索框 -->
    <view class="search-box">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索短剧"
        :show-action="false"
        @search="onSearch"
        @custom="onSearch"
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

    <!-- 书籍列表 -->
    <view
      v-for="book in filteredBooks"
      :key="book.bookId"
      class="book-card"
      @click="goToPlayer(book)"
    >
      <view class="cover-container">
        <image :src="book.coverWap" class="cover" mode="aspectFill" />
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
  </view>
</template>

<script>
import { fetchBooks, fetchBookType } from '@/src/mock/mock.js'

export default {
  data() {
    return {
      books: [],
      bookTypeMap: {},
      filters: [{ id: 0, name: '全部' }],
      activeFilter: 0,
      activeFilterIndex: 0,
      searchKeyword: '', // 添加搜索关键词
    }
  },
  computed: {
    filteredBooks() {
      let result = this.books

      // 先按关键词筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(
          (book) =>
            book.bookName.toLowerCase().includes(keyword) ||
            book.introduction.toLowerCase().includes(keyword)
        )
      }

      // 再按分类筛选
      if (this.activeFilter !== 0) {
        result = result.filter((book) =>
          book.bookTypeThree.includes(this.activeFilter)
        )
      }

      return result
    },
  },
  async created() {
    try {
      const [books, bookType] = await Promise.all([
        fetchBooks(),
        fetchBookType(),
      ])
      this.books = books
      this.bookTypeMap = Object.fromEntries(bookType.map((t) => [t.id, t.name]))
      this.filters = [{ id: 0, name: '全部' }, ...bookType]
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  },
  methods: {
    getTypeName(id) {
      return this.bookTypeMap[id] || ''
    },
    onTabsChange(index) {
      // 添加安全检查，确保filters[index]存在
      if (index >= 0 && index < this.filters.length) {
        this.activeFilterIndex = index
        this.activeFilter = this.filters[index].id
      }
    },
    onSearch() {
      // 搜索功能实现，这里已经通过计算属性自动筛选了
      console.log('搜索关键词:', this.searchKeyword)
    },
    goToPlayer(book) {
      uni.navigateTo({
        url: `/src/pages/theater/player-n?bookName=${encodeURIComponent(
          book.bookName
        )}&introduction=${encodeURIComponent(book.introduction)}`,
      })
    },
  },
}
</script>

<style lang="scss">
.container {
  padding: 20rpx;
}
.search-box {
  margin-bottom: 20rpx;
}
.filters {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
  background: #fff;
  border-radius: 12rpx;
  padding: 8rpx 0;
}
.filter-item {
  display: inline-block;
  font-size: 26rpx;
  color: #666;
  padding: 8rpx 20rpx;
  margin-right: 8rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-item.active {
  color: #fff;
  background: #ff4d4f;
  font-weight: 600;
}
.book-card {
  display: flex;
  flex-direction: row;
  margin-bottom: 32rpx;
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
  padding: 16rpx 0 16rpx 0;
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
</style>
