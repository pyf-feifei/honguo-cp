<template>
  <view class="side-actions">
    <view class="action-item">
      <view class="action-icon like" @click="handleLike">
        <image
          :src="isLiked ? '/static/theater/loved.png' : '/static/theater/love.png'"
          class="action-image"
          mode="aspectFit"
        />
      </view>
      <view class="action-count">{{ likeCount }}</view>
    </view>
    
    <view class="action-item">
      <view class="action-icon star" @click="handleCollect">
        <image
          :src="isCollected ? '/static/theater/collected.png' : '/static/theater/collect.png'"
          class="action-image"
          mode="aspectFit"
        />
      </view>
      <view class="action-text">{{ isCollected ? '已追' : '追剧' }}</view>
    </view>
    
    <view class="action-item">
      <view class="action-icon comment" @click="handleComment">
        <image
          src="/static/theater/message.png"
          class="action-image"
          mode="aspectFit"
        />
      </view>
      <view class="action-count">{{ commentCount }}</view>
    </view>
    
    <view class="action-item">
      <view class="action-icon share" @click="handleShare">
        <image
          src="/static/theater/share-white-full.png"
          class="action-image"
          mode="aspectFit"
        />
      </view>
      <view class="action-text">分享</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoActions',
  props: {
    // 当前视频数据
    videoItem: {
      type: Object,
      default: () => ({})
    },
    // 当前视频索引
    videoIndex: {
      type: Number,
      default: 0
    },
    // 点赞数
    likeCount: {
      type: [Number, String],
      default: 0
    },
    // 评论数
    commentCount: {
      type: [Number, String],
      default: 0
    },
    // 是否已点赞
    liked: {
      type: Boolean,
      default: false
    },
    // 是否已收藏
    collected: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      isLiked: this.liked,
      isCollected: this.collected
    }
  },
  
  watch: {
    liked(val) {
      this.isLiked = val
    },
    collected(val) {
      this.isCollected = val
    }
  },
  
  methods: {
    handleLike() {
      this.isLiked = !this.isLiked
      this.$emit('like', {
        liked: this.isLiked,
        item: this.videoItem,
        index: this.videoIndex
      })
      
      uni.showToast({
        title: this.isLiked ? '已点赞' : '取消点赞',
        icon: 'none',
        duration: 1000
      })
    },
    
    handleCollect() {
      this.isCollected = !this.isCollected
      this.$emit('collect', {
        collected: this.isCollected,
        item: this.videoItem,
        index: this.videoIndex
      })
      
      uni.showToast({
        title: this.isCollected ? '追剧成功' : '取消追剧',
        icon: 'none',
        duration: 1000
      })
    },
    
    handleComment() {
      this.$emit('comment', {
        item: this.videoItem,
        index: this.videoIndex
      })
    },
    
    handleShare() {
      this.$emit('share', {
        item: this.videoItem,
        index: this.videoIndex
      })
      
      // 可以调用系统分享
      // #ifdef APP-PLUS
      uni.share({
        provider: 'weixin',
        type: 0,
        title: this.videoItem.title || '精彩视频',
        summary: '快来看看这个精彩视频！',
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '分享失败',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifndef APP-PLUS
      uni.showToast({
        title: '分享功能',
        icon: 'none'
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.side-actions {
  position: absolute;
  bottom: 25%;
  right: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    
    .action-icon {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .action-image {
        width: 100%;
        height: 100%;
      }
    }
    
    .action-count,
    .action-text {
      color: #ffffff;
      font-size: 24rpx;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
    
    .action-count {
      font-weight: bold;
    }
  }
}
</style>