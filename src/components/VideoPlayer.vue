<template>
  <view class="video-player-container">
    <!-- H5端 -->
    <template v-if="platform === 'h5'">
      <PlarPlayer ref="plarPlayerRef" :src="src" v-bind="attrs">
        <slot></slot>
      </PlarPlayer>
    </template>

    <!-- APP端 -->
    <template v-else-if="platform === 'app-plus'">
      <video :id="videoId" :src="src" v-bind="attrs" class="video-player">
        <slot></slot>
      </video>
    </template>

    <!-- 微信小程序端 -->
    <template v-else-if="platform === 'mp-weixin'">
      <video :id="videoId" :src="src" v-bind="attrs" class="video-player">
        <slot></slot>
      </video>
    </template>

    <!-- 其他平台 -->
    <template v-else>
      <video :id="videoId" :src="src" v-bind="attrs" class="video-player">
        <slot></slot>
      </video>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, useAttrs } from 'vue'
import PlarPlayer from '@/components/PlarPlayer/inxdx.vue'

// 获取所有传入的属性
const attrs = useAttrs()

// 只定义必要的props
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    default: 'videoPlayer',
  },
})

// 视频上下文
const videoContext = ref(null)
const plarPlayerRef = ref(null)

// 获取当前平台
const platform = computed(() => {
  // #ifdef H5
  return 'h5'
  // #endif

  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif

  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif

  // 默认返回通用平台
  return 'unknown'
})

// 初始化视频上下文
onMounted(() => {
  if (platform.value === 'h5') {
    // H5端使用组件引用
    videoContext.value = plarPlayerRef.value
  } else {
    // 其他平台使用uni API
    videoContext.value = uni.createVideoContext(props.videoId)
  }
})

// 视频方法
const play = () => {
  if (platform.value === 'h5' && videoContext.value) {
    videoContext.value.play()
  } else if (videoContext.value) {
    videoContext.value.play()
  }
}

const pause = () => {
  if (platform.value === 'h5' && videoContext.value) {
    videoContext.value.pause()
  } else if (videoContext.value) {
    videoContext.value.pause()
  }
}

const seek = (position) => {
  if (videoContext.value) {
    videoContext.value.seek(position)
  }
}

const stop = () => {
  if (videoContext.value) {
    videoContext.value.stop()
  }
}

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  seek,
  stop,
  videoContext,
})
</script>

<style lang="scss" scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  .video-player {
    width: 100%;
    height: 100%;
    background: #000;
    object-fit: contain;
    position: relative;
  }
}
</style>
