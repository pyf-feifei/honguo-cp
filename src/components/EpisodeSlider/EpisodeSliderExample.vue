<template>
  <view class="container">
    <EpisodeSlider
      ref="episodeSlider"
      :videoList="videoList"
      :initialIndex="0"
      @indexChange="onIndexChange"
    />
  </view>
</template>

<script>
import EpisodeSlider from './EpisodeSlider.vue'

export default {
  name: 'EpisodeSliderExample',
  components: {
    EpisodeSlider,
  },

  data() {
    return {
      videoList: [
        {
          title: '第01集',
          url: 'https://svip.ryplay16.com/20250528/65528_1afe2c0e/index.m3u8',
        },
        {
          title: '第02集',
          url: 'https://svip.ryplay16.com/20250528/65526_5995675a/index.m3u8',
        },
        {
          title: '第03集',
          url: 'https://svip.ryplay16.com/20250528/65525_69fda483/index.m3u8',
        },
        {
          title: '第04集',
          url: 'https://svip.ryplay16.com/20250528/65527_43b1119b/index.m3u8',
        },
        {
          title: '第05集',
          url: 'https://svip.ryplay16.com/20250528/65530_2d9bf821/index.m3u8',
        },
        {
          title: '第06集',
          url: 'https://svip.ryplay16.com/20250528/65529_4d337fa1/index.m3u8',
        },
        {
          title: '第07集',
          url: 'https://svip.ryplay16.com/20250528/65536_4dcc319c/index.m3u8',
        },
        {
          title: '第08集',
          url: 'https://svip.ryplay16.com/20250528/65531_c3f2b130/index.m3u8',
        },
        {
          title: '第09集',
          url: 'https://svip.ryplay16.com/20250528/65533_6847a410/index.m3u8',
        },
        {
          title: '第10集',
          url: 'https://svip.ryplay16.com/20250528/65532_dce769ad/index.m3u8',
        },
        {
          title: '第11集',
          url: 'https://svip.ryplay16.com/20250528/65535_6f3b220f/index.m3u8',
        },
        {
          title: '第12集',
          url: 'https://svip.ryplay16.com/20250528/65534_a82edce6/index.m3u8',
        },
        {
          title: '第13集',
          url: 'https://svip.ryplay16.com/20250528/65539_3b32f0de/index.m3u8',
        },
        {
          title: '第14集',
          url: 'https://svip.ryplay16.com/20250528/65542_76abedc6/index.m3u8',
        },
        {
          title: '第15集',
          url: 'https://svip.ryplay16.com/20250528/65538_7e86c783/index.m3u8',
        },
        {
          title: '第16集',
          url: 'https://svip.ryplay16.com/20250528/65541_0fc960a1/index.m3u8',
        },
        {
          title: '第17集',
          url: 'https://svip.ryplay16.com/20250528/65540_965dc85c/index.m3u8',
        },
        {
          title: '第18集',
          url: 'https://svip.ryplay16.com/20250528/65537_fc97aa11/index.m3u8',
        },
        {
          title: '第19集',
          url: 'https://svip.ryplay16.com/20250528/65546_d14381d6/index.m3u8',
        },
        {
          title: '第20集',
          url: 'https://svip.ryplay16.com/20250528/65544_bb1e3354/index.m3u8',
        },
        {
          title: '第21集',
          url: 'https://svip.ryplay16.com/20250528/65545_e259654a/index.m3u8',
        },
        {
          title: '第22集',
          url: 'https://svip.ryplay16.com/20250528/65543_1cf6a0bd/index.m3u8',
        },
        {
          title: '第23集',
          url: 'https://svip.ryplay16.com/20250528/65548_751c58bd/index.m3u8',
        },
        {
          title: '第24集',
          url: 'https://svip.ryplay16.com/20250528/65547_9daa1115/index.m3u8',
        },
        {
          title: '第25集',
          url: 'https://svip.ryplay16.com/20250528/65553_9a3e43e5/index.m3u8',
        },
        {
          title: '第26集',
          url: 'https://svip.ryplay16.com/20250528/65554_2034d581/index.m3u8',
        },
        {
          title: '第27集',
          url: 'https://svip.ryplay16.com/20250528/65551_e30a2fac/index.m3u8',
        },
        {
          title: '第28集',
          url: 'https://svip.ryplay16.com/20250528/65550_ef9fe6be/index.m3u8',
        },
        {
          title: '第29集',
          url: 'https://svip.ryplay16.com/20250528/65549_45c8d77f/index.m3u8',
        },
        {
          title: '第30集',
          url: 'https://svip.ryplay16.com/20250528/65552_15d6a0ed/index.m3u8',
        },
        {
          title: '第31集',
          url: 'https://svip.ryplay16.com/20250528/65555_f2256410/index.m3u8',
        },
        {
          title: '第32集',
          url: 'https://svip.ryplay16.com/20250528/65557_b313d9e5/index.m3u8',
        },
        {
          title: '第33集',
          url: 'https://svip.ryplay16.com/20250528/65560_c6e6b57e/index.m3u8',
        },
        {
          title: '第34集',
          url: 'https://svip.ryplay16.com/20250528/65558_2fd5a23e/index.m3u8',
        },
        {
          title: '第35集',
          url: 'https://svip.ryplay16.com/20250528/65556_6427a88d/index.m3u8',
        },
        {
          title: '第36集',
          url: 'https://svip.ryplay16.com/20250528/65559_4fd31b55/index.m3u8',
        },
        {
          title: '第37集',
          url: 'https://svip.ryplay16.com/20250528/65565_e17a8271/index.m3u8',
        },
        {
          title: '第38集',
          url: 'https://svip.ryplay16.com/20250528/65564_0a867e42/index.m3u8',
        },
        {
          title: '第39集',
          url: 'https://svip.ryplay16.com/20250528/65562_41996b4f/index.m3u8',
        },
        {
          title: '第40集',
          url: 'https://svip.ryplay16.com/20250528/65561_69b93ce5/index.m3u8',
        },
        {
          title: '第41集',
          url: 'https://svip.ryplay16.com/20250528/65566_e4c8a4ba/index.m3u8',
        },
        {
          title: '第42集',
          url: 'https://svip.ryplay16.com/20250528/65563_89a55477/index.m3u8',
        },
        {
          title: '第43集',
          url: 'https://svip.ryplay16.com/20250528/65567_5d0feaa5/index.m3u8',
        },
        {
          title: '第44集',
          url: 'https://svip.ryplay16.com/20250528/65568_2ff4da83/index.m3u8',
        },
        {
          title: '第45集',
          url: 'https://svip.ryplay16.com/20250528/65569_49980b84/index.m3u8',
        },
        {
          title: '第46集',
          url: 'https://svip.ryplay16.com/20250528/65571_1d32bc6b/index.m3u8',
        },
        {
          title: '第47集',
          url: 'https://svip.ryplay16.com/20250528/65570_b5a1a4ad/index.m3u8',
        },
        {
          title: '第48集',
          url: 'https://svip.ryplay16.com/20250528/65572_2bbf5825/index.m3u8',
        },
        {
          title: '第49集',
          url: 'https://svip.ryplay16.com/20250528/65573_2a8aa791/index.m3u8',
        },
        {
          title: '第50集',
          url: 'https://svip.ryplay16.com/20250528/65574_d6a0abf7/index.m3u8',
        },
        {
          title: '第51集',
          url: 'https://svip.ryplay16.com/20250528/65577_0656a94c/index.m3u8',
        },
        {
          title: '第52集',
          url: 'https://svip.ryplay16.com/20250528/65575_3f10e664/index.m3u8',
        },
        {
          title: '第53集',
          url: 'https://svip.ryplay16.com/20250528/65576_0572ab26/index.m3u8',
        },
        {
          title: '第54集',
          url: 'https://svip.ryplay16.com/20250528/65578_69b6a038/index.m3u8',
        },
        {
          title: '第55集',
          url: 'https://svip.ryplay16.com/20250528/65579_18d7f3db/index.m3u8',
        },
        {
          title: '第56集',
          url: 'https://svip.ryplay16.com/20250528/65580_20fbc739/index.m3u8',
        },
        {
          title: '第57集',
          url: 'https://svip.ryplay16.com/20250528/65582_b7447fff/index.m3u8',
        },
        {
          title: '第58集',
          url: 'https://svip.ryplay16.com/20250528/65584_82ae536e/index.m3u8',
        },
        {
          title: '第59集',
          url: 'https://svip.ryplay16.com/20250528/65581_eaa99420/index.m3u8',
        },
        {
          title: '第60集',
          url: 'https://svip.ryplay16.com/20250528/65583_83977832/index.m3u8',
        },
        {
          title: '第61集',
          url: 'https://svip.ryplay16.com/20250528/65585_bfa62347/index.m3u8',
        },
        {
          title: '第62集',
          url: 'https://svip.ryplay16.com/20250528/65586_489b8e64/index.m3u8',
        },
        {
          title: '第63集',
          url: 'https://svip.ryplay16.com/20250528/65587_62991aca/index.m3u8',
        },
        {
          title: '第64集',
          url: 'https://svip.ryplay16.com/20250528/65588_be5882e4/index.m3u8',
        },
        {
          title: '第65集',
          url: 'https://svip.ryplay16.com/20250528/65589_36c251a1/index.m3u8',
        },
        {
          title: '第66集',
          url: 'https://svip.ryplay16.com/20250528/65590_dc4cdf61/index.m3u8',
        },
      ],
    }
  },

  methods: {
    onIndexChange(index) {
      // console.log('当前播放集数:', index + 1, this.videoList[index].title)
    },
  },
}
</script>

<style>
.container {
  flex: 1;
  background-color: #000000;
}
</style>
