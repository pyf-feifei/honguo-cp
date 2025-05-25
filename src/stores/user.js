import { defineStore } from 'pinia'
import { userApi } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLogin: false,
  }),

  getters: {
    isVip: (state) => {
      if (!state.userInfo) return false
      if (state.userInfo.vipLevel <= 0) return false
      if (!state.userInfo.vipExpireTime) return false
      return new Date(state.userInfo.vipExpireTime) > new Date()
    },
  },

  actions: {
    // 登录
    async login(userId) {
      try {
        const userInfo = await userApi.getUserInfo(userId)
        if (userInfo) {
          this.userInfo = userInfo
          this.isLogin = true
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },

    // 登出
    logout() {
      this.userInfo = null
      this.isLogin = false
    },

    // 更新用户信息
    async updateUserInfo(data) {
      try {
        const userInfo = await userApi.updateUserInfo(this.userInfo.id, data)
        if (userInfo) {
          this.userInfo = userInfo
          return true
        }
        return false
      } catch (error) {
        console.error('更新用户信息失败:', error)
        return false
      }
    },
  },
})
