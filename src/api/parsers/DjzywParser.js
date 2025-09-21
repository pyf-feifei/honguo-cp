// @@@Djzyw解析器 - 短剧资源网数据源解析器

import * as cheerio from 'cheerio'
import { BaseParser } from './BaseParser.js'

export class DjzywParser extends BaseParser {
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
    // @@@参数验证 - 确保page是数字
    const pageNum = typeof page === 'number' ? page : parseInt(page) || 1
    const encodedKeyword = encodeURIComponent(keyword || '')
    return `${this.config.baseUrl}?keyword=${encodedKeyword}&page=${pageNum}`
  }

  /**
   * 解析HTML数据
   * @param {string} html - HTML内容
   * @returns {ParseResult} 解析结果
   */
  parseData(html) {
    const $ = cheerio.load(html)
    const books = []

    // @@@新结构解析 - 查找短剧列表项（使用新的div结构）
    $('.duanjuliebiao .shuju').each((i, el) => {
      const $row = $(el)
      const titleElement = $row.find('.ziti')
      const titleText = titleElement.text().trim()

      // 跳过空行
      if (!titleText) {
        return
      }

      // 解析标题格式：销售风波（62集）李源&张许焓
      const match = titleText.match(/^(.+?)\s*[（(](\d+)\s*集[)）](.*)$/)

      if (match) {
        const bookName = match[1].trim()
        const totalChapterNum = match[2].trim()
        const actorsString = match[3].trim()

        // 解析演员
        const actors = actorsString
          .replace(/[＆&]/g, ' ')
          .split(/\s+/)
          .map((actor) => actor.trim())
          .filter(Boolean)

        // 获取网盘链接
        const links = []
        $row
          .find(
            '.lianjie a[href*="pan."], .lianjie a[href*="quark"], .lianjie a[href*="baidu"]'
          )
          .each((j, linkEl) => {
            const href = $(linkEl).attr('href')
            const text = $(linkEl).text().trim()
            if (href && text) {
              links.push({ type: text, url: href })
            }
          })

        books.push({
          bookId: `djzyw_${i}_${Date.now()}`, // 生成唯一ID
          bookName,
          coverWap: '/static/theater/defaultCover.png',
          introduction:
            actors.length > 0 ? `主演：${actors.join('、')}` : '短剧资源',
          totalChapterNum,
          followCount: Math.floor(Math.random() * 50000 + 5000), // 随机生成5千-5.5万的数据
          statusDesc: '更新中',
          bookTypeThree: [],
          actors,
          downloadLinks: links,
          source: 'djzyw',
        })
      } else {
        // @@@处理没有集数信息的标题 - 直接使用原标题
        books.push({
          bookId: `djzyw_${i}_${Date.now()}`,
          bookName: titleText,
          coverWap: '/static/theater/defaultCover.png',
          introduction: '短剧资源',
          totalChapterNum: '',
          followCount: Math.floor(Math.random() * 50000 + 5000),
          statusDesc: '更新中',
          bookTypeThree: [],
          actors: [],
          downloadLinks: [],
          source: 'djzyw',
        })
      }
    })

    // @@@检查是否有更多页面 - 查找分页链接
    const hasMore = $('.duanjufenye a:contains("下一页")').length > 0

    return {
      books,
      hasMore,
      totalPages: this.extractTotalPages($),
    }
  }

  /**
   * 提取总页数 - 重写以匹配新的HTML结构
   * @param {Object} $ - Cheerio实例
   * @returns {number|null} 总页数
   */
  extractTotalPages($) {
    // @@@新结构分页解析 - 查找分页区域中的总页数信息
    const pageText = $('.duanjufenye').text()
    const match = pageText.match(/共\s*(\d+)\s*页/)
    return match ? parseInt(match[1]) : null
  }
}
