// 添加HLS.js支持
import Hls from 'hls.js'

// 检查HLS.js是否可用
const hlsSupported = Hls && Hls.isSupported()

// 检测是否为HLS视频格式
function isHLSVideo(url) {
  return url && (url.includes('.m3u8') || url.toLowerCase().includes('m3u8'))
}

// 检测浏览器是否原生支持HLS
function nativeHLSSupport() {
  const video = document.createElement('video')
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

/* 
 lodData 上拉加载回调
 refreshData 下拉加载回调
 */
export default {
  props: {
    /* 是否开启下拉刷新 */
    loadOpen: {
      type: Boolean,
      default: true,
    },
    /* tabBar栏 0系统tabBar栏 1自定义tabBar栏 */
    tabBarShow: {
      type: Number,
      default: 0,
    },
    /* 自定义底部栏的高度 */
    tabBarHeight: {
      type: Number,
      default: 50,
    },
    /* 进度条离底部的距离 px*/
    speedBottom: {
      type: Number,
      default: 0,
    },
    /* 初始加载完成是否自动播放 */
    autoplay: {
      type: Boolean,
      default: true,
    },
    /* 是否循环播放 */
    loopPlay: {
      type: Boolean,
      default: true,
    },
    /* 是否开启自动播放 */
    nextPlay: {
      type: Boolean,
      default: false,
    },
    /* 视频总数量，有值才能滑动加载到最后一个视频 */
    totalvod: {
      type: Number,
      default: 0,
    },
    /* 是否开启双击点赞 */
    doubleOpen: {
      type: Boolean,
      default: true,
    },
    /* 双击点赞屏幕是否显示桃心 */
    doubleHeart: {
      type: Boolean,
      default: true,
    },
    /* 多个tab视频时需传入不同的类型 */
    swId: {
      type: String,
      default: '',
    },
    /* 是否有显示 statusBarHeight 状态栏适配 */
    showBarHeight: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      videoStyle: {},
      screenWidth: 0, //屏幕的宽度
      screenHeight: 0, //屏幕的高度
      videoCtx: null,
      vodIndex: 0, // 当前视频下标
      currentIndex: 0, //定位播放的下标
      contentShow: false,
      loadShow: false,
      autoplayVideo: true, // 初始加载完成是否自动播放
      //当前播放的视频数组
      vodList: [
        /* {
					vodUrl:"https://outin-9cc4a7aedd2a11eaabb800163e1a65b6.oss-cn-shanghai.aliyuncs.com/customerTrans/43121ec9955a1ce95146d379f15ea9bd/566eafe2-17b52f0f17b-0007-0f29-cc2-eb217.mp4",
					coverImg:'/static/image/cover1.jpg', //视频封面
					coverShow:false, //是否显示视频封面，vue 小程序端不播放会显示视频，可以不用显示封面，App不播放不会显示视频，就需要封面了
					vodPaly:true, //是否播放、暂停视频
					vodShow:true, //是否显示视频
					object_fit:'contain', //视频的显示类型
					pauseShow:false, //是否显示暂停图标
					loadingShow:false, //是否显示loading加载动画
					fabulousShow:false,//是否点赞
					followReally:false, //是否关注
					sliderShow:true, //是否显示进度条
					rotateImgShow:true, //是否显示旋转头像
				} */
      ],
      totalPlayList: [],
      finalList: [],
      changeIndex: 0, //current 下标
      beforeVodInfo: {}, //当前播放视频对象
      vodCurIndex: 0, //当前播放视频对象下标
      circular: true,
      durationNum: 300,
      openSpot: false,
      shadeNum: 0,
      bufferTime: null, //缓冲视频显示加载动画防抖
      sliderProgress: 0, //进度条滑动层宽度
      sliderTime: 0, //显示滑动进度条时变化的时间
      videoTime: 0, //视频时长 时间
      endTime: 0, //滑动进度条最终的时间
      sliderDrag: false, //是否在拖动进度
      brightSlider: false, //是否显示光亮的进度条
      sliderEndTime: null, //滑动结束隐藏光亮进度条时间延迟
      bufferNum: null, //显示loading加载进度的时间条件
      bufferShow: false, //显示loading加载进度的条件
      playOpen: false, //视频播放失败，是否重播视频的条件
      failTime: null, //视频播放失败，重播视频的时间
      repeatTime: null,
      palyCartoon: false, //是否播放旋转头像
      shakePlay: false, //是否有防抖视频播放
      touchClientY: 0, //触碰的坐标
      touchStartX: 0,
      touchStartY: 0,
      touchStartTime: 0,
      moveClientY: 0, //移动的坐标
      moveOpacity: false, //是否透明
      refreshShow: false, //是否显示下拉刷新
      refreshOpen: false, //下拉刷新的触发条件
      playErrTime: null,
      interceptIndex: [],
      loadTime: null,
      beginLoad: 0,
      loadStart: false,
      muteSetup: false, //是否设置为静音
      manuallyPaused: false,
      lastClickTime: 0, // 上次点击时间，用于防抖
      lastPlaySpotTime: 0, // 上次 playSpot 调用时间，用于防抖
      hlsInstance: null, //HLS播放器实例
      /* 双击点赞部分 */
      lastTapDiffTime: 0, //上次点击时间
      lastTapTimeoutFunc: null, //单击事件事件函数
      likeList: [], //双击点赞显示的桃心数据
      likeId: 1,
      doubleOutTime: null,
      clearDoubleTime: null,
    }
  },
  beforeDestroy() {
    // 清理所有HLS实例
    if (this.hlsInstances && this.hlsInstances.size > 0) {
      // console.log(`清理${this.hlsInstances.size}个HLS实例`)
      this.hlsInstances.forEach((hls, index) => {
        // console.log(`销毁索引${index}的HLS实例`)
        hls.destroy()
      })
      this.hlsInstances.clear()
    }

    // 兼容旧版本的单实例清理
    if (this.hlsInstance) {
      this.hlsInstance.destroy()
      this.hlsInstance = null
    }
  },
  created() {
    // 还原后的代码
    const deviceInfo = uni.getSystemInfoSync()
    let topBarHeight = this.showBarHeight ? deviceInfo.statusBarHeight : 0
    this.videoStyle.statusBarHeight = topBarHeight + 'px'

    // 测试HLS支持
    // this.testHLSSupport()
    this.videoStyle.width = deviceInfo.screenWidth + 'px'
    this.screenWidth = deviceInfo.screenWidth
    this.screenHeight = deviceInfo.screenHeight

    if (this.tabBarShow == 1) {
      this.videoStyle.height =
        deviceInfo.screenHeight - topBarHeight - this.tabBarHeight + 'px'
    } else {
      this.videoStyle.height = deviceInfo.windowHeight - topBarHeight + 'px'
    }
  },
  computed: {
    // 基于当前播放位置的预加载过滤
    filteredVodList() {
      if (!this.vodList || this.vodList.length === 0) {
        return []
      }

      // 过滤出当前播放位置前后2个视频的范围（总共最多5个视频）
      const startIndex = Math.max(0, this.vodIndex - 2)
      const endIndex = Math.min(this.vodList.length - 1, this.vodIndex + 2)

      return this.vodList.filter((item, index) => {
        return index >= startIndex && index <= endIndex
      })
    },

    // 将vodList的vodIndex映射到filteredVodList的索引
    filteredCurrentIndex() {
      if (!this.filteredVodList || this.filteredVodList.length === 0) {
        return 0
      }

      // 在filteredVodList中找到当前播放视频的索引
      const currentVideo = this.vodList[this.vodIndex]
      if (!currentVideo) {
        return 0
      }

      const filteredIndex = this.filteredVodList.findIndex(
        (item) => item.videoIndex === currentVideo.videoIndex
      )

      return filteredIndex >= 0 ? filteredIndex : 0
    },
  },
  watch: {},
  methods: {
    /* 视频切换核心控制器 */
    handleVideoChange(current) {
      // 只对当前预加载范围内的视频进行操作，提高性能
      const startIndex = Math.max(0, current - 2)
      const endIndex = Math.min(this.vodList.length - 1, current + 2)

      for (let index = startIndex; index <= endIndex; index++) {
        if (index === current) {
          // 播放当前视频，但检查是否被手动暂停
          if (!this.manuallyPaused) {
            this.playVideo(index)
          } else {
            // 如果被手动暂停，只设置状态但不播放
            this.vodList[index].vodPaly = false
            this.vodList[index].pauseShow = true
          }
        } else {
          // 暂停非当前视频（不重置进度）
          this.pauseVideo(index)
        }
      }

      // 更新预加载和数据
      this.updateVodList(current)
    },

    /* 播放视频（继续播放，不重置进度） */
    playVideo(index) {
      console.log(`播放视频: ${index}`)
      this.videoPlay(index) // 使用现有的videoPlay逻辑
      this.vodList[index].vodPaly = true
    },

    /* 暂停视频（不重置进度） */
    pauseVideo(index) {
      const videoCtx = uni.createVideoContext(
        'myVideo' + index + this.swId,
        this
      )
      if (videoCtx) {
        videoCtx.pause() // 只暂停，不重置进度
        this.vodList[index].vodPaly = false
      }
    },

    /* 停止并重置视频 */
    stopAndResetVideo(index) {
      const videoCtx = uni.createVideoContext(
        'myVideo' + index + this.swId,
        this
      )
      if (videoCtx) {
        console.log(`停止并重置视频: ${index}`)
        videoCtx.stop() // stop方法会暂停并重置到0
        this.vodList[index].vodPaly = false
      }
    },

    /* 更新视频列表和预加载 */
    updateVodList(current) {
      this.vodIndex = current
      this.vodCurIndex = this.vodList[current].videoIndex
      this.getVodInfo()

      this.$nextTick(() => {
        if (this.circular) {
          this.getVodSliceList()
        }
      })
    },
    /* 初始加载视频 */
    initVod(dataList, index) {
      // 还原后的代码
      this.autoplayVideo = this.autoplay
      if (index) {
        this.durationNum = 0
      }
      let playIndex = index ? index : 0

      // 为每个视频项添加必要的属性
      dataList.filter((item, index) => {
        item.videoIndex = index
        // 初始化时所有视频都设置为未播放状态，等真正开始播放时再设置为true
        item.vodPaly = false
        item.pauseShow = false
        item.loadingShow = false
        item.coverOpacity = item.coverShow ? true : false
      })

      // 按videoIndex排序
      dataList.sort((a, b) => {
        return a.videoIndex - b.videoIndex
      })

      this.totalPlayList = dataList
      this.contentShow = false // Initially hide the content
      this.loadShow = false // 使用基于位置的预加载，不需要底部加载动画
      this.vodCurIndex = playIndex

      let currentNum = 0
      // 使用基于位置的预加载策略，vodList 包含所有数据
      this.vodList = dataList

      setTimeout(() => {
        // 简化逻辑：不再使用3个视频的循环，直接使用所有数据
        this.circular = false // 禁用循环，使用基于位置的过滤

        this.getVodInfo()
        this.vodList.filter((item, index) => {
          if (this.vodCurIndex == item.videoIndex) {
            currentNum = index
          }
        })

        // 移除基于数据长度的预加载逻辑，使用基于位置的过滤

        if (playIndex > 0) {
          // 注释掉错误的赋值，getVodInfo()会正确设置beforeVodInfo
          // this.beforeVodInfo = currentNum
        }
        this.currentIndex = currentNum
        this.vodIndex = currentNum
        this.contentShow = this.totalPlayList.length > 0 ? true : false // Show content after data is ready
      }, 100) // 0x64 = 100

      setTimeout(() => {
        this.durationNum = 300 // 0x12c = 300
        if (this.autoplayVideo) {
          this.handleVideoChange(currentNum)
        } else {
          // 确保beforeVodInfo已经被正确设置后再访问其属性
          if (this.beforeVodInfo && typeof this.beforeVodInfo === 'object') {
            this.beforeVodInfo.vodPaly = false
            // this.beforeVodInfo.pauseShow = true // Bug: This causes the pause icon to show incorrectly
          }
        }
      }, 200) // 0xc8 = 200
    },
    /* 赋值截取的数据 */
    setSliceList(resData) {
      // 还原后的代码
      resData.filter((item) => {
        if (item.videoIndex % 3 == 0) {
          this.vodList[0] = item
        } else if (item.videoIndex % 3 == 1) {
          this.vodList[1] = item
        } else if (item.videoIndex % 3 == 2) {
          this.vodList[2] = item
        }
      })
    },
    /* 到底加载方法 */
    lodingData(dataList) {
      // 还原后的代码
      let num = this.vodList.length
      dataList.filter((item, index) => {
        item.tspId = 'myVideo' + (num + index) + this.swId
        item.vodPaly = false
        item.pauseShow = false
        item.loadingShow = false
        item.coverOpacity = item.coverShow ? true : false
      })
      this.vodList = this.vodList.concat(dataList)
    },
    /* 重新加载 */
    refreshSquare(dataList, index) {
      // 当父组件调用这个方法时，说明数据已经准备好了，可以关闭刷新状态
      let playIndex = index ? index : 0

      // 先停止当前视频播放，避免加载错误
      if (this.vodList.length > 0 && this.vodCurIndex >= 0) {
        const currentVideo = this.vodList[this.vodCurIndex]
        if (currentVideo && currentVideo.tspId) {
          const videoElement = this.$refs[currentVideo.tspId]
          if (videoElement && videoElement[0]) {
            videoElement[0].pause()
          }
        }
      }

      // 清理所有 HLS 实例，避免刷新后的播放错误
      this.cleanupAllHlsInstances()

      this.vodList = []
      this.resetData()

      // 关闭刷新状态，因为父组件已经完成了数据获取
      this.finishRefresh()

      setTimeout(() => {
        this.initVod(dataList, playIndex)
      }, 50)
    },

    /* 清理所有 HLS 实例 */
    cleanupAllHlsInstances() {
      if (this.hlsInstances && this.hlsInstances.size > 0) {
        console.log(`清理 ${this.hlsInstances.size} 个 HLS 实例`)
        this.hlsInstances.forEach((hls, index) => {
          try {
            hls.destroy()
          } catch (error) {
            console.warn(`清理索引 ${index} 的 HLS 实例时出错:`, error)
          }
        })
        this.hlsInstances.clear()
      } else {
        console.log('没有 HLS 实例需要清理')
      }
    },

    /* 完成下拉刷新 */
    finishRefresh() {
      // 模拟原生unirefresh的closeRefresh行为
      console.log(
        '完成刷新: refreshOpen=false, refreshShow=false, moveClientY=0'
      )
      this.refreshShow = false
      this.refreshOpen = false
      this.moveClientY = 0
    },

    /* 静音设置 */
    muteVideo(val) {
      this.muteSetup = val
    },
    /* onShow播放视频 */
    showPlay() {
      if (
        this.vodIndex != null &&
        this.contentShow &&
        this.beforeVodInfo &&
        !this.beforeVodInfo.vodPaly
      ) {
        this.videoPlay(this.vodIndex)
      }
    },
    /* onHide暂停视频 */
    hidePause() {
      if (
        this.vodIndex != null &&
        this.contentShow &&
        this.beforeVodInfo &&
        this.beforeVodInfo.vodPaly
      ) {
        this.videoPause(this.vodIndex)
      }
      this.brightSlider = false //隐藏光亮的进度条
    },
    /* 点击暂停、播放视频 */
    playSpot(index) {
      // 防抖：避免在视频切换过程中被误触发
      const now = Date.now()
      if (this.lastPlaySpotTime && now - this.lastPlaySpotTime < 500) {
        console.log('playSpot 防抖：忽略重复调用')
        return
      }
      this.lastPlaySpotTime = now

      // 确保beforeVodInfo已经被正确初始化
      if (!this.beforeVodInfo || typeof this.beforeVodInfo !== 'object') {
        console.warn(
          'beforeVodInfo not properly initialized, calling getVodInfo()'
        )
        this.getVodInfo()
      }

      console.log(
        `playSpot called for index ${index}, vodPaly: ${this.beforeVodInfo?.vodPaly}`
      )

      // 使用beforeVodInfo来判断当前视频的播放状态
      if (this.beforeVodInfo && this.beforeVodInfo.vodPaly) {
        //暂停
        console.log(`暂停视频 ${index}`)
        this.videoPause(index)
        this.beforeVodInfo.pauseShow = true //显示暂停图标
        this.manuallyPaused = true
      } else {
        //播放
        console.log(`播放视频 ${index}`)
        this.videoPlay(index)
        if (this.beforeVodInfo) {
          this.beforeVodInfo.pauseShow = false //关闭暂停图标
        }
        this.manuallyPaused = false
      }
    },
    /* 播放视频 */
    videoPlay(index) {
      // 还原后的代码 - 增加HLS支持
      let vodInfo = this.vodList[index]
      if (vodInfo) {
        // 不在这里设置vodPaly = true，让startPlay事件来设置，确保状态与实际播放同步
        vodInfo.pauseShow = false
        vodInfo.loadingShow = false
        // 确保封面隐藏
        vodInfo.coverOpacity = false
      }
      this.brightSlider = false

      // 获取当前视频URL
      const currentVideoUrl = vodInfo.vodUrl || vodInfo.src

      // 对于HLS视频，我们简化处理方式
      // 直接尝试播放，让浏览器自己处理HLS支持
      console.log(`播放视频URL: ${currentVideoUrl}, index: ${index}`)

      try {
        const videoContext = uni.createVideoContext(
          'myVideo' + index + this.swId,
          this
        )
        if (videoContext) {
          console.log(`调用 videoContext.play() for index ${index}`)
          videoContext.play()

          // 对于 HLS 视频，由于可能不会触发 @play 事件，我们延迟检查并手动触发 startPlay
          if (isHLSVideo(currentVideoUrl)) {
            console.log(
              `检测到 HLS 视频，将延迟触发 startPlay for index ${index}`
            )
            setTimeout(() => {
              // 检查视频是否真的开始播放了，但 @play 事件没有触发
              // 同时确保用户没有手动暂停视频
              if (
                this.vodIndex === index &&
                (!this.beforeVodInfo || !this.beforeVodInfo.vodPaly) &&
                !this.manuallyPaused
              ) {
                console.log(
                  `HLS 视频可能已播放但未触发 @play 事件，手动调用 startPlay for index ${index}`
                )
                this.startPlay(index)
              } else if (this.manuallyPaused) {
                console.log(
                  `跳过 HLS 延迟触发，因为用户已手动暂停 for index ${index}`
                )
              }
            }, 2000) // 给视频足够时间开始播放
          } else {
            // 对于非HLS视频，也添加一个备用的延迟检查
            setTimeout(() => {
              if (
                this.vodIndex === index &&
                (!this.beforeVodInfo || !this.beforeVodInfo.vodPaly) &&
                !this.manuallyPaused
              ) {
                console.log(
                  `非HLS视频可能未触发 @play 事件，手动调用 startPlay for index ${index}`
                )
                this.startPlay(index)
              }
            }, 1000)
          }
        } else {
          console.error('无法创建video context')
        }
      } catch (error) {
        console.error('视频播放失败:', error)
        // 如果是HLS视频且在浏览器环境，尝试使用HLS.js
        if (isHLSVideo(currentVideoUrl) && typeof window !== 'undefined') {
          this.playHLSVideo(index, currentVideoUrl)
        }
      }
    },

    /* HLS视频播放方法 */
    playHLSVideo(index, videoUrl) {
      console.log(`HLS播放方法被调用，索引: ${index}，URL: ${videoUrl}`)

      // 延迟执行，确保DOM完全渲染
      setTimeout(() => {
        this.tryInitHLS(index, videoUrl)
      }, 1000)
    },

    /* 根据索引获取对应的video元素 */
    getVideoElementByIndex(index) {
      // 查找页面中所有的video元素
      const allVideos = document.querySelectorAll('video')
      // console.log(
      //   `页面中找到 ${allVideos.length} 个video元素，查找索引${index}对应的元素`
      // )

      if (allVideos.length === 0) {
        console.error('页面中没有找到video元素')
        return null
      }

      // 初始化已使用的video元素映射
      if (!this.usedVideoElements) {
        this.usedVideoElements = new Set()
      }

      // 方法1: 直接使用索引对应的video元素（最可靠的方法）
      if (allVideos.length > index && allVideos[index]) {
        const video = allVideos[index]
        // console.log(`使用索引${index}对应的第${index}个video元素`, {
        //   width: video.offsetWidth,
        //   height: video.offsetHeight,
        //   src: video.src,
        //   currentSrc: video.currentSrc,
        // })

        // 标记此video元素已被此索引使用
        this.usedVideoElements.add(index)
        return video
      }

      // 方法2: 查找未被使用的video元素
      for (let i = 0; i < allVideos.length; i++) {
        if (!this.usedVideoElements.has(i)) {
          const video = allVideos[i]
          if (video.offsetWidth > 0 && video.offsetHeight > 0) {
            // console.log(`为索引${index}分配未使用的第${i}个video元素`)
            this.usedVideoElements.add(i)
            return video
          }
        }
      }

      // 方法3: 查找当前最可见的video元素
      let bestVideo = null
      let bestVisibility = 0

      for (let i = 0; i < allVideos.length; i++) {
        const video = allVideos[i]
        const rect = video.getBoundingClientRect()

        // 计算可见度得分
        const visibility =
          Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
          ) *
          Math.max(
            0,
            Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
          )

        if (visibility > bestVisibility) {
          bestVisibility = visibility
          bestVideo = video
        }
      }

      if (bestVideo) {
        // console.log(`为索引${index}使用最可见的video元素`)
        return bestVideo
      }

      // 最后备选：使用第一个可用的video元素
      if (allVideos.length > 0) {
        // console.log(`为索引${index}使用第一个video元素作为备选`)
        return allVideos[0]
      }

      return null
    },

    /* 尝试初始化HLS播放器 */
    tryInitHLS(index, videoUrl) {
      console.log(`尝试为索引${index}初始化HLS播放器`)

      // 根据索引获取对应的video元素
      const targetVideo = this.getVideoElementByIndex(index)
      if (!targetVideo) {
        console.error(`无法找到索引${index}对应的video元素`)
        return
      }

      console.log(`找到索引${index}的video元素:`, targetVideo)

      // console.log(`使用索引${index}的video元素:`, targetVideo)

      // 使用HLS.js播放
      if (hlsSupported) {
        // console.log(`开始为索引${index}使用HLS.js播放`)

        try {
          // 初始化HLS实例映射
          if (!this.hlsInstances) {
            this.hlsInstances = new Map()
          }

          // 清理该索引之前的HLS实例
          if (this.hlsInstances.has(index)) {
            const oldHls = this.hlsInstances.get(index)
            // console.log(`清理索引${index}的旧HLS实例`)
            oldHls.destroy()
            this.hlsInstances.delete(index)
          }

          const hls = new Hls({
            debug: false,
            enableWorker: false, // 禁用Worker避免兼容性问题
            lowLatencyMode: false,
            backBufferLength: 30,
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            fragLoadingMaxRetry: 4,
            fragLoadingRetryDelay: 500,
          })

          hls.loadSource(videoUrl)
          hls.attachMedia(targetVideo)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // console.log(`索引${index}的HLS manifest解析成功`)
            targetVideo
              .play()
              .then(() => {
                console.log(`索引${index}的HLS视频开始播放，手动触发startPlay`)
                // 手动触发 startPlay 事件，因为 HLS.js 可能不会触发 Vue 的 @play 事件
                this.startPlay(index)

                // 清理重试计数器
                if (this.hlsRetryCount && this.hlsRetryCount.has(index)) {
                  this.hlsRetryCount.delete(index)
                  // console.log(`清理索引${index}的重试计数`)
                }
              })
              .catch((error) => {
                if (error.name === 'AbortError') {
                  // console.log(
                  //   `索引${index}的播放请求被中断，这在快速切换视频时是正常现象。`
                  // )
                } else {
                  console.error(`索引${index}的HLS播放失败:`, error)
                }
              })
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.warn(
                    `HLS network error for index ${index}, trying to recover...`
                  )
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.warn(
                    `HLS media error for index ${index}, trying to recover...`
                  )
                  hls.recoverMediaError()
                  break
                default:
                  console.error(
                    `HLS fatal error for index ${index}, destroying instance.`
                  )
                  hls.destroy()
                  this.hlsInstances.delete(index)
                  break
              }
            } else {
              switch (data.details) {
                case Hls.ErrorDetails.BUFFER_STALLED_ERROR:
                case Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE:
                  console.warn(
                    `HLS non-fatal media error for index ${index}: ${data.details}`
                  )
                  if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                    hls.recoverMediaError()
                  }
                  break
                default:
                  // Non-critical errors are not logged to avoid console spam
                  break
              }
            }
          })

          // 保存该索引的HLS实例
          this.hlsInstances.set(index, hls)
        } catch (error) {
          console.error('HLS.js初始化失败:', error)
        }
      } else {
        console.warn('HLS.js不支持')
      }
    },

    /* 降级播放方法 */
    fallbackPlay(index) {
      try {
        uni.createVideoContext('myVideo' + index + this.swId, this).play()
      } catch (error) {
        console.error('降级播放也失败:', error)
        // 显示友好错误提示
        uni.showToast({
          title: '视频格式不支持',
          icon: 'none',
          duration: 2000,
        })
      }
    },
    /* 暂停视频 */
    videoPause(index) {
      // console.log('暂停视频myVideo============>' + index)
      // 还原后的代码
      clearTimeout(this.sliderEndTime)
      const vodInfo = this.vodList[index]
      if (vodInfo) {
        vodInfo.vodPaly = false
      }

      if (
        this.vodIndex == index &&
        this.beforeVodInfo &&
        this.beforeVodInfo.sliderShow
      ) {
        this.brightSlider = true
      }

      // --- 修改开始 ---
      // 增加对HLS视频的特殊处理
      // 在H5环境下，如果视频是HLS格式，并且hls.js可用
      if (
        vodInfo &&
        isHLSVideo(vodInfo.vodUrl) &&
        typeof window !== 'undefined' &&
        hlsSupported
      ) {
        // 直接获取video DOM元素并调用pause()，这对于hls.js控制的视频更可靠
        // console.log(`正在直接暂停HLS视频，索引: ${index}`)
        const videoElement = this.getVideoElementByIndex(index)
        if (videoElement) {
          videoElement.pause()
        }
      } else {
        // 对于原生App或非HLS视频，继续使用uni-app的video context
        uni.createVideoContext('myVideo' + index + this.swId, this).pause()
      }
      // --- 修改结束 ---
    },
    changeSwiper(ev) {
      // 动画开始时，记录目标索引（基于filteredVodList）
      const filteredIndex = ev.detail.current
      // 将filteredVodList的索引映射到vodList的索引
      if (this.filteredVodList && this.filteredVodList[filteredIndex]) {
        this.changeIndex = this.vodList.findIndex(
          (item) =>
            item.videoIndex === this.filteredVodList[filteredIndex].videoIndex
        )
      } else {
        this.changeIndex = filteredIndex
      }

      // 立即暂停当前预加载范围内的视频，防止滑动过程中出现多个声音
      const startIndex = Math.max(0, this.vodIndex - 2)
      const endIndex = Math.min(this.vodList.length - 1, this.vodIndex + 2)

      for (let index = startIndex; index <= endIndex; index++) {
        this.pauseVideo(index)
      }
    },
    /* swiper动画结束时触发 */
    swiperVod(ev) {
      const filteredIndex = ev.detail.current

      // 将filteredVodList的索引映射到vodList的索引
      let actualIndex = filteredIndex
      if (this.filteredVodList && this.filteredVodList[filteredIndex]) {
        const targetVideo = this.filteredVodList[filteredIndex]
        actualIndex = this.vodList.findIndex(
          (item) => item.videoIndex === targetVideo.videoIndex
        )
      }

      this.resetData()
      this.moveOpacity = false
      // 不重置 manuallyPaused 状态，保持用户的暂停选择

      this.handleVideoChange(actualIndex)
    },
    /* 获取当前视频播放对象 */
    getVodInfo() {
      // 还原后的代码
      console.log(`getVodInfo called, vodCurIndex: ${this.vodCurIndex}`)
      this.vodList.filter((item) => {
        if (this.vodCurIndex == item.videoIndex) {
          this.beforeVodInfo = item
          console.log(`Found matching video, beforeVodInfo set:`, item)
        }
      })
      if (!this.beforeVodInfo) {
        console.warn(
          'No matching video found for vodCurIndex:',
          this.vodCurIndex
        )
      }
    },
    /* 截取要播放的视频列表 */
    getVodSliceList() {
      // 还原后的代码
      let videoIndex = this.vodList[this.changeIndex].videoIndex
      let starIdx = videoIndex - 1 < 0 ? 0 : videoIndex - 1
      let endIdx = videoIndex + 2
      let resultList = JSON.parse(
        JSON.stringify(this.totalPlayList.slice(starIdx, endIdx))
      )

      resultList.filter((item) => {
        if (item.videoIndex % 3 == 0) {
          this.vodList[0] = item
        } else if (item.videoIndex % 3 == 1) {
          this.vodList[1] = item
        } else if (item.videoIndex % 3 == 2) {
          this.vodList[2] = item
        }
      })

      this.finalList = resultList
    },
    /* 当开始/继续播放时 */
    startPlay(index) {
      // 还原后的代码
      console.log(
        `startPlay called for index ${index}, current vodIndex: ${this.vodIndex}`
      )
      if (this.vodIndex == index) {
        console.log(`Setting vodPaly = true for index ${index}`)
        this.playOpen = false

        // 视频真正开始播放时，设置正确的播放状态
        if (this.beforeVodInfo) {
          this.beforeVodInfo.vodPaly = true
          this.beforeVodInfo.pauseShow = false
          this.beforeVodInfo.loadingShow = false
          // 确保封面隐藏
          this.beforeVodInfo.coverOpacity = false
        }

        // 同时更新vodList中对应的项
        const vodInfo = this.vodList[index]
        if (vodInfo) {
          vodInfo.vodPaly = true
          vodInfo.pauseShow = false
          vodInfo.loadingShow = false
          // 确保封面隐藏
          vodInfo.coverOpacity = false
        }

        if (this.beforeVodInfo && this.beforeVodInfo.palyCartoon) {
          this.rotateImgShow = true
        }

        clearInterval(this.failTime)
        clearInterval(this.repeatTime)

        // 确保vodLayer隐藏（通过响应式更新）
        this.$nextTick(() => {
          console.log(`视频 ${index} 开始播放，vodLayer应该隐藏`)
        })
      } else {
        console.log(
          `startPlay ignored: vodIndex (${this.vodIndex}) != index (${index})`
        )
      }
    },
    /* 视频出现缓冲 */
    bufferVod(index) {
      // console.log('缓冲视频================》'+index)

      // 还原后的代码
      if (
        this.vodList.length > 0 &&
        this.changeIndex == this.vodIndex &&
        !this.bufferShow &&
        this.beforeVodInfo &&
        this.beforeVodInfo.vodPaly
      ) {
        this.playOpen = true
        this.scheduleLoad()
      }
    },
    /* 视频播放失败 */
    errVod(index) {
      // console.log('视频播放失败================》'+index)

      // 还原后的代码 - 增强错误处理
      // --- 修改开始：优化HLS错误处理 ---
      const currentVideo = this.vodList[index]
      // 在H5环境下，如果HLS视频播放失败，这是一个预期的行为，因为我们将使用hls.js作为后备
      if (
        currentVideo &&
        isHLSVideo(currentVideo.vodUrl) &&
        typeof window !== 'undefined' &&
        hlsSupported
      ) {
        // console.log(
        //   `H5环境原生播放HLS失败（预期行为），索引: ${index}。即将使用hls.js接管。`
        // )
        // 对于HLS视频，尝试重新初始化播放器
        this.playHLSVideo(index, currentVideo.vodUrl)
        return // 提前返回，不执行下面的通用错误处理
      }
      // --- 修改结束 ---

      console.error('视频播放错误，索引:', index)

      clearTimeout(this.playErrTime)
      this.playErrTime = setTimeout(() => {
        if (
          this.vodList.length > 0 &&
          this.changeIndex == this.vodIndex &&
          !this.bufferShow &&
          this.beforeVodInfo &&
          this.beforeVodInfo.vodPaly
        ) {
          this.playOpen = true
          this.palyCartoon = false
          this.scheduleLoad()
        }
      }, 300) // 0x12c = 300
    },
    /* 视频开始加载时触发 */
    onVideoLoadStart(index) {
      // console.log('视频开始加载:', index)
    },
    /* 视频可以播放时触发 */
    onVideoCanPlay(index) {
      // console.log('视频可以播放:', index)
      const currentVideo = this.vodList[index]
      if (currentVideo && isHLSVideo(currentVideo.vodUrl)) {
        // console.log('HLS视频准备就绪:', currentVideo.vodUrl)
      }
    },
    /* 测试HLS功能 */
    testHLSSupport() {
      // console.log('=== HLS支持测试 ===')
      // console.log('HLS.js版本:', Hls.version)
      // console.log('HLS.js支持:', hlsSupported)
      // console.log('浏览器原生HLS支持:', nativeHLSSupport())
      // console.log('当前浏览器UserAgent:', navigator.userAgent)
      // // 测试一个实际的m3u8 URL
      // if (this.vodList.length > 0) {
      //   const testVideo = this.vodList[0]
      //   console.log('测试视频URL:', testVideo.vodUrl)
      //   console.log('是否为HLS格式:', isHLSVideo(testVideo.vodUrl))
      // }
      // // 延迟检查DOM中的video元素
      // setTimeout(() => {
      //   const videos = document.querySelectorAll('video')
      //   console.log(`DOM中的video元素数量: ${videos.length}`)
      //   videos.forEach((video, index) => {
      //     console.log(`Video ${index}:`, {
      //       id: video.id,
      //       src: video.src,
      //       width: video.offsetWidth,
      //       height: video.offsetHeight,
      //       visible: video.offsetWidth > 0 && video.offsetHeight > 0,
      //     })
      //   })
      // }, 2000)
    },
    /* 播放进度变化时触发 */
    timeupdateVod(ev, index) {
      // 还原后的代码
      if (this.vodIndex != index) return false

      if (this.beforeVodInfo) {
        this.beforeVodInfo.coverOpacity = false
      }

      if (!this.sliderDrag) {
        this.videoTime = ev.detail.duration
        this.sliderTime = ev.detail.currentTime
        this.sliderProgress =
          (ev.detail.currentTime / ev.detail.duration) * this.screenWidth
      }

      if (this.vodList.length > 0) {
        this.bufferNum = ev.detail.currentTime
        this.loadingShow = false
        if (this.beforeVodInfo) {
          this.beforeVodInfo.bufferShow = false
        }
        clearTimeout(this.bufferTime)
        clearInterval(this.repeatTime)
        clearInterval(this.failTime)
      }
    },
    /* 显示进度加载动画 */
    scheduleLoad() {
      // 还原后的代码
      if (!this.loadingShow) {
        this.loadingShow = true
        this.bufferTime = setTimeout(() => {
          if (this.beforeVodInfo) {
            this.beforeVodInfo.bufferShow = true
          }
          if (this.playOpen) {
            this.vodLoad()
          }
        }, 2500) // 0x9c4 = 2500ms
      }
    },
    /* 重新播放视频 */
    vodLoad() {
      // 还原后的代码
      /* 视频播放失败，重新播放视频 */
      if (this.playOpen) {
        this.playOpen = false

        if (this.sliderTime == 0) {
          uni
            .createVideoContext('myVideo' + this.vodIndex + this.swId, this)
            .stop()
        }

        this.failTime = setTimeout(() => {
          this.playOpen = true
          this.bufferShow = false
          this.videoPlay(this.vodIndex)
        }, 1000) // 0x3e8 = 1000ms
      }
    },
    /* 视频播放结束 */
    endedVod(index) {
      console.log('视频播放结束' + index)

      if (this.vodIndex == index && this.nextPlay) {
        // 计算下一个视频索引（修正逻辑）
        let nextIndex = this.vodIndex + 1

        // 检查是否超出范围
        if (nextIndex >= this.vodList.length) {
          console.log('已到达最后一集，停止自动播放')
          return
        }

        console.log(
          `自动切换到下一个视频，从第${index}集切换到第${nextIndex}集`
        )

        // 直接调用视频切换方法
        this.handleVideoChange(nextIndex)

        // 确保下一个视频自动播放
        setTimeout(() => {
          if (this.vodList[nextIndex]) {
            this.vodList[nextIndex].vodPaly = true
            this.vodList[nextIndex].pauseShow = false
          }
        }, 100)
      }
    },
    // 根据秒获取时间
    formatSeconds(a) {
      var hh = parseInt(a / 3600)
      var mm = parseInt((a - hh * 3600) / 60)
      if (mm < 10) mm = '0' + mm
      var ss = parseInt((a - hh * 3600) % 60)
      if (ss < 10) ss = '0' + ss
      if (hh < 10) hh = hh == 0 ? '' : `0${hh}:`
      var length = hh + mm + ':' + ss
      if (a >= 0) {
        return length
      } else {
        return '00:00'
      }
    },
    /* 进度条滑动 */
    touchmoveSlider(event) {
      event.stopPropagation()
      // #ifndef APP-NVUE
      let objclientX = event.changedTouches[0].clientX
      // #endif

      // #ifdef APP-NVUE
      let objclientX = event.changedTouches[0].screenX
      // #endif

      // 还原后的代码
      if (objclientX >= 0 && objclientX <= this.screenWidth - 2) {
        clearTimeout(this.sliderEndTime)
        this.brightSlider = true
        this.sliderDrag = true
        this.sliderProgress = objclientX

        let num = this.sliderProgress / (this.screenWidth - 2)
        this.sliderTime = num * this.videoTime
        this.endTime = num * this.videoTime
      }
    },
    /* 进度条滑动结束 */
    touchendSlider(event) {
      // 还原后的代码
      event.stopPropagation()
      this.sliderDrag = false

      let videoCtx = uni.createVideoContext(
        'myVideo' + this.vodIndex + this.swId,
        this
      )
      videoCtx.seek(this.endTime)
      videoCtx.play()

      if (this.beforeVodInfo) {
        this.beforeVodInfo.vodPaly = true
        this.beforeVodInfo.pauseShow = false
      }

      this.sliderEndTime = setTimeout(() => {
        this.brightSlider = false
      }, 2000) // 0x7d0 = 2000ms
    },
    /* 触碰的坐标 */
    vodViewStart(e) {
      // #ifndef APP-NVUE
      this.touchClientY = e.changedTouches[0].clientY
      this.touchStartX = e.changedTouches[0].clientX
      this.touchStartY = e.changedTouches[0].clientY
      // #endif
      // #ifdef APP-NVUE
      this.touchClientY = e.changedTouches[0].screenY
      this.touchStartX = e.changedTouches[0].screenX
      this.touchStartY = e.changedTouches[0].screenY
      // #endif
      this.touchStartTime = new Date().getTime()
    },
    /* 上下滑动的坐标 */
    vodViewMove(e) {
      // #ifndef APP-NVUE
      this.moveClientY = e.changedTouches[0].clientY - this.touchClientY
      // #endif
      // #ifdef APP-NVUE
      this.moveClientY = e.changedTouches[0].screenY - this.touchClientY
      // #endif

      // 还原后的代码
      /* 是否透明进度条 */
      if (this.moveClientY > 0 || this.moveClientY < 0) {
        this.moveOpacity = true
      } else {
        this.moveOpacity = false
      }

      // 下拉刷新逻辑 - 简化为只控制显示状态
      if (this.loadOpen && this.vodCurIndex == 0 && !this.refreshOpen) {
        if (this.moveClientY > 20) {
          this.refreshShow = true
        } else {
          this.refreshShow = false
        }
      }

      // 如果正在刷新，确保刷新组件保持显示
      if (this.refreshOpen) {
        this.refreshShow = true
      }

      this.startPlayVod = false
    },
    /* 滑动结束的坐标 */
    vodViewEnd(e) {
      // #ifndef APP-NVUE
      const moveClientX = e.changedTouches[0].clientX - this.touchStartX
      const moveClientY = e.changedTouches[0].clientY - this.touchStartY
      this.moveClientY = e.changedTouches[0].clientY - this.touchClientY
      // #endif
      // #ifdef APP-NVUE
      const moveClientX = e.changedTouches[0].screenX - this.touchStartX
      const moveClientY = e.changedTouches[0].screenY - this.touchStartY
      this.moveClientY = e.changedTouches[0].screenY - this.touchClientY
      // #endif

      const touchEndTime = new Date().getTime()
      const touchDuration = touchEndTime - this.touchStartTime

      // 判断是否为点击事件
      if (
        touchDuration < 300 &&
        Math.abs(moveClientX) < 10 &&
        Math.abs(moveClientY) < 10
      ) {
        // 防止与其他点击事件冲突，添加防抖
        if (this.lastClickTime && touchEndTime - this.lastClickTime < 500) {
          console.log('防抖：忽略重复的点击事件')
          return
        }
        this.lastClickTime = touchEndTime
        this.handClick(e, this.vodIndex)
        return
      }

      // 还原后的代码
      this.moveOpacity = true
      this.startPlayVod = true // 关键修复：设置为true以允许视频切换

      // 下拉刷新逻辑
      if (this.loadOpen && this.vodCurIndex == 0) {
        if (this.moveClientY > 80 && !this.refreshOpen) {
          // 达到刷新阈值，触发刷新
          console.log(
            '触发刷新: refreshOpen=true, refreshShow=true, moveClientY=80'
          )
          this.refreshOpen = true
          this.refreshShow = true // 确保刷新组件显示
          // 设置固定位置，保持刷新组件显示在顶部
          this.moveClientY = 80
          this.$emit('refreshData')
          return // 触发刷新时不重置moveClientY
        } else if (this.moveClientY <= 80 && !this.refreshOpen) {
          // 未达到刷新阈值且没有正在刷新，隐藏刷新提示
          this.refreshShow = false
        }
      }

      // 只有在没有触发刷新时才重置移动距离
      if (!this.refreshOpen) {
        this.moveClientY = 0
      }
    },
    /* 重置状态数据 */
    resetData() {
      // 还原后的代码
      this.sliderProgress = 0
      this.videoTime = 0
      this.endTime = 0
      this.bufferNum = 0
      this.sliderTime = null
      this.bufferShow = false
      this.sliderDrag = false
      this.brightSlider = false
      this.sliderEndTime = null

      // 注意：刷新状态由 finishRefresh() 方法专门负责重置
      // 这里不重置刷新状态，避免刷新动画过早消失
      // this.refreshShow = false
      // this.refreshOpen = false
    },
    // 单击或双击
    handClick(event, index) {
      // 还原后的代码
      // To fix the pause/play bug, we temporarily disable the double-click logic
      // by calling playSpot immediately. This ensures the primary action is reliable.
      this.playSpot(index)
    },
    /* px转换rpx */
    pxToRpx(px) {
      // 还原后的代码
      return (750 * Number.parseInt(px)) / this.screenWidth // 0x2ee = 750
    },
    /* 双击点赞添加移除动画 */
    doubleAddClass(id) {
      // 还原后的代码
      setTimeout(() => {
        // 添加移除动画类名
        this.likeList.filter((item, index) => {
          if (item.id == id) {
            this.likeList[index].className = 'doubleImageRemove'
          }
        })

        // 延迟隐藏爱心
        setTimeout(() => {
          this.likeList.filter((item, index) => {
            if (item.id == id) {
              item.isShow = false
            }
          })
        }, 400) // 0x190 = 400ms
      }, 500) // 0x1f4 = 500ms
    },
    /* 长按当前视频回调 */
    longpress(item) {
      this.$emit('longpress', item)
    },
    /* 点赞关注操作 */
    handleInfo(obj) {
      this.totalPlayList.filter((item, index) => {
        if (item.videoIndex == obj.videoIndex) {
          this.$set(this.totalPlayList, index, obj)
        }
      })
      this.vodList.filter((item, index) => {
        if (item.videoIndex == obj.videoIndex) {
          this.$set(this.vodList, index, obj)
        }
      })
    },

    /* 销毁所有视频上下文 */
    destroyAllVideos() {
      // 清理所有HLS实例
      if (this.hlsInstances && this.hlsInstances.size > 0) {
        // console.log(`销毁时清理${this.hlsInstances.size}个HLS实例`)
        this.hlsInstances.forEach((hls, index) => {
          // console.log(`销毁索引${index}的HLS实例`)
          hls.destroy()
        })
        this.hlsInstances.clear()
      }

      // 清理兼容旧版本的单实例
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }

      // 清理重试计数器
      if (this.hlsRetryCount) {
        this.hlsRetryCount.clear()
        // console.log('清理所有HLS重试计数器')
      }

      // 清理video元素使用映射
      if (this.usedVideoElements) {
        this.usedVideoElements.clear()
        // console.log('清理video元素使用映射')
      }

      // 停止所有video元素
      this.vodList.forEach((item, index) => {
        const videoId = 'myVideo' + index + this.swId
        const videoContext = uni.createVideoContext(videoId, this)
        if (videoContext) {
          videoContext.stop() // 停止播放
        }
      })

      this.vodList = [] // 清空视频列表数据
      this.videoData = [] // 清空视频数据
      this.contentShow = false // 隐藏内容
      // console.log('所有视频上下文和HLS实例已销毁')
    },
  },
}
