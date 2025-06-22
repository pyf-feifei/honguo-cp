<template>
  <div class="plyr-container">
    <video ref="videoPlayer" class="plyr-video" playsinline controls>
      <slot></slot>
    </video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import Hls from 'hls.js'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
})

const videoPlayer = ref(null)
let player = null
let hls = null

const defaultOptions = {
  controls: [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    'captions',
    'settings',
    'pip',
    'airplay',
    'fullscreen',
  ],
  ...props.options,
}

const initializePlayer = () => {
  if (!videoPlayer.value) {
    return
  }

  const videoElement = videoPlayer.value
  const source = props.src

  if (Hls.isSupported() && source.endsWith('.m3u8')) {
    hls = new Hls()
    hls.loadSource(source)
    hls.attachMedia(videoElement)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      player = new Plyr(videoElement, defaultOptions)
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.error('HLS.js fatal error:', data)
      }
    })
  } else {
    videoElement.src = source
    player = new Plyr(videoElement, defaultOptions)
  }
}

const destroyPlayer = () => {
  if (player) {
    player.destroy()
    player = null
  }
  if (hls) {
    hls.destroy()
    hls = null
  }
}

onMounted(() => {
  initializePlayer()
})

onBeforeUnmount(() => {
  destroyPlayer()
})

watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (newSrc !== oldSrc) {
      destroyPlayer()
      // Use nextTick to ensure the old player is destroyed before creating a new one
      nextTick(() => {
        initializePlayer()
      })
    }
  }
)

const play = () => player?.play()
const pause = () => player?.pause()
const seek = (time) => player?.seek(time)
const stop = () => player?.stop()

defineExpose({
  play,
  pause,
  seek,
  stop,
})
</script>

<style scoped>
.plyr-container {
  width: 100%;
}
.plyr-video {
  width: 100%;
}
</style>
