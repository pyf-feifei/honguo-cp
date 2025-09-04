import { API_SITES } from '../config.js'

/**
 * 批量获取封面图片
 * @param {Array} books - 书籍列表
 * @returns {Promise<Array>} - 返回带有封面图片的书籍列表
 */
export async function batchFetchCoverImages(books) {
  if (!books || books.length === 0) {
    return []
  }

  console.log('开始批量获取封面图片，书籍数量:', books.length)

  // 使用旺旺短剧API
  const apiSite = API_SITES.wwzy
  if (!apiSite) {
    console.error('未找到旺旺短剧API配置')
    return books
  }

  const results = []

  // 为了避免过多并发请求，我们分批处理
  const batchSize = 5
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize)
    const batchPromises = batch.map(async (book) => {
      try {
        // 搜索API
        const searchUrl = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(
          book.bookName
        )}`
        console.log('搜索短剧:', book.bookName, 'URL:', searchUrl)

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

          console.log('找到封面图片:', book.bookName, 'URL:', coverUrl)
          console.log('vod_pic字段值:', firstResult.vod_pic)
          console.log('pic字段值:', firstResult.pic)
          console.log('原始数据:', firstResult)

          return {
            ...book,
            coverWap: coverUrl,
          }
        } else {
          console.log('未找到封面图片:', book.bookName)
          console.log('API返回数据:', data)
          return book
        }
      } catch (error) {
        console.error('获取封面图片失败:', book.bookName, error)
        return book
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)

    // 添加延迟，避免请求过于频繁
    if (i + batchSize < books.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log('批量获取封面图片完成')
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

  console.log('开始获取封面图片:', bookName)

  // 使用旺旺短剧API
  const apiSite = API_SITES.wwzy
  if (!apiSite) {
    console.error('未找到旺旺短剧API配置')
    return ''
  }

  try {
    // 搜索API
    const searchUrl = `${apiSite.api}?ac=videolist&wd=${encodeURIComponent(
      bookName
    )}`
    console.log('搜索短剧:', bookName, 'URL:', searchUrl)

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

      console.log('找到封面图片:', bookName, 'URL:', coverUrl)
      console.log('原始数据:', firstResult)
      return coverUrl
    } else {
      console.log('未找到封面图片:', bookName)
      console.log('API返回数据:', data)
      return ''
    }
  } catch (error) {
    console.error('获取封面图片失败:', bookName, error)
    return ''
  }
}
