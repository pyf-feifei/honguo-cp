// @@@数据解析工具 - 统一数据格式转换和处理

/**
 * 统一书籍数据格式
 * @typedef {Object} BookData
 * @property {string} bookId - 书籍唯一标识
 * @property {string} bookName - 书籍名称
 * @property {string} coverWap - 封面图片URL
 * @property {string} introduction - 简介
 * @property {string} totalChapterNum - 总集数
 * @property {number} followCount - 追剧人数
 * @property {string} statusDesc - 状态描述
 * @property {Array} bookTypeThree - 分类标签
 * @property {Array} actors - 演员列表
 * @property {Array} downloadLinks - 下载链接
 * @property {string} source - 数据源标识
 */

/**
 * 数据解析结果
 * @typedef {Object} ParseResult
 * @property {Array<BookData>} books - 书籍列表
 * @property {boolean} hasMore - 是否有更多数据
 * @property {number|null} totalPages - 总页数
 */

/**
 * 统一数据格式转换器
 */
export class DataParser {
  /**
   * 标准化书籍数据
   * @param {Object} rawBook - 原始书籍数据
   * @param {string} source - 数据源标识
   * @returns {BookData} 标准化后的书籍数据
   */
  static normalizeBook(rawBook, source = 'unknown') {
    return {
      bookId:
        rawBook.bookId ||
        `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookName: rawBook.bookName || '未知剧名',
      coverWap: rawBook.coverWap || '/static/theater/defaultCover.png',
      introduction: rawBook.introduction || '',
      totalChapterNum: rawBook.totalChapterNum || '',
      followCount: rawBook.followCount || 0,
      statusDesc: rawBook.statusDesc || '更新中',
      bookTypeThree: rawBook.bookTypeThree || [],
      actors: rawBook.actors || [],
      downloadLinks: rawBook.downloadLinks || [],
      source: source,
    }
  }

  /**
   * 处理演员字符串
   * @param {string} actorsString - 演员字符串
   * @returns {Array<string>} 演员数组
   */
  static parseActors(actorsString) {
    if (!actorsString || typeof actorsString !== 'string') {
      return []
    }

    return actorsString
      .replace(/[＆&]/g, ' ')
      .split(/\s+/)
      .map((actor) => actor.trim())
      .filter(Boolean)
  }

  /**
   * 解析标题格式
   * @param {string} fullTitle - 完整标题
   * @returns {Object} 解析结果 {bookName, totalChapterNum, actors}
   */
  static parseTitle(fullTitle) {
    if (!fullTitle || typeof fullTitle !== 'string') {
      return {
        bookName: '未知剧名',
        totalChapterNum: '',
        actors: [],
      }
    }

    // 匹配格式：销售风波（62集）李源&张许焓
    const match = fullTitle.match(/^(.+?)\s*[（(](\d+)\s*集[)）](.*)$/)

    if (match) {
      return {
        bookName: match[1].trim(),
        totalChapterNum: match[2].trim(),
        actors: this.parseActors(match[3].trim()),
      }
    }

    // 如果没有匹配到标准格式，返回原标题
    return {
      bookName: fullTitle.trim(),
      totalChapterNum: '',
      actors: [],
    }
  }

  /**
   * 生成随机追剧人数
   * @param {string} source - 数据源
   * @returns {number} 追剧人数
   */
  static generateFollowCount(source) {
    // 不同数据源使用不同的随机范围
    const ranges = {
      djzyw: [5000, 55000], // 5千-5.5万
      panhub: [10000, 100000], // 1万-10万
      default: [1000, 10000], // 1千-1万
    }

    const [min, max] = ranges[source] || ranges.default
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 验证书籍数据完整性
   * @param {BookData} book - 书籍数据
   * @returns {boolean} 是否有效
   */
  static validateBook(book) {
    return !!(book && book.bookName && book.bookName.trim() !== '')
  }

  /**
   * 过滤无效书籍数据
   * @param {Array<BookData>} books - 书籍列表
   * @returns {Array<BookData>} 过滤后的书籍列表
   */
  static filterValidBooks(books) {
    return books.filter((book) => this.validateBook(book))
  }

  /**
   * 合并多个数据源的结果
   * @param {Array<ParseResult>} results - 多个解析结果
   * @returns {ParseResult} 合并后的结果
   */
  static mergeResults(results) {
    const allBooks = []
    let hasMore = false
    let totalPages = null

    results.forEach((result) => {
      if (result.books && Array.isArray(result.books)) {
        allBooks.push(...result.books)
      }
      if (result.hasMore) {
        hasMore = true
      }
      if (
        result.totalPages &&
        (!totalPages || result.totalPages > totalPages)
      ) {
        totalPages = result.totalPages
      }
    })

    return {
      books: this.filterValidBooks(allBooks),
      hasMore,
      totalPages,
    }
  }

  /**
   * 按优先级排序数据源结果
   * @param {Array<ParseResult>} results - 解析结果数组
   * @param {Array<string>} sourceOrder - 数据源优先级顺序
   * @returns {ParseResult} 排序后的结果
   */
  static sortByPriority(results, sourceOrder = ['djzyw', 'panhub']) {
    const sortedBooks = []

    sourceOrder.forEach((source) => {
      const result = results.find(
        (r) => r.books && r.books.some((book) => book.source === source)
      )
      if (result) {
        const sourceBooks = result.books.filter(
          (book) => book.source === source
        )
        sortedBooks.push(...sourceBooks)
      }
    })

    // 添加其他数据源的书籍
    results.forEach((result) => {
      if (result.books) {
        const otherBooks = result.books.filter(
          (book) => !sourceOrder.includes(book.source)
        )
        sortedBooks.push(...otherBooks)
      }
    })

    return {
      books: this.filterValidBooks(sortedBooks),
      hasMore: results.some((r) => r.hasMore),
      totalPages: results.find((r) => r.totalPages)?.totalPages || null,
    }
  }
}

/**
 * 数据缓存管理器
 */
export class DataCache {
  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * 生成缓存键
   * @param {string} source - 数据源
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @returns {string} 缓存键
   */
  generateKey(source, keyword, page) {
    return `${source}_${keyword || ''}_${page}`
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {ParseResult|null} 缓存数据
   */
  get(key) {
    const item = this.cache.get(key)
    if (item && Date.now() - item.timestamp < 5 * 60 * 1000) {
      // 5分钟过期
      return item.data
    }
    this.cache.delete(key)
    return null
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {ParseResult} data - 数据
   */
  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear()
  }
}

// 创建全局缓存实例
export const dataCache = new DataCache()
