// @@@Panhub解析器 - PanHub数据源解析器

import * as cheerio from 'cheerio'
import { BaseParser } from './BaseParser.js'

export class PanhubParser extends BaseParser {
  constructor(config) {
    super(config)
  }

  /**
   * 构建搜索URL
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @returns {string} 搜索URL
   */
  buildSearchUrl(keyword, page) {
    // @@@使用原始PanHub URL构建逻辑
    const searchTerm = keyword || '%20'
    return `${this.config.baseUrl}/${encodeURIComponent(
      searchTerm
    )}-${page}-1.html`
  }

  /**
   * 解析HTML数据
   * @param {string} html - HTML内容
   * @returns {ParseResult} 解析结果
   */
  parseData(html) {
    const $ = cheerio.load(html)
    const books = []

    $('.listBox .left .box .list .item').each((i, el) => {
      const title = $(el).find('.title').text().trim()
      const link = $(el).find('.title').attr('href')
      const time = $(el).find('.type.time').text().trim()
      const source = $(el).find('.type span').text().trim()

      books.push({
        bookId: link || `panhub_${i}_${Date.now()}`,
        bookName: title,
        coverWap: '/static/theater/defaultCover.png',
        introduction: source,
        totalChapterNum: '',
        followCount: Math.floor(Math.random() * 90000 + 10000),
        statusDesc: time,
        bookTypeThree: [],
        actors: [],
        downloadLinks: [],
        source: 'panhub',
      })
    })

    // @@@处理书籍数据 - 使用processBooks方法
    const processedBooks = this.processBooks(books)

    // 检查是否有更多数据
    const hasMore = processedBooks.length >= 10

    return {
      books: processedBooks,
      hasMore,
      totalPages: null,
    }
  }
}
