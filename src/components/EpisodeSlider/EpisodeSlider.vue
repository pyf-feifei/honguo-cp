<template>
  <view
    class="episode-slider"
    :style="{
      width: videoStyle.width + 'px',
      height: videoStyle.height + 'px',
    }"
  >
    <swiper
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
          <text class="placeholder-text">{{ item.title || `第${index + 1}集` }}</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 集数指示器 -->
    <view class="episode-indicator">
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
  },

  data() {
    return {
      currentIndex: this.initialIndex,
      videoStyle: {
        width: 0,
        height: 0,
      },
      // 记录哪些组件已经被创建
      createdComponents: new Set(),
      // 批次加载状态
      batchLoadingComplete: false,
    }
  },

  created() {
    const systemInfo = uni.getSystemInfoSync()
    this.videoStyle.width = systemInfo.screenWidth
    this.videoStyle.height = systemInfo.windowHeight
  },

  watch: {
    currentIndex(newVal) {
      this.$emit('indexChange', newVal)
      // 立即创建当前可见范围的组件
      this.createVisibleComponents()
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
    // 初始化时立即创建可见范围的组件
    this.createVisibleComponents()
    // 延迟创建其他组件
    this.startBatchLoading()
  },

  methods: {
    swiperChange(e) {
      this.currentIndex = e.detail.current
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
    
    // 创建当前可见范围的组件
    createVisibleComponents() {
      const visibleRange = 2
      for (let i = this.currentIndex - visibleRange; i <= this.currentIndex + visibleRange; i++) {
        if (i >= 0 && i < this.videoList.length) {
          this.createdComponents.add(i)
        }
      }
      // 触发响应式更新
      this.$forceUpdate()
    },
    
    // 分批加载其他组件
    async startBatchLoading() {
      // 等待可见组件稳定加载
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('开始分批加载其他视频组件...')
      
      // 分批创建组件，每批3个
      const batchSize = 3
      const delay = 800 // 每批之间延迟800ms
      
      const allIndexes = Array.from({ length: this.videoList.length }, (_, i) => i)
      const remainingIndexes = allIndexes.filter(i => !this.createdComponents.has(i))
      
      for (let i = 0; i < remainingIndexes.length; i += batchSize) {
        const batch = remainingIndexes.slice(i, i + batchSize)
        
        // 创建这一批组件
        batch.forEach(index => {
          this.createdComponents.add(index)
        })
        
        console.log(`创建批次 ${Math.floor(i / batchSize) + 1}: 第${batch.map(idx => idx + 1).join(',')}集`)
        this.$forceUpdate()
        
        // 等待下一批
        if (i + batchSize < remainingIndexes.length) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      
      this.batchLoadingComplete = true
      console.log('所有视频组件创建完成')
    },
  },
}
</script>

<style>
.episode-slider {
  flex: 1;
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
  right: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
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
