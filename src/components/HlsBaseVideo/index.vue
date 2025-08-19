<template>
  <view
    class="video-wrapper"
    @click="onWrapperClick"
    :style="{
      width: videoStyle.width + 'px',
      height: videoStyle.height + 'px',
    }"
  >
    <HLSVideoPlayer
      ref="hlsPlayer"
      :src="item.url"
      :autoplay="isPlay"
      :controls="false"
      :muted="false"
      object-fit="contain"
      :poster="posterUrl"
      :playbackRate="currentSpeed"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onError"
      @timeupdate="onTimeUpdate"
      @canplay="onCanPlay"
      @progress="onProgress"
      class="video-player"
      :style="{
        width: videoStyle.width + 'px',
        height: videoStyle.height + 'px',
      }"
    />

    <!-- 倍速切换按钮 -->
    <view class="speed-picker" @click.stop="showSpeedSheet">
      <view class="speed-selector">
        <text class="speed-text">{{ currentSpeed }}x</text>
        <text class="speed-arrow">▼</text>
      </view>
    </view>
    
    <!-- 倍速选择弹窗 -->
    <u-popup
      :show="speedSheetShow"
      @close="closeSpeedSheet"
      mode="bottom"
      :round="20"
      :closeOnClickOverlay="true"
      :safeAreaInsetBottom="false"
    >
      <view class="speed-popup">
        <view class="speed-popup-title">播放速度</view>
        <view class="speed-options">
          <view
            v-for="(speed, index) in speedOptions"
            :key="index"
            class="speed-option"
            :class="{ 'speed-option-active': currentSpeed === speed }"
            @click="selectSpeed(speed)"
          >
            <text class="speed-option-text" :class="{ 'speed-option-text-active': currentSpeed === speed }">
              {{ speed }}x
            </text>
            <view v-if="currentSpeed === speed" class="speed-check">✓</view>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- Custom Controls -->
    <view class="controls-overlay" @click.stop="onWrapperClick">
      <view class="loading-view" v-if="isLoading" @click.stop="onWrapperClick">
        <text class="loading-text">加载中...</text>
      </view>

      <view
        class="pause-icon-view"
        v-if="!isPlaying && !isLoading"
        @click.stop="onWrapperClick"
      >
        <text class="pause-icon">▶</text>
      </view>

      <view class="bottom-controls" @click.stop>
        <CustomSlider
          class="custom-slider-full"
          :min="0"
          :max="duration"
          :value="currentTime"
          :buffered="buffered"
          :step="1"
          :disabled="false"
          activeColor="#ffffff"
          backgroundColor="rgba(255,255,255,0.3)"
          :blockSize="20"
          blockColor="#ffffff"
          :showValue="false"
          @changing="onSliderChanging"
          @change="onSliderChange"
        />
      </view>
    </view>
  </view>
</template>

<script>
import HLSVideoPlayer from '../HLSVideoPlayer/index.vue'
import CustomSlider from '../CustomSlider/index.vue'

export default {
  name: 'HlsBaseVideo',
  components: {
    HLSVideoPlayer,
    CustomSlider,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isPlay: {
      type: Boolean,
      default: false,
    },
    videoStyle: {
      type: Object,
      required: true,
    },
    loop: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isPlaying: false,
      isLoading: true,
      posterUrl: '',
      currentSpeed: 1,
      speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 2],
      currentSpeedIndex: 2, // 默认 1x 速度
      speedSheetShow: false,
      isClosingSpeedSheet: false,
      duration: 0,
      currentTime: 0,
      buffered: [],
      isDragging: false,
      wasPlayingBeforeDrag: false,
    }
  },
  watch: {
    isPlay(newVal) {
      if (this.isDragging) return
      if (newVal) {
        this.play()
      } else {
        this.pause()
      }
    },
    'item.url'(newUrl) {
      if (newUrl) {
        this.isLoading = true
        // 重置播放状态
        this.currentTime = 0
        this.duration = 0
        this.buffered = []
      }
    },
  },
  mounted() {
    this.posterUrl = this.item.poster || ''
    if (this.isPlay) {
      this.play()
    }
  },
  methods: {
    onWrapperClick() {
      if (this.isDragging) return
      if (this.isClosingSpeedSheet) return

      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },
    onCanPlay() {
      this.isLoading = false
    },
    play() {
      if (this.$refs.hlsPlayer) {
        this.$refs.hlsPlayer.play()
      }
    },
    pause() {
      this.$refs.hlsPlayer?.pause()
    },
    onPlay() {
      this.isPlaying = true
      this.isLoading = false
    },
    onPause() {
      this.isPlaying = false
    },
    onEnded() {
      this.isPlaying = false
      if (this.loop) {
        this.$refs.hlsPlayer?.toSeek(0)
        this.play()
      }
      this.$emit('ended')
    },
    onError(e) {
      this.isLoading = false
      this.$emit('error', {
        videoId: this.item.id,
        originalEvent: e,
      })
    },
    onTimeUpdate(e) {
      if (this.isDragging) return
      const { currentTime, duration } = e

      this.isLoading = false
      this.isPlaying = true
      this.currentTime = Number(currentTime)
      if (duration && !isNaN(duration) && duration > 0) {
        this.duration = Number(duration)
      }
    },
    onProgress(e) {
      if (e && Array.isArray(e.buffered)) {
        this.buffered = e.buffered
      }
    },
    onSliderChanging(e) {
      if (!this.isDragging) {
        this.isDragging = true
        this.wasPlayingBeforeDrag = this.isPlaying
        if (this.isPlaying) {
          this.pause()
        }
      }
      this.currentTime = e.value
    },
    onSliderChange(e) {
      const newValue = e.value !== undefined ? e.value : e.detail?.value
      this.currentTime = newValue

      this.$refs.hlsPlayer?.toSeek(this.currentTime)

      if (this.wasPlayingBeforeDrag) {
        setTimeout(() => {
          this.play()
        }, 100)
      }

      setTimeout(() => {
        this.isDragging = false
      }, 100)
    },
    showSpeedSheet() {
      this.isClosingSpeedSheet = false
      this.speedSheetShow = true
    },
    closeSpeedSheet() {
      this.isClosingSpeedSheet = true
      this.speedSheetShow = false
      // 延迟重置标志，防止关闭弹窗时触发播放/暂停
      setTimeout(() => {
        this.isClosingSpeedSheet = false
      }, 300)
    },
    selectSpeed(speed) {
      this.currentSpeed = speed
      this.isClosingSpeedSheet = true
      this.speedSheetShow = false
      
      // 更新当前速度索引
      const index = this.speedOptions.indexOf(speed)
      if (index !== -1) {
        this.currentSpeedIndex = index
      }
      
      uni.showToast({
        title: `倍速: ${speed}x`,
        icon: 'none',
        duration: 1000
      })
      
      // 延迟重置标志
      setTimeout(() => {
        this.isClosingSpeedSheet = false
      }, 300)
    },
  },
}
</script>

<style scoped>
.video-wrapper {
  flex: 1;
  position: relative;
  background-color: #000;
}
.video-player {
  width: 100%;
  height: 100%;
}
.controls-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.loading-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading-text {
  color: #fff;
  font-size: 28rpx;
}
.pause-icon-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pause-icon {
  font-size: 100rpx;
  color: rgba(255, 255, 255, 0.8);
}
.bottom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding-left: 20rpx;
  padding-right: 20rpx;
  flex-direction: row;
}
.custom-slider-full {
  width: 100%;
  flex: 1;
}

.speed-picker {
  position: absolute;
  top: 100rpx;
  right: 40rpx;
  z-index: 10;
}

.speed-selector {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 12rpx 24rpx;
  border-radius: 25rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.speed-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
  margin-right: 8rpx;
}

.speed-arrow {
  color: #ffffff;
  font-size: 16rpx;
}

/* 倍速弹窗样式 */
.speed-popup {
  background-color: #ffffff;
  padding: 30rpx 0;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}

.speed-popup-title {
  text-align: center;
  color: #333333;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 30rpx;
  padding: 0 40rpx;
}

.speed-options {
  max-height: 600rpx;
}

.speed-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 50rpx;
  position: relative;
}

.speed-option:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.speed-option-active {
  background-color: rgba(0, 0, 0, 0.02);
}

.speed-option-text {
  color: #666666;
  font-size: 30rpx;
}

.speed-option-text-active {
  color: #333333;
  font-weight: 500;
}

.speed-check {
  color: #007aff;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
