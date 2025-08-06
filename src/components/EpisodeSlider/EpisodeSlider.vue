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
          :item="item"
          :is-play="index === currentIndex"
          :video-style="videoStyle"
          :loop="item.originalIndex === videoList.length - 1"
          @ended="onVideoEnded"
        />
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
      // visibleItems: [], // No longer needed
      videoStyle: {
        width: 0,
        height: 0,
      },
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
</style>
