<template>
  <view
    class="slider-container"
    @touchstart.stop="onTouchStart"
    @touchmove.stop="onTouchMove"
    @touchend.stop="onTouchEnd"
  >
    <view
      class="progress-track"
      :class="{ dragging: isDragging }"
      :style="trackStyle"
    >
      <view class="progress-current" :style="progressStyle"></view>
      <view
        class="progress-handle"
        :class="{ dragging: isDragging }"
        :style="handleStyle"
      >
        <view v-if="showValue" class="value-display">
          {{ Math.round(currentValue) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomSlider',
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    activeColor: { type: String, default: '#FFFFFF' },
    backgroundColor: { type: String, default: 'rgba(255, 255, 255, 0.3)' },
    blockSize: { type: Number, default: 20 },
    blockColor: { type: String, default: '#FFFFFF' },
    showValue: { type: Boolean, default: false },
  },
  data() {
    return {
      isDragging: false,
      trackWidth: 0,
      trackLeft: 0,
      currentValue: this.value,
    }
  },
  computed: {
    percentage() {
      if (this.max <= this.min) return 0
      const val = Math.max(this.min, Math.min(this.max, this.currentValue))
      return (val - this.min) / (this.max - this.min)
    },
    progressStyle() {
      const width = this.percentage * 100
      return `width: ${width}%; background-color: ${this.activeColor};`
    },
    trackStyle() {
      return `background-color: ${this.backgroundColor};`
    },
    handleStyle() {
      const handleSize = uni.upx2px(this.blockSize)
      const translateX = this.percentage * this.trackWidth
      // Combine both translations to ensure vertical alignment is not overridden
      return `transform: translateX(${translateX}px) translateY(-50%); background-color: ${
        this.blockColor
      }; width: ${handleSize}px; height: ${handleSize}px; left: -${
        handleSize / 2
      }px;`
    },
  },
  watch: {
    value(newVal) {
      if (!this.isDragging) {
        this.currentValue = newVal
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.getTrackInfo()
      }, 150)
    })
  },
  methods: {
    getTrackInfo() {
      uni
        .createSelectorQuery()
        .in(this)
        .select('.progress-track')
        .boundingClientRect((rect) => {
          if (rect) {
            this.trackWidth = rect.width
            this.trackLeft = rect.left
          }
        })
        .exec()
    },
    onTouchStart(e) {
      if (this.disabled) return
      this.getTrackInfo() // Recalculate on touch start in case of layout changes
      this.isDragging = true
      this.updateValueFromTouch(e)
    },
    onTouchMove(e) {
      if (!this.isDragging || this.disabled) return
      e.preventDefault()
      this.updateValueFromTouch(e)
    },
    onTouchEnd(e) {
      if (!this.isDragging || this.disabled) return
      this.isDragging = false
      this.$emit('change', { value: this.currentValue })
    },
    updateValueFromTouch(e) {
      if (this.trackWidth === 0) return

      const x = e.touches[0].pageX - this.trackLeft
      let progress = x / this.trackWidth
      progress = Math.max(0, Math.min(1, progress))

      let newValue = this.min + progress * (this.max - this.min)

      if (this.step > 0) {
        const steps = Math.round((newValue - this.min) / this.step)
        newValue = this.min + steps * this.step
      }

      newValue = Math.max(this.min, Math.min(this.max, newValue))

      if (this.currentValue !== newValue) {
        this.currentValue = newValue
        this.$emit('changing', { value: newValue })
      }
    },
  },
}
</script>

<style scoped>
.slider-container {
  width: 100%;
  height: 40rpx; /* Increased touch area */
  display: flex;
  align-items: center;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 6rpx;
  border-radius: 3rpx;
  transition: height 0.2s;
}

.progress-track.dragging {
  height: 10rpx;
  border-radius: 5rpx;
}

.progress-current {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  border-radius: 3rpx;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  left: 0;
  /* transform is now handled by inline style */
  border-radius: 50%;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  z-index: 2;
  transition: transform 0.2s ease; /* Keep a smoother transition for dragging */
}

.progress-handle.dragging {
  transform: scale(1.2) translateY(-50%); /* Adjust for scale */
}

.value-display {
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 10;
}
</style>
