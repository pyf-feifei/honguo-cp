const animation = uni.requireNativePlugin('animation')
const dom = uni.requireNativePlugin('dom')
import unirefresh from '../tsp-load/tsp-refresh-n.vue'
import videoMenu from '../tsp-menu/tsp-menu-n.vue'
/*
 lodData 上拉加载回调
 refreshData 下拉加载回调
 */

export default {
  components: {
    unirefresh,
    videoMenu,
  },
  props: {
    /* 是否开启下拉刷新 */
    loadOpen: {
      type: Boolean,
      default: true,
    },
    /* 剩余多少个视频触发上拉加载 */
    surplusNum: {
      type: Number,
      default: 0, //0默认是最后一个
    },
    /* tabBar栏 0系统tabBar栏 1自定义tabBar栏 */
    tabBarShow: {
      type: Number,
      default: 0,
    },
    /* 自定义tabBar的高度 */
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
      vodHeight: 0, //视频部分高度
      videoNewUrl: null, //下一个视频的地址
      currentIndex: null,
      vodIndex: 0, // 当前播放视频下标
      contentShow: false,
      autoplayVideo: true, // 初始加载完成是否自动播放
      vodList: [],
      timeout: null, //滑动视频防抖
      bufferTime: null, //缓冲视频显示加载动画防抖
      sliderProgress: 0, //进度条滑动层宽度
      sliderTime: 0, //显示滑动进度条时变化的时间
      videoTime: 0, //视频时长 时间
      endTime: 0, //滑动进度条最终的时间
      sliderDrag: false, //是否在拖动进度
      brightSlider: false, //是否显示光亮的进度条
      sliderEndTime: null, //滑动结束隐藏光亮进度条时间延迟
      startPlayVod: false, //是否滑动结束播放下一个视频
      bufferShow: false, //显示loading加载进度的条件
      playOpen: false, //视频播放失败，是否重播视频的条件
      failTime: null, //视频播放失败，重播视频的时间
      repeatTime: null,
      preloadTime: null, //延时防抖
      shakePlay: false, //是否有遗漏的视频播放
      rotateAnti: false, //防抖旋转头像
      touchClientY: 0, //触碰的坐标
      moveClientY: 0, //移动的坐标
      moveOpacity: false, //是否透明
      speedHide: false, //滑动时隐藏进度条
      appoint: true, //初始隐藏视频和右侧头像栏
      changeVod: false, //是否正在切换视频
      muteSetup: false, //是否设置为静音
      changeIndex: 0,
      changeTime: null,
      /* 双击点赞部分 */
      lastTapDiffTime: 0, //上次点击时间
      lastTapTimeoutFunc: null, //单击事件事件函数
      likeList: [], //双击点赞显示的桃心数据
      likeId: 1,
      doubleOutTime: null,
      clearDoubleTime: null,
      touchInfo: {},
      /* 双击点赞显示桃心动画 */
      peachAddList: {
        list: [
          { transform: 'scale(1.6)', opacity: '0.8' },
          { transform: 'scale(1)', opacity: '1' },
          { transform: 'scale(1.02)', opacity: '1' },
          { transform: 'scale(1)', opacity: '1' },
        ],
        duration: 75,
      },
      /* 双击点赞移除桃心动画 */
      peachRemoveList: {
        list: [
          { transform: 'scale(1) translateY(0rpx)', opacity: '1' },
          { transform: 'scale(1.35) translateY(-50rpx)', opacity: '0.7' },
          { transform: 'scale(1.6) translateY(-100rpx)', opacity: '0' },
        ],
        duration: 133,
      },
      pauseNum: 0,
      pauseAddList: {
        list: [
          { transform: 'scale(2)', opacity: '0' },
          { transform: 'scale(1)', opacity: '0.35' },
        ],
        duration: 75,
      },
    }
  },
  created() {
    const deviceInfo = uni.getSystemInfoSync()
    let topBarHeight = this.showBarHeight ? deviceInfo.statusBarHeight : 0x0
    this.videoStyle.statusBarHeight = topBarHeight + 'px'
    this.videoStyle.width = deviceInfo.screenWidth + 'px'
    this.screenWidth = deviceInfo.screenWidth
    this.screenHeight = deviceInfo.screenHeight
    if (this.tabBarShow == 0x1) {
      this.videoStyle.height =
        deviceInfo.screenHeight - topBarHeight - this.tabBarHeight + 'px'
      this.vodHeight =
        deviceInfo.screenHeight - topBarHeight - this.tabBarHeight
    } else {
      this.videoStyle.height = deviceInfo.windowHeight - topBarHeight + 'px'
      this.vodHeight = deviceInfo.windowHeight - topBarHeight
    }
  },
  watch: {
    vodIndex(newIndex, oldIndex) {
      console.log(
        '=== vodIndex watch 触发 ===',
        'newIndex:',
        newIndex,
        'oldIndex:',
        oldIndex
      )
      console.log('contentShow:', this.contentShow)
      console.log('autoplayVideo:', this.autoplayVideo)
      console.log('appoint:', this.appoint)

      if (!this.contentShow) {
        console.log('contentShow为false，直接返回')
        return
      }

      console.log('调用resetData')
      this.resetData()

      if (oldIndex >= 0 && !this.appoint) {
        console.log('处理旧视频, oldIndex:', oldIndex)
        this.vodList[oldIndex].coverOpacity = this.vodList[oldIndex].coverShow
          ? true
          : false
        this.vodList[oldIndex].vodPaly = false
        this.vodList[oldIndex].pauseShow = false
        this.vodList[oldIndex].loadingShow = false

        const oldVideoId = 'myVideo' + oldIndex + this.swId
        console.log('暂停旧视频:', oldVideoId)
        uni.createVideoContext(oldVideoId, this).pause()
      }

      this.$nextTick(() => {
        console.log('$nextTick 执行')
        this.changeVod = false
        if (this.autoplayVideo) {
          console.log('自动播放开启，调用swiperVod, newIndex:', newIndex)
          this.autoplayVideo = true
          this.swiperVod(newIndex)
        } else {
          console.log('自动播放关闭')
        }
      })

      console.log('=== vodIndex watch 结束 ===')
    },
  },

  methods: {
    /* 滚动监听 */
    scrolls(ev) {
      console.log('=== scrolls 滚动监听 ===')
      console.log('contentOffset.y:', ev.contentOffset.y)
      console.log('vodHeight:', this.vodHeight)
      console.log('isDragging:', ev.isDragging)

      clearTimeout(this.timeout)
      this.speedHide = true
      let index = Math.round(Math.abs(ev.contentOffset.y) / this.vodHeight)

      console.log('计算出的index:', index)
      console.log('当前vodIndex:', this.vodIndex)
      console.log('startPlayVod:', this.startPlayVod)

      this.changeIndex = index
      this.moveOpacity = ev.isDragging
      this.timeout = setTimeout(() => {
        console.log('timeout执行, 设置currentIndex:', index)
        this.currentIndex = index
        this.speedHide = false
        this.shakePlay = true
        if (this.startPlayVod && index != this.vodIndex) {
          console.log('条件满足，切换vodIndex从', this.vodIndex, '到', index)
          this.vodIndex = index
        } else {
          console.log('不满足切换条件')
          console.log('startPlayVod:', this.startPlayVod)
          console.log('index != vodIndex:', index != this.vodIndex)
        }
      }, 100)

      console.log('=== scrolls 结束 ===')
    },
    /* 初始加载视频 */
    initVod(dataList, index) {
      this.autoplayVideo = this.autoplay

      let playIndex = index ? index : 0

      dataList.filter((item, i) => {
        item.tspId = 'myVideo' + i + this.swId
        item.vodPaly = i == playIndex ? true : false
        item.pauseShow = false
        item.loadingShow = false
        item.coverOpacity = item.coverShow ? true : false
      })

      this.vodList = dataList
      this.contentShow = dataList.length > 0 ? true : false
      this.vodIndex = playIndex

      setTimeout(() => {
        if (playIndex > 0) {
          let element = this.$refs['myVideo' + playIndex + this.swId][0]
          dom.scrollToElement(element, { offset: 0, animated: false })
        }

        setTimeout(() => {
          this.appoint = false

          if (this.autoplayVideo) {
            this.swiperVod(this.vodIndex)
          } else {
            this.vodList[this.vodIndex].vodPaly = false
            this.vodList[this.vodIndex].pauseShow = true

            this.$nextTick(() => {
              this.addAnimation('pauseRef', this.pauseAddList, this.pauseNum)
            })
          }
        }, 200)
      }, 100)
    },
    /* 上拉加载回调 */
    lodData() {
      this.$emit('lodData')
    },
    /* 下拉刷新回调 */
    refreshData() {
      this.$emit('refreshData')
    },
    /* 到底加载方法 */
    lodingData(dataList) {
      let num = this.vodList.length

      dataList.filter((item, i) => {
        item.tspId = 'myVideo' + (num + i) + this.swId
        item.vodPaly = false
        item.pauseShow = false
        item.loadingShow = false
        item.coverOpacity = item.coverShow ? true : false
      })

      this.vodList = this.vodList.concat(dataList)
    },
    /* 重新加载 */
    refreshSquare(dataList, index) {
      let playIndex = index ? index : 0
      this.vodList = []
      this.resetData()
      this.$refs.listBox.resetLoadmore()
      this.$refs.refresh.closeRefresh()
      setTimeout(() => {
        this.initVod(dataList, playIndex)
      }, 50)
    },
    /* onShow显示播放视频 */
    showPlay() {
      if (this.vodIndex != null && this.contentShow) {
        this.videoPlay(this.vodIndex)
      }
    },
    /* onHide隐藏暂停视频 */
    hidePause() {
      if (this.vodIndex != null && this.contentShow) {
        this.videoPause(this.vodIndex)
      }
      this.brightSlider = false //隐藏光亮的进度条
    },
    /* 重置状态数据 */
    resetData() {
      this.videoTime = 0
      this.sliderTime = 0
      this.sliderProgress = 0
      this.endTime = 0
      this.bufferShow = false
      this.sliderDrag = false
      this.brightSlider = false
      this.sliderEndTime = null
    },
    /* 静音设置 */
    muteVideo(val) {
      this.muteSetup = val
    },
    /* 点击暂停、播放视频 */
    playSpot(index) {
      if (this.vodList[index].vodPaly) {
        this.videoPause(index)
        this.vodList[index].pauseShow = true
        this.$nextTick(() => {
          this.addAnimation('pauseRef', this.pauseAddList, this.pauseNum)
        })
        this.moveOpacity = false
      } else {
        this.videoPlay(index)
        this.vodList[index].pauseShow = false
      }
    },
    /* 播放视频 */
    videoPlay(index) {
      console.log('=== videoPlay 开始 ===', 'index:', index)
      console.log('vodList[index]:', this.vodList[index])
      console.log('vodList[index].vodUrl:', this.vodList[index]?.vodUrl)
      console.log('vodList[index].tspId:', this.vodList[index]?.tspId)

      let vodInfo = Object.assign({}, this.vodList[index])
      vodInfo.vodPaly = true
      vodInfo.pauseShow = false
      this.$set(this.vodList, index, vodInfo)
      this.brightSlider = false
      this.moveOpacity = false

      const videoId = 'myVideo' + index + this.swId
      console.log('准备播放视频ID:', videoId)

      const videoContext = uni.createVideoContext(videoId, this)
      console.log('videoContext是否存在:', !!videoContext)

      if (videoContext) {
        console.log('调用视频播放')
        videoContext.play()
        console.log('视频播放调用完成')
      } else {
        console.log('视频上下文创建失败!')
      }

      console.log('=== videoPlay 结束 ===')
    },
    /* 暂停视频 */
    videoPause(index) {
      clearTimeout(this.sliderEndTime)
      this.vodList[index].vodPaly = false

      if (this.vodIndex == index && this.vodList[index].sliderShow) {
        this.brightSlider = true
      }

      uni.createVideoContext('myVideo' + index + this.swId, this).pause()
    },
    /* 播放视频 */
    swiperVod(newIndex) {
      console.log('=== swiperVod 开始 ===', 'newIndex:', newIndex)
      console.log('vodList长度:', this.vodList.length)
      console.log('当前vodIndex:', this.vodIndex)

      clearInterval(this.failTime)
      setTimeout(() => {
        clearTimeout(this.checkTime)
      }, 100)

      this.muteVideo(false)

      const videoContext = uni.createVideoContext(
        'myVideo' + newIndex + this.swId,
        this
      )
      console.log('视频上下文ID:', 'myVideo' + newIndex + this.swId)
      console.log('视频上下文是否存在:', !!videoContext)

      if (videoContext) {
        console.log('暂停当前视频并设置播放状态')
        videoContext.pause()
        this.shakePlay = false
        this.vodList[newIndex].vodPaly = true
        console.log('调用videoPlay方法, index:', newIndex)
        this.videoPlay(newIndex)
      } else {
        console.log('视频上下文不存在!')
      }

      if (
        this.vodList[newIndex + 1] &&
        Math.abs(newIndex + 1 - newIndex) <= 1
      ) {
        console.log('预加载下一个视频, index:', newIndex + 1)
        const nextVideoContext = uni.createVideoContext(
          'myVideo' + (newIndex + 1) + this.swId,
          this
        )
        if (nextVideoContext) {
          nextVideoContext.play()
        }
      }

      this.shakePlay = false
      console.log('=== swiperVod 结束 ===')
    },
    /* 当开始/继续播放时 */
    startPlay(index) {
      if (this.vodIndex == index) {
        this.playOpen = false
        clearInterval(this.failTime)
        if (this.vodList[this.vodIndex].rotateImgShow && !this.rotateAnti) {
          this.$refs['menuRef' + this.vodIndex + ''][0].rotateAvatar()
        }
      }
    },
    /* 视频出现缓冲 */
    bufferVod(index) {
      if (
        this.vodList.length > 0 &&
        index == this.vodIndex &&
        !this.bufferShow &&
        this.videoTime > 0 &&
        this.vodList[this.vodIndex].vodPaly
      ) {
        this.playOpen = true
        this.scheduleLoad()
      }
    },
    /* 视频播放失败 */
    errVod(index) {
      if (
        this.vodList.length > 0 &&
        index == this.vodIndex &&
        !this.bufferShow &&
        this.vodList[this.vodIndex].vodPaly
      ) {
        this.playOpen = true
        this.scheduleLoad()
      }
    },
    /* 播放进度变化时触发 */
    timeupdateVod(ev, index) {
      if (this.vodIndex != index) return false

      this.vodList[index].coverOpacity = false

      if (!this.sliderDrag) {
        this.videoTime = ev.detail.duration
        this.sliderTime = ev.detail.currentTime
        this.sliderProgress =
          (ev.detail.currentTime / ev.detail.duration) * this.screenWidth
      }

      if (this.vodList.length > 0) {
        this.loadingShow = false
        this.vodList[index].bufferShow = false
        clearTimeout(this.bufferTime)
        clearInterval(this.failTime)
        this.playOpen = false
      }

      if (this.vodList[index + 1] && Math.abs(index + 1 - index) <= 1) {
        uni
          .createVideoContext('myVideo' + (index + 1) + this.swId, this)
          .pause()
      }

      this.rotateAnti = true
    },
    /* 显示进度加载动画 */
    scheduleLoad() {
      if (!this.playOpen) {
        this.playOpen = true
        this.bufferTime = setTimeout(() => {
          this.vodList[this.vodIndex].loadingShow = true
          clearTimeout(this.repeatTime)
          this.repeatTime = setTimeout(() => {
            this.loadingSliderShow()
          }, 200)

          if (this.bufferShow) this.vodLoad()
        }, 2500)
      }
    },
    /* 重新播放视频 */
    vodLoad() {
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
        }, 1000)
      }
    },
    /* 视频播放结束 */
    endedVod(index) {
      console.log('=== endedVod 视频播放结束 ===', 'index:', index)
      console.log('当前vodIndex:', this.vodIndex)
      console.log('nextPlay属性:', this.nextPlay)
      console.log('是否匹配当前索引:', this.vodIndex == index)

      if (this.vodIndex == index && this.nextPlay) {
        console.log('满足自动播放下一个视频的条件')
        console.log(
          '准备切换到下一个视频, 当前索引:',
          this.vodIndex,
          '下一个索引:',
          this.vodIndex + 1
        )

        this.vodIndex += 1

        console.log('新的vodIndex:', this.vodIndex)
        console.log('下一个视频元素ID:', 'myVideo' + this.vodIndex + this.swId)

        const nextVideoRef = 'myVideo' + this.vodIndex + this.swId
        console.log('查找元素引用:', nextVideoRef)

        if (this.$refs[nextVideoRef] && this.$refs[nextVideoRef][0]) {
          let el = this.$refs[nextVideoRef][0]
          console.log('找到下一个视频元素，准备滚动')
          dom.scrollToElement(el, { offset: 0, animated: true })
          console.log('滚动调用完成')
        } else {
          console.log('未找到下一个视频元素!', this.$refs[nextVideoRef])
        }
      } else {
        console.log('不满足自动播放条件')
        if (this.vodIndex != index) {
          console.log('索引不匹配, 当前:', this.vodIndex, '传入:', index)
        }
        if (!this.nextPlay) {
          console.log('nextPlay为false，未开启自动播放')
        }
      }

      console.log('=== endedVod 结束 ===')
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

      if (objclientX >= 0 && objclientX <= this.screenWidth - 2) {
        clearTimeout(this.sliderEndTime)
        this.sliderDrag = true
        this.brightSlider = true
        this.sliderProgress = objclientX

        let num = this.sliderProgress / (this.screenWidth - 2)
        this.sliderTime = num * this.videoTime
        this.endTime = num * this.videoTime
      }
    },
    /* 进度条滑动结束 */
    touchendSlider(event) {
      event.stopPropagation()
      this.sliderDrag = false

      let videoCtx = uni.createVideoContext(
        'myVideo' + this.vodIndex + this.swId,
        this
      )
      videoCtx.seek(this.endTime)
      videoCtx.play()
      this.vodList[this.vodIndex].vodPaly = true
      this.vodList[this.vodIndex].pauseShow = false
      this.sliderEndTime = setTimeout(() => {
        this.brightSlider = false
      }, 2000)
    },
    /* 视频是否播放遗漏 */
    vodViewStart() {
      clearTimeout(this.checkTime)
      this.checkTime = setTimeout(() => {
        if (this.shakePlay) {
          this.moveOpacity = false
          this.currentIndex = this.vodIndex
        }
      }, 500)
    },
    /* 上下滑动的坐标 */
    vodViewMove(ev) {
      // #ifndef APP-NVUE
      this.moveClientY = ev.changedTouches[0].clientY - this.touchClientY
      // #endif
      // #ifdef APP-NVUE
      this.moveClientY = ev.changedTouches[0].screenY - this.touchClientY
      // #endif
      console.log('=== vodViewMove 滑动中 ===')
      console.log('startPlayVod 设置为 false')
      this.startPlayVod = false
      console.log('=== vodViewMove 结束 ===')
    },
    /* 滑动结束的坐标 */
    vodViewEnd(ev) {
      this.moveOpacity = false
      this.startPlayVod = true
      this.vodViewStart()
      if (!this.changeTime) {
        this.changeTime = setTimeout(() => {
          this.changeVod = this.changeIndex != this.vodIndex ? true : false
          this.changeTime = null
        }, 300)
      }
    },
    /* loading进度加载动画 */
    loadingSliderShow() {
      let testEl = this.$refs.loadSlider
      animation.transition(
        testEl,
        {
          styles: {
            transform: 'scale(0.4)',
            opacity: '0.9',
          },
          duration: 10, //ms
          timingFunction: 'linear',
          delay: 0, //ms
        },
        () => {
          this.loadingSliderHide()
        }
      )
    },
    loadingSliderHide() {
      let testEl = this.$refs.loadSlider
      animation.transition(
        testEl,
        {
          styles: {
            transform: 'scale(1)',
            opacity: '0.1',
          },
          duration: 400, //ms
          timingFunction: 'linear',
          delay: 0, //ms
        },
        () => {
          this.loadingSliderShow()
        }
      )
    },
    // 单击或双击
    handClick(event, index) {
      if (event.type == 'touchstart') {
        this.touchInfo = event
      }

      if (event.type != 'click') return

      if (!this.doubleOpen) return this.playSpot(index), false

      const curTime = new Date().getTime()
      const lastTime = this.lastTapDiffTime
      this.lastTapDiffTime = curTime

      const diff = curTime - lastTime

      if (diff < 300) {
        clearTimeout(this.lastTapTimeoutFunc)
        this.doubleLike(this.touchInfo, index)
      } else {
        this.lastTapTimeoutFunc = setTimeout(() => {
          this.playSpot(index)
        }, 300)
      }
    },
    /* 双击点赞 */
    doubleLike(event, index) {
      if (!this.vodList[this.vodIndex].fabulousShow) {
        this.$refs['menuRef' + this.vodIndex + ''][0].fabulousBtn(index)
      }

      if (!this.doubleHeart) return
      if (this.doubleOutTime) return

      this.doubleOutTime = setTimeout(() => {
        let screenY = event.changedTouches[0].screenY
        let screenX = event.changedTouches[0].screenX
        let rotateOptions = ['0deg', '15deg', '-15deg']
        let randomIndex = Math.floor(Math.random() * 3)

        let likeObj = {
          id: this.likeId++,
          width: this.pxToRpx(95),
          height: this.pxToRpx(95),
          top: this.pxToRpx(screenY) - this.pxToRpx(180) + 'rpx',
          left: this.pxToRpx(screenX) - this.pxToRpx(95 / 2) + 'rpx',
          rotate: rotateOptions[randomIndex],
          className: '',
          isShow: true,
          addNum: 0,
          removeNum: 0,
        }

        this.likeList.push(likeObj)
        this.doubleOutTime = null

        this.$nextTick(() => {
          this.addAnimation(
            'peachRef' + likeObj.id,
            this.peachAddList,
            likeObj.addNum
          )
          this.doubleAddClass(likeObj.id)
        })

        clearTimeout(this.clearDoubleTime)
        this.clearDoubleTime = setTimeout(() => {
          this.likeList = []
        }, 1500)

        this.$emit('doubleClick', this.vodList[this.vodIndex])
      }, 50)
    },
    /* px转换rpx */
    pxToRpx(px) {
      return (750 * Number.parseInt(px)) / this.screenWidth
    },
    /* 双击点赞添加移除动画 */
    doubleAddClass(id) {
      setTimeout(() => {
        this.likeList.filter((item, index) => {
          if (item.id == id) {
            this.addAnimation(
              'peachRef' + item.id,
              this.peachRemoveList,
              item.removeNum
            )
          }
        })

        setTimeout(() => {
          this.likeList.filter((item, index) => {
            if (item.id == id) {
              item.isShow = false
            }
          })
        }, 400)
      }, 500)
    },
    /* 动画方法 */
    addAnimation(name, dataList, num) {
      let testEl = this.$refs[name][0]

      animation.transition(
        testEl,
        {
          styles: dataList.list[num],
          duration: num == 0 ? 0 : dataList.duration,
          timingFunction: 'linear',
          delay: 0,
        },
        () => {
          num = num + 1
          if (num < dataList.list.length) {
            this.addAnimation(name, dataList, num)
          }
        }
      )
    },
    /* 长按当前视频回调 */
    longpress(item) {
      this.$emit('longpress', item)
    },
    /* 视频点赞、关注 */
    fabulousBtn(data) {
      this.$set(this.vodList, data.index, data.obj)
    },
  },
}
