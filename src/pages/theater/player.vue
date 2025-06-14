<template>
  <view class="player-container">
    <VideoSlider ref="videoSliderRef" :vodList="vodList" :loading="loading" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import VideoSlider from '../../components/VideoSlider.vue'

// 视频列表数据
const vodList = ref([])
const loading = ref(false)
const bookName = ref('')
const videoSliderRef = ref(null)
// onLoad 获取页面参数
onLoad((query) => {
  bookName.value = query.bookName
    ? decodeURIComponent(query.bookName)
    : '未知剧名'
  console.log('bookName.value', bookName.value)

  fetchVodList()
})
// 获取视频列表数据
const fetchVodList = async () => {
  // 如果已经有数据，则不再重复请求
  if (vodList.value.length > 0) return

  loading.value = true
  try {
    const res = await uni.request({
      url: `https://www.iqiyizyapi.com/api.php/provide/vod?ac=videolist&wd=${encodeURIComponent(
        bookName.value
      )}`,
      method: 'GET',
    })
    console.log('res', res)

    if (res.data?.list?.length) {
      // 解析分集
      const vod = res.data.list[0]
      const newEpisodes = vod.vod_play_url.split('#').map((item) => {
        const [title, url] = item.split('$')
        return { title, url }
      })
      console.log('newEpisodes', newEpisodes)

      // 添加到现有列表，避免重复
      if (vodList.value.length === 0) {
        vodList.value = newEpisodes
        // 首次加载数据后，使用nextTick确保DOM已更新，然后尝试播放第一个视频
        setTimeout(() => {
          if (videoSliderRef.value) {
            console.log('调用VideoSlider组件的playFirstVideo方法')
            videoSliderRef.value.playFirstVideo()
          }
        }, 500)
      }
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取视频列表
onMounted(() => {
  // onLoad已经处理了数据加载，这里可以添加其他初始化逻辑
})
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}
</style>
