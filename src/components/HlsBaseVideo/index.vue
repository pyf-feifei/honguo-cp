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

      <!-- 播放时的暂停提示，点击后显示 -->
      <view
        class="play-overlay"
        v-if="isPlaying && showPlayOverlay"
        @click.stop
      >
        <text class="play-overlay-icon">⏸</text>
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
      duration: 0,
      currentTime: 0,
      buffered: 0,
      isDragging: false,
      wasPlayingBeforeDrag: false,
      showPlayOverlay: false,
      overlayTimer: null,
    }
  },
  watch: {
    isPlay(newVal, oldVal) {
      if (this.isDragging) return
      // 添加一个延迟，以避免快速切换导致的播放中断
      setTimeout(() => {
        if (newVal) {
          this.play()
        } else {
          this.pause()
        }
      }, 50)
    },
    'item.url'(newUrl) {
      if (newUrl) {
        this.isLoading = true
      }
    },
  },
  mounted() {
    this.posterUrl = this.item.poster || ''
    if (this.isPlay) {
      this.play()
    }
  },
  beforeDestroy() {
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer)
    }
  },
  methods: {
    onWrapperClick() {
      if (this.isDragging) return

      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
      this.showOperationFeedback()
    },
    onCanPlay() {
      this.isLoading = false
    },
    showOperationFeedback() {
      if (this.overlayTimer) {
        clearTimeout(this.overlayTimer)
      }

      if (this.isPlaying) {
        this.showPlayOverlay = true
        this.overlayTimer = setTimeout(() => {
          this.showPlayOverlay = false
        }, 300)
      } else {
        this.showPlayOverlay = false
      }
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
      if (e && e.buffered !== undefined) {
        this.buffered = Number(e.buffered)
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
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.play-overlay-icon {
  font-size: 80rpx;
  color: rgba(255, 255, 255, 0.9);
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
</style>
