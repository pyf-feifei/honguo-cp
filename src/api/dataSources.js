// @@@数据源配置 - 搜索数据源配置
import { DjzywParser } from './parsers/DjzywParser.js'
import { PanhubParser } from './parsers/PanhubParser.js'

export const SEARCH_DATA_SOURCES = {
  djzyw: {
    name: '短剧资源网',
    baseUrl: 'https://www.djzyw.com/duanju.php',
    priority: 1, // 优先级：1为最高
    enabled: true,
    parser: 'djzyw',
  },
  panhub: {
    name: 'PanHub',
    baseUrl: 'https://panhub.fun/s',
    priority: 2,
    enabled: true,
    parser: 'panhub',
  },
}

// @@@数据源抽象层 - 统一数据源接口
export class DataSourceManager {
  constructor() {
    this.currentSource = 'djzyw' // 默认使用 djzyw
    this.sources = SEARCH_DATA_SOURCES
    this.parsers = new Map()
    this.initParsers()
  }

  // @@@初始化解析器 - 创建解析器实例
  initParsers() {
    this.parsers.set('djzyw', new DjzywParser(SEARCH_DATA_SOURCES.djzyw))
    this.parsers.set('panhub', new PanhubParser(SEARCH_DATA_SOURCES.panhub))
  }

  // 获取当前数据源配置
  getCurrentSource() {
    return this.sources[this.currentSource]
  }

  // 切换数据源
  switchSource(sourceKey) {
    if (this.sources[sourceKey] && this.sources[sourceKey].enabled) {
      this.currentSource = sourceKey
      return true
    }
    return false
  }

  // 获取所有可用数据源
  getAvailableSources() {
    return Object.entries(this.sources)
      .filter(([key, source]) => source.enabled)
      .map(([key, source]) => ({ key, ...source }))
      .sort((a, b) => a.priority - b.priority)
  }

  // 构建搜索URL
  buildSearchUrl(keyword, page) {
    const parser = this.parsers.get(this.currentSource)
    if (!parser) {
      throw new Error(`Parser not found for source: ${this.currentSource}`)
    }
    return parser.buildSearchUrl(keyword, page)
  }

  // @@@简单降级处理 - 只添加必要的备用代理
  async fetchDataWithFallback(keyword, page) {
    const source = this.getCurrentSource()
    const parser = this.parsers.get(this.currentSource)
    const url = this.buildSearchUrl(keyword, page)

    // @@@临时调试 - 输出请求参数
    console.log(`[${source.name}] 请求参数:`, { keyword, page, url })

    // 代理服务列表 - 按优先级排序
    const proxyServices = [
      {
        name: 'allorigins',
        buildUrl: (targetUrl) =>
          `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        description: 'allorigins.win - 稳定可靠，20次/分钟',
      },
      {
        name: 'cloudflare-cors-anywhere',
        buildUrl: (targetUrl) => `https://test.cors.workers.dev/${targetUrl}`,
        description: 'Cloudflare Workers 官方演示',
      },
      {
        name: 'codetabs',
        buildUrl: (targetUrl) =>
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(
            targetUrl
          )}`,
        description: 'codetabs.com - 5次/秒，625KB限制',
      },
      {
        name: 'cors-anywhere',
        buildUrl: (targetUrl) =>
          `https://cors-anywhere.herokuapp.com/${targetUrl}`,
        description: 'cors-anywhere 公共实例，50次/小时',
      },
      {
        name: 'cors.io',
        buildUrl: (targetUrl) => `https://cors.io/${targetUrl}`,
        description: 'cors.io - 可能有访问限制',
      },
      {
        name: 'corsproxy.io',
        buildUrl: (targetUrl) => `https://corsproxy.io/${targetUrl}`,
        description: 'CorsProxy.io - 免费公共代理服务',
      },
    ]

    // 尝试每个代理服务
    for (let i = 0; i < proxyServices.length; i++) {
      const proxy = proxyServices[i]
      const proxyUrl = proxy.buildUrl(url)

      console.log(
        `[${source.name}] 尝试代理 ${i + 1}/${proxyServices.length}: ${
          proxy.name
        } - ${proxy.description}`
      )
      console.log(`[${source.name}] 代理URL:`, proxyUrl)

      try {
        const res = await uni.request({
          url: proxyUrl,
          method: 'GET',
          timeout: 20000,
          dataType: 'text',
          responseType: 'text',
          sslVerify: false,
        })

        console.log(`[${source.name}] ${proxy.name} 响应状态:`, res.statusCode)

        if (res.statusCode === 200) {
          console.log(`[${source.name}] ${proxy.name} 代理成功`)
          return parser.parseData(res.data)
        } else {
          console.warn(
            `[${source.name}] ${proxy.name} 返回状态码: ${res.statusCode}`
          )
          // 继续尝试下一个代理
        }
      } catch (error) {
        console.warn(
          `[${source.name}] ${proxy.name} 代理失败:`,
          error.message || error.errMsg || '未知错误'
        )
        // 继续尝试下一个代理
      }
    }

    // 所有代理都失败
    throw new Error(`[${source.name}] 所有CORS代理服务均失败`)
  }

  // 获取数据
  async fetchData(keyword, page) {
    try {
      return await this.fetchDataWithFallback(keyword, page)
    } catch (error) {
      console.error(`[${this.getCurrentSource().name}] 数据获取失败:`, error)
      throw error
    }
  }
}

// 创建全局数据源管理器实例
export const dataSourceManager = new DataSourceManager()

// @@@测试所有代理服务 - 在控制台调用
export const testAllProxies = async () => {
  console.log('🧪 开始测试所有CORS代理服务...')

  const testUrl = 'https://www.djzyw.com/duanju.php?keyword=测试&page=1'
  const proxyServices = [
    {
      name: 'allorigins',
      buildUrl: (targetUrl) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      description: 'allorigins.win - 稳定可靠，20次/分钟',
    },
    {
      name: 'cloudflare-cors-anywhere',
      buildUrl: (targetUrl) => `https://test.cors.workers.dev/${targetUrl}`,
      description: 'Cloudflare Workers 官方演示',
    },
    {
      name: 'codetabs',
      buildUrl: (targetUrl) =>
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(
          targetUrl
        )}`,
      description: 'codetabs.com - 5次/秒，625KB限制',
    },
    {
      name: 'cors-anywhere',
      buildUrl: (targetUrl) =>
        `https://cors-anywhere.herokuapp.com/${targetUrl}`,
      description: 'cors-anywhere 公共实例，50次/小时',
    },
    {
      name: 'cors.io',
      buildUrl: (targetUrl) => `https://cors.io/${targetUrl}`,
      description: 'cors.io - 可能有访问限制',
    },
    {
      name: 'corsproxy.io',
      buildUrl: (targetUrl) => `https://corsproxy.io/${targetUrl}`,
      description: 'CorsProxy.io - 免费公共代理服务',
    },
  ]

  const results = []

  for (let i = 0; i < proxyServices.length; i++) {
    const proxy = proxyServices[i]
    const proxyUrl = proxy.buildUrl(testUrl)

    console.log(`\n🔍 测试 ${i + 1}/${proxyServices.length}: ${proxy.name}`)
    console.log(`📝 描述: ${proxy.description}`)
    console.log(`🌐 URL: ${proxyUrl}`)

    const startTime = Date.now()

    try {
      const res = await uni.request({
        url: proxyUrl,
        method: 'GET',
        timeout: 15000,
        dataType: 'text',
        responseType: 'text',
        sslVerify: false,
      })

      const duration = Date.now() - startTime

      if (res.statusCode === 200) {
        console.log(`✅ ${proxy.name} - 成功 (${duration}ms)`)
        results.push({
          name: proxy.name,
          success: true,
          duration,
          statusCode: res.statusCode,
          dataLength: res.data ? res.data.length : 0,
        })
      } else {
        console.log(`❌ ${proxy.name} - 失败: HTTP ${res.statusCode}`)
        results.push({
          name: proxy.name,
          success: false,
          duration,
          statusCode: res.statusCode,
          error: `HTTP ${res.statusCode}`,
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMsg = error.message || error.errMsg || '未知错误'
      console.log(`💥 ${proxy.name} - 异常: ${errorMsg} (${duration}ms)`)
      results.push({
        name: proxy.name,
        success: false,
        duration,
        error: errorMsg,
      })
    }

    // 添加延迟避免请求过于频繁
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // 输出汇总结果
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log('\n📊 测试结果汇总:')
  console.log(`✅ 成功: ${successful.length}/${results.length}`)
  console.log(`❌ 失败: ${failed.length}/${results.length}`)

  if (successful.length > 0) {
    console.log('\n🏆 成功的代理服务 (按速度排序):')
    successful
      .sort((a, b) => a.duration - b.duration)
      .forEach((result, index) => {
        console.log(
          `${index + 1}. ${result.name} - ${result.duration}ms (状态码: ${
            result.statusCode
          })`
        )
      })
  }

  if (failed.length > 0) {
    console.log('\n💥 失败的代理服务:')
    failed.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} - ${result.error}`)
    })
  }

  return results
}
