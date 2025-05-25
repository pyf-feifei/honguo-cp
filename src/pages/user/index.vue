<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar-wrap" @tap="handleLogin">
        <image
          class="avatar"
          :src="userInfo ? userInfo.avatar : '/static/avatar/default.svg'"
          mode="aspectFill"
        />
      </view>
      <view class="info" @tap="handleLogin">
        <text class="nickname">{{
          userInfo ? userInfo.nickname : '点击登录'
        }}</text>
        <text v-if="userInfo" class="phone">{{ userInfo.phone }}</text>
      </view>
    </view>

    <!-- VIP信息 -->
    <view class="vip-card" v-if="userInfo">
      <view class="vip-info">
        <view class="vip-level">
          <text class="label">VIP等级</text>
          <text class="value">{{ userInfo.vipLevel }}</text>
        </view>
        <view class="vip-expire">
          <text class="label">到期时间</text>
          <text class="value">{{ formatDate(userInfo.vipExpireTime) }}</text>
        </view>
      </view>
      <button class="vip-btn" @tap="goToVip">立即开通</button>
    </view>

    <!-- 金币信息 -->
    <view class="coins-card" v-if="userInfo">
      <view class="coins-info">
        <text class="label">我的金币</text>
        <text class="value">{{ userInfo.coins }}</text>
      </view>
      <button class="coins-btn" @tap="goToRecharge">立即充值</button>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="goToFavorite">
        <image class="icon" src="/static/icons/favorite.svg" />
        <text class="text">我的收藏</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @tap="goToHistory">
        <image class="icon" src="/static/icons/history.svg" />
        <text class="text">观看历史</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @tap="goToSettings">
        <image class="icon" src="/static/icons/settings.svg" />
        <text class="text">设置</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <button v-if="userInfo" class="logout-btn" @tap="handleLogout">
      退出登录
    </button>
  </view>
</template>

<script>
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

export default {
  setup() {
    const userStore = useUserStore()
    const { userInfo, isLogin } = storeToRefs(userStore)
    return { userInfo, isLogin, userStore }
  },

  methods: {
    // 处理登录
    handleLogin() {
      if (!this.isLogin) {
        // 模拟登录，实际项目中应该跳转到登录页
        this.userStore.login('1')
      }
    },

    // 处理退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.userStore.logout()
          }
        },
      })
    },

    // 跳转到VIP页面
    goToVip() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none',
      })
    },

    // 跳转到充值页面
    goToRecharge() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none',
      })
    },

    // 跳转到收藏页面
    goToFavorite() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
        })
        return
      }

      uni.navigateTo({
        url: '/pages/user/favorite',
      })
    },

    // 跳转到历史页面
    goToHistory() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
        })
        return
      }

      uni.navigateTo({
        url: '/pages/user/history',
      })
    },

    // 跳转到设置页面
    goToSettings() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none',
      })
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '未开通'
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  background-color: #fff;

  .avatar-wrap {
    margin-right: 30rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
    }
  }

  .info {
    .nickname {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
    }

    .phone {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.vip-card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background: linear-gradient(to right, #ff4d4f, #ff7875);
  border-radius: 12rpx;

  .vip-info {
    display: flex;
    margin-bottom: 20rpx;

    .vip-level,
    .vip-expire {
      margin-right: 40rpx;

      .label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10rpx;
      }

      .value {
        font-size: 32rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }

  .vip-btn {
    width: 200rpx;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    background-color: #fff;
    color: #ff4d4f;
    font-size: 28rpx;
    border-radius: 30rpx;
  }
}

.coins-card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;

  .coins-info {
    margin-bottom: 20rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }

    .value {
      font-size: 40rpx;
      color: #ffd700;
      font-weight: bold;
    }
  }

  .coins-btn {
    width: 200rpx;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    background-color: #ffd700;
    color: #333;
    font-size: 28rpx;
    border-radius: 30rpx;
  }
}

.menu-list {
  margin: 20rpx 30rpx;
  background-color: #fff;
  border-radius: 12rpx;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 20rpx;
    }

    .text {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .arrow {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.logout-btn {
  margin: 40rpx 30rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #fff;
  color: #ff4d4f;
  font-size: 32rpx;
  border-radius: 44rpx;
}
</style>
