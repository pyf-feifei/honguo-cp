// @@@基础解析器抽象类 - 定义解析器统一接口

/**
 * 解析结果
 * @typedef {Object} ParseResult
 * @property {Array<BookData>} books - 书籍列表
 * @property {boolean} hasMore - 是否有更多数据
 * @property {number|null} totalPages - 总页数
 */

/**
 * 基础解析器抽象类
 */
export class BaseParser {
  constructor(config) {
    this.config = config
  }

  /**
   * 构建搜索URL
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @returns {string} 搜索URL
   */
  buildSearchUrl(keyword, page) {
    throw new Error('buildSearchUrl method must be implemented')
  }

  /**
   * 解析HTML数据
   * @param {string} html - HTML内容
   * @returns {ParseResult} 解析结果
   */
  parseData(html) {
    throw new Error('parseData method must be implemented')
  }

  /**
   * 处理书籍数据
   * @param {Array} books - 原始书籍数据
   * @returns {Array} 处理后的书籍数据
   */
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
  }

  /**
   * 提取总页数
   * @param {Object} $ - Cheerio实例
   * @returns {number|null} 总页数
   */
  extractTotalPages($) {
    const pageText = $('*:contains("共")').text()
    const match = pageText.match(/共\s*(\d+)\s*页/)
    return match ? parseInt(match[1]) : null
  }
}
