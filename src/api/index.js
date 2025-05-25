import mockData from '../mock/mock'

// 用户相关接口
export const userApi = {
  // 获取用户信息
  getUserInfo: (userId) => {
    return new Promise((resolve) => {
      const user = mockData.users.find((u) => u.id === userId)
      resolve(user || null)
    })
  },

  // 更新用户信息
  updateUserInfo: (userId, data) => {
    return new Promise((resolve) => {
      const index = mockData.users.findIndex((u) => u.id === userId)
      if (index !== -1) {
        mockData.users[index] = { ...mockData.users[index], ...data }
        resolve(mockData.users[index])
      }
      resolve(null)
    })
  },
}

// 短剧相关接口
export const dramaApi = {
  // 获取短剧列表
  getDramaList: (params = {}) => {
    return new Promise((resolve) => {
      let list = [...mockData.dramas]

      // 标签筛选
      if (params.tags) {
        list = list.filter((drama) =>
          params.tags.some((tag) => drama.tags.includes(tag))
        )
      }

      // VIP筛选
      if (params.isVip !== undefined) {
        list = list.filter((drama) => drama.isVip === params.isVip)
      }

      resolve(list)
    })
  },

  // 获取短剧详情
  getDramaDetail: (dramaId) => {
    return new Promise((resolve) => {
      const drama = mockData.dramas.find((d) => d.id === dramaId)
      resolve(drama || null)
    })
  },
}

// 剧集相关接口
export const episodeApi = {
  // 获取剧集列表
  getEpisodeList: (dramaId) => {
    return new Promise((resolve) => {
      const episodes = mockData.episodes.filter((e) => e.dramaId === dramaId)
      resolve(episodes)
    })
  },

  // 获取剧集详情
  getEpisodeDetail: (episodeId) => {
    return new Promise((resolve) => {
      const episode = mockData.episodes.find((e) => e.id === episodeId)
      resolve(episode || null)
    })
  },
}

// 收藏相关接口
export const favoriteApi = {
  // 获取收藏列表
  getFavoriteList: (userId) => {
    return new Promise((resolve) => {
      const favorites = mockData.favorites
        .filter((f) => f.userId === userId)
        .map((f) => ({
          ...f,
          drama: mockData.dramas.find((d) => d.id === f.dramaId),
        }))
      resolve(favorites)
    })
  },

  // 添加收藏
  addFavorite: (userId, dramaId) => {
    return new Promise((resolve) => {
      const favorite = {
        id: String(mockData.favorites.length + 1),
        userId,
        dramaId,
        createTime: new Date(),
      }
      mockData.favorites.push(favorite)
      resolve(favorite)
    })
  },

  // 取消收藏
  removeFavorite: (userId, dramaId) => {
    return new Promise((resolve) => {
      const index = mockData.favorites.findIndex(
        (f) => f.userId === userId && f.dramaId === dramaId
      )
      if (index !== -1) {
        mockData.favorites.splice(index, 1)
        resolve(true)
      }
      resolve(false)
    })
  },
}

// 观看历史相关接口
export const historyApi = {
  // 获取观看历史
  getHistoryList: (userId) => {
    return new Promise((resolve) => {
      const history = mockData.watchHistory
        .filter((h) => h.userId === userId)
        .map((h) => ({
          ...h,
          drama: mockData.dramas.find((d) => d.id === h.dramaId),
          episode: mockData.episodes.find((e) => e.id === h.episodeId),
        }))
      resolve(history)
    })
  },

  // 更新观看进度
  updateProgress: (userId, dramaId, episodeId, progress) => {
    return new Promise((resolve) => {
      const index = mockData.watchHistory.findIndex(
        (h) =>
          h.userId === userId &&
          h.dramaId === dramaId &&
          h.episodeId === episodeId
      )

      if (index !== -1) {
        mockData.watchHistory[index].progress = progress
        mockData.watchHistory[index].createTime = new Date()
        resolve(mockData.watchHistory[index])
      } else {
        const history = {
          id: String(mockData.watchHistory.length + 1),
          userId,
          dramaId,
          episodeId,
          progress,
          createTime: new Date(),
        }
        mockData.watchHistory.push(history)
        resolve(history)
      }
    })
  },
}

// 评论相关接口
export const commentApi = {
  // 获取评论列表
  getCommentList: (dramaId) => {
    return new Promise((resolve) => {
      const comments = mockData.comments
        .filter((c) => c.dramaId === dramaId)
        .map((c) => ({
          ...c,
          user: mockData.users.find((u) => u.id === c.userId),
        }))
      resolve(comments)
    })
  },

  // 添加评论
  addComment: (userId, dramaId, content) => {
    return new Promise((resolve) => {
      const comment = {
        id: String(mockData.comments.length + 1),
        userId,
        dramaId,
        content,
        likeCount: 0,
        createTime: new Date(),
      }
      mockData.comments.push(comment)
      resolve(comment)
    })
  },
}
