<template>
  <view class="container">
    <!-- 封面图 -->
    <image class="cover" :src="drama.cover" mode="aspectFill" />

    <!-- 基本信息 -->
    <view class="info">
      <view class="title">{{ drama.title }}</view>
      <view class="tags">
        <text v-for="tag in drama.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
      <view class="stats">
        <text class="play-count"
          >{{ formatNumber(drama.playCount) }}次播放</text
        >
        <text class="like-count">{{ formatNumber(drama.likeCount) }}点赞</text>
        <text class="comment-count"
          >{{ formatNumber(drama.commentCount) }}评论</text
        >
      </view>
      <view class="description">{{ drama.description }}</view>
    </view>

    <!-- 剧集列表 -->
    <view class="episode-list">
      <view class="section-title">剧集列表</view>
      <view
        v-for="episode in episodes"
        :key="episode.id"
        class="episode-item"
        @tap="playEpisode(episode)"
      >
        <view class="episode-info">
          <text class="episode-title">{{ episode.title }}</text>
          <text class="episode-duration">{{
            formatDuration(episode.duration)
          }}</text>
        </view>
        <view class="episode-status">
          <text v-if="episode.isVip" class="vip-tag">VIP</text>
          <text v-else-if="episode.price > 0" class="price-tag"
            >{{ episode.price }}金币</text
          >
          <text v-else class="free-tag">免费</text>
        </view>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comment-list">
      <view class="section-title">评论 ({{ drama.commentCount }})</view>
      <view v-for="comment in comments" :key="comment.id" class="comment-item">
        <image class="avatar" :src="comment.user.avatar" mode="aspectFill" />
        <view class="comment-content">
          <view class="comment-header">
            <text class="nickname">{{ comment.user.nickname }}</text>
            <text class="time">{{ formatTime(comment.createTime) }}</text>
          </view>
          <text class="content">{{ comment.content }}</text>
          <view class="comment-footer">
            <text class="like-count">{{ comment.likeCount }}点赞</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="left">
        <view class="action-item" @tap="toggleFavorite">
          <image
            :src="
              isFavorite
                ? '/static/icons/favorite-active.svg'
                : '/static/icons/favorite.svg'
            "
            class="icon"
          />
          <text>{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
        <view class="action-item" @tap="showCommentInput">
          <image src="/static/icons/comment.svg" class="icon" />
          <text>评论</text>
        </view>
      </view>
      <view class="right">
        <button class="play-btn" @tap="playFirstEpisode">立即观看</button>
      </view>
    </view>

    <!-- 评论输入框 -->
    <uni-popup ref="commentPopup" type="bottom">
      <view class="comment-input">
        <input
          type="text"
          v-model="commentContent"
          placeholder="说点什么..."
          @confirm="submitComment"
        />
        <button class="submit-btn" @tap="submitComment">发送</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { dramaApi, episodeApi, favoriteApi, commentApi } from '../../api'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

export default {
  data() {
    return {
      drama: null,
      episodes: [],
      comments: [],
      isFavorite: false,
      commentContent: '',
    }
  },

  setup() {
    const userStore = useUserStore()
    const { userInfo, isLogin } = storeToRefs(userStore)
    return { userInfo, isLogin }
  },

  onLoad(options) {
    const { id } = options
    this.loadDramaDetail(id)
    this.loadEpisodes(id)
    this.loadComments(id)
    if (this.isLogin) {
      this.checkFavorite(id)
    }
  },

  methods: {
    // 加载短剧详情
    async loadDramaDetail(dramaId) {
      try {
        const drama = await dramaApi.getDramaDetail(dramaId)
        if (drama) {
          this.drama = drama
        }
      } catch (error) {
        console.error('加载短剧详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      }
    },

    // 加载剧集列表
    async loadEpisodes(dramaId) {
      try {
        const episodes = await episodeApi.getEpisodeList(dramaId)
        this.episodes = episodes
      } catch (error) {
        console.error('加载剧集列表失败:', error)
      }
    },

    // 加载评论列表
    async loadComments(dramaId) {
      try {
        const comments = await commentApi.getCommentList(dramaId)
        this.comments = comments
      } catch (error) {
        console.error('加载评论列表失败:', error)
      }
    },

    // 检查是否已收藏
    async checkFavorite(dramaId) {
      try {
        const favorites = await favoriteApi.getFavoriteList(this.userInfo.id)
        this.isFavorite = favorites.some((f) => f.dramaId === dramaId)
      } catch (error) {
        console.error('检查收藏状态失败:', error)
      }
    },

    // 切换收藏状态
    async toggleFavorite() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
        })
        return
      }

      try {
        if (this.isFavorite) {
          await favoriteApi.removeFavorite(this.userInfo.id, this.drama.id)
        } else {
          await favoriteApi.addFavorite(this.userInfo.id, this.drama.id)
        }
        this.isFavorite = !this.isFavorite
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none',
        })
      }
    },

    // 播放剧集
    playEpisode(episode) {
      if (episode.isVip && !this.isVip) {
        uni.showToast({
          title: '开通VIP即可观看',
          icon: 'none',
        })
        return
      }

      if (episode.price > 0 && !this.isVip) {
        uni.showModal({
          title: '提示',
          content: `观看需要支付${episode.price}金币，是否继续？`,
          success: (res) => {
            if (res.confirm) {
              this.goToPlayer(episode)
            }
          },
        })
        return
      }

      this.goToPlayer(episode)
    },

    // 播放第一集
    playFirstEpisode() {
      if (this.episodes.length > 0) {
        this.playEpisode(this.episodes[0])
      }
    },

    // 跳转到播放页
    goToPlayer(episode) {
      uni.navigateTo({
        url: `/pages/drama/player?id=${episode.id}`,
      })
    },

    // 显示评论输入框
    showCommentInput() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none',
        })
        return
      }

      this.$refs.commentPopup.open()
    },

    // 提交评论
    async submitComment() {
      if (!this.commentContent.trim()) {
        uni.showToast({
          title: '请输入评论内容',
          icon: 'none',
        })
        return
      }

      try {
        await commentApi.addComment(
          this.userInfo.id,
          this.drama.id,
          this.commentContent
        )
        this.commentContent = ''
        this.$refs.commentPopup.close()
        this.loadComments(this.drama.id)
        uni.showToast({
          title: '评论成功',
          icon: 'success',
        })
      } catch (error) {
        console.error('评论失败:', error)
        uni.showToast({
          title: '评论失败',
          icon: 'none',
        })
      }
    },

    // 格式化数字
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },

    // 格式化时长
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // 格式化时间
    formatTime(date) {
      const now = new Date()
      const diff = now - new Date(date)

      if (diff < 60000) {
        return '刚刚'
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      } else if (diff < 2592000000) {
        return Math.floor(diff / 86400000) + '天前'
      } else {
        return new Date(date).toLocaleDateString()
      }
    },
  },
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.cover {
  width: 100%;
  height: 500rpx;
}

.info {
  padding: 30rpx;
  background-color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .tags {
    margin-bottom: 20rpx;

    .tag {
      display: inline-block;
      padding: 6rpx 20rpx;
      margin-right: 20rpx;
      background-color: #f5f5f5;
      border-radius: 6rpx;
      font-size: 24rpx;
      color: #666;
    }
  }

  .stats {
    margin-bottom: 20rpx;
    font-size: 24rpx;
    color: #999;

    text {
      margin-right: 30rpx;
    }
  }

  .description {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.episode-list {
  margin-top: 20rpx;
  padding: 30rpx;
  background-color: #fff;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .episode-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .episode-info {
      .episode-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
      }

      .episode-duration {
        font-size: 24rpx;
        color: #999;
      }
    }

    .episode-status {
      .vip-tag,
      .price-tag,
      .free-tag {
        padding: 6rpx 20rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
      }

      .vip-tag {
        background-color: #ff4d4f;
        color: #fff;
      }

      .price-tag {
        background-color: #ffd700;
        color: #333;
      }

      .free-tag {
        background-color: #f5f5f5;
        color: #666;
      }
    }
  }
}

.comment-list {
  margin-top: 20rpx;
  padding: 30rpx;
  background-color: #fff;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .comment-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }

    .comment-content {
      flex: 1;

      .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;

        .nickname {
          font-size: 28rpx;
          color: #333;
        }

        .time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 10rpx;
      }

      .comment-footer {
        .like-count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .left {
    display: flex;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 40rpx;

      .icon {
        width: 48rpx;
        height: 48rpx;
        margin-bottom: 6rpx;
      }

      text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .right {
    .play-btn {
      width: 240rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background-color: #ff4d4f;
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
    }
  }
}

.comment-input {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;

  input {
    flex: 1;
    height: 72rpx;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    margin-right: 20rpx;
  }

  .submit-btn {
    width: 120rpx;
    height: 72rpx;
    line-height: 72rpx;
    text-align: center;
    background-color: #ff4d4f;
    color: #fff;
    font-size: 28rpx;
    border-radius: 36rpx;
  }
}
</style>
