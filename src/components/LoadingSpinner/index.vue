<template>
  <view class="loading-spinner" v-if="visible">
    <view class="spinner-container">
      <!-- 抖音风格的三个圆点加载动画 -->
      <view class="dot-wrapper">
        <view class="dot dot1"></view>
        <view class="dot dot2"></view>
        <view class="dot dot3"></view>
      </view>
      <text class="loading-text" v-if="showText">{{ text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: '加载中...'
    },
    showText: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'medium' // small, medium, large
    },
    color: {
      type: String,
      default: '#fe2c55' // 抖音主题色
    }
  },
  computed: {
    dotSize() {
      const sizes = {
        small: '8rpx',
        medium: '12rpx',
        large: '16rpx'
      }
      return sizes[this.size] || sizes.medium
    }
  }
}
</script>

<style scoped lang="scss">
.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 16rpx;
}

.dot-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: linear-gradient(45deg, #fe2c55, #ff0050);
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot1 {
  animation-delay: -0.32s;
}

.dot2 {
  animation-delay: -0.16s;
}

.dot3 {
  animation-delay: 0s;
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.loading-text {
  color: #ffffff;
  font-size: 24rpx;
  margin-top: 20rpx;
  text-align: center;
}

/* 响应式大小调整 */
.loading-spinner[data-size="small"] .dot {
  width: 8rpx;
  height: 8rpx;
}

.loading-spinner[data-size="large"] .dot {
  width: 16rpx;
  height: 16rpx;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .spinner-container {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>