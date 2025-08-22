<template>
  <view class="ad-container">
    <!-- 有广告数据时显示轮播图 -->
    <u-swiper
      v-if="hasAds"
      :list="adList"
      key-name="image"
      show-title
      :autoplay="true"
      circular
      height="120"
      @click="handleAdClick"
    ></u-swiper>
    <!-- 没有广告数据时显示默认内容 -->
    <view v-else class="default-ad-content">
      <image class="logo" src="/static/theater/logo.png" mode="aspectFit" />
      <text class="text">河马剧场</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  adList: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['adClick'])

const hasAds = computed(() => {
  return props.adList && props.adList.length > 0
})

const handleAdClick = (index) => {
  emit('adClick', props.adList[index])
}
</script>

<style lang="scss" scoped>
.ad-container {
  width: 100%;
  height: 120rpx;
  flex-shrink: 0;
  background-color: rgba(0, 0, 0, 0.8);
}

.default-ad-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);

  .logo {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }

  .text {
    font-size: 28rpx;
    color: #fff;
  }
}
</style>
