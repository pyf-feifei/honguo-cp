import { API_SITES } from '../config.js'
import { coverCache } from './coverCache.js'

/**
 * 批量获取封面图片（实时更新版本）
 * @param {Array} books - 书籍列表
 * @param {Function} onCoverUpdate - 封面更新回调函数
 * @returns {Promise<Array>} - 返回带有封面图片的书籍列表
 */
export async function batchFetchCoverImages(books, onCoverUpdate) {
  if (!books || books.length === 0) {
    return []
  }

  const results = [...books] // 创建副本，避免修改原数组

  // @@@并发处理所有书籍，实现实时更新
  const promises = books.map(async (book, index) => {
    try {
      const coverUrl = await fetchCoverImage(book.bookName)

      if (coverUrl) {
        // @@@立即更新结果并通知UI
        results[index] = { ...book, coverWap: coverUrl }
        if (onCoverUpdate) {
          onCoverUpdate(results[index], index)
        }
      }
    } catch (error) {
      // 静默处理错误
    }
  })

  // 等待所有请求完成
  await Promise.all(promises)
  return results
}

/**
 * 获取单个封面图片
 * @param {String} bookName - 书籍名称
 * @returns {Promise<String>} - 返回封面图片URL
 */
export async function fetchCoverImage(bookName) {
  if (!bookName) {
    return ''
  }

  // @@@优先使用最大资源和无尽资源API，因为它们有更多封面图片
  const priorityApis = [
    { key: 'zuid', name: '最大资源' },
    { key: 'wujin', name: '无尽资源' },
    { key: 'wwzy', name: '旺旺短剧' },
  ]

  // @@@使用缓存机制，优先使用成功的API
  const recommendedApi = coverCache.getRecommendedApi(bookName, priorityApis)

  // 如果所有API都失败了，直接返回空字符串
  if (coverCache.isAllApisFailed(bookName, priorityApis)) {
    return ''
  }

  // 按推荐顺序重新排列API列表
  const orderedApis = [
    recommendedApi,
    ...priorityApis.filter((api) => api.key !== recommendedApi.key),
  ]

  for (const apiInfo of orderedApis) {
    const apiSite = API_SITES[apiInfo.key]
    if (!apiSite) {
      continue
    }

    const coverUrl = await tryFetchCoverFromApi(bookName, apiSite, apiInfo.name)
    if (coverUrl) {
      // @@@记录成功的API
      coverCache.recordSuccess(bookName, apiInfo.key)
      return coverUrl
    } else {
      // @@@记录失败的API
      coverCache.recordFailure(bookName, apiInfo.key)
    }
  }

  return ''
}

// @@@从指定API获取封面图片的辅助函数
async function tryFetchCoverFromApi(bookName, apiSite, apiName) {
  try {
    // 搜索API
    const searchUrl = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(
      bookName
    )}`

    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: searchUrl,
        method: 'GET',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        },
      })
    })

    if (response.statusCode !== 200) {
      return null
    }

    const data = response.data

    if (data && data.list && data.list.length > 0) {
      // 取第一个匹配结果的封面
      const firstResult = data.list[0]
      const coverUrl = firstResult.vod_pic || firstResult.pic || ''

      if (coverUrl) {
        return coverUrl
      }
    }
  } catch (error) {
    // 静默处理错误
  }

  return null
}

// @@@保留原有的tryFetchCover函数作为备用
async function tryFetchCover(bookName) {
  // 使用旺旺短剧API
  const apiSite = API_SITES.wwzy
  if (!apiSite) {
    console.error('未找到旺旺短剧API配置')
    return ''
  }

  // 尝试获取封面图片的函数
  const tryFetchCoverInternal = async (searchName) => {
    // 搜索API
    const searchUrl = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(
      searchName
    )}`
    console.log('搜索短剧:', searchName, 'URL:', searchUrl)

    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: searchUrl,
        method: 'GET',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        },
      })
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP error! status: ${response.statusCode}`)
    }

    const data = response.data

    if (data && data.list && data.list.length > 0) {
      // 取第一个匹配结果的封面
      const firstResult = data.list[0]
      const coverUrl = firstResult.vod_pic || firstResult.pic || ''

      console.log('找到封面图片:', searchName, 'URL:', coverUrl)
      console.log('vod_pic字段值:', firstResult.vod_pic)
      console.log('pic字段值:', firstResult.pic)
      console.log('原始数据:', firstResult)
      return coverUrl
    } else {
      console.log('未找到封面图片:', searchName)
      console.log('API返回数据:', data)
      return null
    }
  }

  try {
    // 首先尝试使用完整的书籍名称查询
    let coverUrl = await tryFetchCoverInternal(bookName)
    if (coverUrl) {
      return coverUrl
    }

    // 如果完整名称查询不到，检查是否包含 "&" 或 "＆"
    if (bookName.includes('&') || bookName.includes('＆')) {
      // 拆分书籍名称
      const separator = bookName.includes('＆') ? '＆' : '&'
      const nameParts = bookName.split(separator).map((part) => part.trim())

      console.log('拆分书籍名称:', nameParts)

      // 依次尝试每个部分
      for (const part of nameParts) {
        if (part) {
          // 确保部分不为空
          coverUrl = await tryFetchCoverInternal(part)
          if (coverUrl) {
            console.log('使用拆分后的名称找到封面图片:', part, 'URL:', coverUrl)
            return coverUrl
          }
        }
      }
    }

    // 如果所有尝试都失败了，返回空字符串
    console.log('所有尝试都失败了，未找到封面图片:', bookName)
    return ''
  } catch (error) {
    console.error('获取封面图片失败:', bookName, error)
    return ''
  }
}
