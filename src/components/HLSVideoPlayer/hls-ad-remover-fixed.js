const REQUEST_TIMEOUT = 5000 // 减少超时时间

// 简化的广告检测逻辑
function isAdChunk(chunk) {
  // 检测广告的多种特征
  const adIndicators = [
    // 广告通常有不同的duration模式
    /EXTINF:\s*([0-9.]+)\s*,/gm,
    // 广告可能包含特定的标识
    /#EXT-X-DISCONTINUITY/,
    // 检查segment数量和时长
  ]
  
  const extinfs = [...chunk.matchAll(/EXTINF:\s*([0-9.]+)\s*,/gm)].map(
    (match) => parseFloat(match[1])
  )
  
  if (extinfs.length === 0) {
    return false // 不是媒体chunk，保留
  }
  
  // 广告检测规则
  const uniqueDurations = new Set(extinfs)
  const avgDuration = extinfs.reduce((a, b) => a + b, 0) / extinfs.length
  const totalDuration = extinfs.reduce((a, b) => a + b, 0)
  
  // 多重检测条件
  const isAd = (
    // 1. 如果有多种不同的片段时长（广告特征）
    uniqueDurations.size > 1 && uniqueDurations.size > extinfs.length * 0.5
  ) || (
    // 2. 平均时长异常（通常广告片段时长不同）
    avgDuration < 2 || avgDuration > 15
  ) || (
    // 3. 总时长过短或过长
    totalDuration < 5 || totalDuration > 120
  ) || (
    // 4. 包含广告相关URL模式
    /ad[s]?[_-]|advertising|commercial|promo/i.test(chunk)
  )
  
  return isAd
}

async function processPlaylist(url, playlist) {
  try {
    const discontinuityMarker = '#EXT-X-DISCONTINUITY'
    const chunks = playlist.split(discontinuityMarker)
    const firstChunk = chunks.shift() // 保留头部信息
    
    // 过滤广告chunk
    const contentChunks = []
    let sequenceNumber = 0
    
    for (const chunk of chunks) {
      if (!isAdChunk(chunk)) {
        contentChunks.push(chunk)
      } else {
        console.log(`广告过滤器: 移除广告片段 ${sequenceNumber}`)
      }
      sequenceNumber++
    }
    
    // 重新构建播放列表
    let newPlaylist = firstChunk
    
    if (contentChunks.length > 0) {
      newPlaylist += contentChunks.map(chunk => discontinuityMarker + chunk).join('')
    } else {
      // 如果所有chunk都被误判为广告，保留原始播放列表
      console.warn('广告过滤器: 警告 - 所有片段都被识别为广告，保留原始播放列表')
      return playlist
    }
    
    // 保持结束标记
    if (playlist.includes('#EXT-X-ENDLIST')) {
      newPlaylist += '\n#EXT-X-ENDLIST'
    }
    
    console.log(`广告过滤器: 保留 ${contentChunks.length}/${chunks.length} 个片段`)
    return newPlaylist
    
  } catch (error) {
    console.error('广告过滤器处理失败:', error)
    return playlist // 出错时返回原始播放列表
  }
}

export class AdRemoverLoader {
  constructor(config) {
    this.originalLoader = new config.loader(config)
    this.enabled = true // 可以动态启用/禁用
    console.log('广告过滤器已初始化')
  }
  
  load(context, config, callbacks) {
    if (!this.enabled || (context.type !== 'manifest' && context.type !== 'level')) {
      // 不需要处理或已禁用，直接使用原始loader
      return this.originalLoader.load(context, config, callbacks)
    }
    
    const originalOnSuccess = callbacks.onSuccess
    const originalOnError = callbacks.onError
    
    callbacks.onSuccess = (response, stats, context) => {
      if (response.data && typeof response.data === 'string') {
        processPlaylist(response.url, response.data)
          .then((processedData) => {
            response.data = processedData
            originalOnSuccess(response, stats, context)
          })
          .catch((error) => {
            console.error('广告过滤器: 处理失败，使用原始数据', error)
            originalOnSuccess(response, stats, context)
          })
      } else {
        originalOnSuccess(response, stats, context)
      }
    }
    
    callbacks.onError = (error, context, networkDetails) => {
      console.error('广告过滤器: 加载错误', error)
      originalOnError(error, context, networkDetails)
    }
    
    this.originalLoader.load(context, config, callbacks)
  }
  
  destroy() {
    if (this.originalLoader && this.originalLoader.destroy) {
      this.originalLoader.destroy()
    }
  }
  
  // 控制方法
  enable() {
    this.enabled = true
    console.log('广告过滤器已启用')
  }
  
  disable() {
    this.enabled = false
    console.log('广告过滤器已禁用')
  }
}