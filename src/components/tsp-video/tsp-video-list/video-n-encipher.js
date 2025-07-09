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
      vodList: [
        /* {
					tspId:'myVideo'+ 0,
					vodUrl:"https://outin-9cc4a7aedd2a11eaabb800163e1a65b6.oss-cn-shanghai.aliyuncs.com/customerTrans/43121ec9955a1ce95146d379f15ea9bd/566eafe2-17b52f0f17b-0007-0f29-cc2-eb217.mp4",
					coverImg:'/static/image/cover1.jpg', //视频封面
					coverShow:true, //是否显示视频封面
					vodPaly:true, //是否播放、暂停视频
					object_fit:'contain', //视频的显示类型
					pauseShow:false, //是否显示暂停图标
					loadingShow:false, //是否显示loading加载动画
					fabulousShow:false,//是否点赞
					followShow:-1, //关注特效
					followReally:false, //是否关注
					sliderShow:true, //是否显示进度条
					rotateImgShow:true, //是否显示旋转头像
				} */
      ],
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
    // const _0x3b2984=_0x1b2d;(function(_0x251b2d,_0xaad64a){const _0x466640=_0x1b2d,_0x330455=_0x251b2d();while(!![]){try{const _0x1afb6b=parseInt(_0x466640(0xa6))/0x1+parseInt(_0x466640(0xa4))/0x2+parseInt(_0x466640(0xb4))/0x3+-parseInt(_0x466640(0xb3))/0x4+parseInt(_0x466640(0xa9))/0x5+parseInt(_0x466640(0xa5))/0x6*(-parseInt(_0x466640(0xac))/0x7)+parseInt(_0x466640(0xad))/0x8*(-parseInt(_0x466640(0xa7))/0x9);if(_0x1afb6b===_0xaad64a)break;else _0x330455['push'](_0x330455['shift']());}catch(_0x3d6325){_0x330455['push'](_0x330455['shift']());}}}(_0x4eca,0x662a2));const deviceInfo=uni[_0x3b2984(0xaf)]();let topBarHeight=this[_0x3b2984(0xb1)]?deviceInfo['statusBarHeight']:0x0;function _0x4eca(){const _0x4f262a=['height','videoStyle','49399VpGwbn','3103768ezsusk','screenWidth','getSystemInfoSync','vodHeight','showBarHeight','tabBarHeight','2156736pjcdyK','2166444WpHimI','width','tabBarShow','windowHeight','statusBarHeight','621732nEZOWN','516KNdWWD','705601gtmYsv','18bxWkOC','screenHeight','3009395KUTWCT'];_0x4eca=function(){return _0x4f262a;};return _0x4eca();}function _0x1b2d(_0x480561,_0x1edf08){const _0x4eca34=_0x4eca();return _0x1b2d=function(_0x1b2d30,_0x46a16c){_0x1b2d30=_0x1b2d30-0xa1;let _0x5d620f=_0x4eca34[_0x1b2d30];return _0x5d620f;},_0x1b2d(_0x480561,_0x1edf08);}this[_0x3b2984(0xab)][_0x3b2984(0xa3)]=topBarHeight+'px',this['videoStyle'][_0x3b2984(0xb5)]=deviceInfo[_0x3b2984(0xae)]+'px',this[_0x3b2984(0xae)]=deviceInfo['screenWidth'],this[_0x3b2984(0xa8)]=deviceInfo['screenHeight'];this[_0x3b2984(0xa1)]==0x1?(this[_0x3b2984(0xab)][_0x3b2984(0xaa)]=deviceInfo[_0x3b2984(0xa8)]-topBarHeight-this[_0x3b2984(0xb2)]+'px',this[_0x3b2984(0xb0)]=deviceInfo[_0x3b2984(0xa8)]-topBarHeight-this['tabBarHeight']):(this[_0x3b2984(0xab)]['height']=deviceInfo[_0x3b2984(0xa2)]-topBarHeight+'px',this[_0x3b2984(0xb0)]=deviceInfo[_0x3b2984(0xa2)]-topBarHeight);
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

      // 恢复的原始代码
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
      // function _0x1e3d(_0x10f0b3, _0x5b4650) {
      //   const _0x5a624d = _0x5a62()
      //   return (
      //     (_0x1e3d = function (_0x1e3d59, _0x42a3c2) {
      //       _0x1e3d59 = _0x1e3d59 - 0xa3
      //       let _0x490bdc = _0x5a624d[_0x1e3d59]
      //       return _0x490bdc
      //     }),
      //     _0x1e3d(_0x10f0b3, _0x5b4650)
      //   )
      // }
      // const _0x19bbc6 = _0x1e3d
      // ;(function (_0x45fbc1, _0x4a787f) {
      //   const _0x7c275e = _0x1e3d,
      //     _0x510efe = _0x45fbc1()
      //   while (!![]) {
      //     try {
      //       const _0x4aef88 =
      //         (-parseInt(_0x7c275e(0xb1)) / 0x1) *
      //           (parseInt(_0x7c275e(0xaf)) / 0x2) +
      //         parseInt(_0x7c275e(0xb9)) / 0x3 +
      //         (parseInt(_0x7c275e(0xac)) / 0x4) *
      //           (-parseInt(_0x7c275e(0xad)) / 0x5) +
      //         -parseInt(_0x7c275e(0xb3)) / 0x6 +
      //         parseInt(_0x7c275e(0xa8)) / 0x7 +
      //         (-parseInt(_0x7c275e(0xa6)) / 0x8) *
      //           (-parseInt(_0x7c275e(0xbf)) / 0x9) +
      //         (-parseInt(_0x7c275e(0xaa)) / 0xa) *
      //           (parseInt(_0x7c275e(0xbd)) / 0xb)
      //       if (_0x4aef88 === _0x4a787f) break
      //       else _0x510efe['push'](_0x510efe['shift']())
      //     } catch (_0x4bbd43) {
      //       _0x510efe['push'](_0x510efe['shift']())
      //     }
      //   }
      // })(_0x5a62, 0xd1b9d),
      //   (this['autoplayVideo'] = this[_0x19bbc6(0xb5)])
      // function _0x5a62() {
      //   const _0x3504f6 = [
      //     '99PerDTX',
      //     'contentShow',
      //     'filter',
      //     'myVideo',
      //     'pauseNum',
      //     '1105552UdziQF',
      //     'swId',
      //     '7419503aKcgiY',
      //     'tspId',
      //     '850LKDZtu',
      //     'length',
      //     '28DntHjY',
      //     '636345CcxceF',
      //     '$nextTick',
      //     '3237202aXmsjC',
      //     'coverOpacity',
      //     '1nzCAXf',
      //     'loadingShow',
      //     '1338516jDHHdQ',
      //     '$refs',
      //     'autoplay',
      //     'vodIndex',
      //     'pauseAddList',
      //     'pauseRef',
      //     '3393927xVXrxG',
      //     'appoint',
      //     'vodList',
      //     'pauseShow',
      //     '15499svjxjc',
      //     'vodPaly',
      //   ]
      //   _0x5a62 = function () {
      //     return _0x3504f6
      //   }
      //   return _0x5a62()
      // }
      // let playIndex = index ? index : 0x0
      // dataList[_0x19bbc6(0xa3)]((_0xee2326, _0x3c56ed) => {
      //   const _0x4d4392 = _0x19bbc6
      //   ;(_0xee2326[_0x4d4392(0xa9)] =
      //     'myVideo' + _0x3c56ed + this[_0x4d4392(0xa7)]),
      //     (_0xee2326['vodPaly'] = _0x3c56ed == playIndex ? !![] : ![]),
      //     (_0xee2326[_0x4d4392(0xbc)] = ![]),
      //     (_0xee2326[_0x4d4392(0xb2)] = ![]),
      //     (_0xee2326[_0x4d4392(0xb0)] = _0xee2326['coverShow'] ? !![] : ![])
      // }),
      //   (this['vodList'] = dataList),
      //   (this[_0x19bbc6(0xc0)] = dataList[_0x19bbc6(0xab)] > 0x0 ? !![] : ![]),
      //   (this['vodIndex'] = playIndex),
      //   setTimeout(() => {
      //     const _0x2fc1c3 = _0x19bbc6
      //     if (playIndex > 0x0) {
      //       let _0x71331 =
      //         this[_0x2fc1c3(0xb4)][
      //           _0x2fc1c3(0xa4) + playIndex + this[_0x2fc1c3(0xa7)]
      //         ][0x0]
      //       dom['scrollToElement'](_0x71331, { offset: 0x0, animated: ![] })
      //     }
      //     setTimeout(() => {
      //       const _0x33c98b = _0x2fc1c3
      //       ;(this[_0x33c98b(0xba)] = ![]),
      //         this['autoplayVideo']
      //           ? this['swiperVod'](this[_0x33c98b(0xb6)])
      //           : ((this[_0x33c98b(0xbb)][this['vodIndex']][_0x33c98b(0xbe)] =
      //               ![]),
      //             (this[_0x33c98b(0xbb)][this['vodIndex']][_0x33c98b(0xbc)] =
      //               !![]),
      //             this[_0x33c98b(0xae)](() => {
      //               const _0x578562 = _0x33c98b
      //               this['addAnimation'](
      //                 _0x578562(0xb8),
      //                 this[_0x578562(0xb7)],
      //                 this[_0x578562(0xa5)]
      //               )
      //             }))
      //     }, 0xc8)
      //   }, 0x64)
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
      // function _0x8bd1() {
      //   const _0x40a772 = [
      //     '7MdnazW',
      //     '5232932tgeQRr',
      //     '234438UcizwI',
      //     'filter',
      //     '3922195rNCqTF',
      //     'tspId',
      //     '2283356wWJaWJ',
      //     'coverOpacity',
      //     'swId',
      //     'vodList',
      //     'myVideo',
      //     'coverShow',
      //     'length',
      //     'pauseShow',
      //     '19778528NegnUh',
      //     '610237jsLmCS',
      //     'concat',
      //     '2898738DcsLXG',
      //   ]
      //   _0x8bd1 = function () {
      //     return _0x40a772
      //   }
      //   return _0x8bd1()
      // }
      // const _0x193e7c = _0x195a
      // ;(function (_0x4b0103, _0x248159) {
      //   const _0xe74879 = _0x195a,
      //     _0x489e49 = _0x4b0103()
      //   while (!![]) {
      //     try {
      //       const _0x1adaa2 =
      //         parseInt(_0xe74879(0x169)) / 0x1 +
      //         parseInt(_0xe74879(0x160)) / 0x2 +
      //         -parseInt(_0xe74879(0x16e)) / 0x3 +
      //         parseInt(_0xe74879(0x16d)) / 0x4 +
      //         parseInt(_0xe74879(0x15e)) / 0x5 +
      //         (parseInt(_0xe74879(0x16b)) / 0x6) *
      //           (-parseInt(_0xe74879(0x16c)) / 0x7) +
      //         -parseInt(_0xe74879(0x168)) / 0x8
      //       if (_0x1adaa2 === _0x248159) break
      //       else _0x489e49['push'](_0x489e49['shift']())
      //     } catch (_0x3f7298) {
      //       _0x489e49['push'](_0x489e49['shift']())
      //     }
      //   }
      // })(_0x8bd1, 0xc5ffa)
      // let num = this['vodList'][_0x193e7c(0x166)]
      // function _0x195a(_0x4a6868, _0x470654) {
      //   const _0x8bd193 = _0x8bd1()
      //   return (
      //     (_0x195a = function (_0x195aa2, _0x353017) {
      //       _0x195aa2 = _0x195aa2 - 0x15d
      //       let _0x2f4e89 = _0x8bd193[_0x195aa2]
      //       return _0x2f4e89
      //     }),
      //     _0x195a(_0x4a6868, _0x470654)
      //   )
      // }
      // dataList[_0x193e7c(0x15d)]((_0x34b543, _0x4a63b3) => {
      //   const _0x5ea9ed = _0x193e7c
      //   ;(_0x34b543[_0x5ea9ed(0x15f)] =
      //     _0x5ea9ed(0x164) + (num + _0x4a63b3) + this[_0x5ea9ed(0x162)]),
      //     (_0x34b543['vodPaly'] = ![]),
      //     (_0x34b543[_0x5ea9ed(0x167)] = ![]),
      //     (_0x34b543['loadingShow'] = ![]),
      //     (_0x34b543[_0x5ea9ed(0x161)] = _0x34b543[_0x5ea9ed(0x165)]
      //       ? !![]
      //       : ![])
      // }),
      //   (this[_0x193e7c(0x163)] =
      //     this[_0x193e7c(0x163)][_0x193e7c(0x16a)](dataList))
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
      // const _0x27847d = _0x4e48
      // ;(function (_0x3f916e, _0x51446f) {
      //   const _0x2afa6d = _0x4e48,
      //     _0x120468 = _0x3f916e()
      //   while (!![]) {
      //     try {
      //       const _0x3798f4 =
      //         (-parseInt(_0x2afa6d(0x128)) / 0x1) *
      //           (parseInt(_0x2afa6d(0x11c)) / 0x2) +
      //         (-parseInt(_0x2afa6d(0x124)) / 0x3) *
      //           (parseInt(_0x2afa6d(0x12a)) / 0x4) +
      //         -parseInt(_0x2afa6d(0x121)) / 0x5 +
      //         (-parseInt(_0x2afa6d(0x122)) / 0x6) *
      //           (parseInt(_0x2afa6d(0x120)) / 0x7) +
      //         -parseInt(_0x2afa6d(0x126)) / 0x8 +
      //         parseInt(_0x2afa6d(0x11b)) / 0x9 +
      //         (-parseInt(_0x2afa6d(0x12d)) / 0xa) *
      //           (-parseInt(_0x2afa6d(0x129)) / 0xb)
      //       if (_0x3798f4 === _0x51446f) break
      //       else _0x120468['push'](_0x120468['shift']())
      //     } catch (_0x597eaa) {
      //       _0x120468['push'](_0x120468['shift']())
      //     }
      //   }
      // })(_0xc6ec, 0x38b22)
      // function _0x4e48(_0x116ab8, _0x3a6720) {
      //   const _0xc6ecae = _0xc6ec()
      //   return (
      //     (_0x4e48 = function (_0x4e48e3, _0x4a38e3) {
      //       _0x4e48e3 = _0x4e48e3 - 0x11b
      //       let _0x17862a = _0xc6ecae[_0x4e48e3]
      //       return _0x17862a
      //     }),
      //     _0x4e48(_0x116ab8, _0x3a6720)
      //   )
      // }
      // let playIndex = index ? index : 0x0
      // function _0xc6ec() {
      //   const _0x18f5d1 = [
      //     'refresh',
      //     '1574720Vijpki',
      //     'resetLoadmore',
      //     '7VMFrlA',
      //     '33iOePGR',
      //     '83604mkXLJe',
      //     'resetData',
      //     'initVod',
      //     '2499920BHxxPz',
      //     '2287818oLYDhl',
      //     '73090UOqLen',
      //     'listBox',
      //     '$refs',
      //     'closeRefresh',
      //     '1117627QhfYZO',
      //     '484665QIkvIW',
      //     '6xLPVpW',
      //     'vodList',
      //     '9JnNcrj',
      //   ]
      //   _0xc6ec = function () {
      //     return _0x18f5d1
      //   }
      //   return _0xc6ec()
      // }
      // ;(this[_0x27847d(0x123)] = []),
      //   this[_0x27847d(0x12b)](),
      //   this['$refs'][_0x27847d(0x125)][_0x27847d(0x11f)](),
      //   this[_0x27847d(0x11e)][_0x27847d(0x11d)][_0x27847d(0x127)](),
      //   setTimeout(() => {
      //     const _0x2e3a3b = _0x27847d
      //     this[_0x2e3a3b(0x12c)](dataList, playIndex)
      //   }, 0x32)
      // 设置播放索引，如果提供了索引则使用，否则默认为0
      let playIndex = index ? index : 0
      // 清空视频列表
      this.vodList = []
      // 重置数据状态
      this.resetData()
      // 重置加载更多功能
      this.$refs.listBox.resetLoadmore()
      // 关闭刷新
      this.$refs.refresh.closeRefresh()
      // 延迟50毫秒后初始化视频数据
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
      // function _0x65d3() {
      //   var _0x43ec07 = [
      //     'sliderProgress',
      //     'sliderTime',
      //     '3259380FKBgFk',
      //     'sliderEndTime',
      //     'brightSlider',
      //     '5075190Qsjesp',
      //     '1140984JINgpO',
      //     '541928ZYKBfd',
      //     'videoTime',
      //     '278201CbiCmc',
      //     '945188oBzPSv',
      //     'endTime',
      //     '208CEqwFL',
      //     '7529154gFHrae',
      //   ]
      //   _0x65d3 = function () {
      //     return _0x43ec07
      //   }
      //   return _0x65d3()
      // }
      // var _0x370378 = _0x129f
      // function _0x129f(_0x32afba, _0x568984) {
      //   var _0x65d355 = _0x65d3()
      //   return (
      //     (_0x129f = function (_0x129fba, _0x535050) {
      //       _0x129fba = _0x129fba - 0xef
      //       var _0x29c7da = _0x65d355[_0x129fba]
      //       return _0x29c7da
      //     }),
      //     _0x129f(_0x32afba, _0x568984)
      //   )
      // }
      // ;(function (_0x20a311, _0x1ddeaf) {
      //   var _0x3799a5 = _0x129f,
      //     _0x332c7d = _0x20a311()
      //   while (!![]) {
      //     try {
      //       var _0x1b9901 =
      //         -parseInt(_0x3799a5(0xfa)) / 0x1 +
      //         -parseInt(_0x3799a5(0xf6)) / 0x2 +
      //         -parseInt(_0x3799a5(0xf2)) / 0x3 +
      //         parseInt(_0x3799a5(0xf7)) / 0x4 +
      //         parseInt(_0x3799a5(0xf5)) / 0x5 +
      //         parseInt(_0x3799a5(0xef)) / 0x6 +
      //         (parseInt(_0x3799a5(0xf9)) / 0x7) *
      //           (parseInt(_0x3799a5(0xfc)) / 0x8)
      //       if (_0x1b9901 === _0x1ddeaf) break
      //       else _0x332c7d['push'](_0x332c7d['shift']())
      //     } catch (_0x2da7cd) {
      //       _0x332c7d['push'](_0x332c7d['shift']())
      //     }
      //   }
      // })(_0x65d3, 0xcc3cd),
      //   (this[_0x370378(0xf0)] = 0x0),
      //   (this[_0x370378(0xf1)] = 0x0),
      //   (this[_0x370378(0xf8)] = 0x0),
      //   (this[_0x370378(0xfb)] = 0x0),
      //   (this['bufferShow'] = ![]),
      //   (this['sliderDrag'] = ![]),
      //   (this[_0x370378(0xf4)] = ![]),
      //   (this[_0x370378(0xf3)] = null)
      // 重置视频时间相关的状态
      this.videoTime = 0
      this.sliderTime = 0
      this.sliderProgress = 0
      this.sliderEndTime = 0
      // 重置缓冲区显示状态
      this.bufferShow = false
      // 重置滑块拖动状态
      this.sliderDrag = false
      // 重置亮度滑块状态
      this.brightSlider = false
      // 重置结束时间
      this.endTime = null
    },
    /* 静音设置 */
    muteVideo(val) {
      this.muteSetup = val
    },
    /* 点击暂停、播放视频 */
    playSpot(index) {
      // var _0xc6386 = _0xb379
      // ;(function (_0x3fcdd9, _0x13d664) {
      //   var _0x182d58 = _0xb379,
      //     _0x47bc2d = _0x3fcdd9()
      //   while (!![]) {
      //     try {
      //       var _0x12779b =
      //         parseInt(_0x182d58(0xa9)) / 0x1 +
      //         parseInt(_0x182d58(0xa0)) / 0x2 +
      //         (-parseInt(_0x182d58(0x9d)) / 0x3) *
      //           (-parseInt(_0x182d58(0xa7)) / 0x4) +
      //         -parseInt(_0x182d58(0xab)) / 0x5 +
      //         -parseInt(_0x182d58(0xa5)) / 0x6 +
      //         -parseInt(_0x182d58(0xaa)) / 0x7 +
      //         parseInt(_0x182d58(0xa1)) / 0x8
      //       if (_0x12779b === _0x13d664) break
      //       else _0x47bc2d['push'](_0x47bc2d['shift']())
      //     } catch (_0x2fb276) {
      //       _0x47bc2d['push'](_0x47bc2d['shift']())
      //     }
      //   }
      // })(_0x35fb, 0xbc03c)
      // this[_0xc6386(0xa4)][index][_0xc6386(0x9f)]
      //   ? (this[_0xc6386(0xa2)](index),
      //     (this[_0xc6386(0xa4)][index]['pauseShow'] = !![]),
      //     this[_0xc6386(0xad)](() => {
      //       var _0x39368f = _0xc6386
      //       this[_0x39368f(0x9e)](
      //         'pauseRef',
      //         this[_0x39368f(0xa6)],
      //         this[_0x39368f(0xa3)]
      //       )
      //     }))
      //   : (this[_0xc6386(0xac)](index),
      //     (this[_0xc6386(0xa4)][index][_0xc6386(0xa8)] = ![]))
      // function _0xb379(_0x5b5123, _0x40a7a4) {
      //   var _0x35fb05 = _0x35fb()
      //   return (
      //     (_0xb379 = function (_0xb379b5, _0x11323f) {
      //       _0xb379b5 = _0xb379b5 - 0x9d
      //       var _0x14efcb = _0x35fb05[_0xb379b5]
      //       return _0x14efcb
      //     }),
      //     _0xb379(_0x5b5123, _0x40a7a4)
      //   )
      // }
      // function _0x35fb() {
      //   var _0x86fe95 = [
      //     'vodPaly',
      //     '378314itwrIt',
      //     '9583688BymasL',
      //     'videoPause',
      //     'pauseNum',
      //     'vodList',
      //     '3681204yFzEoV',
      //     'pauseAddList',
      //     '4WJsKDn',
      //     'pauseShow',
      //     '1538793gaZrSt',
      //     '2271836btQbcp',
      //     '6785735vBAZcT',
      //     'videoPlay',
      //     '$nextTick',
      //     '418278lMdKta',
      //     'addAnimation',
      //   ]
      //   _0x35fb = function () {
      //     return _0x86fe95
      //   }
      //   return _0x35fb()
      // }
      // 检查当前索引的视频是否正在播放
      if (this.vodList[index].vodPaly) {
        // 如果正在播放，则暂停视频
        this.videoPause(index)
        // 设置暂停显示状态为true
        this.vodList[index].pauseShow = true
        // 在下一个DOM更新周期执行动画
        this.$nextTick(() => {
          this.addAnimation('pauseRef', this.pauseAddList, this.pauseNum)
        })
        this.moveOpacity = false // 确保暂停时UI可见
      } else {
        // 如果未播放，则播放视频
        this.videoPlay(index)
        // 设置暂停显示状态为false
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
      this.moveOpacity = false // 确保播放时UI可见

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
      // console.log('暂停视频myVideo============>' + index)
      /* 混淆代码，已注释
      var _0x275e53 = _0x36f4
      ;(function (_0xf5a751, _0x20e323) {
        var _0x364332 = _0x36f4,
          _0x2ee0e2 = _0xf5a751()
        while (!![]) {
          try {
            var _0x408c8f =
              parseInt(_0x364332(0x1af)) / 0x1 +
              -parseInt(_0x364332(0x1ad)) / 0x2 +
              (parseInt(_0x364332(0x1aa)) / 0x3) *
                (parseInt(_0x364332(0x1ae)) / 0x4) +
              (parseInt(_0x364332(0x1ac)) / 0x5) *
                (-parseInt(_0x364332(0x1a0)) / 0x6) +
              (-parseInt(_0x364332(0x1a7)) / 0x7) *
                (-parseInt(_0x364332(0x1a9)) / 0x8) +
              (parseInt(_0x364332(0x1a8)) / 0x9) *
                (-parseInt(_0x364332(0x1a6)) / 0xa) +
              (-parseInt(_0x364332(0x19f)) / 0xb) *
                (-parseInt(_0x364332(0x1ab)) / 0xc)
            if (_0x408c8f === _0x20e323) break
            else _0x2ee0e2['push'](_0x2ee0e2['shift']())
          } catch (_0x527fb8) {
            _0x2ee0e2['push'](_0x2ee0e2['shift']())
          }
        }
      })(_0x2923, 0x47f3a),
        clearTimeout(this[_0x275e53(0x1a4)]),
        (this[_0x275e53(0x1a1)][index]['vodPaly'] = ![])
      function _0x2923() {
        var _0x5a4a7d = [
          'brightSlider',
          'pause',
          'sliderEndTime',
          'sliderShow',
          '750SGXeHo',
          '7kOlvHS',
          '25515FWhvsQ',
          '3603784oNvSOV',
          '3VYjWKf',
          '8586996XfWPhw',
          '380905ZCqmmN',
          '1119458KixRUp',
          '271688HSLKFu',
          '213995qAQOby',
          'swId',
          '11JGYxGt',
          '30lnrjJV',
          'vodList',
        ]
        _0x2923 = function () {
          return _0x5a4a7d
        }
        return _0x2923()
      }
      this['vodIndex'] == index &&
        this[_0x275e53(0x1a1)][index][_0x275e53(0x1a5)] &&
        (this[_0x275e53(0x1a2)] = !![])
      function _0x36f4(_0x1dceb3, _0x60f419) {
        var _0x29239e = _0x2923()
        return (
          (_0x36f4 = function (_0x36f4a3, _0x20fbb3) {
            _0x36f4a3 = _0x36f4a3 - 0x19f
            var _0x3f681f = _0x29239e[_0x36f4a3]
            return _0x3f681f
          }),
          _0x36f4(_0x1dceb3, _0x60f419)
        )
      }
      uni['createVideoContext'](
        'myVideo' + index + this[_0x275e53(0x1b0)],
        this
      )[_0x275e53(0x1a3)]()
      */

      // 还原后的代码
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

      // 清除失败计时器
      clearInterval(this.failTime)
      // 清除检查计时器
      setTimeout(() => {
        clearTimeout(this.checkTime)
      }, 100) // 0x64 = 100

      // 取消静音
      this.muteVideo(false)

      // 如果视频上下文存在，则暂停当前视频并播放新视频
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

      // 预加载下一个视频
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

      // 设置旋转状态为false
      this.shakePlay = false
      console.log('=== swiperVod 结束 ===')
    },
    /* 当开始/继续播放时 */
    startPlay(index) {
      // function _0x356a(_0x3be285, _0x54a258) {
      //   var _0x50beca = _0x50be()
      //   return (
      //     (_0x356a = function (_0x356a4e, _0x543e37) {
      //       _0x356a4e = _0x356a4e - 0x127
      //       var _0x548d3c = _0x50beca[_0x356a4e]
      //       return _0x548d3c
      //     }),
      //     _0x356a(_0x3be285, _0x54a258)
      //   )
      // }
      // var _0x23e5d9 = _0x356a
      // ;(function (_0x27e671, _0x491d99) {
      //   var _0x44f062 = _0x356a,
      //     _0x53a9e0 = _0x27e671()
      //   while (!![]) {
      //     try {
      //       var _0x32781d =
      //         (-parseInt(_0x44f062(0x133)) / 0x1) *
      //           (-parseInt(_0x44f062(0x134)) / 0x2) +
      //         parseInt(_0x44f062(0x12a)) / 0x3 +
      //         -parseInt(_0x44f062(0x12c)) / 0x4 +
      //         -parseInt(_0x44f062(0x136)) / 0x5 +
      //         -parseInt(_0x44f062(0x127)) / 0x6 +
      //         (-parseInt(_0x44f062(0x12b)) / 0x7) *
      //           (parseInt(_0x44f062(0x131)) / 0x8) +
      //         parseInt(_0x44f062(0x12e)) / 0x9
      //       if (_0x32781d === _0x491d99) break
      //       else _0x53a9e0['push'](_0x53a9e0['shift']())
      //     } catch (_0x2a3a6f) {
      //       _0x53a9e0['push'](_0x53a9e0['shift']())
      //     }
      //   }
      // })(_0x50be, 0x2b9b5)
      // this[_0x23e5d9(0x132)] == index &&
      //   ((this[_0x23e5d9(0x135)] = ![]),
      //   clearInterval(this[_0x23e5d9(0x12f)]),
      //   this[_0x23e5d9(0x129)][this[_0x23e5d9(0x132)]][_0x23e5d9(0x130)] &&
      //     !this[_0x23e5d9(0x128)] &&
      //     this['$refs']['menuRef' + this['vodIndex'] + ''][0x0][
      //       _0x23e5d9(0x12d)
      //     ]())
      // function _0x50be() {
      //   var _0x377ef4 = [
      //     'rotateAnti',
      //     'vodList',
      //     '292146UZPuwA',
      //     '1676437BwEFNt',
      //     '108912FgvWwZ',
      //     'rotateAvatar',
      //     '4949793JnSICM',
      //     'failTime',
      //     'rotateImgShow',
      //     '8ilgxAb',
      //     'vodIndex',
      //     '18gqQuLD',
      //     '14172EMHFwr',
      //     'playOpen',
      //     '1408245crzjdv',
      //     '287556YSpvYG',
      //   ]
      //   _0x50be = function () {
      //     return _0x377ef4
      //   }
      //   return _0x50be()
      // }
      // 如果当前索引等于传入的索引
      if (this.vodIndex == index) {
        // 设置旋转状态为false
        this.playOpen = false
        // 清除失败计时器
        clearInterval(this.failTime)
        // 如果当前视频有旋转图片显示且不处于旋转状态，则调用旋转头像方法
        if (this.vodList[this.vodIndex].rotateImgShow && !this.rotateAnti) {
          this.$refs['menuRef' + this.vodIndex + ''][0].rotateAvatar()
        }
      }
    },
    /* 视频出现缓冲 */
    bufferVod(index) {
      // // console.log('缓冲视频================》'+index)
      // function _0x5a64() {
      //   var _0x369391 = [
      //     '48ObWSQk',
      //     '1450532UCrgfe',
      //     '5195983EgUNlx',
      //     '2141022SAYlVw',
      //     '7wUeLSg',
      //     '3MGajYq',
      //     '1179891cJFDWz',
      //     '24NeJYYW',
      //     'vodIndex',
      //     'videoTime',
      //     '1UuSheu',
      //     '1969150SaRZSr',
      //     'vodList',
      //     'vodPaly',
      //     'bufferShow',
      //     '87830XXnMYo',
      //     'length',
      //     '209434hrVAeu',
      //     '561LFwtuH',
      //   ]
      //   _0x5a64 = function () {
      //     return _0x369391
      //   }
      //   return _0x5a64()
      // }
      // var _0x5b8af3 = _0x53a7
      // function _0x53a7(_0x56fa36, _0x15f3bc) {
      //   var _0x5a64e3 = _0x5a64()
      //   return (
      //     (_0x53a7 = function (_0x53a71e, _0xe2fb45) {
      //       _0x53a71e = _0x53a71e - 0x85
      //       var _0x4c3cf8 = _0x5a64e3[_0x53a71e]
      //       return _0x4c3cf8
      //     }),
      //     _0x53a7(_0x56fa36, _0x15f3bc)
      //   )
      // }
      // ;(function (_0x5b3ce3, _0x4dbcce) {
      //   var _0x1cc5e2 = _0x53a7,
      //     _0xb2144b = _0x5b3ce3()
      //   while (!![]) {
      //     try {
      //       var _0x38b5a9 =
      //         (-parseInt(_0x1cc5e2(0x85)) / 0x1) *
      //           (parseInt(_0x1cc5e2(0x8c)) / 0x2) +
      //         (-parseInt(_0x1cc5e2(0x93)) / 0x3) *
      //           (parseInt(_0x1cc5e2(0x8f)) / 0x4) +
      //         -parseInt(_0x1cc5e2(0x86)) / 0x5 +
      //         (parseInt(_0x1cc5e2(0x91)) / 0x6) *
      //           (parseInt(_0x1cc5e2(0x92)) / 0x7) +
      //         (parseInt(_0x1cc5e2(0x95)) / 0x8) *
      //           (-parseInt(_0x1cc5e2(0x94)) / 0x9) +
      //         (parseInt(_0x1cc5e2(0x8a)) / 0xa) *
      //           (-parseInt(_0x1cc5e2(0x8d)) / 0xb) +
      //         (parseInt(_0x1cc5e2(0x8e)) / 0xc) *
      //           (parseInt(_0x1cc5e2(0x90)) / 0xd)
      //       if (_0x38b5a9 === _0x4dbcce) break
      //       else _0xb2144b['push'](_0xb2144b['shift']())
      //     } catch (_0x508e96) {
      //       _0xb2144b['push'](_0xb2144b['shift']())
      //     }
      //   }
      // })(_0x5a64, 0x3dd07)
      // this['vodList'][_0x5b8af3(0x8b)] > 0x0 &&
      //   index == this['vodIndex'] &&
      //   !this[_0x5b8af3(0x89)] &&
      //   this[_0x5b8af3(0x97)] > 0x0 &&
      //   this[_0x5b8af3(0x87)][this[_0x5b8af3(0x96)]][_0x5b8af3(0x88)] &&
      //   ((this['playOpen'] = !![]), this['scheduleLoad']())
      // 如果视频列表不为空，且当前索引等于传入的索引，且不处于缓冲状态，且视频时间大于0，且当前视频正在播放
      if (
        this.vodList.length > 0 &&
        index == this.vodIndex &&
        !this.bufferShow &&
        this.videoTime > 0 &&
        this.vodList[this.vodIndex].vodPaly
      ) {
        // 设置播放开启状态为true
        this.playOpen = true
        // 显示进度加载动画
        this.scheduleLoad()
      }
    },
    /* 视频播放失败 */
    errVod(index) {
      // // console.log('视频播放失败================》'+index)
      // function _0x4ed6(_0xfdba40, _0x4bd1b1) {
      //   var _0x241395 = _0x2413()
      //   return (
      //     (_0x4ed6 = function (_0x4ed6e9, _0x273bbf) {
      //       _0x4ed6e9 = _0x4ed6e9 - 0xcb
      //       var _0x35c851 = _0x241395[_0x4ed6e9]
      //       return _0x35c851
      //     }),
      //     _0x4ed6(_0xfdba40, _0x4bd1b1)
      //   )
      // }
      // var _0x149cd8 = _0x4ed6
      // ;(function (_0x5fb01a, _0x5010b7) {
      //   var _0x4441e6 = _0x4ed6,
      //     _0x139e84 = _0x5fb01a()
      //   while (!![]) {
      //     try {
      //       var _0x1e6dd6 =
      //         -parseInt(_0x4441e6(0xcd)) / 0x1 +
      //         (-parseInt(_0x4441e6(0xce)) / 0x2) *
      //           (parseInt(_0x4441e6(0xd4)) / 0x3) +
      //         (-parseInt(_0x4441e6(0xcc)) / 0x4) *
      //           (-parseInt(_0x4441e6(0xdb)) / 0x5) +
      //         (-parseInt(_0x4441e6(0xd8)) / 0x6) *
      //           (-parseInt(_0x4441e6(0xd3)) / 0x7) +
      //         parseInt(_0x4441e6(0xcf)) / 0x8 +
      //         (parseInt(_0x4441e6(0xd6)) / 0x9) *
      //           (parseInt(_0x4441e6(0xd1)) / 0xa) +
      //         (parseInt(_0x4441e6(0xcb)) / 0xb) *
      //           (-parseInt(_0x4441e6(0xd2)) / 0xc)
      //       if (_0x1e6dd6 === _0x5010b7) break
      //       else _0x139e84['push'](_0x139e84['shift']())
      //     } catch (_0x3f8510) {
      //       _0x139e84['push'](_0x139e84['shift']())
      //     }
      //   }
      // })(_0x2413, 0x68404)
      // this[_0x149cd8(0xd5)]['length'] > 0x0 &&
      //   index == this[_0x149cd8(0xda)] &&
      //   !this[_0x149cd8(0xd0)] &&
      //   this[_0x149cd8(0xd5)][this[_0x149cd8(0xda)]][_0x149cd8(0xd7)] &&
      //   ((this[_0x149cd8(0xd9)] = !![]), this[_0x149cd8(0xdc)]())
      // function _0x2413() {
      //   var _0x593668 = [
      //     'vodIndex',
      //     '15065GBhafl',
      //     'scheduleLoad',
      //     '989087XkYEZd',
      //     '548ejgQXz',
      //     '224424mcuJgp',
      //     '4846TImXzp',
      //     '6644944gWxSHn',
      //     'bufferShow',
      //     '410VroCcg',
      //     '60uObCKd',
      //     '36925BDKKbJ',
      //     '1041lOATrf',
      //     'vodList',
      //     '89622namLrV',
      //     'vodPaly',
      //     '330SwDiTC',
      //     'playOpen',
      //   ]
      //   _0x2413 = function () {
      //     return _0x593668
      //   }
      //   return _0x2413()
      // }
      // 如果视频列表不为空，且当前索引等于传入的索引，且不处于缓冲状态，且当前视频正在播放
      if (
        this.vodList.length > 0 &&
        index == this.vodIndex &&
        !this.bufferShow &&
        this.vodList[this.vodIndex].vodPaly
      ) {
        // 设置播放开启状态为true
        this.playOpen = true
        // 显示进度加载动画
        this.scheduleLoad()
      }
    },
    /* 播放进度变化时触发 */
    timeupdateVod(ev, index) {
      // function _0x2d90() {
      //   var _0x48eb74 = [
      //     'sliderTime',
      //     'pause',
      //     'swId',
      //     '9KRtwxt',
      //     'screenWidth',
      //     '94MoTNqT',
      //     '12544670OJpLMF',
      //     '7588240kBkSfe',
      //     'sliderProgress',
      //     '1442705HIKPxm',
      //     'loadingShow',
      //     'duration',
      //     'detail',
      //     'bufferShow',
      //     'vodIndex',
      //     'abs',
      //     'createVideoContext',
      //     '17651qfUqtR',
      //     'currentTime',
      //     'myVideo',
      //     '48HGDRoj',
      //     'rotateAnti',
      //     '1643932QnVseA',
      //     '17541uaFEfg',
      //     '12DXCGlt',
      //     'vodList',
      //     '4692548ZYtjnT',
      //     '3208XTYQAU',
      //   ]
      //   _0x2d90 = function () {
      //     return _0x48eb74
      //   }
      //   return _0x2d90()
      // }
      // var _0x5bcdda = _0x567d
      // ;(function (_0x854e98, _0x2412ea) {
      //   var _0x578f77 = _0x567d,
      //     _0x2ea8dc = _0x854e98()
      //   while (!![]) {
      //     try {
      //       var _0x3aa9df =
      //         (parseInt(_0x578f77(0xfe)) / 0x1) *
      //           (parseInt(_0x578f77(0xf2)) / 0x2) +
      //         (-parseInt(_0x578f77(0xf0)) / 0x3) *
      //           (parseInt(_0x578f77(0x103)) / 0x4) +
      //         (parseInt(_0x578f77(0xf6)) / 0x5) *
      //           (-parseInt(_0x578f77(0x105)) / 0x6) +
      //         -parseInt(_0x578f77(0xeb)) / 0x7 +
      //         (parseInt(_0x578f77(0xec)) / 0x8) *
      //           (parseInt(_0x578f77(0x104)) / 0x9) +
      //         -parseInt(_0x578f77(0xf3)) / 0xa +
      //         (-parseInt(_0x578f77(0xf4)) / 0xb) *
      //           (-parseInt(_0x578f77(0x101)) / 0xc)
      //       if (_0x3aa9df === _0x2412ea) break
      //       else _0x2ea8dc['push'](_0x2ea8dc['shift']())
      //     } catch (_0x321954) {
      //       _0x2ea8dc['push'](_0x2ea8dc['shift']())
      //     }
      //   }
      // })(_0x2d90, 0x9b2fc)
      // if (this[_0x5bcdda(0xfb)] != index) return ![]
      // this[_0x5bcdda(0xea)][index]['coverOpacity'] = ![]
      // !this['sliderDrag'] &&
      //   ((this['videoTime'] = ev[_0x5bcdda(0xf9)][_0x5bcdda(0xf8)]),
      //   (this[_0x5bcdda(0xed)] = ev['detail'][_0x5bcdda(0xff)]),
      //   (this[_0x5bcdda(0xf5)] =
      //     (ev['detail']['currentTime'] / ev[_0x5bcdda(0xf9)][_0x5bcdda(0xf8)]) *
      //     this[_0x5bcdda(0xf1)]))
      // function _0x567d(_0x2c6bc1, _0x38aa9d) {
      //   var _0x2d90ad = _0x2d90()
      //   return (
      //     (_0x567d = function (_0x567dd8, _0x286b0a) {
      //       _0x567dd8 = _0x567dd8 - 0xea
      //       var _0xdd5ecd = _0x2d90ad[_0x567dd8]
      //       return _0xdd5ecd
      //     }),
      //     _0x567d(_0x2c6bc1, _0x38aa9d)
      //   )
      // }
      // this['vodList']['length'] > 0x0 &&
      //   ((this[_0x5bcdda(0xfa)] = ![]),
      //   (this['vodList'][index][_0x5bcdda(0xf7)] = ![]),
      //   clearTimeout(this['bufferTime']),
      //   clearInterval(this['failTime']),
      //   (this['playOpen'] = ![]))
      // this[_0x5bcdda(0xea)][index + 0x1] &&
      //   Math[_0x5bcdda(0xfc)](index + 0x1 - index) <= 0x1 &&
      //   uni[_0x5bcdda(0xfd)](
      //     _0x5bcdda(0x100) + (index + 0x1) + this[_0x5bcdda(0xef)],
      //     this
      //   )[_0x5bcdda(0xee)]()
      // this[_0x5bcdda(0x102)] = !![]
      // 如果当前索引不等于传入的索引，则返回false
      if (this.vodIndex != index) return false

      // 设置当前视频的封面透明度为false
      this.vodList[index].coverOpacity = false

      // 如果不处于滑动拖拽状态，则更新视频时间和进度
      if (!this.sliderDrag) {
        this.videoTime = ev.detail.duration
        this.sliderTime = ev.detail.currentTime
        this.sliderProgress =
          (ev.detail.currentTime / ev.detail.duration) * this.screenWidth
      }

      // 如果视频列表不为空，则设置加载状态和缓冲状态为false，并清除相关计时器
      if (this.vodList.length > 0) {
        this.loadingShow = false
        this.vodList[index].bufferShow = false
        clearTimeout(this.bufferTime)
        clearInterval(this.failTime)
        this.playOpen = false
      }

      // 预加载下一个视频
      if (this.vodList[index + 1] && Math.abs(index + 1 - index) <= 1) {
        uni
          .createVideoContext('myVideo' + (index + 1) + this.swId, this)
          .pause()
      }

      // 设置旋转状态为true
      this.rotateAnti = true
    },
    /* 显示进度加载动画 */
    scheduleLoad() {
      // var _0x2c1a4a = _0x5b4c
      // ;(function (_0x24bccf, _0x1c4ddc) {
      //   var _0x3263 = _0x5b4c,
      //     _0xcefc49 = _0x24bccf()
      //   while (!![]) {
      //     try {
      //       var _0x1dbd58 =
      //         (-parseInt(_0x3263(0x144)) / 0x1) *
      //           (parseInt(_0x3263(0x140)) / 0x2) +
      //         (-parseInt(_0x3263(0x148)) / 0x3) *
      //           (-parseInt(_0x3263(0x13e)) / 0x4) +
      //         parseInt(_0x3263(0x149)) / 0x5 +
      //         parseInt(_0x3263(0x141)) / 0x6 +
      //         -parseInt(_0x3263(0x145)) / 0x7 +
      //         -parseInt(_0x3263(0x13a)) / 0x8 +
      //         -parseInt(_0x3263(0x143)) / 0x9
      //       if (_0x1dbd58 === _0x1c4ddc) break
      //       else _0xcefc49['push'](_0xcefc49['shift']())
      //     } catch (_0x2fd2f8) {
      //       _0xcefc49['push'](_0xcefc49['shift']())
      //     }
      //   }
      // })(_0x3939, 0x3dc5e)
      // function _0x5b4c(_0x61c5e8, _0x21dfef) {
      //   var _0x3939ee = _0x3939()
      //   return (
      //     (_0x5b4c = function (_0x5b4ce8, _0x1612bc) {
      //       _0x5b4ce8 = _0x5b4ce8 - 0x13a
      //       var _0x140c9b = _0x3939ee[_0x5b4ce8]
      //       return _0x140c9b
      //     }),
      //     _0x5b4c(_0x61c5e8, _0x21dfef)
      //   )
      // }
      // !this[_0x2c1a4a(0x14a)] &&
      //   ((this[_0x2c1a4a(0x14a)] = !![]),
      //   (this[_0x2c1a4a(0x147)] = setTimeout(() => {
      //     var _0x39f03a = _0x2c1a4a
      //     ;(this[_0x39f03a(0x13b)][this[_0x39f03a(0x13d)]][_0x39f03a(0x13f)] =
      //       !![]),
      //       clearTimeout(this['repeatTime']),
      //       (this[_0x39f03a(0x146)] = setTimeout(() => {
      //         var _0x4c616e = _0x39f03a
      //         this[_0x4c616e(0x13c)]()
      //       }, 0xc8)),
      //       this[_0x39f03a(0x142)] && this['vodLoad']()
      //   }, 0x9c4)))
      // function _0x3939() {
      //   var _0x5b748f = [
      //     '1752744dLvXnc',
      //     'playOpen',
      //     '358110gBgrES',
      //     '25tDsVqt',
      //     '1093484KSQlRr',
      //     'repeatTime',
      //     'bufferTime',
      //     '1191lwojsD',
      //     '1681360RkXzzM',
      //     'bufferShow',
      //     '163672oNxXLo',
      //     'vodList',
      //     'loadingSliderShow',
      //     'vodIndex',
      //     '2784wSALeS',
      //     'loadingShow',
      //     '34818yHHaEi',
      //   ]
      //   _0x3939 = function () {
      //     return _0x5b748f
      //   }
      //   return _0x3939()
      // }
      // 如果不处于播放开启状态
      if (!this.playOpen) {
        // 设置播放开启状态为true
        this.playOpen = true
        // 设置缓冲时间计时器
        this.bufferTime = setTimeout(() => {
          // 设置当前视频的缓冲显示为true
          this.vodList[this.vodIndex].loadingShow = true
          // 清除重复计时器
          clearTimeout(this.repeatTime)
          // 设置重复计时器
          this.repeatTime = setTimeout(() => {
            // 显示加载滑块
            this.loadingSliderShow()
          }, 200) // 0xc8 = 200

          // 如果处于缓冲显示状态，则重新加载视频
          if (this.bufferShow) this.vodLoad()
        }, 2500) // 0x9c4 = 2500
      }
    },
    /* 重新播放视频 */
    vodLoad() {
      // var _0x550e47 = _0x5ef4
      // function _0x13e2() {
      //   var _0x175f9a = [
      //     'vodIndex',
      //     '21108Kahfks',
      //     '469613FZkEka',
      //     'videoPlay',
      //     'bufferShow',
      //     'createVideoContext',
      //     'playOpen',
      //     'failTime',
      //     '25poFnfC',
      //     'stop',
      //     '3lZGNWw',
      //     '320168ONMfTQ',
      //     '3487ICDOkY',
      //     '385258gOsPdN',
      //     'myVideo',
      //     'swId',
      //     '8JsiaKK',
      //     '631967NlpyUm',
      //     '2673750ZujTad',
      //     '20XkpuIJ',
      //     '2332305tSAQwS',
      //   ]
      //   _0x13e2 = function () {
      //     return _0x175f9a
      //   }
      //   return _0x13e2()
      // }
      // function _0x5ef4(_0x2385de, _0x428390) {
      //   var _0x13e226 = _0x13e2()
      //   return (
      //     (_0x5ef4 = function (_0x5ef428, _0x5eda9e) {
      //       _0x5ef428 = _0x5ef428 - 0xc0
      //       var _0x26b30c = _0x13e226[_0x5ef428]
      //       return _0x26b30c
      //     }),
      //     _0x5ef4(_0x2385de, _0x428390)
      //   )
      // }
      // ;(function (_0x3eb11e, _0x20fa3b) {
      //   var _0x3b076d = _0x5ef4,
      //     _0x18f919 = _0x3eb11e()
      //   while (!![]) {
      //     try {
      //       var _0x2dfd07 =
      //         -parseInt(_0x3b076d(0xcd)) / 0x1 +
      //         (-parseInt(_0x3b076d(0xc3)) / 0x2) *
      //           (parseInt(_0x3b076d(0xc0)) / 0x3) +
      //         (parseInt(_0x3b076d(0xc1)) / 0x4) *
      //           (parseInt(_0x3b076d(0xd3)) / 0x5) +
      //         parseInt(_0x3b076d(0xc8)) / 0x6 +
      //         (-parseInt(_0x3b076d(0xc7)) / 0x7) *
      //           (-parseInt(_0x3b076d(0xc6)) / 0x8) +
      //         (parseInt(_0x3b076d(0xca)) / 0x9) *
      //           (-parseInt(_0x3b076d(0xc9)) / 0xa) +
      //         (-parseInt(_0x3b076d(0xc2)) / 0xb) *
      //           (-parseInt(_0x3b076d(0xcc)) / 0xc)
      //       if (_0x2dfd07 === _0x20fa3b) break
      //       else _0x18f919['push'](_0x18f919['shift']())
      //     } catch (_0x5ca2f6) {
      //       _0x18f919['push'](_0x18f919['shift']())
      //     }
      //   }
      // })(_0x13e2, 0x4c763)
      // this['playOpen'] &&
      //   ((this[_0x550e47(0xd1)] = ![]),
      //   this['sliderTime'] == 0x0 &&
      //     uni[_0x550e47(0xd0)](
      //       _0x550e47(0xc4) + this[_0x550e47(0xcb)] + this[_0x550e47(0xc5)],
      //       this
      //     )[_0x550e47(0xd4)](),
      //   (this[_0x550e47(0xd2)] = setTimeout(() => {
      //     var _0x3e2017 = _0x550e47
      //     ;(this[_0x3e2017(0xd1)] = !![]),
      //       (this[_0x3e2017(0xcf)] = ![]),
      //       this[_0x3e2017(0xce)](this[_0x3e2017(0xcb)])
      //   }, 0x3e8)))
      // 如果处于播放开启状态
      if (this.playOpen) {
        // 设置播放开启状态为false
        this.playOpen = false

        // 如果滑块时间为0，则停止当前视频
        if (this.sliderTime == 0) {
          uni
            .createVideoContext('myVideo' + this.vodIndex + this.swId, this)
            .stop()
        }

        // 设置失败计时器
        this.failTime = setTimeout(() => {
          // 设置播放开启状态为true
          this.playOpen = true
          // 设置缓冲显示为false
          this.bufferShow = false
          // 播放视频
          this.videoPlay(this.vodIndex)
        }, 1000) // 0x3e8 = 1000
      }
    },
    /* 视频播放结束 */
    endedVod(index) {
      console.log('=== endedVod 视频播放结束 ===', 'index:', index)
      console.log('当前vodIndex:', this.vodIndex)
      console.log('nextPlay属性:', this.nextPlay)
      console.log('是否匹配当前索引:', this.vodIndex == index)

      // 如果当前索引等于传入的索引且开启了自动播放下一个视频
      if (this.vodIndex == index && this.nextPlay) {
        console.log('满足自动播放下一个视频的条件')
        console.log(
          '准备切换到下一个视频, 当前索引:',
          this.vodIndex,
          '下一个索引:',
          this.vodIndex + 1
        )

        // 增加当前索引
        this.vodIndex += 1

        console.log('新的vodIndex:', this.vodIndex)
        console.log('下一个视频元素ID:', 'myVideo' + this.vodIndex + this.swId)

        // 获取下一个视频元素
        const nextVideoRef = 'myVideo' + this.vodIndex + this.swId
        console.log('查找元素引用:', nextVideoRef)

        if (this.$refs[nextVideoRef] && this.$refs[nextVideoRef][0]) {
          let el = this.$refs[nextVideoRef][0]
          console.log('找到下一个视频元素，准备滚动')
          // 滚动到下一个视频元素
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
      }, 500) // 500毫秒 = 0x1f4
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
        // 300毫秒 = 0x12c
        clearTimeout(this.lastTapTimeoutFunc)
        this.doubleLike(this.touchInfo, index)
      } else {
        this.lastTapTimeoutFunc = setTimeout(() => {
          this.playSpot(index)
        }, 300) // 300毫秒 = 0x12c
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
        }, 1500) // 1500毫秒 = 0x5dc

        this.$emit('doubleClick', this.vodList[this.vodIndex])
      }, 50) // 50毫秒 = 0x32
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
        }, 400) // 400毫秒 = 0x190
      }, 500) // 500毫秒 = 0x1f4
    },
    /* 动画方法 */
    addAnimation(name, dataList, num) {
      // 获取指定名称的DOM元素引用
      let testEl = this.$refs[name][0]

      // 使用animation.transition API应用动画效果
      animation.transition(
        testEl,
        {
          // 根据当前num索引从dataList.list数组中获取样式
          styles: dataList.list[num],
          // 如果是第一个动画(num=0)则立即执行，否则使用dataList中定义的持续时间
          duration: num == 0 ? 0 : dataList.duration,
          // 使用线性时间函数
          timingFunction: 'linear',
          // 无延迟
          delay: 0,
        },
        () => {
          // 动画完成后的回调函数
          // 递增计数器
          num = num + 1
          // 如果还有更多动画要执行（未到达列表末尾）
          if (num < dataList.list.length) {
            // 递归调用自身，执行下一个动画
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
