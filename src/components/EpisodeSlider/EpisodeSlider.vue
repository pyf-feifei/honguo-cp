<template>
  <view
    class="episode-slider"
    :style="{
      width: videoStyle.width + 'px',
      height: '100%',
    }"
  >
    <swiper
      v-if="isHeightReady"
      class="slider-container"
      :style="{
        width: videoStyle.width + 'px',
        height: videoStyle.height + 'px',
      }"
      :vertical="true"
      :circular="false"
      :current="currentIndex"
      @change="swiperChange"
    >
      <swiper-item
        v-for="(item, index) in processedList"
        :key="item.id"
        class="swiper-item-container"
      >
        <HlsBaseVideo
          v-if="shouldCreateComponent(index)"
          v-show="Math.abs(currentIndex - index) <= 2"
          :item="item"
          :is-play="index === currentIndex"
          :video-style="videoStyle"
          :loop="item.originalIndex === videoList.length - 1"
          @ended="onVideoEnded"
        />
        <view v-else class="placeholder-view">
          <text class="placeholder-text">{{
            item.title || `第${index + 1}集`
          }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 集数指示器 -->
    <view class="episode-indicator">
      <!-- 返回图标 -->
      <view class="back-icon" @click="handleBack">
        <view class="back-arrow-shape"></view>
      </view>
      <text class="indicator-text"
        >{{ currentIndex + 1 }} / {{ videoList.length }}</text
      >
    </view>
  </view>
</template>

<script>
import HlsBaseVideo from '../HlsBaseVideo/index.vue'

export default {
  name: 'EpisodeSlider',
  components: {
    HlsBaseVideo,
  },
  props: {
    videoList: {
      type: Array,
      default: () => [],
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    // 是否启用组件清理（清理远离当前位置的组件以节省内存）
    enableCleanup: {
      type: Boolean,
      default: false, // 默认不清理
    },
    // 组件保持范围（当enableCleanup为true时生效）
    keepRange: {
      type: Number,
      default: 5, // 保持前后各5个组件
    },
    // 组件加载范围
    loadRange: {
      type: Number,
      default: 2, // 加载前后各2个组件
    },
  },

  data() {
    return {
      currentIndex: this.initialIndex,
      videoStyle: {
        width: 0,
        height: 0,
      },
      isHeightReady: false,
      // 记录哪些组件已经被创建
      createdComponents: new Set(),
    }
  },

  created() {
    const systemInfo = uni.getSystemInfoSync()
    this.videoStyle.width = systemInfo.screenWidth
  },

  watch: {
    currentIndex(newVal) {
      this.$emit('indexChange', newVal)
      // 动态创建可见范围的组件
      this.loadComponentsAroundIndex(newVal)
    },
    videoList: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          // 视频列表更新后，初始化组件
          this.$nextTick(() => {
            this.loadComponentsAroundIndex(this.currentIndex)
          })
        }
      },
      immediate: true,
    },
  },

  computed: {
    processedList() {
      return this.videoList.map((item, index) => ({
        ...item,
        id: item.url || `video_${index}`, // Use URL as a key, or index as a fallback
      }))
    },
  },

  mounted() {
    this.$nextTick(() => {
      const query = uni.createSelectorQuery().in(this)
      query
        .select('.episode-slider')
        .boundingClientRect((data) => {
          if (data && data.height > 0) {
            this.videoStyle.height = data.height
            this.isHeightReady = true
          } else {
            console.error('Failed to get EpisodeSlider height, using fallback.')
            const systemInfo = uni.getSystemInfoSync()
            this.videoStyle.height = systemInfo.windowHeight - uni.upx2px(120)
            this.isHeightReady = true
          }
        })
        .exec()
    })

    // 初始化时只创建当前可见范围的组件
    // 如果此时已有数据，立即加载；否则等待 watch 触发
    if (this.videoList && this.videoList.length > 0) {
      this.loadComponentsAroundIndex(this.currentIndex)
    }
  },

  methods: {
    swiperChange(e) {
      this.currentIndex = e.detail.current
    },
    handleBack() {
      this.$emit('back')
    },
    onVideoEnded() {
      if (this.currentIndex < this.videoList.length - 1) {
        this.currentIndex++
      } else {
        // Optionally handle end of playlist, e.g., loop back to start or show a message
      }
    },

    // 判断组件是否应该被创建
    shouldCreateComponent(index) {
      return this.createdComponents.has(index)
    },

    // 动态加载指定索引周围的组件
    loadComponentsAroundIndex(centerIndex) {
      // 确保有视频列表数据
      if (!this.videoList || this.videoList.length === 0) {
        console.log('视频列表为空，跳过组件加载')
        return
      }

      let hasNewComponents = false

      // 计算需要加载的索引范围（使用props中的loadRange）
      for (
        let i = centerIndex - this.loadRange;
        i <= centerIndex + this.loadRange;
        i++
      ) {
        if (i >= 0 && i < this.videoList.length) {
          // 只加载还未创建的组件
          if (!this.createdComponents.has(i)) {
            this.createdComponents.add(i)
            hasNewComponents = true
            console.log(`动态加载第${i + 1}集`)
          }
        }
      }

      // 只在有新组件加载时触发更新
      if (hasNewComponents) {
        console.log(`已创建组件索引:`, Array.from(this.createdComponents))
        this.$forceUpdate()
      }

      // 根据props决定是否清理远离当前位置的组件
      if (this.enableCleanup) {
        this.cleanupDistantComponents(centerIndex)
      }
    },

    // 清理远离当前位置的组件
    cleanupDistantComponents(centerIndex) {
      const toRemove = []

      // 找出需要清理的组件（使用props中的keepRange）
      for (const index of this.createdComponents) {
        if (Math.abs(centerIndex - index) > this.keepRange) {
          toRemove.push(index)
        }
      }

      // 执行清理
      if (toRemove.length > 0) {
        console.log(`清理组件: 第${toRemove.map((i) => i + 1).join(', ')}集`)
        toRemove.forEach((index) => {
          this.createdComponents.delete(index)
        })

        // 触发更新
        this.$forceUpdate()
      }
    },
  },
}
</script>

<style>
.episode-slider {
  width: 100%;
  height: 100%;
  background-color: #000;
}
.slider-container {
  flex: 1;
}
.swiper-item-container {
  flex: 1;
}
.episode-indicator {
  position: absolute;
  top: 100rpx;
  left: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
}
.back-icon {
  margin-right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow-shape {
  width: 14rpx;
  height: 14rpx;
  border-left: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(45deg);
}
.indicator-text {
  font-size: 28rpx;
  color: #ffffff;
}
.placeholder-view {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
}
.placeholder-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>
