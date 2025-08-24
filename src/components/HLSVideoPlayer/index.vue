<!-- eslint-disable -->
<template>
  <view class="player-container">
    <view
      class="player-wrapper"
      :id="videoWrapperId"
      :randomNum="randomNum"
      :change:randomNum="hlsVideoPlayer.randomNumChange"
      :viewportProps="viewportProps"
      :change:viewportProps="hlsVideoPlayer.viewportChange"
      :videoSrc="videoSrc"
      :change:videoSrc="hlsVideoPlayer.initVideoPlayer"
      :command="eventCommand"
      :change:command="hlsVideoPlayer.triggerCommand"
      :func="renderFunc"
      :change:func="hlsVideoPlayer.triggerFunc"
    />
    <LoadingSpinner :visible="isLoading" :text="loadingText" size="medium" />
  </view>
</template>

<script>
import LoadingSpinner from '../LoadingSpinner/index.vue'

export default {
  components: {
    LoadingSpinner,
  },
  props: {
    src: {
      type: String,
      default: '',
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    controls: {
      type: Boolean,
      default: false,
    },
    objectFit: {
      type: String,
      default: 'contain',
    },
    muted: {
      type: Boolean,
      default: false,
    },
    playbackRate: {
      type: Number,
      default: 1,
    },
    poster: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      randomNum: Math.floor(Math.random() * 100000000),
      videoSrc: '',
      // 父组件向子组件传递的事件指令（video的原生事件）
      eventCommand: null,
      // 父组件传递过来的，对 renderjs 层的函数执行（对视频控制的自定义事件）
      renderFunc: {
        name: null,
        params: null,
      },
      // 提供给父组件进行获取的视频属性
      currentTime: 0,
      duration: 0,
      playing: false,
      buffered: 0,
      // 加载状态
      isLoading: false,
      loadingText: '加载中...',
    }
  },
  watch: {
    // 监听视频资源地址更新
    src: {
      handler(val) {
        if (!val) return
        this.isLoading = true
        this.loadingText = '正在加载视频...'
        setTimeout(() => {
          this.videoSrc = val
        }, 0)
      },
      immediate: true,
    },
  },
  computed: {
    videoWrapperId() {
      return `video-wrapper-${this.randomNum}`
    },
    // 聚合视图层的所有数据变化，传给renderjs的渲染层
    viewportProps() {
      return {
        autoplay: this.autoplay,
        muted: this.muted,
        controls: this.controls,
        objectFit: this.objectFit,
        poster: this.poster,
        playbackRate: this.playbackRate,
      }
    },
  },
  // 方法
  methods: {
    // 传递事件指令给父组件
    eventEmit({ event, data }) {
      // 处理加载状态
      switch (event) {
        case 'waiting':
        case 'stalled':
          this.isLoading = true
          this.loadingText = '缓冲中...'
          break
        case 'canplay':
        case 'playing':
        case 'canplaythrough':
          this.isLoading = false
          break
        case 'loadstart':
          this.isLoading = true
          this.loadingText = '正在加载...'
          break
        case 'error':
          this.isLoading = false
          break
      }
      this.$emit(event, data)
    },
    // 修改view视图层的data数据
    setViewData({ key, value }) {
      key && this.$set(this, key, value)
    },
    // 重置事件指令
    resetEventCommand() {
      this.eventCommand = null
    },
    // 播放指令
    play() {
      this.eventCommand = 'play'
    },
    // 暂停指令
    pause() {
      this.eventCommand = 'pause'
    },
    // 重置自定义函数指令
    resetFunc() {
      this.renderFunc = {
        name: null,
        params: null,
      }
    },
    // 自定义事件 - 移除视频
    remove(params) {
      this.renderFunc = {
        name: 'removeHandler',
        params,
      }
    },
    // 自定义事件 - 全屏
    fullScreen(params) {
      this.renderFunc = {
        name: 'fullScreenHandler',
        params,
      }
    },
    // 跳转到指定时间点
    toSeek(time) {
      this.renderFunc = {
        name: 'toSeekHandler',
        params: time,
      }
    },
    // 启用广告过滤器
    enableAdFilter() {
      this.renderFunc = {
        name: 'enableAdFilterHandler',
        params: null,
      }
    },
    // 禁用广告过滤器
    disableAdFilter() {
      this.renderFunc = {
        name: 'disableAdFilterHandler',
        params: null,
      }
    },
  },
}
</script>

<script module="hlsVideoPlayer" lang="renderjs">
import hlsjs from 'hls.js'
import { AdRemoverLoader } from './hls-ad-remover-fixed.js'
const PLAYER_ID = 'HLS_VIDEO_PLAYER'

export default {
  data() {
    return {
      num: '',
      videoEl: null,
      renderProps: {}
    }
  },
  computed: {
    playerId() {
      return `${PLAYER_ID}_${this.num}`
    },
    wrapperId() {
      return `video-wrapper-${this.num}`
    }
  },
  methods: {
    isApple() {
      const ua = navigator.userAgent.toLowerCase()
      return ua.indexOf('iphone') !== -1 || ua.indexOf('ipad') !== -1
    },
    async initVideoPlayer(src) {
      await this.$nextTick()
      if (!src) return
      if (this.videoEl) {
        // 切换视频源
        this.videoEl.src = src
        return
      }

      const videoEl = document.createElement('video')
      this.videoEl = videoEl
      // 开始监听视频相关事件
      this.listenVideoEvent()

      const { autoplay, muted, controls, playbackRate, objectFit, poster } = this.renderProps
      videoEl.src = src
      videoEl.autoplay = autoplay
      videoEl.controls = controls
      videoEl.muted = muted
      videoEl.playbackRate = playbackRate
      videoEl.id = this.playerId
      videoEl.setAttribute('x5-video-player-type', 'h5')
      videoEl.setAttribute('preload', 'none')
      videoEl.setAttribute('playsinline', true)
      videoEl.setAttribute('webkit-playsinline', true)
      videoEl.setAttribute('x5-playsinline', true)
      videoEl.setAttribute('crossorigin', 'anonymous')
      videoEl.setAttribute('controlslist', 'nodownload')
      videoEl.setAttribute('disablePictureInPicture', true)
      videoEl.setAttribute('x5-video-orientation', 'portrait')
      videoEl.setAttribute('show-play-btn', 'false')
      videoEl.setAttribute('x5-show-center-play-btn', 'false')
      videoEl.style.visibility = 'hidden'
      videoEl.style.objectFit = objectFit
      poster && (videoEl.poster = poster)
      videoEl.style.width = '100%'
      videoEl.style.height = '100%'
      // 插入视频元素
      document.getElementById(this.wrapperId).appendChild(videoEl)

      // 添加loadeddata事件监听器，在视频数据加载完成后显示视频元素
      const loadedDataHandler = () => {
        // 延迟显示视频元素，确保默认播放图标不会显示
        setTimeout(() => {
          videoEl.style.visibility = 'visible'
        }, 100)
      }

      videoEl.addEventListener('loadeddata', loadedDataHandler, { once: true })

      if (!this.isApple()) {
        this.initHlsPlayer(src)
      }
    },
    // 播放视频流
    initHlsPlayer(src) {
      this.hlsPlayer = new hlsjs({
        // 优化配置减少卡顿
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        backBufferLength: 90,
        // 集成广告过滤器
        pLoader: AdRemoverLoader
      })
      this.hlsPlayer.loadSource(src)
      this.hlsPlayer.attachMedia(this.videoEl)

      this.hlsPlayer.on(hlsjs.Events.MANIFEST_PARSED, () => {
        // hls 视频流加载完成
        this.$ownerInstance.callMethod('eventEmit', { event: 'hlsManifestParsed' })
      })

      this.hlsPlayer.on(hlsjs.Events.ERROR, (event, data) => {
        // hls 视频加载错误
        this.$ownerInstance.callMethod('eventEmit', { event: 'hlsError', data })
      })

    },
    // 监听视频相关事件
    listenVideoEvent() {
      // 播放事件监听
      const playHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'play' })
        this.$ownerInstance.callMethod('setViewData', {
          key: 'playing',
          value: true
        })
      }
      this.videoEl.removeEventListener('play', playHandler)
      this.videoEl.addEventListener('play', playHandler)

      // 暂停事件监听
      const pauseHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'pause' })
        this.$ownerInstance.callMethod('setViewData', {
          key: 'playing',
          value: false
        })
      }
      this.videoEl.removeEventListener('pause', pauseHandler)
      this.videoEl.addEventListener('pause', pauseHandler)

      // 结束事件监听
      const endedHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'ended' })
        this.$ownerInstance.callMethod('resetEventCommand')
      }
      this.videoEl.removeEventListener('ended', endedHandler)
      this.videoEl.addEventListener('ended', endedHandler)

      // 加载完成事件监听
      const canPlayHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'canplay' })
      }
      this.videoEl.removeEventListener('canplay', canPlayHandler)
      this.videoEl.addEventListener('canplay', canPlayHandler)

      // 加载失败事件监听
      const errorHandler = (e) => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'error' })
      }
      this.videoEl.removeEventListener('error', errorHandler)
      this.videoEl.addEventListener('error', errorHandler)

      // 等待数据事件监听（缓冲中）
      const waitingHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'waiting' })
      }
      this.videoEl.removeEventListener('waiting', waitingHandler)
      this.videoEl.addEventListener('waiting', waitingHandler)

      // 加载停滞事件监听
      const stalledHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'stalled' })
      }
      this.videoEl.removeEventListener('stalled', stalledHandler)
      this.videoEl.addEventListener('stalled', stalledHandler)

      // 开始加载事件监听
      const loadstartHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'loadstart' })
      }
      this.videoEl.removeEventListener('loadstart', loadstartHandler)
      this.videoEl.addEventListener('loadstart', loadstartHandler)

      // 可以播放完整视频事件监听
      const canPlayThroughHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'canplaythrough' })
      }
      this.videoEl.removeEventListener('canplaythrough', canPlayThroughHandler)
      this.videoEl.addEventListener('canplaythrough', canPlayThroughHandler)

      // loadedmetadata 事件监听
      const loadedMetadataHandler = () => {
        this.$ownerInstance.callMethod('eventEmit', { event: 'loadedmetadata' })
        // 获取视频的长度
        const duration = this.videoEl.duration
        this.$ownerInstance.callMethod('eventEmit', {
          event: 'durationchange',
          data: duration
        })

        this.$ownerInstance.callMethod('setViewData', {
          key: 'duration',
          value: duration
        })
      }
      this.videoEl.removeEventListener('loadedmetadata', loadedMetadataHandler)
      this.videoEl.addEventListener('loadedmetadata', loadedMetadataHandler)

      // 播放进度监听
      const timeupdateHandler = (e) => {
        const currentTime = e.target.currentTime
        const duration = e.target.duration
        this.$ownerInstance.callMethod('eventEmit', {
          event: 'timeupdate',
          data: {
            currentTime,
            duration
          }
        })

        this.$ownerInstance.callMethod('setViewData', {
          key: 'currentTime',
          value: currentTime
        })
        this.$ownerInstance.callMethod('setViewData', {
          key: 'duration',
          value: duration
        })
      }
      this.videoEl.removeEventListener('timeupdate', timeupdateHandler)
      this.videoEl.addEventListener('timeupdate', timeupdateHandler)

      // 缓冲进度监听
      const progressHandler = () => {
        const bufferedRanges = []
        if (this.videoEl && this.videoEl.buffered) {
          for (let i = 0; i < this.videoEl.buffered.length; i++) {
            bufferedRanges.push({
              start: this.videoEl.buffered.start(i),
              end: this.videoEl.buffered.end(i),
            })
          }
        }

        this.$ownerInstance.callMethod('eventEmit', {
          event: 'progress',
          data: {
            buffered: bufferedRanges,
            duration: this.videoEl.duration,
          },
        })
        this.$ownerInstance.callMethod('setViewData', {
          key: 'buffered',
          value: bufferedRanges,
        })
      }
      this.videoEl.removeEventListener('progress', progressHandler)
      this.videoEl.addEventListener('progress', progressHandler)

      // 倍速播放监听
      const ratechangeHandler = (e) => {
        const playbackRate = e.target.playbackRate
        this.$ownerInstance.callMethod('eventEmit', {
          event: 'ratechange',
          data: playbackRate
        })
      }
      this.videoEl.removeEventListener('ratechange', ratechangeHandler)
      this.videoEl.addEventListener('ratechange', ratechangeHandler)

      // 全屏事件监听
      if (this.isApple()) {
        const webkitbeginfullscreenHandler = () => {
          const presentationMode = this.videoEl.webkitPresentationMode
          let isFullScreen = null
          if (presentationMode === 'fullscreen') {
            isFullScreen = true
          } else {
            isFullScreen = false
          }
          this.$ownerInstance.callMethod('eventEmit', {
            event: 'fullscreenchange',
            data: isFullScreen
          })
        }
        this.videoEl.removeEventListener('webkitpresentationmodechanged', webkitbeginfullscreenHandler)
        this.videoEl.addEventListener('webkitpresentationmodechanged', webkitbeginfullscreenHandler)
      } else {
        const fullscreenchangeHandler = () => {
          let isFullScreen = null
          if (document.fullscreenElement) {
            isFullScreen = true
          } else {
            isFullScreen = false
          }
          this.$ownerInstance.callMethod('eventEmit', {
            event: 'fullscreenchange',
            data: isFullScreen
          })
        }
        document.removeEventListener('fullscreenchange', fullscreenchangeHandler)
        document.addEventListener('fullscreenchange', fullscreenchangeHandler)
      }
    },
    triggerCommand(eventType) {
      if (eventType) {
        this.$ownerInstance.callMethod('resetEventCommand')
        this.videoEl && this.videoEl[eventType]()
      }
    },
    triggerFunc(func) {
      const { name, params } = func || {}
      if (name) {
        this[name](params)
        this.$ownerInstance.callMethod('resetFunc')
      }
    },
    removeHandler() {
      if (this.videoEl) {
        this.videoEl.pause()
        this.videoEl.src = ''
        this.$ownerInstance.callMethod('setViewData', {
          key: 'videoSrc',
          value: ''
        })
        this.videoEl.load()
      }
    },
    fullScreenHandler() {
      if (this.isApple()) {
        this.videoEl.webkitEnterFullscreen()
      } else {
        this.videoEl.requestFullscreen()
      }
    },
    toSeekHandler(time) {
      if (this.videoEl) {
        this.videoEl.currentTime = time
      }
    },
    enableAdFilterHandler() {
      if (this.hlsPlayer && this.hlsPlayer.config && this.hlsPlayer.config.pLoader) {
        this.hlsPlayer.config.pLoader.prototype.enable && this.hlsPlayer.config.pLoader.prototype.enable()
      }
    },
    disableAdFilterHandler() {
      if (this.hlsPlayer && this.hlsPlayer.config && this.hlsPlayer.config.pLoader) {
        this.hlsPlayer.config.pLoader.prototype.disable && this.hlsPlayer.config.pLoader.prototype.disable()
      }
    },
    viewportChange(props) {
      this.renderProps = props
      const { autoplay, muted, controls, playbackRate } = props
      if (this.videoEl) {
        this.videoEl.autoplay = autoplay
        this.videoEl.controls = controls
        this.videoEl.muted = muted
        this.videoEl.playbackRate = playbackRate
      }
    },
    randomNumChange(val) {
      this.num = val
    }
  }
}
</script>

<style scoped>
.player-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.player-wrapper {
  overflow: hidden;
  height: 100%;
  padding: 0;
}

/* 隐藏视频元素的默认播放按钮 */
.player-wrapper video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

/* 隐藏视频控件面板 */
.player-wrapper video::-webkit-media-controls {
  display: none !important;
}

/* 隐藏视频播放按钮 */
.player-wrapper video::-webkit-media-controls-play-button {
  display: none !important;
}

/* 隐藏视频全屏按钮 */
.player-wrapper video::-webkit-media-controls-fullscreen-button {
  display: none !important;
}

/* 隐藏视频时间线 */
.player-wrapper video::-webkit-media-controls-timeline {
  display: none !important;
}

/* 隐藏视频音量控制 */
.player-wrapper video::-webkit-media-controls-volume-slider {
  display: none !important;
}

/* 隐藏视频静音按钮 */
.player-wrapper video::-webkit-media-controls-mute-button {
  display: none !important;
}

/* 隐藏视频中心播放按钮 */
.player-wrapper video::-internal-media-controls-overlay-cast-button {
  display: none !important;
}

/* 隐藏视频海报图像 */
.player-wrapper video::poster {
  display: none !important;
}

/* 设置视频背景为透明 */
.player-wrapper video {
  background: transparent !important;
}
</style>
