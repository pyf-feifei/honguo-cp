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
      showShade: false, //显示遮罩swiper
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
      moveClientY: 0, //移动的坐标
      moveOpacity: false, //是否透明
      refreshShow: false, //是否显示下拉刷新
      refreshOpacity: 0, //下拉刷新的透明度
      refreshclientY: 0, //下拉刷新的坐标
      refreshOpen: false, //下拉刷新的触发条件
      playErrTime: null,
      interceptIndex: [],
      loadTime: null,
      beginLoad: 0,
      loadStart: false,
      muteSetup: false, //是否设置为静音
      /* 双击点赞部分 */
      lastTapDiffTime: 0, //上次点击时间
      lastTapTimeoutFunc: null, //单击事件事件函数
      likeList: [], //双击点赞显示的桃心数据
      likeId: 1,
      doubleOutTime: null,
      clearDoubleTime: null,
    }
  },
  created() {
    const _0x39f18d = _0x50be
    function _0x4ca5() {
      const _0x5edbae = [
        '1307304YFggMW',
        'getSystemInfoSync',
        '12EjvKKG',
        '10GrMSyc',
        '6598640shGSOe',
        '21mElKHD',
        '1333345ljhEwE',
        '535689PiAbUK',
        'windowHeight',
        '473TbkyNt',
        '2kEJeEN',
        'tabBarShow',
        'statusBarHeight',
        'screenWidth',
        'tabBarHeight',
        '5045262ujpDEL',
        'showBarHeight',
        'videoStyle',
        '3074904etBcIb',
        'screenHeight',
        '404053GpHTeB',
      ]
      _0x4ca5 = function () {
        return _0x5edbae
      }
      return _0x4ca5()
    }
    ;(function (_0x2702e6, _0x1db478) {
      const _0x506974 = _0x50be,
        _0x3a9ecb = _0x2702e6()
      while (!![]) {
        try {
          const _0x2c62f1 =
            -parseInt(_0x506974(0xec)) / 0x1 +
            (parseInt(_0x506974(0xf7)) / 0x2) *
              (-parseInt(_0x506974(0xe7)) / 0x3) +
            (parseInt(_0x506974(0xef)) / 0x4) *
              (parseInt(_0x506974(0xf3)) / 0x5) +
            (parseInt(_0x506974(0xea)) / 0x6) *
              (-parseInt(_0x506974(0xf2)) / 0x7) +
            -parseInt(_0x506974(0xf1)) / 0x8 +
            (-parseInt(_0x506974(0xf4)) / 0x9) *
              (parseInt(_0x506974(0xf0)) / 0xa) +
            (-parseInt(_0x506974(0xf6)) / 0xb) *
              (-parseInt(_0x506974(0xed)) / 0xc)
          if (_0x2c62f1 === _0x1db478) break
          else _0x3a9ecb['push'](_0x3a9ecb['shift']())
        } catch (_0x1e8360) {
          _0x3a9ecb['push'](_0x3a9ecb['shift']())
        }
      }
    })(_0x4ca5, 0xee807)
    const deviceInfo = uni[_0x39f18d(0xee)]()
    let topBarHeight = this[_0x39f18d(0xe8)] ? deviceInfo[_0x39f18d(0xf9)] : 0x0
    ;(this[_0x39f18d(0xe9)][_0x39f18d(0xf9)] = topBarHeight + 'px'),
      (this['videoStyle']['width'] = deviceInfo[_0x39f18d(0xfa)] + 'px'),
      (this[_0x39f18d(0xfa)] = deviceInfo['screenWidth']),
      (this[_0x39f18d(0xeb)] = deviceInfo[_0x39f18d(0xeb)])
    function _0x50be(_0x5d3597, _0x29e591) {
      const _0x4ca5ab = _0x4ca5()
      return (
        (_0x50be = function (_0x50bef4, _0x3f8e0c) {
          _0x50bef4 = _0x50bef4 - 0xe6
          let _0x312c60 = _0x4ca5ab[_0x50bef4]
          return _0x312c60
        }),
        _0x50be(_0x5d3597, _0x29e591)
      )
    }
    this[_0x39f18d(0xf8)] == 0x1
      ? (this['videoStyle']['height'] =
          deviceInfo[_0x39f18d(0xeb)] -
          topBarHeight -
          this[_0x39f18d(0xe6)] +
          'px')
      : (this[_0x39f18d(0xe9)]['height'] =
          deviceInfo[_0x39f18d(0xf5)] - topBarHeight + 'px')
  },
  watch: {
    vodCurIndex(newIndex, oldIndex) {
      /* 上一个视频处理 */
      const _0x3cf8ea = _0x146d
      function _0x146d(_0x1c57e9, _0x15fcb5) {
        const _0x2237fc = _0x2237()
        return (
          (_0x146d = function (_0x146d4d, _0x2b0bfb) {
            _0x146d4d = _0x146d4d - 0x169
            let _0x15a2cd = _0x2237fc[_0x146d4d]
            return _0x15a2cd
          }),
          _0x146d(_0x1c57e9, _0x15fcb5)
        )
      }
      ;(function (_0x2459ec, _0x191ab0) {
        const _0x58a5ee = _0x146d,
          _0x5c04a5 = _0x2459ec()
        while (!![]) {
          try {
            const _0x181791 =
              parseInt(_0x58a5ee(0x169)) / 0x1 +
              (-parseInt(_0x58a5ee(0x16b)) / 0x2) *
                (-parseInt(_0x58a5ee(0x16d)) / 0x3) +
              -parseInt(_0x58a5ee(0x172)) / 0x4 +
              (parseInt(_0x58a5ee(0x179)) / 0x5) *
                (-parseInt(_0x58a5ee(0x17a)) / 0x6) +
              parseInt(_0x58a5ee(0x173)) / 0x7 +
              (-parseInt(_0x58a5ee(0x16c)) / 0x8) *
                (parseInt(_0x58a5ee(0x16f)) / 0x9) +
              parseInt(_0x58a5ee(0x174)) / 0xa
            if (_0x181791 === _0x191ab0) break
            else _0x5c04a5['push'](_0x5c04a5['shift']())
          } catch (_0x143a71) {
            _0x5c04a5['push'](_0x5c04a5['shift']())
          }
        }
      })(_0x2237, 0xebd04)
      function _0x2237() {
        const _0x4d509d = [
          'vodPaly',
          '1284616TFukhx',
          'swId',
          '1938giWhte',
          '2013816MYSOwL',
          '2937hPrhrM',
          'coverOpacity',
          '54QKLBfT',
          'videoIndex',
          'myVideo',
          '7095204INEprR',
          '1200276kFnZVJ',
          '35469610QWKwmR',
          'vodList',
          'coverShow',
          'loadingShow',
          'pauseShow',
          '5nAAQZf',
          '10209846ClGbCI',
        ]
        _0x2237 = function () {
          return _0x4d509d
        }
        return _0x2237()
      }
      if (oldIndex >= 0x0) {
        let oldObj = null
        this[_0x3cf8ea(0x175)]['filter']((_0x1d50b9, _0x31bfca) => {
          const _0x291681 = _0x3cf8ea
          oldIndex == _0x1d50b9[_0x291681(0x170)] &&
            ((_0x1d50b9[_0x291681(0x16e)] = _0x1d50b9[_0x291681(0x176)]
              ? !![]
              : ![]),
            (_0x1d50b9[_0x291681(0x17b)] = ![]),
            (_0x1d50b9[_0x291681(0x178)] = ![]),
            (_0x1d50b9[_0x291681(0x177)] = ![]),
            uni['createVideoContext'](
              _0x291681(0x171) + _0x31bfca + this[_0x291681(0x16a)],
              this
            )['pause']())
        })
      }
    },
  },
  methods: {
    /* 初始加载视频 */
    initVod(dataList, index) {
      const _0x38e7d4 = _0x2842
      function _0x2842(_0x1aec05, _0x14c2e2) {
        const _0x690539 = _0x6905()
        return (
          (_0x2842 = function (_0x284225, _0x1c0bad) {
            _0x284225 = _0x284225 - 0x1ae
            let _0x16a49b = _0x690539[_0x284225]
            return _0x16a49b
          }),
          _0x2842(_0x1aec05, _0x14c2e2)
        )
      }
      ;(function (_0x1553e1, _0x4cd66c) {
        const _0x57c2b2 = _0x2842,
          _0x3d7387 = _0x1553e1()
        while (!![]) {
          try {
            const _0x154502 =
              -parseInt(_0x57c2b2(0x1b6)) / 0x1 +
              -parseInt(_0x57c2b2(0x1c9)) / 0x2 +
              parseInt(_0x57c2b2(0x1ae)) / 0x3 +
              parseInt(_0x57c2b2(0x1c1)) / 0x4 +
              (-parseInt(_0x57c2b2(0x1cd)) / 0x5) *
                (-parseInt(_0x57c2b2(0x1b2)) / 0x6) +
              (-parseInt(_0x57c2b2(0x1c3)) / 0x7) *
                (-parseInt(_0x57c2b2(0x1b5)) / 0x8) +
              -parseInt(_0x57c2b2(0x1c4)) / 0x9
            if (_0x154502 === _0x4cd66c) break
            else _0x3d7387['push'](_0x3d7387['shift']())
          } catch (_0x640e23) {
            _0x3d7387['push'](_0x3d7387['shift']())
          }
        }
      })(_0x6905, 0x56c6c),
        (this['autoplayVideo'] = this[_0x38e7d4(0x1cf)])
      index && (this['durationNum'] = 0x0)
      let playIndex = index ? index : 0x0
      function _0x6905() {
        const _0xf45b06 = [
          'currentIndex',
          'pauseShow',
          '2377252PCFSrj',
          'beforeVodInfo',
          '630lTNtsS',
          '4118157uZELrE',
          'coverOpacity',
          'slice',
          'filter',
          'circular',
          '1133074asAbhU',
          'getVodInfo',
          'vodList',
          'parse',
          '10jcDpZd',
          'vodPaly',
          'autoplay',
          'loadTime',
          'push',
          'totalPlayList',
          'setSliceList',
          '1173924QimsJP',
          'changeIndex',
          'autoplayVideo',
          'durationNum',
          '1096998ClnRsD',
          'swiperPlay',
          'stringify',
          '55048UdkjAb',
          '591031NEYHpM',
          'lodData',
          'vodCurIndex',
          'length',
          'contentShow',
          'sort',
          'loadShow',
          'videoIndex',
          'coverShow',
        ]
        _0x6905 = function () {
          return _0xf45b06
        }
        return _0x6905()
      }
      dataList[_0x38e7d4(0x1c7)]((_0x32b1c9, _0x458824) => {
        const _0x27fa65 = _0x38e7d4
        ;(_0x32b1c9[_0x27fa65(0x1bd)] = _0x458824),
          (_0x32b1c9['vodPaly'] = _0x458824 == playIndex ? !![] : ![]),
          (_0x32b1c9[_0x27fa65(0x1c0)] = ![]),
          (_0x32b1c9['loadingShow'] = ![]),
          (_0x32b1c9[_0x27fa65(0x1c5)] = _0x32b1c9[_0x27fa65(0x1be)]
            ? !![]
            : ![])
      }),
        dataList[_0x38e7d4(0x1bb)]((_0x4d0b62, _0x5b990e) => {
          const _0x3a80d1 = _0x38e7d4
          return _0x4d0b62[_0x3a80d1(0x1bd)] - _0x5b990e[_0x3a80d1(0x1bd)]
        }),
        (this[_0x38e7d4(0x1d2)] = dataList),
        (this[_0x38e7d4(0x1ba)] = dataList['length'] > 0x0 ? !![] : ![]),
        (this[_0x38e7d4(0x1bc)] =
          dataList[_0x38e7d4(0x1b9)] > 0x0 ? !![] : ![]),
        (this[_0x38e7d4(0x1b8)] = playIndex)
      let currentNum = 0x0
      this[_0x38e7d4(0x1d2)]['length'] >= 0x3
        ? (this[_0x38e7d4(0x1cb)] = [{}, {}, {}])
        : (this['vodList'] = dataList)
      setTimeout(() => {
        const _0x2f4d60 = _0x38e7d4
        if (this[_0x2f4d60(0x1d2)][_0x2f4d60(0x1b9)] >= 0x3) {
          let _0x323de4 = this['totalPlayList'][_0x2f4d60(0x1b9)],
            _0x2c70b6 = _0x323de4 % 0x3,
            _0x4e3879 = playIndex - 0x1 < 0x0 ? 0x0 : playIndex - 0x1,
            _0x153457 = playIndex + 0x2,
            _0x340e04 = _0x323de4 - _0x2c70b6
          if (playIndex == 0x0 || playIndex + 0x1 >= _0x340e04) {
            this[_0x2f4d60(0x1c8)] = ![]
            let _0x14fd3d = []
            playIndex == 0x0
              ? (_0x14fd3d = JSON[_0x2f4d60(0x1cc)](
                  JSON[_0x2f4d60(0x1b4)](
                    this[_0x2f4d60(0x1d2)][_0x2f4d60(0x1c6)](
                      _0x4e3879,
                      playIndex + 0x3
                    )
                  )
                ))
              : (_0x14fd3d = JSON['parse'](
                  JSON[_0x2f4d60(0x1b4)](
                    this['totalPlayList'][_0x2f4d60(0x1c6)](
                      _0x340e04 - 0x3,
                      _0x340e04
                    )
                  )
                ))
            this[_0x2f4d60(0x1d3)](_0x14fd3d)
            if (playIndex != 0x0) {
              let _0x5ae1a6 = JSON['parse'](
                JSON[_0x2f4d60(0x1b4)](
                  this[_0x2f4d60(0x1d2)][_0x2f4d60(0x1c6)](_0x340e04, _0x323de4)
                )
              )
              _0x5ae1a6['filter']((_0x369258) => {
                const _0x2ee9be = _0x2f4d60
                this[_0x2ee9be(0x1cb)][_0x2ee9be(0x1d1)](_0x369258)
              }),
                this[_0x2f4d60(0x1d2)]['length'] >= this['totalvod'] &&
                  (this['loadShow'] = ![])
            }
          } else {
            this[_0x2f4d60(0x1c8)] = !![]
            let _0x10dedd = JSON[_0x2f4d60(0x1cc)](
              JSON[_0x2f4d60(0x1b4)](
                this['totalPlayList'][_0x2f4d60(0x1c6)](_0x4e3879, _0x153457)
              )
            )
            this[_0x2f4d60(0x1d3)](_0x10dedd)
          }
        } else this[_0x2f4d60(0x1c8)] = ![]
        this[_0x2f4d60(0x1ca)](),
          this[_0x2f4d60(0x1cb)][_0x2f4d60(0x1c7)]((_0x13493c, _0x4b7bf6) => {
            const _0x563fd8 = _0x2f4d60
            this[_0x563fd8(0x1b8)] == _0x13493c[_0x563fd8(0x1bd)] &&
              (currentNum = _0x4b7bf6)
          }),
          this[_0x2f4d60(0x1b8)] + 0x1 >=
            this[_0x2f4d60(0x1d2)][_0x2f4d60(0x1b9)] -
              (this[_0x2f4d60(0x1d2)][_0x2f4d60(0x1b9)] % 0x3) &&
            this['totalPlayList'][_0x2f4d60(0x1b9)] >= 0x3 &&
            ((this['loadStart'] = !![]),
            clearTimeout(this[_0x2f4d60(0x1d0)]),
            (this[_0x2f4d60(0x1d0)] = setTimeout(() => {
              const _0xf69f09 = _0x2f4d60
              ;(this['beginLoad'] = this['totalPlayList'][_0xf69f09(0x1b9)]),
                this['$emit'](_0xf69f09(0x1b7))
            }, 0x12c))),
          playIndex > 0x0 && (this[_0x2f4d60(0x1bf)] = currentNum),
          (this[_0x2f4d60(0x1af)] = currentNum),
          (this['vodIndex'] = currentNum)
      }, 0x64),
        setTimeout(() => {
          const _0x2f5710 = _0x38e7d4
          ;(this[_0x2f5710(0x1b1)] = 0x12c),
            this[_0x2f5710(0x1b0)]
              ? this[_0x2f5710(0x1b3)](currentNum)
              : ((this['beforeVodInfo'][_0x2f5710(0x1ce)] = ![]),
                (this[_0x2f5710(0x1c2)][_0x2f5710(0x1c0)] = !![]))
        }, 0xc8)
    },
    /* 赋值截取的数据 */
    setSliceList(resData) {
      var _0x11d060 = _0x53dd
      function _0x53dd(_0x555d47, _0x5a1792) {
        var _0x1a3ab6 = _0x1a3a()
        return (
          (_0x53dd = function (_0x53dde1, _0xb25ea8) {
            _0x53dde1 = _0x53dde1 - 0xec
            var _0x26d7bf = _0x1a3ab6[_0x53dde1]
            return _0x26d7bf
          }),
          _0x53dd(_0x555d47, _0x5a1792)
        )
      }
      function _0x1a3a() {
        var _0x58678d = [
          '339085fxNbft',
          '52WHwWWy',
          '35965ouMksf',
          'vodList',
          '18TQFotj',
          'videoIndex',
          '110343YwTbgA',
          '4888850daRYuv',
          '5160nsneYM',
          '2222484iApyXL',
          '9583lUhJSk',
          '1447272KyhfLL',
          'filter',
          '22czRyoB',
        ]
        _0x1a3a = function () {
          return _0x58678d
        }
        return _0x1a3a()
      }
      ;(function (_0x574add, _0x237dc6) {
        var _0x382507 = _0x53dd,
          _0xbc49 = _0x574add()
        while (!![]) {
          try {
            var _0x210565 =
              parseInt(_0x382507(0xf9)) / 0x1 +
              (parseInt(_0x382507(0xef)) / 0x2) *
                (parseInt(_0x382507(0xf1)) / 0x3) +
              (parseInt(_0x382507(0xec)) / 0x4) *
                (-parseInt(_0x382507(0xed)) / 0x5) +
              -parseInt(_0x382507(0xf4)) / 0x6 +
              (-parseInt(_0x382507(0xf5)) / 0x7) *
                (parseInt(_0x382507(0xf3)) / 0x8) +
              parseInt(_0x382507(0xf6)) / 0x9 +
              (-parseInt(_0x382507(0xf2)) / 0xa) *
                (-parseInt(_0x382507(0xf8)) / 0xb)
            if (_0x210565 === _0x237dc6) break
            else _0xbc49['push'](_0xbc49['shift']())
          } catch (_0x265c1e) {
            _0xbc49['push'](_0xbc49['shift']())
          }
        }
      })(_0x1a3a, 0x70bc4),
        resData[_0x11d060(0xf7)]((_0x1c42db) => {
          var _0x38b9ac = _0x11d060
          if (_0x1c42db[_0x38b9ac(0xf0)] % 0x3 == 0x0)
            this[_0x38b9ac(0xee)][0x0] = _0x1c42db
          else {
            if (_0x1c42db[_0x38b9ac(0xf0)] % 0x3 == 0x1)
              this['vodList'][0x1] = _0x1c42db
            else
              _0x1c42db[_0x38b9ac(0xf0)] % 0x3 == 0x2 &&
                (this[_0x38b9ac(0xee)][0x2] = _0x1c42db)
          }
        })
    },
    /* 到底加载方法 */
    lodingData(dataList) {
      const _0x1b7470 = _0x16b4
      ;(function (_0x3bada9, _0xdc16d6) {
        const _0x422c00 = _0x16b4,
          _0x1cdfb1 = _0x3bada9()
        while (!![]) {
          try {
            const _0x334189 =
              -parseInt(_0x422c00(0x6f)) / 0x1 +
              -parseInt(_0x422c00(0x6b)) / 0x2 +
              parseInt(_0x422c00(0x6d)) / 0x3 +
              (-parseInt(_0x422c00(0x7c)) / 0x4) *
                (-parseInt(_0x422c00(0x75)) / 0x5) +
              parseInt(_0x422c00(0x79)) / 0x6 +
              (parseInt(_0x422c00(0x73)) / 0x7) *
                (-parseInt(_0x422c00(0x7a)) / 0x8) +
              (-parseInt(_0x422c00(0x65)) / 0x9) *
                (-parseInt(_0x422c00(0x78)) / 0xa)
            if (_0x334189 === _0xdc16d6) break
            else _0x1cdfb1['push'](_0x1cdfb1['shift']())
          } catch (_0x4ee1d0) {
            _0x1cdfb1['push'](_0x1cdfb1['shift']())
          }
        }
      })(_0x4083, 0x977ee)
      let num = this[_0x1b7470(0x7b)][_0x1b7470(0x70)]
      dataList['filter']((_0x3fd6dd, _0xef6fd) => {
        const _0x760067 = _0x1b7470
        ;(_0x3fd6dd['videoIndex'] = num + _0xef6fd),
          (_0x3fd6dd['vodPaly'] = ![]),
          (_0x3fd6dd[_0x760067(0x69)] = ![]),
          (_0x3fd6dd[_0x760067(0x6e)] = ![]),
          (_0x3fd6dd[_0x760067(0x71)] = _0x3fd6dd['coverShow'] ? !![] : ![])
      }),
        (this[_0x1b7470(0x7b)] = this['totalPlayList']['concat'](dataList)),
        this[_0x1b7470(0x72)](() => {
          const _0x3b8173 = _0x1b7470
          this[_0x3b8173(0x74)](),
            setTimeout(() => {
              const _0x3eb83e = _0x3b8173
              this['finalList']['filter']((_0x2f9d59) => {
                const _0x869c8e = _0x16b4
                if (_0x2f9d59[_0x869c8e(0x67)] != this[_0x869c8e(0x76)]) {
                  if (_0x2f9d59[_0x869c8e(0x67)] % 0x3 == 0x0)
                    this[_0x869c8e(0x7d)][0x0] = _0x2f9d59
                  else {
                    if (_0x2f9d59[_0x869c8e(0x67)] % 0x3 == 0x1)
                      this['vodList'][0x1] = _0x2f9d59
                    else
                      _0x2f9d59[_0x869c8e(0x67)] % 0x3 == 0x2 &&
                        (this[_0x869c8e(0x7d)][0x2] = _0x2f9d59)
                  }
                }
              })
              let _0x2fc9c9 =
                this[_0x3eb83e(0x68)] - (this[_0x3eb83e(0x68)] % 0x3)
              if (
                this['vodCurIndex'] != 0x0 &&
                this['vodList'][_0x3eb83e(0x70)] == 0x3 &&
                this['vodCurIndex'] + 0x1 >= _0x2fc9c9 &&
                this['totalvod'] > 0x0
              ) {
                let _0x3edfa3 = this[_0x3eb83e(0x7b)]['slice'](
                  this['vodCurIndex'] + 0x1,
                  this[_0x3eb83e(0x7b)]['length']
                )
                _0x3edfa3[_0x3eb83e(0x77)]((_0x390f63) => {
                  const _0x2df866 = _0x3eb83e
                  this['vodList'][_0x2df866(0x6c)](_0x390f63)
                })
              }
              ;(this[_0x3eb83e(0x66)] = this['totalPlayList'][_0x3eb83e(0x70)]),
                this['$nextTick'](() => {
                  const _0x2c3abb = _0x3eb83e
                  this[_0x2c3abb(0x6a)] = !![]
                })
            }, 0x64)
        })
      function _0x16b4(_0x4f6cc9, _0x10cf96) {
        const _0x40838d = _0x4083()
        return (
          (_0x16b4 = function (_0x16b442, _0x4dd36c) {
            _0x16b442 = _0x16b442 - 0x65
            let _0x5f55b6 = _0x40838d[_0x16b442]
            return _0x5f55b6
          }),
          _0x16b4(_0x4f6cc9, _0x10cf96)
        )
      }
      function _0x4083() {
        const _0x45eb55 = [
          '9huzAXM',
          'beginLoad',
          'videoIndex',
          'totalvod',
          'pauseShow',
          'circular',
          '999496VeZWJW',
          'push',
          '3537900sGoOAh',
          'loadingShow',
          '200858HjlDJy',
          'length',
          'coverOpacity',
          '$nextTick',
          '21cUVijH',
          'getVodSliceList',
          '3519365eqxdsT',
          'vodCurIndex',
          'filter',
          '1014810OluoMc',
          '946656UFZKvA',
          '2190128IflqbY',
          'totalPlayList',
          '4ulCobj',
          'vodList',
        ]
        _0x4083 = function () {
          return _0x45eb55
        }
        return _0x4083()
      }
    },
    /* 重新加载 */
    refreshSquare(dataList, index) {
      const _0x1f1417 = _0x4b93
      function _0x4b93(_0x43d26a, _0x548193) {
        const _0x11f73e = _0x11f7()
        return (
          (_0x4b93 = function (_0x4b935c, _0x1396bf) {
            _0x4b935c = _0x4b935c - 0x13e
            let _0x435bea = _0x11f73e[_0x4b935c]
            return _0x435bea
          }),
          _0x4b93(_0x43d26a, _0x548193)
        )
      }
      function _0x11f7() {
        const _0x296e61 = [
          '8jXGMum',
          'resetData',
          'refreshShow',
          '812284Kwqgxv',
          'totalPlayList',
          '2014580rQTSBt',
          'refreshOpen',
          '7804035rdXiUj',
          '1796079YoOoSV',
          '9136130xyZLhh',
          '33180mjlBsl',
          '968002ElYZqd',
          'initVod',
          'vodList',
          '18MLdKcG',
          '228yBiJWb',
          '22cytWmh',
        ]
        _0x11f7 = function () {
          return _0x296e61
        }
        return _0x11f7()
      }
      ;(function (_0x5e33b7, _0x5bc152) {
        const _0x76f95e = _0x4b93,
          _0x4ed711 = _0x5e33b7()
        while (!![]) {
          try {
            const _0x54e248 =
              -parseInt(_0x76f95e(0x14c)) / 0x1 +
              -parseInt(_0x76f95e(0x14e)) / 0x2 +
              parseInt(_0x76f95e(0x140)) / 0x3 +
              (-parseInt(_0x76f95e(0x147)) / 0x4) *
                (parseInt(_0x76f95e(0x142)) / 0x5) +
              (parseInt(_0x76f95e(0x146)) / 0x6) *
                (-parseInt(_0x76f95e(0x143)) / 0x7) +
              (parseInt(_0x76f95e(0x149)) / 0x8) *
                (parseInt(_0x76f95e(0x13f)) / 0x9) +
              (-parseInt(_0x76f95e(0x141)) / 0xa) *
                (-parseInt(_0x76f95e(0x148)) / 0xb)
            if (_0x54e248 === _0x5bc152) break
            else _0x4ed711['push'](_0x4ed711['shift']())
          } catch (_0x2a01af) {
            _0x4ed711['push'](_0x4ed711['shift']())
          }
        }
      })(_0x11f7, 0xa619e)
      let playIndex = index ? index : 0x0
      this[_0x1f1417(0x14a)](),
        (this[_0x1f1417(0x14b)] = ![]),
        (this[_0x1f1417(0x13e)] = ![]),
        (this['vodCurIndex'] = 0x0),
        (this['currentIndex'] = 0x0),
        (this[_0x1f1417(0x145)] = []),
        (this[_0x1f1417(0x14d)] = []),
        setTimeout(() => {
          const _0x171556 = _0x1f1417
          this[_0x171556(0x144)](dataList, playIndex)
        }, 0x64)
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
        this.beforeVodInfo.vodPaly
      ) {
        this.videoPause(this.vodIndex)
      }
      this.brightSlider = false //隐藏光亮的进度条
    },
    /* 点击暂停、播放视频 */
    playSpot(index) {
      if (this.beforeVodInfo.vodPaly) {
        //暂停
        this.videoPause(index)
        this.beforeVodInfo.pauseShow = true //显示暂停图标
      } else {
        //播放
        this.videoPlay(index)
        this.beforeVodInfo.pauseShow = false //关闭暂停图标
      }
    },
    /* 播放视频 */
    videoPlay(index) {
      // console.log('播放视频myVideo============>' + index)
      function _0x57f0(_0xe30d53, _0xa88a5b) {
        var _0x53a89a = _0x53a8()
        return (
          (_0x57f0 = function (_0x57f086, _0x363fe8) {
            _0x57f086 = _0x57f086 - 0xca
            var _0x156e5e = _0x53a89a[_0x57f086]
            return _0x156e5e
          }),
          _0x57f0(_0xe30d53, _0xa88a5b)
        )
      }
      var _0x24baca = _0x57f0
      ;(function (_0x29d854, _0x207251) {
        var _0x278782 = _0x57f0,
          _0x293589 = _0x29d854()
        while (!![]) {
          try {
            var _0x587796 =
              (parseInt(_0x278782(0xd2)) / 0x1) *
                (-parseInt(_0x278782(0xd3)) / 0x2) +
              -parseInt(_0x278782(0xd4)) / 0x3 +
              -parseInt(_0x278782(0xd9)) / 0x4 +
              -parseInt(_0x278782(0xcc)) / 0x5 +
              -parseInt(_0x278782(0xca)) / 0x6 +
              (parseInt(_0x278782(0xcd)) / 0x7) *
                (parseInt(_0x278782(0xda)) / 0x8) +
              (-parseInt(_0x278782(0xce)) / 0x9) *
                (-parseInt(_0x278782(0xd8)) / 0xa)
            if (_0x587796 === _0x207251) break
            else _0x293589['push'](_0x293589['shift']())
          } catch (_0x20356c) {
            _0x293589['push'](_0x293589['shift']())
          }
        }
      })(_0x53a8, 0xeef78),
        (this['openSpot'] = !![]),
        this[_0x24baca(0xcb)](),
        (this[_0x24baca(0xdc)] = ![]),
        (this[_0x24baca(0xdd)]['vodPaly'] = !![]),
        (this[_0x24baca(0xdd)][_0x24baca(0xd6)] = ![]),
        (this[_0x24baca(0xd1)] = ![]),
        (this[_0x24baca(0xd5)] = ![]),
        this[_0x24baca(0xd7)](() => {
          var _0x501864 = _0x24baca
          ;(this['moveOpacity'] = ![]),
            uni[_0x501864(0xd0)](
              'myVideo' + index + this[_0x501864(0xdb)],
              this
            )[_0x501864(0xcf)]()
        })
      function _0x53a8() {
        var _0x4b7f27 = [
          'getVodInfo',
          '9091090XZLfcg',
          '9604jQXdJc',
          '220680Isftmg',
          'play',
          'createVideoContext',
          'brightSlider',
          '6ItLZYO',
          '2128ahWZNP',
          '5273499uFoEhY',
          'loadStart',
          'pauseShow',
          '$nextTick',
          '2290TfmqoZ',
          '7122180IYQDZG',
          '10808qvlGdM',
          'swId',
          'showShade',
          'beforeVodInfo',
          '6761184xUUhXD',
        ]
        _0x53a8 = function () {
          return _0x4b7f27
        }
        return _0x53a8()
      }
    },
    /* 暂停视频 */
    videoPause(index) {
      // console.log('暂停视频myVideo============>' + index)
      var _0x243fa2 = _0x3a44
      function _0x5ba7() {
        var _0x4f5d9c = [
          'swId',
          'vodIndex',
          'pause',
          'beforeVodInfo',
          '748156yXJlQi',
          'myVideo',
          '73754TXrucN',
          '604890aNAzUl',
          'sliderEndTime',
          '3103362cERdWJ',
          'sliderShow',
          '1528800HiEzRO',
          'brightSlider',
          'createVideoContext',
          '$nextTick',
          '1287643xTAiWT',
          '88026iJvGJi',
          '5XdvIFd',
          '3TQEcnh',
        ]
        _0x5ba7 = function () {
          return _0x4f5d9c
        }
        return _0x5ba7()
      }
      ;(function (_0x2f0f44, _0x1311e0) {
        var _0x3c1da6 = _0x3a44,
          _0x1b8c50 = _0x2f0f44()
        while (!![]) {
          try {
            var _0x4328f1 =
              (parseInt(_0x3c1da6(0x19e)) / 0x1) *
                (parseInt(_0x3c1da6(0x193)) / 0x2) +
              (-parseInt(_0x3c1da6(0x19f)) / 0x3) *
                (parseInt(_0x3c1da6(0x1a4)) / 0x4) +
              parseInt(_0x3c1da6(0x194)) / 0x5 +
              parseInt(_0x3c1da6(0x19d)) / 0x6 +
              parseInt(_0x3c1da6(0x19c)) / 0x7 +
              parseInt(_0x3c1da6(0x198)) / 0x8 +
              -parseInt(_0x3c1da6(0x196)) / 0x9
            if (_0x4328f1 === _0x1311e0) break
            else _0x1b8c50['push'](_0x1b8c50['shift']())
          } catch (_0x5cc6f3) {
            _0x1b8c50['push'](_0x1b8c50['shift']())
          }
        }
      })(_0x5ba7, 0x27d9a),
        this['getVodInfo'](),
        clearTimeout(this[_0x243fa2(0x195)]),
        (this['beforeVodInfo']['vodPaly'] = ![])
      function _0x3a44(_0x95d9, _0x572ede) {
        var _0x5ba7b0 = _0x5ba7()
        return (
          (_0x3a44 = function (_0x3a448c, _0x492498) {
            _0x3a448c = _0x3a448c - 0x192
            var _0x2e82e6 = _0x5ba7b0[_0x3a448c]
            return _0x2e82e6
          }),
          _0x3a44(_0x95d9, _0x572ede)
        )
      }
      this[_0x243fa2(0x1a1)] == index &&
        this[_0x243fa2(0x1a3)][_0x243fa2(0x197)] &&
        (this[_0x243fa2(0x199)] = !![])
      this[_0x243fa2(0x19b)](() => {
        var _0x3e391f = _0x243fa2
        uni[_0x3e391f(0x19a)](
          _0x3e391f(0x192) + index + this[_0x3e391f(0x1a0)],
          this
        )[_0x3e391f(0x1a2)]()
      })
    },
    changeSwiper(ev) {
      function _0x1f8f() {
        const _0x54c58c = [
          'vodCurIndex',
          'videoIndex',
          '4946230PWZftg',
          '3218418FQhtDk',
          '2210124MLYiNS',
          'moveOpacity',
          'current',
          '24ZMRjjG',
          '29033400kCazfh',
          'showShade',
          'length',
          'getVodInfo',
          '2fzjQCV',
          '149660iuJgaS',
          '425840BgjLbF',
          'shadeNum',
          'vodList',
          '1526034DnXKja',
          '216PEWLJw',
          'detail',
          'totalPlayList',
          '192jOktez',
        ]
        _0x1f8f = function () {
          return _0x54c58c
        }
        return _0x1f8f()
      }
      function _0x3427(_0x2e5284, _0x53325e) {
        const _0x1f8f6b = _0x1f8f()
        return (
          (_0x3427 = function (_0x342789, _0x5e3ac3) {
            _0x342789 = _0x342789 - 0x179
            let _0x1a825a = _0x1f8f6b[_0x342789]
            return _0x1a825a
          }),
          _0x3427(_0x2e5284, _0x53325e)
        )
      }
      const _0x2cbab5 = _0x3427
      ;(function (_0x114024, _0x199613) {
        const _0x43c9e6 = _0x3427,
          _0x3f962c = _0x114024()
        while (!![]) {
          try {
            const _0x447726 =
              (-parseInt(_0x43c9e6(0x182)) / 0x1) *
                (-parseInt(_0x43c9e6(0x17d)) / 0x2) +
              parseInt(_0x43c9e6(0x18a)) / 0x3 +
              (parseInt(_0x43c9e6(0x186)) / 0x4) *
                (-parseInt(_0x43c9e6(0x17e)) / 0x5) +
              (parseInt(_0x43c9e6(0x18e)) / 0x6) *
                (-parseInt(_0x43c9e6(0x18b)) / 0x7) +
              (parseInt(_0x43c9e6(0x17f)) / 0x8) *
                (-parseInt(_0x43c9e6(0x183)) / 0x9) +
              -parseInt(_0x43c9e6(0x189)) / 0xa +
              parseInt(_0x43c9e6(0x179)) / 0xb
            if (_0x447726 === _0x199613) break
            else _0x3f962c['push'](_0x3f962c['shift']())
          } catch (_0x51f9c1) {
            _0x3f962c['push'](_0x3f962c['shift']())
          }
        }
      })(_0x1f8f, 0xbb1e1)
      let curIndex = ev[_0x2cbab5(0x184)][_0x2cbab5(0x18d)],
        videoIndex = this[_0x2cbab5(0x181)][curIndex][_0x2cbab5(0x188)]
      ;(this[_0x2cbab5(0x18c)] = !![]),
        this['shadeNum']++,
        (this['openSpot'] = ![]),
        (this['autoplayVideo'] = !![])
      let vodTotal = this['totalPlayList'][_0x2cbab5(0x17b)] % 0x3
      ;(videoIndex == 0x0 ||
        videoIndex + 0x1 ==
          this[_0x2cbab5(0x185)][_0x2cbab5(0x17b)] - vodTotal) &&
        this[_0x2cbab5(0x180)] > 0x1 &&
        (this[_0x2cbab5(0x17a)] = !![])
      ;(this['changeIndex'] = curIndex),
        (this[_0x2cbab5(0x187)] = videoIndex),
        this['getVodSliceList'](),
        this[_0x2cbab5(0x17c)]()
    },
    /* 要播放视频的下标 */
    swiperVod(ev) {
      const _0x102a01 = _0x45cc
      ;(function (_0x50b19a, _0x298432) {
        const _0x38e4b0 = _0x45cc,
          _0x54700d = _0x50b19a()
        while (!![]) {
          try {
            const _0x3fc393 =
              (-parseInt(_0x38e4b0(0xb2)) / 0x1) *
                (-parseInt(_0x38e4b0(0x9d)) / 0x2) +
              parseInt(_0x38e4b0(0xa7)) / 0x3 +
              (parseInt(_0x38e4b0(0xa3)) / 0x4) *
                (-parseInt(_0x38e4b0(0x9f)) / 0x5) +
              (-parseInt(_0x38e4b0(0xa4)) / 0x6) *
                (-parseInt(_0x38e4b0(0xb8)) / 0x7) +
              (-parseInt(_0x38e4b0(0x9e)) / 0x8) *
                (parseInt(_0x38e4b0(0xb4)) / 0x9) +
              -parseInt(_0x38e4b0(0xac)) / 0xa +
              parseInt(_0x38e4b0(0xba)) / 0xb
            if (_0x3fc393 === _0x298432) break
            else _0x54700d['push'](_0x54700d['shift']())
          } catch (_0x46ed7b) {
            _0x54700d['push'](_0x54700d['shift']())
          }
        }
      })(_0x2ff3, 0xead81)
      let curIndex = ev[_0x102a01(0xb9)]['current']
      if (this['openSpot']) return
      this[_0x102a01(0xbb)](),
        (this[_0x102a01(0xa1)] = ![]),
        (this['shadeNum'] = 0x0),
        (this[_0x102a01(0x9b)] = ![]),
        this[_0x102a01(0xb3)](this[_0x102a01(0xb6)])
      let endNum =
        this[_0x102a01(0xb7)]['length'] -
        (this[_0x102a01(0xb7)][_0x102a01(0xa6)] % 0x3)
      function _0x2ff3() {
        const _0x3771b1 = [
          '3MzKZpP',
          'setSliceList',
          '9GiQLvp',
          'vodList',
          'finalList',
          'totalPlayList',
          '5833765DsrEOk',
          'detail',
          '3436334asAfxm',
          'resetData',
          '$emit',
          'showShade',
          'swiperPlay',
          '911866kckRha',
          '12067592tWqagk',
          '48215zwxCIt',
          'beginLoad',
          'moveOpacity',
          'changeIndex',
          '4VPrFxY',
          '6JvMEjB',
          'slice',
          'length',
          '5234655glwXPp',
          'loadTime',
          'push',
          'lodData',
          '$nextTick',
          '17784600VMBiYj',
          'totalvod',
          'vodCurIndex',
          'circular',
          'vodIndex',
          'loadShow',
        ]
        _0x2ff3 = function () {
          return _0x3771b1
        }
        return _0x2ff3()
      }
      if (
        this[_0x102a01(0xae)] == 0x0 ||
        this[_0x102a01(0xae)] + 0x1 >= endNum
      ) {
        this[_0x102a01(0xaf)] = ![]
        let appendNum = this[_0x102a01(0xad)] - (this[_0x102a01(0xad)] % 0x3)
        if (
          this[_0x102a01(0xae)] != 0x0 &&
          this[_0x102a01(0xb5)]['length'] == 0x3 &&
          this[_0x102a01(0xae)] + 0x1 >= appendNum &&
          this[_0x102a01(0xad)] > 0x0
        ) {
          let arrList = this['totalPlayList'][_0x102a01(0xa5)](
            this[_0x102a01(0xae)] + 0x1,
            this[_0x102a01(0xb7)][_0x102a01(0xa6)]
          )
          arrList['filter']((_0x2a8c60) => {
            const _0x428696 = _0x102a01
            this[_0x428696(0xb5)][_0x428696(0xa9)](_0x2a8c60)
          })
        }
      } else {
        let loadNum = this['beginLoad'] - (this['beginLoad'] % 0x3)
        if (
          this[_0x102a01(0xa0)] > 0x0 &&
          this['vodCurIndex'] + 0x1 >= loadNum &&
          this[_0x102a01(0xae)] + 0x1 <= this[_0x102a01(0xa0)]
        ) {
        } else
          this[_0x102a01(0xb5)][_0x102a01(0xa6)] > 0x3 &&
            (this['vodList'][_0x102a01(0xa6)] = 0x3),
            (this[_0x102a01(0xa0)] = 0x0)
        this[_0x102a01(0xab)](() => {
          const _0x3550c0 = _0x102a01
          this[_0x3550c0(0xaf)] = !![]
        })
      }
      this[_0x102a01(0xad)] > 0x0 &&
        (this[_0x102a01(0xb1)] =
          this[_0x102a01(0xb7)][_0x102a01(0xa6)] >= this[_0x102a01(0xad)]
            ? ![]
            : !![])
      ;(this[_0x102a01(0xb0)] = this[_0x102a01(0xa2)]),
        this[_0x102a01(0x9c)](this[_0x102a01(0xb0)])
      function _0x45cc(_0x1c32cb, _0x544e43) {
        const _0x2ff35e = _0x2ff3()
        return (
          (_0x45cc = function (_0x45cce0, _0x296785) {
            _0x45cce0 = _0x45cce0 - 0x9b
            let _0x2c3c35 = _0x2ff35e[_0x45cce0]
            return _0x2c3c35
          }),
          _0x45cc(_0x1c32cb, _0x544e43)
        )
      }
      this[_0x102a01(0xae)] + 0x1 >=
        this['totalPlayList'][_0x102a01(0xa6)] -
          (this['totalPlayList'][_0x102a01(0xa6)] % 0x3) &&
        !this['loadStart'] &&
        (clearTimeout(this[_0x102a01(0xa8)]),
        (this[_0x102a01(0xa8)] = setTimeout(() => {
          const _0x381442 = _0x102a01
          this[_0x381442(0xbc)](_0x381442(0xaa))
        }, 0x12c)))
    },
    /* 获取当前视频播放对象 */
    getVodInfo() {
      var _0xc1c987 = _0x704c
      ;(function (_0x4da968, _0x461ef6) {
        var _0x20b4db = _0x704c,
          _0x57a3c3 = _0x4da968()
        while (!![]) {
          try {
            var _0x47a85e =
              (-parseInt(_0x20b4db(0xff)) / 0x1) *
                (-parseInt(_0x20b4db(0x100)) / 0x2) +
              (-parseInt(_0x20b4db(0x105)) / 0x3) *
                (parseInt(_0x20b4db(0x10a)) / 0x4) +
              (parseInt(_0x20b4db(0xfe)) / 0x5) *
                (-parseInt(_0x20b4db(0x109)) / 0x6) +
              -parseInt(_0x20b4db(0xfd)) / 0x7 +
              (-parseInt(_0x20b4db(0xfc)) / 0x8) *
                (parseInt(_0x20b4db(0x108)) / 0x9) +
              -parseInt(_0x20b4db(0x106)) / 0xa +
              parseInt(_0x20b4db(0x104)) / 0xb
            if (_0x47a85e === _0x461ef6) break
            else _0x57a3c3['push'](_0x57a3c3['shift']())
          } catch (_0x4af65e) {
            _0x57a3c3['push'](_0x57a3c3['shift']())
          }
        }
      })(_0x1271, 0x5063e),
        this['vodList'][_0xc1c987(0x101)]((_0x3a8b49) => {
          var _0x2229c0 = _0xc1c987
          this[_0x2229c0(0x102)] == _0x3a8b49[_0x2229c0(0x103)] &&
            (this[_0x2229c0(0x107)] = _0x3a8b49)
        })
      function _0x704c(_0x591fc5, _0x562afb) {
        var _0x127114 = _0x1271()
        return (
          (_0x704c = function (_0x704ce5, _0x12447e) {
            _0x704ce5 = _0x704ce5 - 0xfc
            var _0x6661bb = _0x127114[_0x704ce5]
            return _0x6661bb
          }),
          _0x704c(_0x591fc5, _0x562afb)
        )
      }
      function _0x1271() {
        var _0x95f09d = [
          '12xnpofs',
          '977370BKhKBm',
          'beforeVodInfo',
          '3637773XAWiOc',
          '6QsDUrG',
          '576860KWhXmm',
          '8nbvVRe',
          '1048131esEyBp',
          '791515HzzrZO',
          '220codJjD',
          '1640wbmcbU',
          'filter',
          'vodCurIndex',
          'videoIndex',
          '16892788DezDCF',
        ]
        _0x1271 = function () {
          return _0x95f09d
        }
        return _0x1271()
      }
    },
    /* 截取要播放的视频列表 */
    getVodSliceList() {
      const _0x2c4df4 = _0x2483
      ;(function (_0x3b8b3e, _0x4a09c9) {
        const _0x20cba = _0x2483,
          _0x47b16e = _0x3b8b3e()
        while (!![]) {
          try {
            const _0x5036b0 =
              (-parseInt(_0x20cba(0xfc)) / 0x1) *
                (-parseInt(_0x20cba(0xf4)) / 0x2) +
              (-parseInt(_0x20cba(0xf9)) / 0x3) *
                (-parseInt(_0x20cba(0xfe)) / 0x4) +
              (parseInt(_0x20cba(0xee)) / 0x5) *
                (parseInt(_0x20cba(0xef)) / 0x6) +
              parseInt(_0x20cba(0xf7)) / 0x7 +
              (-parseInt(_0x20cba(0xf5)) / 0x8) *
                (parseInt(_0x20cba(0xf0)) / 0x9) +
              parseInt(_0x20cba(0xff)) / 0xa +
              (-parseInt(_0x20cba(0xfa)) / 0xb) *
                (parseInt(_0x20cba(0x100)) / 0xc)
            if (_0x5036b0 === _0x4a09c9) break
            else _0x47b16e['push'](_0x47b16e['shift']())
          } catch (_0x4f3890) {
            _0x47b16e['push'](_0x47b16e['shift']())
          }
        }
      })(_0x45fc, 0x29605)
      function _0x45fc() {
        const _0x1c0ed8 = [
          '821202vvgsMM',
          '22OiavkR',
          'finalList',
          '1GklnFb',
          'vodList',
          '4efVfqY',
          '2275460vVjrIO',
          '2512452wIYzHH',
          '3215KixqFD',
          '918kFGahp',
          '157446NNJILF',
          'videoIndex',
          'slice',
          'stringify',
          '127594mDtJsr',
          '72IMNYon',
          'filter',
          '575463pLSLCE',
          'parse',
        ]
        _0x45fc = function () {
          return _0x1c0ed8
        }
        return _0x45fc()
      }
      function _0x2483(_0x2dfb79, _0x4c1648) {
        const _0x45fc82 = _0x45fc()
        return (
          (_0x2483 = function (_0x248357, _0x12ef63) {
            _0x248357 = _0x248357 - 0xee
            let _0x519aad = _0x45fc82[_0x248357]
            return _0x519aad
          }),
          _0x2483(_0x2dfb79, _0x4c1648)
        )
      }
      let videoIndex = this[_0x2c4df4(0xfd)][this['changeIndex']]['videoIndex'],
        starIdx = videoIndex - 0x1 < 0x0 ? 0x0 : videoIndex - 0x1,
        endIdx = videoIndex + 0x2,
        resultList = JSON[_0x2c4df4(0xf8)](
          JSON[_0x2c4df4(0xf3)](
            this['totalPlayList'][_0x2c4df4(0xf2)](starIdx, endIdx)
          )
        )
      resultList[_0x2c4df4(0xf6)]((_0x5b9dcd) => {
        const _0x3eb1d7 = _0x2c4df4
        if (_0x5b9dcd[_0x3eb1d7(0xf1)] % 0x3 == 0x0)
          this[_0x3eb1d7(0xfd)][0x0][_0x3eb1d7(0xf1)] = _0x5b9dcd['videoIndex']
        else {
          if (_0x5b9dcd[_0x3eb1d7(0xf1)] % 0x3 == 0x1)
            this[_0x3eb1d7(0xfd)][0x1][_0x3eb1d7(0xf1)] =
              _0x5b9dcd[_0x3eb1d7(0xf1)]
          else
            _0x5b9dcd['videoIndex'] % 0x3 == 0x2 &&
              (this[_0x3eb1d7(0xfd)][0x2][_0x3eb1d7(0xf1)] =
                _0x5b9dcd['videoIndex'])
        }
      }),
        (this[_0x2c4df4(0xfb)] = resultList)
    },
    /* swiper播放视频 */
    swiperPlay(newIndex) {
      var _0xdfb822 = _0x5828
      function _0x5828(_0x11b48a, _0x3a59ee) {
        var _0x54a569 = _0x54a5()
        return (
          (_0x5828 = function (_0x5828f1, _0x3fe17a) {
            _0x5828f1 = _0x5828f1 - 0x197
            var _0x3b04f4 = _0x54a569[_0x5828f1]
            return _0x3b04f4
          }),
          _0x5828(_0x11b48a, _0x3a59ee)
        )
      }
      function _0x54a5() {
        var _0x5a728b = [
          'beforeVodInfo',
          'videoPlay',
          '15GhLyDA',
          '15338USBANd',
          'createVideoContext',
          'muteVideo',
          '6886944LlNHuj',
          'menuRef',
          '1758376HTMMDz',
          'swId',
          '10032390PTBYTQ',
          'shakePlay',
          'likeeffect',
          '318868sRBKOP',
          '709816aMBkYh',
          '$refs',
          '474YILMBS',
          '3156930OgOSgQ',
          'playOpen',
        ]
        _0x54a5 = function () {
          return _0x5a728b
        }
        return _0x54a5()
      }
      ;(function (_0x1cb3cd, _0x112de5) {
        var _0x1bf152 = _0x5828,
          _0x4bc0cb = _0x1cb3cd()
        while (!![]) {
          try {
            var _0x1b9109 =
              -parseInt(_0x1bf152(0x197)) / 0x1 +
              (parseInt(_0x1bf152(0x1a0)) / 0x2) *
                (parseInt(_0x1bf152(0x19a)) / 0x3) +
              (parseInt(_0x1bf152(0x1a5)) / 0x4) *
                (-parseInt(_0x1bf152(0x19f)) / 0x5) +
              parseInt(_0x1bf152(0x1a7)) / 0x6 +
              parseInt(_0x1bf152(0x19b)) / 0x7 +
              -parseInt(_0x1bf152(0x198)) / 0x8 +
              -parseInt(_0x1bf152(0x1a3)) / 0x9
            if (_0x1b9109 === _0x112de5) break
            else _0x4bc0cb['push'](_0x4bc0cb['shift']())
          } catch (_0x11c7ad) {
            _0x4bc0cb['push'](_0x4bc0cb['shift']())
          }
        }
      })(_0x54a5, 0xcdd9c),
        (this[_0xdfb822(0x19c)] = ![]),
        clearInterval(this['failTime']),
        clearInterval(this['repeatTime']),
        this[_0xdfb822(0x1a2)](![])
      uni[_0xdfb822(0x1a1)](
        'myVideo' + newIndex + this[_0xdfb822(0x1a6)],
        this
      ) &&
        ((this[_0xdfb822(0x1a8)] = ![]),
        (this[_0xdfb822(0x19d)]['vodPaly'] = !![]),
        this[_0xdfb822(0x19e)](newIndex))
      this[_0xdfb822(0x199)][_0xdfb822(0x1a4) + newIndex + ''][0x0][
        _0xdfb822(0x1a9)
      ] = null
    },
    /* 当开始/继续播放时 */
    startPlay(index) {
      var _0xe890c4 = _0x1ab5
      function _0x5913() {
        var _0x1ae99c = [
          '6366EZQDAh',
          'playOpen',
          '2116610hAPTFW',
          '4837vQQPaR',
          'rotateImgShow',
          '1727937lqfiAM',
          '40cYmcNk',
          'failTime',
          '3862poRnVt',
          '17vewSpm',
          '2076664YZknjI',
          '2256006KKggvG',
          '3451784oRtVJv',
          'palyCartoon',
          'vodIndex',
          'beforeVodInfo',
        ]
        _0x5913 = function () {
          return _0x1ae99c
        }
        return _0x5913()
      }
      function _0x1ab5(_0x3936d6, _0x1e4e4e) {
        var _0x591394 = _0x5913()
        return (
          (_0x1ab5 = function (_0x1ab529, _0x4b0ea5) {
            _0x1ab529 = _0x1ab529 - 0x171
            var _0x535389 = _0x591394[_0x1ab529]
            return _0x535389
          }),
          _0x1ab5(_0x3936d6, _0x1e4e4e)
        )
      }
      ;(function (_0x3069d5, _0x368b76) {
        var _0x260350 = _0x1ab5,
          _0x14a2b7 = _0x3069d5()
        while (!![]) {
          try {
            var _0x1704f1 =
              (parseInt(_0x260350(0x178)) / 0x1) *
                (-parseInt(_0x260350(0x177)) / 0x2) +
              parseInt(_0x260350(0x17a)) / 0x3 +
              parseInt(_0x260350(0x179)) / 0x4 +
              parseInt(_0x260350(0x171)) / 0x5 +
              (-parseInt(_0x260350(0x17f)) / 0x6) *
                (parseInt(_0x260350(0x172)) / 0x7) +
              parseInt(_0x260350(0x17b)) / 0x8 +
              (-parseInt(_0x260350(0x174)) / 0x9) *
                (parseInt(_0x260350(0x175)) / 0xa)
            if (_0x1704f1 === _0x368b76) break
            else _0x14a2b7['push'](_0x14a2b7['shift']())
          } catch (_0x2b681f) {
            _0x14a2b7['push'](_0x14a2b7['shift']())
          }
        }
      })(_0x5913, 0x9088d)
      this[_0xe890c4(0x17d)] == index &&
        ((this[_0xe890c4(0x180)] = ![]),
        this[_0xe890c4(0x17e)][_0xe890c4(0x173)] &&
          (this[_0xe890c4(0x17c)] = !![]),
        clearInterval(this[_0xe890c4(0x176)]),
        clearInterval(this['repeatTime']))
    },
    /* 视频出现缓冲 */
    bufferVod(index) {
      // console.log('缓冲视频================》'+index)
      function _0x1c0a(_0x19bd72, _0x38b25b) {
        var _0x919084 = _0x9190()
        return (
          (_0x1c0a = function (_0x1c0ae5, _0x5d50f0) {
            _0x1c0ae5 = _0x1c0ae5 - 0x1ea
            var _0x329051 = _0x919084[_0x1c0ae5]
            return _0x329051
          }),
          _0x1c0a(_0x19bd72, _0x38b25b)
        )
      }
      var _0x351785 = _0x1c0a
      function _0x9190() {
        var _0x1cff61 = [
          '79344LcZvVn',
          'playOpen',
          'beforeVodInfo',
          '14EVpIJC',
          '580nuxIVb',
          '1858955XZyiHP',
          '10745284ZQBLlo',
          'vodList',
          'length',
          '4JCLXYY',
          '3875464vouOlj',
          '52FnkGyt',
          '15769iUcrsS',
          'vodIndex',
          '936162cYAqCg',
          '847653mJONbf',
        ]
        _0x9190 = function () {
          return _0x1cff61
        }
        return _0x9190()
      }
      ;(function (_0x4dbda2, _0x428f66) {
        var _0x2f887e = _0x1c0a,
          _0x2655e7 = _0x4dbda2()
        while (!![]) {
          try {
            var _0xd5dd98 =
              (-parseInt(_0x2f887e(0x1f9)) / 0x1) *
                (-parseInt(_0x2f887e(0x1f8)) / 0x2) +
              parseInt(_0x2f887e(0x1ec)) / 0x3 +
              (parseInt(_0x2f887e(0x1f6)) / 0x4) *
                (parseInt(_0x2f887e(0x1f2)) / 0x5) +
              (-parseInt(_0x2f887e(0x1eb)) / 0x6) *
                (-parseInt(_0x2f887e(0x1f0)) / 0x7) +
              parseInt(_0x2f887e(0x1f7)) / 0x8 +
              (parseInt(_0x2f887e(0x1ed)) / 0x9) *
                (-parseInt(_0x2f887e(0x1f1)) / 0xa) +
              -parseInt(_0x2f887e(0x1f3)) / 0xb
            if (_0xd5dd98 === _0x428f66) break
            else _0x2655e7['push'](_0x2655e7['shift']())
          } catch (_0x2d262b) {
            _0x2655e7['push'](_0x2655e7['shift']())
          }
        }
      })(_0x9190, 0x5afab)
      this[_0x351785(0x1f4)][_0x351785(0x1f5)] > 0x0 &&
        this['changeIndex'] == this[_0x351785(0x1ea)] &&
        !this['bufferShow'] &&
        this[_0x351785(0x1ef)]['vodPaly'] &&
        ((this[_0x351785(0x1ee)] = !![]), this['scheduleLoad']())
    },
    /* 视频播放失败 */
    errVod(index) {
      // console.log('视频播放失败================》'+index)
      function _0x29d9() {
        var _0x54b74d = [
          '953735uUWSbI',
          'palyCartoon',
          '28muDWdF',
          '35pIcvvk',
          'vodIndex',
          '183213nvCOpn',
          'vodPaly',
          '19122554XNqVcj',
          'vodList',
          '1101QJphIN',
          '273432rOgFxi',
          'playOpen',
          '257661EvnFcZ',
          'bufferShow',
          '2440218sBPCzI',
          'beforeVodInfo',
          'scheduleLoad',
          'playErrTime',
          '1486QjEzPa',
          '180iNJeCY',
        ]
        _0x29d9 = function () {
          return _0x54b74d
        }
        return _0x29d9()
      }
      var _0x4201f1 = _0x1f7f
      function _0x1f7f(_0xe2ebec, _0x577a48) {
        var _0x29d986 = _0x29d9()
        return (
          (_0x1f7f = function (_0x1f7f9b, _0x473136) {
            _0x1f7f9b = _0x1f7f9b - 0x95
            var _0x370377 = _0x29d986[_0x1f7f9b]
            return _0x370377
          }),
          _0x1f7f(_0xe2ebec, _0x577a48)
        )
      }
      ;(function (_0xa60d1f, _0x9b2eba) {
        var _0x4f6f4c = _0x1f7f,
          _0xaf820d = _0xa60d1f()
        while (!![]) {
          try {
            var _0x1fc5bb =
              (-parseInt(_0x4f6f4c(0x9f)) / 0x1) *
                (parseInt(_0x4f6f4c(0xa8)) / 0x2) +
              (parseInt(_0x4f6f4c(0x9b)) / 0x3) *
                (-parseInt(_0x4f6f4c(0x98)) / 0x4) +
              parseInt(_0x4f6f4c(0x96)) / 0x5 +
              -parseInt(_0x4f6f4c(0xa4)) / 0x6 +
              (parseInt(_0x4f6f4c(0x99)) / 0x7) *
                (-parseInt(_0x4f6f4c(0xa0)) / 0x8) +
              (-parseInt(_0x4f6f4c(0xa2)) / 0x9) *
                (-parseInt(_0x4f6f4c(0x95)) / 0xa) +
              parseInt(_0x4f6f4c(0x9d)) / 0xb
            if (_0x1fc5bb === _0x9b2eba) break
            else _0xaf820d['push'](_0xaf820d['shift']())
          } catch (_0x2f4211) {
            _0xaf820d['push'](_0xaf820d['shift']())
          }
        }
      })(_0x29d9, 0x97b21),
        clearTimeout(this[_0x4201f1(0xa7)]),
        (this[_0x4201f1(0xa7)] = setTimeout(() => {
          var _0x21b57e = _0x4201f1
          this[_0x21b57e(0x9e)]['length'] > 0x0 &&
            this['changeIndex'] == this[_0x21b57e(0x9a)] &&
            !this[_0x21b57e(0xa3)] &&
            this[_0x21b57e(0xa5)][_0x21b57e(0x9c)] &&
            ((this[_0x21b57e(0xa1)] = !![]),
            (this[_0x21b57e(0x97)] = ![]),
            this[_0x21b57e(0xa6)]())
        }, 0x12c))
    },
    /* 播放进度变化时触发 */
    timeupdateVod(ev, index) {
      var _0x102745 = _0x386a
      ;(function (_0x50122e, _0xbc284d) {
        var _0x2fad76 = _0x386a,
          _0x5241a0 = _0x50122e()
        while (!![]) {
          try {
            var _0x1e87b1 =
              (-parseInt(_0x2fad76(0xc8)) / 0x1) *
                (-parseInt(_0x2fad76(0xc3)) / 0x2) +
              (parseInt(_0x2fad76(0xb8)) / 0x3) *
                (parseInt(_0x2fad76(0xbc)) / 0x4) +
              (-parseInt(_0x2fad76(0xc1)) / 0x5) *
                (parseInt(_0x2fad76(0xbe)) / 0x6) +
              (parseInt(_0x2fad76(0xcf)) / 0x7) *
                (-parseInt(_0x2fad76(0xc4)) / 0x8) +
              (-parseInt(_0x2fad76(0xcc)) / 0x9) *
                (-parseInt(_0x2fad76(0xc0)) / 0xa) +
              -parseInt(_0x2fad76(0xb7)) / 0xb +
              parseInt(_0x2fad76(0xc2)) / 0xc
            if (_0x1e87b1 === _0xbc284d) break
            else _0x5241a0['push'](_0x5241a0['shift']())
          } catch (_0x2391c5) {
            _0x5241a0['push'](_0x5241a0['shift']())
          }
        }
      })(_0x5d7c, 0x34e79)
      if (this[_0x102745(0xce)] != index) return ![]
      function _0x5d7c() {
        var _0x11c1fa = [
          'loadingShow',
          '43nGTIlc',
          'vodList',
          'repeatTime',
          'screenWidth',
          '17604wdPpDB',
          'sliderTime',
          'vodIndex',
          '7eSUbzz',
          'bufferNum',
          'failTime',
          '3352228dWCJIN',
          '40296OZqbKj',
          'bufferShow',
          'sliderProgress',
          'currentTime',
          '80XRutuE',
          'beforeVodInfo',
          '227394FIWxQI',
          'detail',
          '720vmuIrZ',
          '45VmYCNE',
          '6671112aTMcGK',
          '6550qccEVM',
          '1949496ltBEBO',
          'videoTime',
          'duration',
        ]
        _0x5d7c = function () {
          return _0x11c1fa
        }
        return _0x5d7c()
      }
      this[_0x102745(0xbd)]['coverOpacity'] = ![]
      function _0x386a(_0x4122ee, _0x250a19) {
        var _0x5d7c03 = _0x5d7c()
        return (
          (_0x386a = function (_0x386acc, _0xeaa820) {
            _0x386acc = _0x386acc - 0xb5
            var _0x346435 = _0x5d7c03[_0x386acc]
            return _0x346435
          }),
          _0x386a(_0x4122ee, _0x250a19)
        )
      }
      !this['sliderDrag'] &&
        ((this[_0x102745(0xc5)] = ev[_0x102745(0xbf)][_0x102745(0xc6)]),
        (this[_0x102745(0xcd)] = ev[_0x102745(0xbf)]['currentTime']),
        (this[_0x102745(0xba)] =
          (ev[_0x102745(0xbf)][_0x102745(0xbb)] /
            ev['detail'][_0x102745(0xc6)]) *
          this[_0x102745(0xcb)]))
      this[_0x102745(0xc9)]['length'] > 0x0 &&
        ((this[_0x102745(0xb5)] = ev[_0x102745(0xbf)][_0x102745(0xbb)]),
        (this[_0x102745(0xb9)] = ![]),
        (this[_0x102745(0xbd)][_0x102745(0xc7)] = ![]),
        clearTimeout(this['bufferTime']),
        clearInterval(this[_0x102745(0xb6)]),
        clearInterval(this[_0x102745(0xca)]))
    },
    /* 显示进度加载动画 */
    scheduleLoad() {
      var _0x2b35ac = _0x2a09
      ;(function (_0x46d573, _0x7e16c7) {
        var _0x3668d9 = _0x2a09,
          _0x17d0e1 = _0x46d573()
        while (!![]) {
          try {
            var _0x5106e5 =
              parseInt(_0x3668d9(0x175)) / 0x1 +
              -parseInt(_0x3668d9(0x16b)) / 0x2 +
              (parseInt(_0x3668d9(0x170)) / 0x3) *
                (-parseInt(_0x3668d9(0x16e)) / 0x4) +
              -parseInt(_0x3668d9(0x172)) / 0x5 +
              (-parseInt(_0x3668d9(0x168)) / 0x6) *
                (-parseInt(_0x3668d9(0x174)) / 0x7) +
              -parseInt(_0x3668d9(0x16a)) / 0x8 +
              parseInt(_0x3668d9(0x176)) / 0x9
            if (_0x5106e5 === _0x7e16c7) break
            else _0x17d0e1['push'](_0x17d0e1['shift']())
          } catch (_0x5d1eeb) {
            _0x17d0e1['push'](_0x17d0e1['shift']())
          }
        }
      })(_0x3dd2, 0x212a8)
      function _0x2a09(_0x381677, _0x342ceb) {
        var _0x3dd26d = _0x3dd2()
        return (
          (_0x2a09 = function (_0x2a0942, _0x35d2e0) {
            _0x2a0942 = _0x2a0942 - 0x168
            var _0x2a25d6 = _0x3dd26d[_0x2a0942]
            return _0x2a25d6
          }),
          _0x2a09(_0x381677, _0x342ceb)
        )
      }
      function _0x3dd2() {
        var _0x33cf9d = [
          'beforeVodInfo',
          '88875BmJQZd',
          'playOpen',
          '5152AuBisc',
          '170310uvZDUx',
          '1025775ZjbqmP',
          '1776dYUIUG',
          'bufferTime',
          '875904SBOveV',
          '427606JyvcCS',
          'vodLoad',
          'bufferShow',
          '36pjXFUN',
          'loadingShow',
          '8409XvMPja',
        ]
        _0x3dd2 = function () {
          return _0x33cf9d
        }
        return _0x3dd2()
      }
      !this[_0x2b35ac(0x16d)] &&
        ((this[_0x2b35ac(0x16d)] = !![]),
        (this[_0x2b35ac(0x169)] = setTimeout(() => {
          var _0x58bf51 = _0x2b35ac
          ;(this[_0x58bf51(0x171)][_0x58bf51(0x16f)] = !![]),
            this[_0x58bf51(0x173)] && this[_0x58bf51(0x16c)]()
        }, 0x9c4)))
    },
    /* 重新播放视频 */
    vodLoad() {
      /* 视频播放失败，重新播放视频 */
      function _0x3f8c() {
        var _0x23f667 = [
          '914655iFBkIp',
          '957916jzflPE',
          '122fNTjfI',
          '172902yqDxFX',
          'bufferShow',
          'swId',
          'vodIndex',
          'createVideoContext',
          'playOpen',
          '706605ptNMbx',
          'myVideo',
          '3329JwVCIe',
          'sliderTime',
          '565957auudxC',
          '4152376OhnFOp',
        ]
        _0x3f8c = function () {
          return _0x23f667
        }
        return _0x3f8c()
      }
      var _0x355baf = _0x5a2f
      function _0x5a2f(_0x3bbaf8, _0x1cf5a6) {
        var _0x3f8c3f = _0x3f8c()
        return (
          (_0x5a2f = function (_0x5a2fe3, _0x4acf37) {
            _0x5a2fe3 = _0x5a2fe3 - 0x142
            var _0x5a34cf = _0x3f8c3f[_0x5a2fe3]
            return _0x5a34cf
          }),
          _0x5a2f(_0x3bbaf8, _0x1cf5a6)
        )
      }
      ;(function (_0x432a1e, _0x3a88d3) {
        var _0x2eeac0 = _0x5a2f,
          _0x2fab3f = _0x432a1e()
        while (!![]) {
          try {
            var _0x1543f7 =
              (-parseInt(_0x2eeac0(0x144)) / 0x1) *
                (parseInt(_0x2eeac0(0x14a)) / 0x2) +
              -parseInt(_0x2eeac0(0x142)) / 0x3 +
              parseInt(_0x2eeac0(0x149)) / 0x4 +
              -parseInt(_0x2eeac0(0x148)) / 0x5 +
              -parseInt(_0x2eeac0(0x14b)) / 0x6 +
              parseInt(_0x2eeac0(0x146)) / 0x7 +
              parseInt(_0x2eeac0(0x147)) / 0x8
            if (_0x1543f7 === _0x3a88d3) break
            else _0x2fab3f['push'](_0x2fab3f['shift']())
          } catch (_0x11aea0) {
            _0x2fab3f['push'](_0x2fab3f['shift']())
          }
        }
      })(_0x3f8c, 0x2e261)
      this[_0x355baf(0x150)] &&
        ((this['playOpen'] = ![]),
        this[_0x355baf(0x145)] == 0x0 &&
          uni[_0x355baf(0x14f)](
            _0x355baf(0x143) + this[_0x355baf(0x14e)] + this[_0x355baf(0x14d)],
            this
          )['stop'](),
        (this['failTime'] = setTimeout(() => {
          var _0xe037b1 = _0x355baf
          ;(this[_0xe037b1(0x150)] = !![]),
            (this[_0xe037b1(0x14c)] = ![]),
            this['videoPlay'](this[_0xe037b1(0x14e)])
        }, 0x3e8)))
    },
    /* 视频播放结束 */
    endedVod(index) {
      console.log('视频播放结束' + index)
      var _0x2cb824 = _0x358f
      function _0x358f(_0x2af0b7, _0x54afd7) {
        var _0x580482 = _0x5804()
        return (
          (_0x358f = function (_0x358fb7, _0x46bd35) {
            _0x358fb7 = _0x358fb7 - 0x1e6
            var _0x3e35a5 = _0x580482[_0x358fb7]
            return _0x3e35a5
          }),
          _0x358f(_0x2af0b7, _0x54afd7)
        )
      }
      function _0x5804() {
        var _0x2c2ab4 = [
          '1439683uCqPVV',
          '2214530eQQPFl',
          '30452140bJKvft',
          '13204pakJue',
          '5415003cDlvWK',
          '64YkgWBH',
          'currentIndex',
          '450mBrqOZ',
          '730902uspvaJ',
          'nextPlay',
          '3axACst',
          'vodIndex',
          '10600614LOJCUO',
        ]
        _0x5804 = function () {
          return _0x2c2ab4
        }
        return _0x5804()
      }
      ;(function (_0x201784, _0x478bfe) {
        var _0x451159 = _0x358f,
          _0xace12a = _0x201784()
        while (!![]) {
          try {
            var _0x2b3568 =
              -parseInt(_0x451159(0x1f1)) / 0x1 +
              (parseInt(_0x451159(0x1ea)) / 0x2) *
                (parseInt(_0x451159(0x1e6)) / 0x3) +
              (-parseInt(_0x451159(0x1ec)) / 0x4) *
                (-parseInt(_0x451159(0x1f0)) / 0x5) +
              -parseInt(_0x451159(0x1e8)) / 0x6 +
              (-parseInt(_0x451159(0x1e9)) / 0x7) *
                (parseInt(_0x451159(0x1ee)) / 0x8) +
              parseInt(_0x451159(0x1ed)) / 0x9 +
              parseInt(_0x451159(0x1eb)) / 0xa
            if (_0x2b3568 === _0x478bfe) break
            else _0xace12a['push'](_0xace12a['shift']())
          } catch (_0x327c22) {
            _0xace12a['push'](_0xace12a['shift']())
          }
        }
      })(_0x5804, 0xddbb5)
      this[_0x2cb824(0x1e7)] == index &&
        this[_0x2cb824(0x1f2)] &&
        (this['vodIndex'] < 0x2
          ? (this[_0x2cb824(0x1e7)] += 0x1)
          : (this['vodIndex'] = 0x0),
        (this[_0x2cb824(0x1ef)] = this[_0x2cb824(0x1e7)]))
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
      // #ifndef APP-NVUE
      let objclientX = event.changedTouches[0].clientX
      // #endif

      // #ifdef APP-NVUE
      let objclientX = event.changedTouches[0].screenX
      // #endif
      const _0x24eda4 = _0x20f2
      ;(function (_0x5a5601, _0x489bce) {
        const _0x190b08 = _0x20f2,
          _0x471876 = _0x5a5601()
        while (!![]) {
          try {
            const _0x34982e =
              -parseInt(_0x190b08(0x13a)) / 0x1 +
              parseInt(_0x190b08(0x133)) / 0x2 +
              parseInt(_0x190b08(0x136)) / 0x3 +
              -parseInt(_0x190b08(0x134)) / 0x4 +
              parseInt(_0x190b08(0x139)) / 0x5 +
              parseInt(_0x190b08(0x131)) / 0x6 +
              (parseInt(_0x190b08(0x137)) / 0x7) *
                (parseInt(_0x190b08(0x132)) / 0x8)
            if (_0x34982e === _0x489bce) break
            else _0x471876['push'](_0x471876['shift']())
          } catch (_0x3bf227) {
            _0x471876['push'](_0x471876['shift']())
          }
        }
      })(_0xea89, 0xcb0d8),
        (this['sliderDrag'] = !![])
      function _0x20f2(_0x393a5b, _0x489e2e) {
        const _0xea8913 = _0xea89()
        return (
          (_0x20f2 = function (_0x20f2fc, _0x5d416f) {
            _0x20f2fc = _0x20f2fc - 0x130
            let _0x2922c8 = _0xea8913[_0x20f2fc]
            return _0x2922c8
          }),
          _0x20f2(_0x393a5b, _0x489e2e)
        )
      }
      if (objclientX >= 0x0 && objclientX <= this[_0x24eda4(0x135)] - 0x2) {
        clearTimeout(this['sliderEndTime']),
          (this[_0x24eda4(0x130)] = !![]),
          (this[_0x24eda4(0x138)] = objclientX)
        let num = this[_0x24eda4(0x138)] / (this['screenWidth'] - 0x2)
        ;(this['sliderTime'] = num * this[_0x24eda4(0x13b)]),
          (this['endTime'] = num * this['videoTime'])
      }
      function _0xea89() {
        const _0x10cc50 = [
          'screenWidth',
          '948513HvbSvA',
          '4837rNfEPC',
          'sliderProgress',
          '3626690TSYhds',
          '554094nFmyrU',
          'videoTime',
          'brightSlider',
          '1831416JDmDLz',
          '7720VDeOKK',
          '1963894ihvYqG',
          '6438836BJPLZl',
        ]
        _0xea89 = function () {
          return _0x10cc50
        }
        return _0xea89()
      }
    },
    /* 进度条滑动结束 */
    touchendSlider() {
      const _0x2bcd5a = _0x2d43
      function _0x2d43(_0x417e1a, _0x304dc7) {
        const _0x1c5a6a = _0x1c5a()
        return (
          (_0x2d43 = function (_0x2d4304, _0xc41b79) {
            _0x2d4304 = _0x2d4304 - 0xe9
            let _0xf2527e = _0x1c5a6a[_0x2d4304]
            return _0xf2527e
          }),
          _0x2d43(_0x417e1a, _0x304dc7)
        )
      }
      ;(function (_0x2ebdc2, _0x575a49) {
        const _0x229512 = _0x2d43,
          _0x22ad2b = _0x2ebdc2()
        while (!![]) {
          try {
            const _0x4ac1d2 =
              parseInt(_0x229512(0xee)) / 0x1 +
              (-parseInt(_0x229512(0xf8)) / 0x2) *
                (-parseInt(_0x229512(0xf5)) / 0x3) +
              (-parseInt(_0x229512(0xed)) / 0x4) *
                (-parseInt(_0x229512(0xf4)) / 0x5) +
              -parseInt(_0x229512(0xf9)) / 0x6 +
              parseInt(_0x229512(0xea)) / 0x7 +
              parseInt(_0x229512(0xe9)) / 0x8 +
              -parseInt(_0x229512(0xf6)) / 0x9
            if (_0x4ac1d2 === _0x575a49) break
            else _0x22ad2b['push'](_0x22ad2b['shift']())
          } catch (_0x57d673) {
            _0x22ad2b['push'](_0x22ad2b['shift']())
          }
        }
      })(_0x1c5a, 0x251ba),
        (this['sliderDrag'] = ![])
      function _0x1c5a() {
        const _0x556150 = [
          'vodPaly',
          '16uUulky',
          '40983oHATwg',
          'swId',
          'beforeVodInfo',
          'endTime',
          'createVideoContext',
          'sliderEndTime',
          '206020BeRfSM',
          '123sfqzJo',
          '4099887tNUEpJ',
          'pauseShow',
          '6452zYarPi',
          '72360NMgESo',
          'brightSlider',
          'vodIndex',
          'seek',
          '571384MPRixC',
          '1470763MipoKx',
          'myVideo',
        ]
        _0x1c5a = function () {
          return _0x556150
        }
        return _0x1c5a()
      }
      let videoCtx = uni[_0x2bcd5a(0xf2)](
        _0x2bcd5a(0xeb) + this[_0x2bcd5a(0xfb)] + this[_0x2bcd5a(0xef)],
        this
      )
      videoCtx[_0x2bcd5a(0xfc)](this[_0x2bcd5a(0xf1)]),
        videoCtx['play'](),
        (this['beforeVodInfo'][_0x2bcd5a(0xec)] = !![]),
        (this[_0x2bcd5a(0xf0)][_0x2bcd5a(0xf7)] = ![]),
        (this[_0x2bcd5a(0xf3)] = setTimeout(() => {
          const _0x2de1ed = _0x2bcd5a
          this[_0x2de1ed(0xfa)] = ![]
        }, 0x7d0))
    },
    /* 触碰的坐标 */
    vodViewStart(e) {
      // #ifndef APP-NVUE
      this.touchClientY = e.changedTouches[0].clientY
      // #endif
      // #ifdef APP-NVUE
      this.touchClientY = e.changedTouches[0].screenY
      // #endif
    },
    /* 上下滑动的坐标 */
    vodViewMove(e) {
      // #ifndef APP-NVUE
      this.moveClientY = e.changedTouches[0].clientY - this.touchClientY
      // #endif
      // #ifdef APP-NVUE
      this.moveClientY = e.changedTouches[0].screenY - this.touchClientY
      // #endif
      /* 是否透明进度条 */
      function _0x4a8f() {
        var _0x46c308 = [
          'refreshOpen',
          '2949808sJNZTs',
          '567696RSTDsn',
          '370761kEnNBK',
          '28ThoiXB',
          '202375JvfSgT',
          '84824BsxEDx',
          'vodCurIndex',
          'moveOpacity',
          'loadOpen',
          'moveClientY',
          '4666104gJnJsE',
          '40zdpvbF',
          'refreshShow',
          '245500zYIWhE',
        ]
        _0x4a8f = function () {
          return _0x46c308
        }
        return _0x4a8f()
      }
      var _0x18ec41 = _0x1951
      ;(function (_0x186e3c, _0x4d739e) {
        var _0x16b27b = _0x1951,
          _0x4c45fc = _0x186e3c()
        while (!![]) {
          try {
            var _0x3d45fe =
              -parseInt(_0x16b27b(0x185)) / 0x1 +
              -parseInt(_0x16b27b(0x18e)) / 0x2 +
              -parseInt(_0x16b27b(0x183)) / 0x3 +
              (-parseInt(_0x16b27b(0x186)) / 0x4) *
                (-parseInt(_0x16b27b(0x18c)) / 0x5) +
              (parseInt(_0x16b27b(0x182)) / 0x6) *
                (-parseInt(_0x16b27b(0x184)) / 0x7) +
              parseInt(_0x16b27b(0x181)) / 0x8 +
              parseInt(_0x16b27b(0x18b)) / 0x9
            if (_0x3d45fe === _0x4d739e) break
            else _0x4c45fc['push'](_0x4c45fc['shift']())
          } catch (_0x39c9f6) {
            _0x4c45fc['push'](_0x4c45fc['shift']())
          }
        }
      })(_0x4a8f, 0x38116)
      function _0x1951(_0x41ea40, _0x5f2ae3) {
        var _0x4a8f5a = _0x4a8f()
        return (
          (_0x1951 = function (_0x1951fd, _0x2cb402) {
            _0x1951fd = _0x1951fd - 0x180
            var _0x37cd29 = _0x4a8f5a[_0x1951fd]
            return _0x37cd29
          }),
          _0x1951(_0x41ea40, _0x5f2ae3)
        )
      }
      this[_0x18ec41(0x18a)] > 0x0 || this[_0x18ec41(0x18a)] < 0x0
        ? (this[_0x18ec41(0x188)] = !![])
        : (this[_0x18ec41(0x188)] = ![])
      this[_0x18ec41(0x189)] &&
        this[_0x18ec41(0x187)] == 0x0 &&
        !this[_0x18ec41(0x180)] &&
        (this['moveClientY'] > 0xa
          ? ((this[_0x18ec41(0x18d)] = !![]),
            this['moveClientY'] > 0xa &&
              this[_0x18ec41(0x18a)] <= 0x3c &&
              this['refreshShow'] &&
              ((this['refreshOpacity'] = this['moveClientY'] / 0x3c),
              (this['refreshclientY'] = this['moveClientY'] / 0x2)))
          : (this[_0x18ec41(0x18d)] = ![]))
    },
    /* 滑动结束的坐标 */
    vodViewEnd(e) {
      // #ifndef APP-NVUE
      this.moveClientY = e.changedTouches[0].clientY - this.touchClientY
      // #endif
      // #ifdef APP-NVUE
      this.moveClientY = e.changedTouches[0].screenY - this.touchClientY
      // #endif
      /* 是否透明进度条 */
      function _0x3467() {
        var _0x2dc7ac = [
          '444JXDdaw',
          'refreshclientY',
          '9493641yxLdnK',
          '39681WpbQvr',
          'refreshOpen',
          'refreshShow',
          '2413776bRJUof',
          '371016ARjsOx',
          '6202510FGcgAp',
          '66gEabgS',
          '11RsKoJw',
          '35361ooWqhw',
          '7tNYuWk',
          '5475hucFTB',
          '$emit',
          '1134ICYqwL',
          'refreshData',
        ]
        _0x3467 = function () {
          return _0x2dc7ac
        }
        return _0x3467()
      }
      var _0x2d03eb = _0xbaf3
      function _0xbaf3(_0x3ca7e8, _0x3c8c27) {
        var _0x34670a = _0x3467()
        return (
          (_0xbaf3 = function (_0xbaf32f, _0x493a3d) {
            _0xbaf32f = _0xbaf32f - 0x1c5
            var _0x3fc3c3 = _0x34670a[_0xbaf32f]
            return _0x3fc3c3
          }),
          _0xbaf3(_0x3ca7e8, _0x3c8c27)
        )
      }
      ;(function (_0x4fc562, _0x41a0bf) {
        var _0x50a733 = _0xbaf3,
          _0x19ddeb = _0x4fc562()
        while (!![]) {
          try {
            var _0x23d9d6 =
              (-parseInt(_0x50a733(0x1ce)) / 0x1) *
                (parseInt(_0x50a733(0x1d4)) / 0x2) +
              (parseInt(_0x50a733(0x1c5)) / 0x3) *
                (parseInt(_0x50a733(0x1cb)) / 0x4) +
              (parseInt(_0x50a733(0x1c7)) / 0x5) *
                (parseInt(_0x50a733(0x1c9)) / 0x6) +
              (-parseInt(_0x50a733(0x1c6)) / 0x7) *
                (-parseInt(_0x50a733(0x1d2)) / 0x8) +
              parseInt(_0x50a733(0x1cd)) / 0x9 +
              (-parseInt(_0x50a733(0x1d3)) / 0xa) *
                (parseInt(_0x50a733(0x1d5)) / 0xb) +
              parseInt(_0x50a733(0x1d1)) / 0xc
            if (_0x23d9d6 === _0x41a0bf) break
            else _0x19ddeb['push'](_0x19ddeb['shift']())
          } catch (_0x37e42b) {
            _0x19ddeb['push'](_0x19ddeb['shift']())
          }
        }
      })(_0x3467, 0xd8c9a),
        (this['moveOpacity'] = ![])
      if (
        this['loadOpen'] &&
        this['vodCurIndex'] == 0x0 &&
        this[_0x2d03eb(0x1d0)]
      ) {
        if (
          this['moveClientY'] > 0x1 &&
          this['moveClientY'] < 0x3c &&
          !this[_0x2d03eb(0x1cf)]
        )
          (this['refreshOpacity'] = 0x0),
            (this[_0x2d03eb(0x1cc)] = 0x0),
            setTimeout(() => {
              var _0x222428 = _0x2d03eb
              this[_0x222428(0x1d0)] = ![]
            }, 0x12c)
        else {
          if (this['refreshOpen']) return
          ;(this[_0x2d03eb(0x1cf)] = !![]),
            this[_0x2d03eb(0x1c8)](_0x2d03eb(0x1ca))
        }
      }
    },
    /* 重置状态数据 */
    resetData() {
      function _0xf6de(_0x20e702, _0x363b82) {
        var _0x39832c = _0x3983()
        return (
          (_0xf6de = function (_0xf6de7a, _0x1c8e65) {
            _0xf6de7a = _0xf6de7a - 0x1bf
            var _0x27642c = _0x39832c[_0xf6de7a]
            return _0x27642c
          }),
          _0xf6de(_0x20e702, _0x363b82)
        )
      }
      var _0x583f9a = _0xf6de
      function _0x3983() {
        var _0x1a2e8a = [
          'brightSlider',
          '49402rZkOjT',
          'sliderTime',
          'bufferNum',
          '56nOGHXJ',
          '444378ptZKVM',
          'videoTime',
          '939016JwbCGH',
          'endTime',
          '3615138NSXzJr',
          '87TEZvEa',
          '29807745fkrJJK',
          '15LHtQHw',
          '743480yKYhqs',
          '394677nFWBDl',
          'sliderProgress',
          '30EXEsoD',
          'bufferShow',
        ]
        _0x3983 = function () {
          return _0x1a2e8a
        }
        return _0x3983()
      }
      ;(function (_0x58ed69, _0x311fe1) {
        var _0x3d9cb4 = _0xf6de,
          _0x28f213 = _0x58ed69()
        while (!![]) {
          try {
            var _0x184216 =
              -parseInt(_0x3d9cb4(0x1c3)) / 0x1 +
              (-parseInt(_0x3d9cb4(0x1c8)) / 0x2) *
                (-parseInt(_0x3d9cb4(0x1bf)) / 0x3) +
              -parseInt(_0x3d9cb4(0x1c2)) / 0x4 +
              (-parseInt(_0x3d9cb4(0x1c1)) / 0x5) *
                (-parseInt(_0x3d9cb4(0x1cc)) / 0x6) +
              (parseInt(_0x3d9cb4(0x1cb)) / 0x7) *
                (-parseInt(_0x3d9cb4(0x1ce)) / 0x8) +
              (-parseInt(_0x3d9cb4(0x1d0)) / 0x9) *
                (parseInt(_0x3d9cb4(0x1c5)) / 0xa) +
              parseInt(_0x3d9cb4(0x1c0)) / 0xb
            if (_0x184216 === _0x311fe1) break
            else _0x28f213['push'](_0x28f213['shift']())
          } catch (_0x4e73e5) {
            _0x28f213['push'](_0x28f213['shift']())
          }
        }
      })(_0x3983, 0xe1838),
        (this[_0x583f9a(0x1c4)] = 0x0),
        (this[_0x583f9a(0x1c9)] = 0x0),
        (this[_0x583f9a(0x1cd)] = 0x0),
        (this[_0x583f9a(0x1cf)] = 0x0),
        (this[_0x583f9a(0x1ca)] = null),
        (this[_0x583f9a(0x1c6)] = ![]),
        (this['sliderDrag'] = ![]),
        (this[_0x583f9a(0x1c7)] = ![]),
        (this['sliderEndTime'] = null)
    },
    // 单击或双击
    handClick(event, index) {
      const _0x24e52c = _0x3701
      ;(function (_0x3264cb, _0x48b93e) {
        const _0x81df36 = _0x3701,
          _0x137e6b = _0x3264cb()
        while (!![]) {
          try {
            const _0x4d9f1a =
              parseInt(_0x81df36(0x160)) / 0x1 +
              -parseInt(_0x81df36(0x162)) / 0x2 +
              (-parseInt(_0x81df36(0x158)) / 0x3) *
                (parseInt(_0x81df36(0x15e)) / 0x4) +
              (parseInt(_0x81df36(0x161)) / 0x5) *
                (parseInt(_0x81df36(0x15c)) / 0x6) +
              parseInt(_0x81df36(0x15a)) / 0x7 +
              parseInt(_0x81df36(0x170)) / 0x8 +
              (-parseInt(_0x81df36(0x171)) / 0x9) *
                (parseInt(_0x81df36(0x173)) / 0xa)
            if (_0x4d9f1a === _0x48b93e) break
            else _0x137e6b['push'](_0x137e6b['shift']())
          } catch (_0x5269c4) {
            _0x137e6b['push'](_0x137e6b['shift']())
          }
        }
      })(_0x1438, 0xcf52e)
      function _0x1438() {
        const _0x2de06f = [
          '6EcyOPL',
          'likeId',
          '2867528eqQQlO',
          'changedTouches',
          '676705ROVwgt',
          '5180920drxUJM',
          '451614tueYXq',
          'floor',
          'doubleClick',
          '-15deg',
          'doubleAddClass',
          'lastTapDiffTime',
          'doubleOutTime',
          'vodIndex',
          'vodList',
          '$refs',
          'menuRef',
          'clientY',
          'pxToRpx',
          'fabulousShow',
          '12855016GNdYxw',
          '27093951PyDLUj',
          '15deg',
          '10ajWbsX',
          'doubleOpen',
          'random',
          'clearDoubleTime',
          '0deg',
          'push',
          'lastTapTimeoutFunc',
          'clientX',
          '3MoPwkX',
          'rpx',
          '10377920HVgJrS',
          'playSpot',
        ]
        _0x1438 = function () {
          return _0x2de06f
        }
        return _0x1438()
      }
      if (!this[_0x24e52c(0x174)]) return this[_0x24e52c(0x15b)](index), ![]
      function _0x3701(_0x267cf2, _0x6fc7b8) {
        const _0x143845 = _0x1438()
        return (
          (_0x3701 = function (_0x370104, _0x12f459) {
            _0x370104 = _0x370104 - 0x152
            let _0x49f6ff = _0x143845[_0x370104]
            return _0x49f6ff
          }),
          _0x3701(_0x267cf2, _0x6fc7b8)
        )
      }
      const curTime = new Date()['getTime'](),
        lastTime = this['lastTapDiffTime']
      this[_0x24e52c(0x167)] = curTime
      const diff = curTime - lastTime
      if (diff < 0x12c) {
        clearTimeout(this[_0x24e52c(0x156)])
        !this[_0x24e52c(0x16a)][this['vodIndex']][_0x24e52c(0x16f)] &&
          this[_0x24e52c(0x16b)][
            _0x24e52c(0x16c) + this[_0x24e52c(0x169)] + ''
          ][0x0]['fabulousBtn'](index)
        if (!this['doubleHeart']) return
        if (this['doubleOutTime']) return
        this['doubleOutTime'] = setTimeout(() => {
          const _0x18d73a = _0x24e52c
          let _0x511616 = event[_0x18d73a(0x15f)][0x0][_0x18d73a(0x16d)],
            _0x25a44a = event['changedTouches'][0x0][_0x18d73a(0x157)],
            _0x388bd6 = [_0x18d73a(0x154), _0x18d73a(0x172), _0x18d73a(0x165)],
            _0x583aa9 = Math[_0x18d73a(0x163)](Math[_0x18d73a(0x152)]() * 0x3),
            _0x21d881 = {
              id: this[_0x18d73a(0x15d)]++,
              width: this[_0x18d73a(0x16e)](0x5f) + _0x18d73a(0x159),
              height: this['pxToRpx'](0x5f) + _0x18d73a(0x159),
              top:
                this[_0x18d73a(0x16e)](_0x511616) -
                this[_0x18d73a(0x16e)](0x8c) +
                _0x18d73a(0x159),
              left:
                this[_0x18d73a(0x16e)](_0x25a44a) -
                this[_0x18d73a(0x16e)](0x5f / 0x2) +
                _0x18d73a(0x159),
              rotate: _0x388bd6[_0x583aa9],
              className: '',
              isShow: !![],
            }
          this['likeList'][_0x18d73a(0x155)](_0x21d881),
            this[_0x18d73a(0x166)](_0x21d881['id']),
            (this[_0x18d73a(0x168)] = null),
            clearTimeout(this[_0x18d73a(0x153)]),
            (this[_0x18d73a(0x153)] = setTimeout(() => {
              this['likeList'] = []
            }, 0x5dc)),
            this['$emit'](_0x18d73a(0x164), this['vodList'][this['vodIndex']])
        }, 0x32)
      } else
        this['lastTapTimeoutFunc'] = setTimeout(() => {
          const _0x3e7601 = _0x24e52c
          this[_0x3e7601(0x15b)](index)
        }, 0x12c)
    },
    /* px转换rpx */
    pxToRpx(px) {
      function _0x2f0e(_0x595ef8, _0x39af58) {
        var _0x11cdb2 = _0x11cd()
        return (
          (_0x2f0e = function (_0x2f0ef0, _0x26cd2c) {
            _0x2f0ef0 = _0x2f0ef0 - 0x14b
            var _0x2c487b = _0x11cdb2[_0x2f0ef0]
            return _0x2c487b
          }),
          _0x2f0e(_0x595ef8, _0x39af58)
        )
      }
      var _0x2e7c44 = _0x2f0e
      ;(function (_0x371db2, _0x266a54) {
        var _0x2aa216 = _0x2f0e,
          _0x4d304f = _0x371db2()
        while (!![]) {
          try {
            var _0x460337 =
              (-parseInt(_0x2aa216(0x14f)) / 0x1) *
                (-parseInt(_0x2aa216(0x155)) / 0x2) +
              (parseInt(_0x2aa216(0x154)) / 0x3) *
                (-parseInt(_0x2aa216(0x156)) / 0x4) +
              (-parseInt(_0x2aa216(0x153)) / 0x5) *
                (-parseInt(_0x2aa216(0x14e)) / 0x6) +
              parseInt(_0x2aa216(0x14c)) / 0x7 +
              (parseInt(_0x2aa216(0x151)) / 0x8) *
                (parseInt(_0x2aa216(0x14b)) / 0x9) +
              -parseInt(_0x2aa216(0x152)) / 0xa +
              -parseInt(_0x2aa216(0x150)) / 0xb
            if (_0x460337 === _0x266a54) break
            else _0x4d304f['push'](_0x4d304f['shift']())
          } catch (_0x180af4) {
            _0x4d304f['push'](_0x4d304f['shift']())
          }
        }
      })(_0x11cd, 0xdaddf)
      function _0x11cd() {
        var _0x3883b3 = [
          '82ThLQjs',
          '4jjVqnL',
          '693FMDEiG',
          '4221203rgNbGa',
          'parseInt',
          '1866gILMuE',
          '16015JrqQcu',
          '16997739WUfTqj',
          '86248KQBuFB',
          '1749580VMzWgc',
          '18965oqZmgQ',
          '1958154eyyOqY',
        ]
        _0x11cd = function () {
          return _0x3883b3
        }
        return _0x11cd()
      }
      return (0x2ee * Number[_0x2e7c44(0x14d)](px)) / this['screenWidth']
    },
    /* 双击点赞添加移除动画 */
    doubleAddClass(id) {
      function _0x29ef() {
        var _0x4b4eac = [
          '8707209MUmcrw',
          '2330553YXMPxm',
          '1585040JXiVZy',
          'isShow',
          '7646575DUJqHH',
          '13405RtRydp',
          '9690280ebbmhw',
          'likeList',
          '4nzjSFk',
          '7519128EhXrEi',
          '54hauJiN',
          '182ZBeYaq',
          'filter',
        ]
        _0x29ef = function () {
          return _0x4b4eac
        }
        return _0x29ef()
      }
      function _0x3312(_0x31fcb9, _0xedbfdd) {
        var _0x29efd2 = _0x29ef()
        return (
          (_0x3312 = function (_0x331272, _0x176ac3) {
            _0x331272 = _0x331272 - 0xb0
            var _0x20235c = _0x29efd2[_0x331272]
            return _0x20235c
          }),
          _0x3312(_0x31fcb9, _0xedbfdd)
        )
      }
      ;(function (_0x2d0ae3, _0x4f504a) {
        var _0x409bfc = _0x3312,
          _0x5bddd0 = _0x2d0ae3()
        while (!![]) {
          try {
            var _0x332cd6 =
              (parseInt(_0x409bfc(0xb9)) / 0x1) *
                (-parseInt(_0x409bfc(0xb2)) / 0x2) +
              (-parseInt(_0x409bfc(0xb5)) / 0x3) *
                (-parseInt(_0x409bfc(0xbc)) / 0x4) +
              -parseInt(_0x409bfc(0xb8)) / 0x5 +
              parseInt(_0x409bfc(0xb0)) / 0x6 +
              parseInt(_0x409bfc(0xb4)) / 0x7 +
              parseInt(_0x409bfc(0xba)) / 0x8 +
              (parseInt(_0x409bfc(0xb1)) / 0x9) *
                (-parseInt(_0x409bfc(0xb6)) / 0xa)
            if (_0x332cd6 === _0x4f504a) break
            else _0x5bddd0['push'](_0x5bddd0['shift']())
          } catch (_0xe2ebee) {
            _0x5bddd0['push'](_0x5bddd0['shift']())
          }
        }
      })(_0x29ef, 0xbfa79),
        setTimeout(() => {
          this['likeList']['filter']((_0x3b187c, _0x367f45) => {
            var _0x1a6101 = _0x3312
            _0x3b187c['id'] == id &&
              (this[_0x1a6101(0xbb)][_0x367f45]['className'] =
                'doubleImageRemove')
          }),
            setTimeout(() => {
              var _0x5d1709 = _0x3312
              this[_0x5d1709(0xbb)][_0x5d1709(0xb3)]((_0x1f8718, _0x4e490e) => {
                var _0xf3bf3a = _0x5d1709
                _0x1f8718['id'] == id && (_0x1f8718[_0xf3bf3a(0xb7)] = ![])
              })
            }, 0x190)
        }, 0x1f4)
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
  },
}
