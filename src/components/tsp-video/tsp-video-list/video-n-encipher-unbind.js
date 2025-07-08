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
    // vodIndex(newIndex, oldIndex) {
    //   function _0x39ee(_0x56f547, _0x211810) {
    //     var _0x46ef7e = _0x46ef()
    //     return (
    //       (_0x39ee = function (_0x39ee34, _0x53287e) {
    //         _0x39ee34 = _0x39ee34 - 0x1b0
    //         var _0x2ed594 = _0x46ef7e[_0x39ee34]
    //         return _0x2ed594
    //       }),
    //       _0x39ee(_0x56f547, _0x211810)
    //     )
    //   }
    //   var _0x448f8b = _0x39ee
    //   ;(function (_0x29f8d6, _0x439e05) {
    //     var _0xa6a669 = _0x39ee,
    //       _0x3440a3 = _0x29f8d6()
    //     while (!![]) {
    //       try {
    //         var _0x17063a =
    //           (-parseInt(_0xa6a669(0x1c1)) / 0x1) *
    //             (-parseInt(_0xa6a669(0x1c7)) / 0x2) +
    //           parseInt(_0xa6a669(0x1b3)) / 0x3 +
    //           (parseInt(_0xa6a669(0x1c0)) / 0x4) *
    //             (-parseInt(_0xa6a669(0x1bd)) / 0x5) +
    //           (parseInt(_0xa6a669(0x1b9)) / 0x6) *
    //             (parseInt(_0xa6a669(0x1bb)) / 0x7) +
    //           -parseInt(_0xa6a669(0x1c8)) / 0x8 +
    //           (-parseInt(_0xa6a669(0x1c4)) / 0x9) *
    //             (parseInt(_0xa6a669(0x1b6)) / 0xa) +
    //           -parseInt(_0xa6a669(0x1bf)) / 0xb
    //         if (_0x17063a === _0x439e05) break
    //         else _0x3440a3['push'](_0x3440a3['shift']())
    //       } catch (_0x18ed03) {
    //         _0x3440a3['push'](_0x3440a3['shift']())
    //       }
    //     }
    //   })(_0x46ef, 0x86e4f)
    //   if (!this[_0x448f8b(0x1b7)]) return
    //   this[_0x448f8b(0x1b2)]()
    //   oldIndex >= 0x0 &&
    //     !this['appoint'] &&
    //     ((this[_0x448f8b(0x1be)][oldIndex][_0x448f8b(0x1b5)] = this['vodList'][
    //       oldIndex
    //     ][_0x448f8b(0x1c5)]
    //       ? !![]
    //       : ![]),
    //     (this['vodList'][oldIndex]['vodPaly'] = ![]),
    //     (this[_0x448f8b(0x1be)][oldIndex][_0x448f8b(0x1b4)] = ![]),
    //     (this[_0x448f8b(0x1be)][oldIndex][_0x448f8b(0x1b8)] = ![]),
    //     uni[_0x448f8b(0x1b1)](
    //       _0x448f8b(0x1ba) + oldIndex + this[_0x448f8b(0x1b0)],
    //       this
    //     )[_0x448f8b(0x1c3)]())
    //   function _0x46ef() {
    //     var _0x456b0f = [
    //       'coverOpacity',
    //       '68270yidxDZ',
    //       'contentShow',
    //       'loadingShow',
    //       '6hSIyKr',
    //       'myVideo',
    //       '5983096FUAOsm',
    //       'swiperVod',
    //       '235GPwcnI',
    //       'vodList',
    //       '5966785JhsEtb',
    //       '34708qCyEmM',
    //       '2iZVeqd',
    //       'changeVod',
    //       'pause',
    //       '45KnFCOg',
    //       'coverShow',
    //       'autoplayVideo',
    //       '972232tTmkCg',
    //       '2451624VWlriM',
    //       'swId',
    //       'createVideoContext',
    //       'resetData',
    //       '49227XHnQLR',
    //       'pauseShow',
    //     ]
    //     _0x46ef = function () {
    //       return _0x456b0f
    //     }
    //     return _0x46ef()
    //   }
    //   this['$nextTick'](() => {
    //     var _0x5971e3 = _0x448f8b
    //     ;(this[_0x5971e3(0x1c2)] = ![]),
    //       this[_0x5971e3(0x1c6)] &&
    //         ((this['autoplayVideo'] = !![]), this[_0x5971e3(0x1bc)](newIndex))
    //   })
    // },
    vodIndex(newIndex, oldIndex) {
      // 恢复的原始代码
      if (!this.contentShow) return
      this.resetData()

      if (oldIndex >= 0 && !this.appoint) {
        this.vodList[oldIndex].coverOpacity = this.vodList[oldIndex].coverShow
          ? true
          : false
        this.vodList[oldIndex].vodPaly = false
        this.vodList[oldIndex].pauseShow = false
        this.vodList[oldIndex].loadingShow = false
        uni.createVideoContext('myVideo' + oldIndex + this.swId, this).pause()
      }

      this.$nextTick(() => {
        this.changeVod = false
        if (this.autoplayVideo) {
          this.autoplayVideo = true
          this.swiperVod(newIndex)
        }
      })
    },
  },

  methods: {
    /* 滚动监听 */
    scrolls(ev) {
      // const _0x2b632d = _0x160c
      // function _0x2f4e() {
      //   const _0xf6239a = [
      //     '4952gYoUuW',
      //     'vodHeight',
      //     '3015235VCLntF',
      //     '4oBEiIS',
      //     'timeout',
      //     '274iQaeGi',
      //     'shakePlay',
      //     '1615179qdVSnu',
      //     'currentIndex',
      //     '1299012mgxUJh',
      //     'startPlayVod',
      //     'abs',
      //     '136tprfWN',
      //     'contentOffset',
      //     '80451eRsYrP',
      //     '7bTNSzw',
      //     '235520CioOyf',
      //     'moveOpacity',
      //     'speedHide',
      //     'changeIndex',
      //     '1053786jiRYJa',
      //     'vodIndex',
      //     '110AYiqUX',
      //   ]
      //   _0x2f4e = function () {
      //     return _0xf6239a
      //   }
      //   return _0x2f4e()
      // }
      // ;(function (_0x4c570c, _0x20f0c2) {
      //   const _0x45f7a8 = _0x160c,
      //     _0xa89179 = _0x4c570c()
      //   while (!![]) {
      //     try {
      //       const _0x7a820a =
      //         (-parseInt(_0x45f7a8(0xa9)) / 0x1) *
      //           (parseInt(_0x45f7a8(0x97)) / 0x2) +
      //         parseInt(_0x45f7a8(0x99)) / 0x3 +
      //         (-parseInt(_0x45f7a8(0xac)) / 0x4) *
      //           (parseInt(_0x45f7a8(0xab)) / 0x5) +
      //         (-parseInt(_0x45f7a8(0xa6)) / 0x6) *
      //           (-parseInt(_0x45f7a8(0xa1)) / 0x7) +
      //         (parseInt(_0x45f7a8(0x9e)) / 0x8) *
      //           (-parseInt(_0x45f7a8(0xa0)) / 0x9) +
      //         -parseInt(_0x45f7a8(0xa2)) / 0xa +
      //         (-parseInt(_0x45f7a8(0xa8)) / 0xb) *
      //           (-parseInt(_0x45f7a8(0x9b)) / 0xc)
      //       if (_0x7a820a === _0x20f0c2) break
      //       else _0xa89179['push'](_0xa89179['shift']())
      //     } catch (_0x223148) {
      //       _0xa89179['push'](_0xa89179['shift']())
      //     }
      //   }
      // })(_0x2f4e, 0x52e5c),
      //   clearTimeout(this[_0x2b632d(0xad)]),
      //   (this[_0x2b632d(0xa4)] = !![])
      // let index = Math['round'](
      //   Math[_0x2b632d(0x9d)](ev[_0x2b632d(0x9f)]['y']) / this[_0x2b632d(0xaa)]
      // )
      // function _0x160c(_0x3be48e, _0x3f8a53) {
      //   const _0x2f4e7e = _0x2f4e()
      //   return (
      //     (_0x160c = function (_0x160cb1, _0x3611f2) {
      //       _0x160cb1 = _0x160cb1 - 0x97
      //       let _0xd6d533 = _0x2f4e7e[_0x160cb1]
      //       return _0xd6d533
      //     }),
      //     _0x160c(_0x3be48e, _0x3f8a53)
      //   )
      // }
      // ;(this[_0x2b632d(0xa5)] = index),
      //   (this[_0x2b632d(0xa3)] = ev['isDragging']),
      //   (this[_0x2b632d(0xad)] = setTimeout(() => {
      //     const _0x4c907b = _0x2b632d
      //     ;(this[_0x4c907b(0x9a)] = index),
      //       (this['speedHide'] = ![]),
      //       (this[_0x4c907b(0x98)] = !![]),
      //       this[_0x4c907b(0x9c)] &&
      //         index != this[_0x4c907b(0xa7)] &&
      //         (this[_0x4c907b(0xa7)] = index)
      //   }, 0x64))
      clearTimeout(this.timeout)
      this.speedHide = true
      let index = Math.round(Math.abs(ev.contentOffset.y) / this.vodHeight)

      this.changeIndex = index
      this.moveOpacity = ev.isDragging
      this.timeout = setTimeout(() => {
        this.currentIndex = index
        this.speedHide = false
        this.shakePlay = true
        if (this.startPlayVod && index != this.vodIndex) {
          this.vodIndex = index
        }
      }, 100)
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
              this.addAnimation('pauseAddList', this.pauseNum, this.pauseRef)
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
          this.addAnimation('pauseRef', this.pauseNum, this.pauseAddList)
        })
      } else {
        // 如果未播放，则播放视频
        this.videoPlay(index)
        // 设置暂停显示状态为false
        this.vodList[index].pauseShow = false
      }
    },
    /* 播放视频 */
    videoPlay(index) {
      // console.log('播放视频myVideo============>' + index)
      /* 混淆代码，已注释
      function _0x5c60() {
        const _0x59b174 = [
          '53296cNtfJk',
          '4765519CxSBdo',
          '321RgCGJX',
          'myVideo',
          '$set',
          '12LAoZmI',
          'swId',
          '690327hqLWfB',
          '189fwWOzy',
          'brightSlider',
          '36iyjvrI',
          '209548xKhZIu',
          '82730ZewxsA',
          'vodPaly',
          'vodList',
          'assign',
          '2uFKWgc',
          'play',
          '7272UbKLHM',
          '1326220moTjfk',
        ]
        _0x5c60 = function () {
          return _0x59b174
        }
        return _0x5c60()
      }
      const _0xc7bbd3 = _0x47f0
      function _0x47f0(_0x2e623d, _0x3b717a) {
        const _0x5c6086 = _0x5c60()
        return (
          (_0x47f0 = function (_0x47f0bc, _0x2b783e) {
            _0x47f0bc = _0x47f0bc - 0x79
            let _0x4b3fd2 = _0x5c6086[_0x47f0bc]
            return _0x4b3fd2
          }),
          _0x47f0(_0x2e623d, _0x3b717a)
        )
      }
      ;(function (_0x4390a7, _0x3570b0) {
        const _0x2c3523 = _0x47f0,
          _0x4e83ad = _0x4390a7()
        while (!![]) {
          try {
            const _0x1d314f =
              (parseInt(_0x2c3523(0x8b)) / 0x1) *
                (-parseInt(_0x2c3523(0x7c)) / 0x2) +
              (parseInt(_0x2c3523(0x82)) / 0x3) *
                (parseInt(_0x2c3523(0x7e)) / 0x4) +
              (parseInt(_0x2c3523(0x8c)) / 0x5) *
                (-parseInt(_0x2c3523(0x8a)) / 0x6) +
              (parseInt(_0x2c3523(0x88)) / 0x7) *
                (-parseInt(_0x2c3523(0x80)) / 0x8) +
              -parseInt(_0x2c3523(0x87)) / 0x9 +
              parseInt(_0x2c3523(0x7f)) / 0xa +
              (parseInt(_0x2c3523(0x81)) / 0xb) *
                (parseInt(_0x2c3523(0x85)) / 0xc)
            if (_0x1d314f === _0x3570b0) break
            else _0x4e83ad['push'](_0x4e83ad['shift']())
          } catch (_0x1130d6) {
            _0x4e83ad['push'](_0x4e83ad['shift']())
          }
        }
      })(_0x5c60, 0x2f9a0)
      let vodInfo = Object[_0xc7bbd3(0x7b)]({}, this[_0xc7bbd3(0x7a)][index])
      ;(vodInfo[_0xc7bbd3(0x79)] = !![]),
        (vodInfo['pauseShow'] = ![]),
        this[_0xc7bbd3(0x84)](this[_0xc7bbd3(0x7a)], index, vodInfo),
        (this[_0xc7bbd3(0x89)] = ![]),
        uni['createVideoContext'](
          _0xc7bbd3(0x83) + index + this[_0xc7bbd3(0x86)],
          this
        )[_0xc7bbd3(0x7d)]()
      */

      // 还原后的代码
      let vodInfo = Object.assign({}, this.vodList[index])
      vodInfo.vodPaly = true
      vodInfo.pauseShow = false
      this.$set(this.vodList, index, vodInfo)
      this.brightSlider = false
      uni.createVideoContext('myVideo' + index + this.swId, this).play()
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
      // function _0xdc90() {
      //   var _0x475ffb = [
      //     'myVideo',
      //     'createVideoContext',
      //     '843485DDGoPN',
      //     'abs',
      //     'failTime',
      //     'play',
      //     '236745Shulzv',
      //     'vodPaly',
      //     'rotateAnti',
      //     '7746816zBFJYn',
      //     '4767044iKYDuH',
      //     '1484931TgAtMg',
      //     '3178pEaqAe',
      //     'muteVideo',
      //     '30ElvuWJ',
      //     '152VMSUhb',
      //     'swId',
      //     'shakePlay',
      //     '11MPLOWX',
      //     '71eIGdkp',
      //     '12684440YKiYVa',
      //     'videoPlay',
      //   ]
      //   _0xdc90 = function () {
      //     return _0x475ffb
      //   }
      //   return _0xdc90()
      // }
      // var _0x21a950 = _0x508c
      // ;(function (_0x395f95, _0x219cdf) {
      //   var _0x515aca = _0x508c,
      //     _0x1afb7c = _0x395f95()
      //   while (!![]) {
      //     try {
      //       var _0x864484 =
      //         (-parseInt(_0x515aca(0xe4)) / 0x1) *
      //           (-parseInt(_0x515aca(0xf3)) / 0x2) +
      //         -parseInt(_0x515aca(0xf2)) / 0x3 +
      //         parseInt(_0x515aca(0xf1)) / 0x4 +
      //         (parseInt(_0x515aca(0xe9)) / 0x5) *
      //           (-parseInt(_0x515aca(0xdf)) / 0x6) +
      //         -parseInt(_0x515aca(0xf0)) / 0x7 +
      //         (parseInt(_0x515aca(0xe0)) / 0x8) *
      //           (parseInt(_0x515aca(0xed)) / 0x9) +
      //         (parseInt(_0x515aca(0xe5)) / 0xa) *
      //           (parseInt(_0x515aca(0xe3)) / 0xb)
      //       if (_0x864484 === _0x219cdf) break
      //       else _0x1afb7c['push'](_0x1afb7c['shift']())
      //     } catch (_0x355cbb) {
      //       _0x1afb7c['push'](_0x1afb7c['shift']())
      //     }
      //   }
      // })(_0xdc90, 0x993d5),
      //   clearInterval(this[_0x21a950(0xeb)]),
      //   setTimeout(() => {
      //     clearTimeout(this['checkTime'])
      //   }, 0x64),
      //   this[_0x21a950(0xf4)](![])
      // uni['createVideoContext'](
      //   'myVideo' + newIndex + this[_0x21a950(0xe1)],
      //   this
      // ) &&
      //   (uni[_0x21a950(0xe8)](_0x21a950(0xe7) + newIndex + this['swId'], this)[
      //     'pause'
      //   ](),
      //   (this[_0x21a950(0xe2)] = ![]),
      //   (this['vodList'][newIndex][_0x21a950(0xee)] = !![]),
      //   this[_0x21a950(0xe6)](newIndex))
      // function _0x508c(_0x2c28c0, _0x30d687) {
      //   var _0xdc90ff = _0xdc90()
      //   return (
      //     (_0x508c = function (_0x508cda, _0x5d066d) {
      //       _0x508cda = _0x508cda - 0xdf
      //       var _0x50fa78 = _0xdc90ff[_0x508cda]
      //       return _0x50fa78
      //     }),
      //     _0x508c(_0x2c28c0, _0x30d687)
      //   )
      // }
      // this['vodList'][newIndex + 0x1] &&
      //   Math[_0x21a950(0xea)](newIndex + 0x1 - newIndex) <= 0x1 &&
      //   uni[_0x21a950(0xe8)](
      //     _0x21a950(0xe7) + (newIndex + 0x1) + this['swId'],
      //     this
      //   )[_0x21a950(0xec)]()
      // this[_0x21a950(0xef)] = ![]
      // 清除失败计时器
      clearInterval(this.failTime)
      // 清除检查计时器
      setTimeout(() => {
        clearTimeout(this.checkTime)
      }, 100) // 0x64 = 100

      // 取消静音
      this.muteVideo(false)

      // 如果视频上下文存在，则暂停当前视频并播放新视频
      if (uni.createVideoContext('myVideo' + newIndex + this.swId, this)) {
        uni.createVideoContext('myVideo' + newIndex + this.swId, this).pause()
        this.shakePlay = false
        this.vodList[newIndex].vodPaly = true
        this.videoPlay(newIndex)
      }

      // 预加载下一个视频
      if (
        this.vodList[newIndex + 1] &&
        Math.abs(newIndex + 1 - newIndex) <= 1
      ) {
        uni
          .createVideoContext('myVideo' + (newIndex + 1) + this.swId, this)
          .play()
      }

      // 设置旋转状态为false
      this.rotateAnti = false
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
      // // console.log('视频播放结束'+index)
      // const _0x532385 = _0x4e35
      // function _0x4e35(_0x3de526, _0x399486) {
      //   const _0x55ae49 = _0x55ae()
      //   return (
      //     (_0x4e35 = function (_0x4e35d1, _0x3e001f) {
      //       _0x4e35d1 = _0x4e35d1 - 0x1d7
      //       let _0x2f5cef = _0x55ae49[_0x4e35d1]
      //       return _0x2f5cef
      //     }),
      //     _0x4e35(_0x3de526, _0x399486)
      //   )
      // }
      // function _0x55ae() {
      //   const _0x161a64 = [
      //     '7231509oqgsWL',
      //     '872LzvBDx',
      //     '1290EpbyAQ',
      //     '1766300mayYKN',
      //     '2403704FvEnfu',
      //     '381208khWadh',
      //     '7yRjFsO',
      //     'swId',
      //     'vodIndex',
      //     '388216rXQdKN',
      //     '10eAUUqH',
      //     'nextPlay',
      //     '2059494OqdNfG',
      //     '$refs',
      //     'myVideo',
      //   ]
      //   _0x55ae = function () {
      //     return _0x161a64
      //   }
      //   return _0x55ae()
      // }
      // ;(function (_0x818683, _0x2302bc) {
      //   const _0x542faf = _0x4e35,
      //     _0x41127b = _0x818683()
      //   while (!![]) {
      //     try {
      //       const _0x5f1333 =
      //         parseInt(_0x542faf(0x1da)) / 0x1 +
      //         parseInt(_0x542faf(0x1e5)) / 0x2 +
      //         (-parseInt(_0x542faf(0x1e2)) / 0x3) *
      //           (-parseInt(_0x542faf(0x1e1)) / 0x4) +
      //         parseInt(_0x542faf(0x1e3)) / 0x5 +
      //         parseInt(_0x542faf(0x1dd)) / 0x6 +
      //         (parseInt(_0x542faf(0x1d7)) / 0x7) *
      //           (-parseInt(_0x542faf(0x1e4)) / 0x8) +
      //         (-parseInt(_0x542faf(0x1e0)) / 0x9) *
      //           (parseInt(_0x542faf(0x1db)) / 0xa)
      //       if (_0x5f1333 === _0x2302bc) break
      //       else _0x41127b['push'](_0x41127b['shift']())
      //     } catch (_0x34d88d) {
      //       _0x41127b['push'](_0x41127b['shift']())
      //     }
      //   }
      // })(_0x55ae, 0x40b91)
      // if (this[_0x532385(0x1d9)] == index && this[_0x532385(0x1dc)]) {
      //   this[_0x532385(0x1d9)] += 0x1
      //   let el =
      //     this[_0x532385(0x1de)][
      //       _0x532385(0x1df) + this[_0x532385(0x1d9)] + this[_0x532385(0x1d8)]
      //     ][0x0]
      //   dom['scrollToElement'](el, { offset: 0x0, animated: !![] })
      // }
      // 如果当前索引等于传入的索引且有下一个视频
      if (this.vodIndex == index && this.nextPlay) {
        // 增加当前索引
        this.vodIndex += 1
        // 获取下一个视频元素
        let el = this.$refs['myVideo' + this.vodIndex + this.swId][0]
        // 滚动到下一个视频元素
        dom.scrollToElement(el, { offset: 0, animated: true })
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
      // event.stopPropagation()
      // // #ifndef APP-NVUE
      // let objclientX = event.changedTouches[0].clientX
      // // #endif

      // // #ifdef APP-NVUE
      // let objclientX = event.changedTouches[0].screenX
      // // #endif
      // function _0x3f55(_0x25e232, _0x55695c) {
      //   const _0x2b5240 = _0x2b52()
      //   return (
      //     (_0x3f55 = function (_0x3f55ae, _0x39eb08) {
      //       _0x3f55ae = _0x3f55ae - 0x113
      //       let _0x13f47c = _0x2b5240[_0x3f55ae]
      //       return _0x13f47c
      //     }),
      //     _0x3f55(_0x25e232, _0x55695c)
      //   )
      // }
      // const _0x3b1ac3 = _0x3f55
      // ;(function (_0x54e5c7, _0x3e1550) {
      //   const _0x33728f = _0x3f55,
      //     _0x5b6e02 = _0x54e5c7()
      //   while (!![]) {
      //     try {
      //       const _0x18c0bb =
      //         -parseInt(_0x33728f(0x118)) / 0x1 +
      //         (-parseInt(_0x33728f(0x123)) / 0x2) *
      //           (-parseInt(_0x33728f(0x113)) / 0x3) +
      //         -parseInt(_0x33728f(0x122)) / 0x4 +
      //         (parseInt(_0x33728f(0x116)) / 0x5) *
      //           (parseInt(_0x33728f(0x117)) / 0x6) +
      //         -parseInt(_0x33728f(0x11a)) / 0x7 +
      //         -parseInt(_0x33728f(0x121)) / 0x8 +
      //         (parseInt(_0x33728f(0x115)) / 0x9) *
      //           (parseInt(_0x33728f(0x11b)) / 0xa)
      //       if (_0x18c0bb === _0x3e1550) break
      //       else _0x5b6e02['push'](_0x5b6e02['shift']())
      //     } catch (_0x3d1c53) {
      //       _0x5b6e02['push'](_0x5b6e02['shift']())
      //     }
      //   }
      // })(_0x2b52, 0x29380)
      // function _0x2b52() {
      //   const _0x89eb23 = [
      //     '2mgCisU',
      //     '27366NCigwy',
      //     'sliderEndTime',
      //     '585EnOOVZ',
      //     '85dkDkeE',
      //     '67026GUlRqG',
      //     '223346DuMUqy',
      //     'sliderTime',
      //     '1147153roVdgb',
      //     '119410YvPCnu',
      //     'brightSlider',
      //     'screenWidth',
      //     'sliderProgress',
      //     'videoTime',
      //     'sliderDrag',
      //     '1392568KKTYCF',
      //     '980264SHVKrP',
      //   ]
      //   _0x2b52 = function () {
      //     return _0x89eb23
      //   }
      //   return _0x2b52()
      // }
      // if (objclientX >= 0x0 && objclientX <= this[_0x3b1ac3(0x11d)] - 0x2) {
      //   clearTimeout(this[_0x3b1ac3(0x114)]),
      //     (this[_0x3b1ac3(0x120)] = !![]),
      //     (this[_0x3b1ac3(0x11c)] = !![]),
      //     (this[_0x3b1ac3(0x11e)] = objclientX)
      //   let num = this[_0x3b1ac3(0x11e)] / (this[_0x3b1ac3(0x11d)] - 0x2)
      //   ;(this[_0x3b1ac3(0x119)] = num * this[_0x3b1ac3(0x11f)]),
      //     (this['endTime'] = num * this[_0x3b1ac3(0x11f)])
      // }
      event.stopPropagation()

      // #ifndef APP-NVUE
      let objclientX = event.changedTouches[0].clientX
      // #endif

      // #ifdef APP-NVUE
      let objclientX = event.changedTouches[0].screenX
      // #endif

      if (objclientX >= 0 && objclientX <= this.screenWidth - 2) {
        clearTimeout(this.sliderEndTime)
        this.brightSlider = true
        this.sliderDrag = true
        this.sliderProgress = objclientX

        let num = this.sliderProgress / (this.screenWidth - 2)
        this.videoTime = num * this.sliderTime
        this.endTime = num * this.sliderTime
      }
    },
    /* 进度条滑动结束 */
    touchendSlider(event) {
      // function _0x1d8a() {
      //   const _0x2ff2ef = [
      //     '28DFyici',
      //     'swId',
      //     'pauseShow',
      //     '2346828AcRYfO',
      //     '10ZzkCCy',
      //     '492497LkqzPx',
      //     '1313004hXhSkp',
      //     '3631347vjEwSV',
      //     'sliderEndTime',
      //     'endTime',
      //     '21512iqCLgT',
      //     '157935YOmYuF',
      //     'play',
      //     'seek',
      //     '742IznzQx',
      //     'sliderDrag',
      //     '2dhcUAw',
      //     'vodIndex',
      //     '6304320eexPPp',
      //     'vodList',
      //   ]
      //   _0x1d8a = function () {
      //     return _0x2ff2ef
      //   }
      //   return _0x1d8a()
      // }
      // const _0x46ff32 = _0x15fd
      // ;(function (_0xb484a4, _0x4f9aff) {
      //   const _0x23727e = _0x15fd,
      //     _0x30e9ff = _0xb484a4()
      //   while (!![]) {
      //     try {
      //       const _0x1540e5 =
      //         (parseInt(_0x23727e(0x1a6)) / 0x1) *
      //           (parseInt(_0x23727e(0x19d)) / 0x2) +
      //         -parseInt(_0x23727e(0x1a7)) / 0x3 +
      //         (-parseInt(_0x23727e(0x1a1)) / 0x4) *
      //           (-parseInt(_0x23727e(0x198)) / 0x5) +
      //         -parseInt(_0x23727e(0x1a4)) / 0x6 +
      //         (-parseInt(_0x23727e(0x19b)) / 0x7) *
      //           (parseInt(_0x23727e(0x197)) / 0x8) +
      //         (-parseInt(_0x23727e(0x194)) / 0x9) *
      //           (-parseInt(_0x23727e(0x1a5)) / 0xa) +
      //         parseInt(_0x23727e(0x19f)) / 0xb
      //       if (_0x1540e5 === _0x4f9aff) break
      //       else _0x30e9ff['push'](_0x30e9ff['shift']())
      //     } catch (_0x627bda) {
      //       _0x30e9ff['push'](_0x30e9ff['shift']())
      //     }
      //   }
      // })(_0x1d8a, 0x8cb71),
      //   event['stopPropagation'](),
      //   (this[_0x46ff32(0x19c)] = ![])
      // function _0x15fd(_0x390e66, _0x24467d) {
      //   const _0x1d8a78 = _0x1d8a()
      //   return (
      //     (_0x15fd = function (_0x15fd38, _0x58a952) {
      //       _0x15fd38 = _0x15fd38 - 0x194
      //       let _0x5d480d = _0x1d8a78[_0x15fd38]
      //       return _0x5d480d
      //     }),
      //     _0x15fd(_0x390e66, _0x24467d)
      //   )
      // }
      // let videoCtx = uni['createVideoContext'](
      //   'myVideo' + this[_0x46ff32(0x19e)] + this[_0x46ff32(0x1a2)],
      //   this
      // )
      // videoCtx[_0x46ff32(0x19a)](this[_0x46ff32(0x196)]),
      //   videoCtx[_0x46ff32(0x199)](),
      //   (this[_0x46ff32(0x1a0)][this[_0x46ff32(0x19e)]]['vodPaly'] = !![]),
      //   (this[_0x46ff32(0x1a0)][this[_0x46ff32(0x19e)]][_0x46ff32(0x1a3)] =
      //     ![]),
      //   (this[_0x46ff32(0x195)] = setTimeout(() => {
      //     this['brightSlider'] = ![]
      //   }, 0x7d0))
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
      }, 2000) // 2000毫秒 = 0x7d0
    },
    /* 视频是否播放遗漏 */
    vodViewStart() {
      // function _0xc106(_0x34a271, _0x5125e3) {
      //   var _0x15e66d = _0x15e6()
      //   return (
      //     (_0xc106 = function (_0xc1066, _0x247e77) {
      //       _0xc1066 = _0xc1066 - 0x129
      //       var _0xc1ea5c = _0x15e66d[_0xc1066]
      //       return _0xc1ea5c
      //     }),
      //     _0xc106(_0x34a271, _0x5125e3)
      //   )
      // }
      // function _0x15e6() {
      //   var _0x4ce6e8 = [
      //     '55486fWpkoU',
      //     '316xBgKSm',
      //     'moveOpacity',
      //     'vodIndex',
      //     'checkTime',
      //     '1255194SYzdpI',
      //     '9246880kUbtAE',
      //     'shakePlay',
      //     '2673460JEZzAB',
      //     '30cDSlZL',
      //     '4182tGKTkB',
      //     '364sBxIPi',
      //     '43992dfeYFX',
      //     'currentIndex',
      //     '4047366UtCBnm',
      //   ]
      //   _0x15e6 = function () {
      //     return _0x4ce6e8
      //   }
      //   return _0x15e6()
      // }
      // var _0xc45e98 = _0xc106
      // ;(function (_0x5925aa, _0x59d24d) {
      //   var _0x3de8c8 = _0xc106,
      //     _0x3af56e = _0x5925aa()
      //   while (!![]) {
      //     try {
      //       var _0x286849 =
      //         (-parseInt(_0x3de8c8(0x136)) / 0x1) *
      //           (parseInt(_0x3de8c8(0x12d)) / 0x2) +
      //         (-parseInt(_0x3de8c8(0x137)) / 0x3) *
      //           (-parseInt(_0x3de8c8(0x12e)) / 0x4) +
      //         -parseInt(_0x3de8c8(0x135)) / 0x5 +
      //         parseInt(_0x3de8c8(0x12c)) / 0x6 +
      //         (parseInt(_0x3de8c8(0x129)) / 0x7) *
      //           (parseInt(_0x3de8c8(0x12a)) / 0x8) +
      //         -parseInt(_0x3de8c8(0x132)) / 0x9 +
      //         parseInt(_0x3de8c8(0x133)) / 0xa
      //       if (_0x286849 === _0x59d24d) break
      //       else _0x3af56e['push'](_0x3af56e['shift']())
      //     } catch (_0x330563) {
      //       _0x3af56e['push'](_0x3af56e['shift']())
      //     }
      //   }
      // })(_0x15e6, 0x775ab),
      //   clearTimeout(this[_0xc45e98(0x131)]),
      //   (this[_0xc45e98(0x131)] = setTimeout(() => {
      //     var _0x3e4bfc = _0xc45e98
      //     this[_0x3e4bfc(0x134)] &&
      //       ((this[_0x3e4bfc(0x12f)] = ![]),
      //       (this[_0x3e4bfc(0x130)] = this[_0x3e4bfc(0x12b)]))
      //   }, 0x1f4))
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
      this.startPlayVod = false
    },
    /* 滑动结束的坐标 */
    vodViewEnd(ev) {
      // function _0x1aae(_0x595ce4, _0x8d3418) {
      //   var _0x17d382 = _0x17d3()
      //   return (
      //     (_0x1aae = function (_0x1aae37, _0x47e7da) {
      //       _0x1aae37 = _0x1aae37 - 0x107
      //       var _0x5bb6d3 = _0x17d382[_0x1aae37]
      //       return _0x5bb6d3
      //     }),
      //     _0x1aae(_0x595ce4, _0x8d3418)
      //   )
      // }
      // function _0x17d3() {
      //   var _0x3a1cec = [
      //     '5586980ZTVQVV',
      //     '2qUucNk',
      //     '81945IRSjvi',
      //     '586082VJDYIi',
      //     '28vfgBLM',
      //     '4833070xOyKJq',
      //     '32752lXfIkm',
      //     'changeVod',
      //     'changeTime',
      //     '2694KVwDlK',
      //     '10lihCTg',
      //     'vodViewStart',
      //     '126729kzgLtb',
      //     'moveOpacity',
      //     '1655dhIBWg',
      //     'startPlayVod',
      //   ]
      //   _0x17d3 = function () {
      //     return _0x3a1cec
      //   }
      //   return _0x17d3()
      // }
      // var _0x9aeee8 = _0x1aae
      // ;(function (_0x6a4c5d, _0x438f4e) {
      //   var _0x1b7da0 = _0x1aae,
      //     _0x45d769 = _0x6a4c5d()
      //   while (!![]) {
      //     try {
      //       var _0x324acc =
      //         (parseInt(_0x1b7da0(0x10f)) / 0x1) *
      //           (parseInt(_0x1b7da0(0x111)) / 0x2) +
      //         (parseInt(_0x1b7da0(0x110)) / 0x3) *
      //           (parseInt(_0x1b7da0(0x112)) / 0x4) +
      //         (-parseInt(_0x1b7da0(0x10c)) / 0x5) *
      //           (-parseInt(_0x1b7da0(0x107)) / 0x6) +
      //         -parseInt(_0x1b7da0(0x10e)) / 0x7 +
      //         -parseInt(_0x1b7da0(0x114)) / 0x8 +
      //         (parseInt(_0x1b7da0(0x10a)) / 0x9) *
      //           (-parseInt(_0x1b7da0(0x108)) / 0xa) +
      //         parseInt(_0x1b7da0(0x113)) / 0xb
      //       if (_0x324acc === _0x438f4e) break
      //       else _0x45d769['push'](_0x45d769['shift']())
      //     } catch (_0xa5594e) {
      //       _0x45d769['push'](_0x45d769['shift']())
      //     }
      //   }
      // })(_0x17d3, 0x86061),
      //   (this[_0x9aeee8(0x10d)] = !![]),
      //   (this[_0x9aeee8(0x10b)] = ![]),
      //   this[_0x9aeee8(0x109)]()
      // !this[_0x9aeee8(0x116)] &&
      //   (this['changeTime'] = setTimeout(() => {
      //     var _0x5ecd79 = _0x9aeee8
      //     ;(this[_0x5ecd79(0x115)] =
      //       this['changeIndex'] != this['vodIndex'] ? !![] : ![]),
      //       (this[_0x5ecd79(0x116)] = null)
      //   }, 0x12c))
      this.moveOpacity = true
      this.startPlayVod = false
      this.vodViewStart()

      if (!this.changeTime) {
        this.changeTime = setTimeout(() => {
          this.changeVod = this.changeIndex != this.vodIndex ? true : false
          this.changeTime = null
        }, 300) // 300毫秒 = 0x12c
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
      // // console.log(event)
      // const _0x39b06f = _0x1406
      // ;(function (_0x383552, _0x3a9334) {
      //   const _0x5c5380 = _0x1406,
      //     _0x415820 = _0x383552()
      //   while (!![]) {
      //     try {
      //       const _0x2386b1 =
      //         (parseInt(_0x5c5380(0x105)) / 0x1) *
      //           (-parseInt(_0x5c5380(0x104)) / 0x2) +
      //         -parseInt(_0x5c5380(0x102)) / 0x3 +
      //         -parseInt(_0x5c5380(0x10b)) / 0x4 +
      //         parseInt(_0x5c5380(0x107)) / 0x5 +
      //         parseInt(_0x5c5380(0x111)) / 0x6 +
      //         (-parseInt(_0x5c5380(0x10c)) / 0x7) *
      //           (parseInt(_0x5c5380(0x103)) / 0x8) +
      //         parseInt(_0x5c5380(0x10e)) / 0x9
      //       if (_0x2386b1 === _0x3a9334) break
      //       else _0x415820['push'](_0x415820['shift']())
      //     } catch (_0x3ad27b) {
      //       _0x415820['push'](_0x415820['shift']())
      //     }
      //   }
      // })(_0x4600, 0xc9f5c)
      // event[_0x39b06f(0x10f)] == _0x39b06f(0x101) &&
      //   (this[_0x39b06f(0x10a)] = event)
      // if (event[_0x39b06f(0x10f)] != _0x39b06f(0x110)) return
      // if (!this[_0x39b06f(0x10d)]) return this['playSpot'](index), ![]
      // const curTime = new Date()[_0x39b06f(0x106)](),
      //   lastTime = this[_0x39b06f(0x108)]
      // this[_0x39b06f(0x108)] = curTime
      // const diff = curTime - lastTime
      // function _0x4600() {
      //   const _0x66d489 = [
      //     'type',
      //     'click',
      //     '4769646rsFWFt',
      //     'touchstart',
      //     '3585300rLKQwa',
      //     '304tMzYAI',
      //     '601270QcIiWj',
      //     '2MBjlWQ',
      //     'getTime',
      //     '4336820xshscy',
      //     'lastTapDiffTime',
      //     'lastTapTimeoutFunc',
      //     'touchInfo',
      //     '2774708wIFaYz',
      //     '276493GTvWdU',
      //     'doubleOpen',
      //     '28403388nRcrJP',
      //   ]
      //   _0x4600 = function () {
      //     return _0x66d489
      //   }
      //   return _0x4600()
      // }
      // function _0x1406(_0x26a366, _0x548496) {
      //   const _0x4600b1 = _0x4600()
      //   return (
      //     (_0x1406 = function (_0x14061c, _0x58a687) {
      //       _0x14061c = _0x14061c - 0x101
      //       let _0x2eed56 = _0x4600b1[_0x14061c]
      //       return _0x2eed56
      //     }),
      //     _0x1406(_0x26a366, _0x548496)
      //   )
      // }
      // diff < 0x12c
      //   ? (clearTimeout(this[_0x39b06f(0x109)]),
      //     this['doubleLike'](this[_0x39b06f(0x10a)], index))
      //   : (this['lastTapTimeoutFunc'] = setTimeout(() => {
      //       this['playSpot'](index)
      //     }, 0x12c))
      // console.log(event)
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
      // const _0x34ccb9 = _0x329b
      // ;(function (_0x33b320, _0x38fbb5) {
      //   const _0x2ccbd3 = _0x329b,
      //     _0x126c08 = _0x33b320()
      //   while (!![]) {
      //     try {
      //       const _0x5282d5 =
      //         (-parseInt(_0x2ccbd3(0x124)) / 0x1) *
      //           (parseInt(_0x2ccbd3(0x13a)) / 0x2) +
      //         (-parseInt(_0x2ccbd3(0x13f)) / 0x3) *
      //           (parseInt(_0x2ccbd3(0x129)) / 0x4) +
      //         (-parseInt(_0x2ccbd3(0x12a)) / 0x5) *
      //           (parseInt(_0x2ccbd3(0x13e)) / 0x6) +
      //         (parseInt(_0x2ccbd3(0x12c)) / 0x7) *
      //           (parseInt(_0x2ccbd3(0x12b)) / 0x8) +
      //         -parseInt(_0x2ccbd3(0x126)) / 0x9 +
      //         -parseInt(_0x2ccbd3(0x127)) / 0xa +
      //         parseInt(_0x2ccbd3(0x138)) / 0xb
      //       if (_0x5282d5 === _0x38fbb5) break
      //       else _0x126c08['push'](_0x126c08['shift']())
      //     } catch (_0x168487) {
      //       _0x126c08['push'](_0x126c08['shift']())
      //     }
      //   }
      // })(_0x1977, 0x94430)
      // function _0x1977() {
      //   const _0x16a3bc = [
      //     'vodList',
      //     'changedTouches',
      //     '517578wVvpIF',
      //     '477nIdwJC',
      //     'addNum',
      //     'screenX',
      //     'doubleClick',
      //     'floor',
      //     '$refs',
      //     '$nextTick',
      //     '$emit',
      //     '444457osnJZK',
      //     'doubleAddClass',
      //     '1457352aeOjJt',
      //     '4051720lphmAX',
      //     'doubleHeart',
      //     '16420IsacVd',
      //     '65fvPOEl',
      //     '8tTKabQ',
      //     '6183289tEynuS',
      //     'fabulousBtn',
      //     'addAnimation',
      //     '0deg',
      //     'rpx',
      //     '15deg',
      //     'random',
      //     'fabulousShow',
      //     'pxToRpx',
      //     'clearDoubleTime',
      //     'doubleOutTime',
      //     'screenY',
      //     '32494891MUlPwS',
      //     'vodIndex',
      //     '4ZiWQgg',
      //     'push',
      //   ]
      //   _0x1977 = function () {
      //     return _0x16a3bc
      //   }
      //   return _0x1977()
      // }
      // !this['vodList'][this[_0x34ccb9(0x139)]][_0x34ccb9(0x133)] &&
      //   this[_0x34ccb9(0x121)]['menuRef' + this[_0x34ccb9(0x139)] + ''][0x0][
      //     _0x34ccb9(0x12d)
      //   ](index)
      // function _0x329b(_0x1abefb, _0x2a3c5b) {
      //   const _0x197776 = _0x1977()
      //   return (
      //     (_0x329b = function (_0x329b96, _0x317bcf) {
      //       _0x329b96 = _0x329b96 - 0x120
      //       let _0x40a5ef = _0x197776[_0x329b96]
      //       return _0x40a5ef
      //     }),
      //     _0x329b(_0x1abefb, _0x2a3c5b)
      //   )
      // }
      // if (!this[_0x34ccb9(0x128)]) return
      // if (this[_0x34ccb9(0x136)]) return
      // this[_0x34ccb9(0x136)] = setTimeout(() => {
      //   const _0x36aa4b = _0x34ccb9
      //   let _0x2f3e1c = event[_0x36aa4b(0x13d)][0x0][_0x36aa4b(0x137)],
      //     _0x4ccabc = event[_0x36aa4b(0x13d)][0x0][_0x36aa4b(0x141)],
      //     _0x37ea4f = [_0x36aa4b(0x12f), _0x36aa4b(0x131), '-15deg'],
      //     _0x5467e1 = Math[_0x36aa4b(0x120)](Math[_0x36aa4b(0x132)]() * 0x3),
      //     _0x67418c = {
      //       id: this['likeId']++,
      //       width: this[_0x36aa4b(0x134)](0x5f),
      //       height: this['pxToRpx'](0x5f),
      //       top:
      //         this[_0x36aa4b(0x134)](_0x2f3e1c) -
      //         this[_0x36aa4b(0x134)](0xb4) +
      //         _0x36aa4b(0x130),
      //       left:
      //         this[_0x36aa4b(0x134)](_0x4ccabc) -
      //         this[_0x36aa4b(0x134)](0x5f / 0x2) +
      //         _0x36aa4b(0x130),
      //       rotate: _0x37ea4f[_0x5467e1],
      //       className: '',
      //       isShow: !![],
      //       addNum: 0x0,
      //       removeNum: 0x0,
      //     }
      //   this['likeList'][_0x36aa4b(0x13b)](_0x67418c),
      //     (this[_0x36aa4b(0x136)] = null),
      //     this[_0x36aa4b(0x122)](() => {
      //       const _0x477620 = _0x36aa4b
      //       this[_0x477620(0x12e)](
      //         'peachRef' + _0x67418c['id'],
      //         this['peachAddList'],
      //         _0x67418c[_0x477620(0x140)]
      //       ),
      //         this[_0x477620(0x125)](_0x67418c['id'])
      //     }),
      //     clearTimeout(this[_0x36aa4b(0x135)]),
      //     (this['clearDoubleTime'] = setTimeout(() => {
      //       this['likeList'] = []
      //     }, 0x5dc)),
      //     this[_0x36aa4b(0x123)](
      //       _0x36aa4b(0x142),
      //       this[_0x36aa4b(0x13c)][this['vodIndex']]
      //     )
      // }, 0x32)
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
      // function _0x2549(_0xd1fd01, _0x498fd7) {
      //   var _0x4574b = _0x4574()
      //   return (
      //     (_0x2549 = function (_0x254924, _0x3fd8dd) {
      //       _0x254924 = _0x254924 - 0x1ed
      //       var _0x29ea46 = _0x4574b[_0x254924]
      //       return _0x29ea46
      //     }),
      //     _0x2549(_0xd1fd01, _0x498fd7)
      //   )
      // }
      // ;(function (_0x1bb240, _0x4ae74e) {
      //   var _0x3dfdd2 = _0x2549,
      //     _0x11b6c3 = _0x1bb240()
      //   while (!![]) {
      //     try {
      //       var _0x42cae5 =
      //         (-parseInt(_0x3dfdd2(0x1ed)) / 0x1) *
      //           (-parseInt(_0x3dfdd2(0x1ef)) / 0x2) +
      //         -parseInt(_0x3dfdd2(0x1f2)) / 0x3 +
      //         parseInt(_0x3dfdd2(0x1f0)) / 0x4 +
      //         -parseInt(_0x3dfdd2(0x1f5)) / 0x5 +
      //         -parseInt(_0x3dfdd2(0x1f4)) / 0x6 +
      //         -parseInt(_0x3dfdd2(0x1f1)) / 0x7 +
      //         (parseInt(_0x3dfdd2(0x1f3)) / 0x8) *
      //           (parseInt(_0x3dfdd2(0x1ee)) / 0x9)
      //       if (_0x42cae5 === _0x4ae74e) break
      //       else _0x11b6c3['push'](_0x11b6c3['shift']())
      //     } catch (_0x4aaa85) {
      //       _0x11b6c3['push'](_0x11b6c3['shift']())
      //     }
      //   }
      // })(_0x4574, 0x5e529)
      // function _0x4574() {
      //   var _0x326803 = [
      //     '3193450FRYNWD',
      //     '587813uWVwCa',
      //     '9714267gOpmjP',
      //     '2eIHrPw',
      //     '2871224yQnVXW',
      //     '2689449ESdowx',
      //     '2173707ZbKNgK',
      //     '8sJdOSO',
      //     '1507026WKswQL',
      //   ]
      //   _0x4574 = function () {
      //     return _0x326803
      //   }
      //   return _0x4574()
      // }
      // return (0x2ee * Number['parseInt'](px)) / this['screenWidth']
      return (750 * Number.parseInt(px)) / this.screenWidth
    },
    /* 双击点赞添加移除动画 */
    doubleAddClass(id) {
      // function _0x4b6f(_0x109b0d, _0x5ead80) {
      //   var _0x40a3ee = _0x40a3()
      //   return (
      //     (_0x4b6f = function (_0x4b6ff3, _0x4461c4) {
      //       _0x4b6ff3 = _0x4b6ff3 - 0x178
      //       var _0x5b3c88 = _0x40a3ee[_0x4b6ff3]
      //       return _0x5b3c88
      //     }),
      //     _0x4b6f(_0x109b0d, _0x5ead80)
      //   )
      // }
      // function _0x40a3() {
      //   var _0x4a4739 = [
      //     '1585710QICjGY',
      //     'removeNum',
      //     '2335644Ilixkv',
      //     '81zXCURh',
      //     '5lcduST',
      //     'peachRef',
      //     'filter',
      //     'isShow',
      //     '3065904kHGJyJ',
      //     '1227060MOsrRb',
      //     '160658JvRHca',
      //     '66790eNmftn',
      //     '108ydXyYQ',
      //     'likeList',
      //     '29416KtGzJx',
      //     'addAnimation',
      //     'peachRemoveList',
      //   ]
      //   _0x40a3 = function () {
      //     return _0x4a4739
      //   }
      //   return _0x40a3()
      // }
      // ;(function (_0x17657c, _0x4b47fe) {
      //   var _0x553f93 = _0x4b6f,
      //     _0xc1878d = _0x17657c()
      //   while (!![]) {
      //     try {
      //       var _0x2f1418 =
      //         (parseInt(_0x553f93(0x184)) / 0x1) *
      //           (parseInt(_0x553f93(0x179)) / 0x2) +
      //         (parseInt(_0x553f93(0x17b)) / 0x3) *
      //           (-parseInt(_0x553f93(0x17d)) / 0x4) +
      //         parseInt(_0x553f93(0x17a)) / 0x5 +
      //         -parseInt(_0x553f93(0x182)) / 0x6 +
      //         -parseInt(_0x553f93(0x180)) / 0x7 +
      //         -parseInt(_0x553f93(0x188)) / 0x8 +
      //         (-parseInt(_0x553f93(0x183)) / 0x9) *
      //           (-parseInt(_0x553f93(0x178)) / 0xa)
      //       if (_0x2f1418 === _0x4b47fe) break
      //       else _0xc1878d['push'](_0xc1878d['shift']())
      //     } catch (_0x8534b8) {
      //       _0xc1878d['push'](_0xc1878d['shift']())
      //     }
      //   }
      // })(_0x40a3, 0x3e653),
      //   setTimeout(() => {
      //     var _0x385750 = _0x4b6f
      //     this[_0x385750(0x17c)][_0x385750(0x186)]((_0xa6819b, _0x32462d) => {
      //       var _0x35142f = _0x385750
      //       _0xa6819b['id'] == id &&
      //         this[_0x35142f(0x17e)](
      //           _0x35142f(0x185) + _0xa6819b['id'],
      //           this[_0x35142f(0x17f)],
      //           _0xa6819b[_0x35142f(0x181)]
      //         )
      //     }),
      //       setTimeout(() => {
      //         var _0x2840c8 = _0x385750
      //         this[_0x2840c8(0x17c)]['filter']((_0x1f3288, _0x2d8322) => {
      //           var _0x14f891 = _0x2840c8
      //           _0x1f3288['id'] == id && (_0x1f3288[_0x14f891(0x187)] = ![])
      //         })
      //       }, 0x190)
      //   }, 0x1f4)
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
      // const _0x1bf7d9 = _0x4b61
      // ;(function (_0x4b3318, _0x1d67a3) {
      //   const _0x122616 = _0x4b61,
      //     _0xcade2 = _0x4b3318()
      //   while (!![]) {
      //     try {
      //       const _0x4c3a5f =
      //         parseInt(_0x122616(0xa7)) / 0x1 +
      //         (parseInt(_0x122616(0xab)) / 0x2) *
      //           (-parseInt(_0x122616(0xa3)) / 0x3) +
      //         (parseInt(_0x122616(0xa2)) / 0x4) *
      //           (parseInt(_0x122616(0xaa)) / 0x5) +
      //         (parseInt(_0x122616(0xb3)) / 0x6) *
      //           (parseInt(_0x122616(0xa8)) / 0x7) +
      //         (-parseInt(_0x122616(0xaf)) / 0x8) *
      //           (parseInt(_0x122616(0xac)) / 0x9) +
      //         (-parseInt(_0x122616(0xb4)) / 0xa) *
      //           (parseInt(_0x122616(0xa4)) / 0xb) +
      //         parseInt(_0x122616(0xb0)) / 0xc
      //       if (_0x4c3a5f === _0x1d67a3) break
      //       else _0xcade2['push'](_0xcade2['shift']())
      //     } catch (_0x3760ae) {
      //       _0xcade2['push'](_0xcade2['shift']())
      //     }
      //   }
      // })(_0x2ab7, 0x29919)
      // function _0x4b61(_0x3df9e8, _0x19ba29) {
      //   const _0x2ab720 = _0x2ab7()
      //   return (
      //     (_0x4b61 = function (_0x4b618d, _0x10efb3) {
      //       _0x4b618d = _0x4b618d - 0xa2
      //       let _0x34d0f6 = _0x2ab720[_0x4b618d]
      //       return _0x34d0f6
      //     }),
      //     _0x4b61(_0x3df9e8, _0x19ba29)
      //   )
      // }
      // function _0x2ab7() {
      //   const _0x1e2b0c = [
      //     'duration',
      //     '760AMPyHj',
      //     '5470xEpKFk',
      //     '657PYYxIM',
      //     '$refs',
      //     'addAnimation',
      //     '27952KuYycu',
      //     '3032256JpHdCc',
      //     'linear',
      //     'length',
      //     '476070BKZLCF',
      //     '10UFzoyw',
      //     '1576XyWBUS',
      //     '201RbBneV',
      //     '794211xCJyvi',
      //     'list',
      //     'transition',
      //     '50817aWiIXt',
      //     '28otSPyZ',
      //   ]
      //   _0x2ab7 = function () {
      //     return _0x1e2b0c
      //   }
      //   return _0x2ab7()
      // }
      // let testEl = this[_0x1bf7d9(0xad)][name][0x0]
      // animation[_0x1bf7d9(0xa6)](
      //   testEl,
      //   {
      //     styles: dataList[_0x1bf7d9(0xa5)][num],
      //     duration: num == 0x0 ? 0x0 : dataList[_0x1bf7d9(0xa9)],
      //     timingFunction: _0x1bf7d9(0xb1),
      //     delay: 0x0,
      //   },
      //   () => {
      //     const _0x478403 = _0x1bf7d9
      //     ;(num = num + 0x1),
      //       num < dataList[_0x478403(0xa5)][_0x478403(0xb2)] &&
      //         this[_0x478403(0xae)](name, dataList, num)
      //   }
      // )
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
