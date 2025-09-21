// @@@封面图片API缓存系统
class CoverCache {
  constructor() {
    this.cache = new Map() // 存储短剧名称 -> 成功API的映射
    this.failedApis = new Map() // 存储短剧名称 -> 失败API列表
  }

  // 记录成功的API
  recordSuccess(bookName, apiKey) {
    this.cache.set(bookName, apiKey)
    // 清除失败记录
    this.failedApis.delete(bookName)
  }

  // 记录失败的API
  recordFailure(bookName, apiKey) {
    if (!this.failedApis.has(bookName)) {
      this.failedApis.set(bookName, new Set())
    }
    this.failedApis.get(bookName).add(apiKey)
  }

  // 获取推荐的API（优先使用成功的，排除失败的）
  getRecommendedApi(bookName, allApis) {
    // 如果有成功的API，直接返回
    if (this.cache.has(bookName)) {
      const successApi = this.cache.get(bookName)
      return allApis.find((api) => api.key === successApi) || allApis[0]
    }

    // 排除失败的API，返回第一个可用的
    const failedApis = this.failedApis.get(bookName) || new Set()
    return allApis.find((api) => !failedApis.has(api.key)) || allApis[0]
  }

  // 检查是否所有API都失败了
  isAllApisFailed(bookName, allApis) {
    const failedApis = this.failedApis.get(bookName) || new Set()
    return failedApis.size >= allApis.length
  }

  // 清除特定短剧的缓存
  clearBookCache(bookName) {
    this.cache.delete(bookName)
    this.failedApis.delete(bookName)
  }

  // 清除所有缓存
  clearAll() {
    this.cache.clear()
    this.failedApis.clear()
  }
}

export const coverCache = new CoverCache()

