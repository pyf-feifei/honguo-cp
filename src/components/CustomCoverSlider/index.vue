<template>
  <cover-view
    class="custom-cover-slider"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <cover-view class="slider-rail">
      <cover-view
        class="slider-buffered"
        :style="{ width: bufferedPercent + '%' }"
      ></cover-view>
      <cover-view
        class="slider-progress"
        :style="{ width: progressPercent + '%' }"
      ></cover-view>
    </cover-view>
    <cover-view
      class="slider-thumb"
      :style="{ left: progressPercent + '%' }"
    ></cover-view>
  </cover-view>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  value: { type: Number, default: 0 },
  buffered: { type: Number, default: 0 },
})

const emit = defineEmits(['change', 'changing', 'dragstart'])

const { proxy } = getCurrentInstance()
const sliderRect = ref(null)
const isDragging = ref(false)

const progressPercent = computed(() => {
  if (props.max <= props.min) return 0
  const percent = ((props.value - props.min) / (props.max - props.min)) * 100
  return Math.max(0, Math.min(100, percent))
})

const bufferedPercent = computed(() => {
  if (props.max <= props.min) return 0
  const percent = ((props.buffered - props.min) / (props.max - props.min)) * 100
  return Math.max(0, Math.min(100, percent))
})

const getSliderRect = () => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(proxy)
    query
      .select('.custom-cover-slider')
      .boundingClientRect((data) => {
        if (data) {
          sliderRect.value = data
        }
        resolve(data)
      })
      .exec()
  })
}

onMounted(() => {
  getSliderRect()
})

const onTouchStart = (e) => {
  emit('dragstart')
  isDragging.value = true
  handleTouch(e, 'changing')
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  handleTouch(e, 'changing')
}

const onTouchEnd = (e) => {
  if (!isDragging.value) return
  handleTouch(e, 'change')
  isDragging.value = false
}

const handleTouch = (e, eventType) => {
  if (!sliderRect.value) {
    getSliderRect().then(() => {
      if (sliderRect.value) proceed(e, eventType)
    })
  } else {
    proceed(e, eventType)
  }
}

const proceed = (e, eventType) => {
  const touch = e.touches || e.changedTouches
  if (!touch) return

  const touchX = touch.clientX
  const offsetX = touchX - sliderRect.value.left
  const progress = Math.max(0, Math.min(1, offsetX / sliderRect.value.width))
  const newValue = props.min + progress * (props.max - props.min)

  emit(eventType, { value: newValue })
}
</script>

<style lang="scss" scoped>
.custom-cover-slider {
  width: 100%;
  height: 44px; /* Touch area height */
  position: relative;
  display: flex;
  align-items: center;

  .slider-rail {
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    position: relative;
  }

  .slider-buffered {
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
  }

  .slider-progress {
    height: 100%;
    background-color: #fff;
    border-radius: 2px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .slider-thumb {
    width: 16px;
    height: 16px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
}
</style>
