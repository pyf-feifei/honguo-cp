<template>
  <view class="play-container">
    <!-- 视频播放器 -->
    <video
      :src="currentEpisode.videoUrl"
      class="video-player"
      :controls="false"
      :autoplay="true"
      :show-center-play-btn="false"
      :show-play-btn="false"
      @timeupdate="onTimeUpdate"
      @ended="onVideoEnded"
    />
    
    <!-- 右侧操作栏 -->
    <view class="right-actions">
      <!-- 点赞 -->
      <view class="action-item" @tap="toggleLike">
        <image 
          :src="isLiked ? '/static/icons/favorite-active.svg' : '/static/icons/favorite.svg'" 
          class="action-icon"
        />
        <text class="action-text">{{ formatNumber(currentEpisode.likeCount) }}</text>
      </view>
      
      <!-- 收藏 -->
      <view class="action-item" @tap="toggleCollect">
        <image 
          :src="isCollected ? '/static/icons/favorite-active.svg' : '/static/icons/favorite.svg'" 
          class="action-icon"
        />
        <text class="action-text">收藏</text>
      </view>
      
      <!-- 评论 -->
      <view class="action-item" @tap="showComments">
        <image src="/static/icons/comment.svg" class="action-icon" />
        <text class="action-text">{{ formatNumber(currentEpisode.commentCount) }}</text>
      </view>
      
      <!-- 选集 -->
      <view class="action-item" @tap="showEpisodeList">
        <text class="episode-text">选集</text>
      </view>
    </view>
    
    <!-- 底部信息 -->
    <view class="bottom-info">
      <view class="drama-title">{{ drama.title }}</view>
      <view class="episode-title">{{ currentEpisode.title }}</view>
      <view class="episode-progress">第{{ currentEpisode.episodeNumber }}集 全{{ drama.totalEpisodes }}集</view>
    </view>
    
    <!-- 选集弹窗 -->
    <u-popup v-model="showEpisodes" mode="bottom" height="60%">
      <view class="episode-popup">
        <view class="popup-header">
          <view class="drama-info">
            <image :src="drama.cover" class="drama-cover" />
            <view class="drama-details">
              <text class="drama-name">{{ drama.title }}</text>
              <text class="drama-desc">{{ drama.description }}</text>
            </view>
            <button class="follow-btn" @tap="toggleFollow">
              {{ isFollowed ? '已追剧' : '加入追剧' }}
            </button>
          </view>
          
          <view class="tabs">
            <text class="tab active">剧集</text>
            <text class="tab">剧情简介</text>
          </view>
        </view>
        
        <view class="episode-groups">
          <view class="group-tabs">
            <text 
              v-for="group in episodeGroups" 
              :key="group.id"
              :class="['group-tab', { active: selectedGroup === group.id }]"
              @tap="selectGroup(group.id)"
            >
              {{ group.name }}
            </text>
          </view>
          
          <scroll-view class="episode-grid" scroll-y>
            <view 
              v-for="episode in filteredEpisodes" 
              :key="episode.id"
              :class="['episode-item', { 
                active: episode.id === currentEpisode.id,
                playing: episode.id === currentEpisode.id 
              }]"
              @tap="playEpisode(episode)"
            >
              <text class="episode-number">{{ episode.episodeNumber }}</text>
              <view v-if="episode.id === currentEpisode.id" class="playing-indicator">
                <text>...</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { dramaApi } from '../../api'

export default {
  data() {
    return {
      dramaId: '',
      episodeId: '',
      drama: {},
      episodes: [],
      currentEpisode: {},
      currentIndex: 0,
      isLiked: false,
      isCollected: false,
      isFollowed: false,
      showEpisodes: false,
      episodeGroups: [],
      selectedGroup: '',
      startY: 0,
      moveY: 0,
    }
  },
  
  computed: {
    filteredEpisodes() {
      if (!this.selectedGroup) return this.episodes
      const group = this.episodeGroups.find(g => g.id === this.selectedGroup)
      if (!group) return this.episodes
      return this.episodes.filter(ep => 
        ep.episodeNumber >= group.startEpisode && 
        ep.episodeNumber <= group.endEpisode
      )
    }
  },
  
  onLoad(options) {
    this.dramaId = options.dramaId
    this.episodeId = options.episodeId || ''
    this.loadData()
  },
  
  methods: {
    async loadData() {
      try {
        // 加载剧集信息
        this.drama = await dramaApi.getDramaDetail(this.dramaId)
        this.episodes = await dramaApi.getEpisodeList(this.dramaId)
        this.episodeGroups = await dramaApi.getEpisodeGroups(this.dramaId)
        
        // 设置当前播放集数
        if (this.episodeId) {
          this.currentIndex = this.episodes.findIndex(ep => ep.id === this.episodeId)
        }
        this.currentEpisode = this.episodes[this.currentIndex] || this.episodes[0]
        
        // 设置默认分组
        if (this.episodeGroups.length > 0) {
          this.selectedGroup = this.episodeGroups[0].id
        }
        
        // 加载用户状态
        this.loadUserStatus()
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    
    // 上下滑动切换集数
    onTouchStart(e) {
      this.startY = e.touches[0].clientY
    },
    
    onTouchMove(e) {
      this.moveY = e.touches[0].clientY - this.startY
    },
    
    onTouchEnd() {
      if (Math.abs(this.moveY) > 50) {
        if (this.moveY > 0) {
          // 下滑 - 上一集
          this.playPrevious()
        } else {
          // 上滑 - 下一集
          this.playNext()
        }
      }
      this.moveY = 0
    },
    
    playNext() {
      if (this.currentIndex < this.episodes.length - 1) {
        this.currentIndex++
        this.currentEpisode = this.episodes[this.currentIndex]
      }
    },
    
    playPrevious() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.currentEpisode = this.episodes[this.currentIndex]
      }
    },
    
    playEpisode(episode) {
      this.currentIndex = this.episodes.findIndex(ep => ep.id === episode.id)
      this.currentEpisode = episode
      this.showEpisodes = false
    },
    
    toggleLike() {
      this.isLiked = !this.isLiked
      // 调用API更新点赞状态
    },
    
    toggleCollect() {
      this.isCollected = !this.isCollected
      // 调用API更新收藏状态
    },
    
    showEpisodeList() {
      this.showEpisodes = true
    },
    
    selectGroup(groupId) {
      this.selectedGroup = groupId
    },
    
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },
  }
}
</script>

<style lang="scss">
.play-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
}

.right-actions {
  position: absolute;
  right: 20rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .action-item {
    margin-bottom: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .action-icon {
      width: 60rpx;
      height: 60rpx;
      margin-bottom: 10rpx;
    }
    
    .action-text, .episode-text {
      color: #fff;
      font-size: 24rpx;
    }
  }
}

.bottom-info {
  position: absolute;
  left: 20rpx;
  bottom: 100rpx;
  color: #fff;
  
  .drama-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
  }
  
  .episode-title {
    font-size: 28rpx;
    margin-bottom: 10rpx;
  }
  
  .episode-progress {
    font-size: 24rpx;
    color: #ccc;
  }
}

.episode-popup {
  .popup-header {
    padding: 30rpx;
    
    .drama-info {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      
      .drama-cover {
        width: 80rpx;
        height: 80rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }
      
      .drama-details {
        flex: 1;
        
        .drama-name {
          font-size: 32rpx;
          font-weight: bold;
          display: block;
          margin-bottom: 10rpx;
        }
        
        .drama-desc {
          font-size: 24rpx;
          color: #666;
        }
      }
      
      .follow-btn {
        background: #ff4d4f;
        color: #fff;
        border: none;
        border-radius: 30rpx;
        padding: 10rpx 30rpx;
        font-size: 24rpx;
      }
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #eee;
      
      .tab {
        padding: 20rpx 40rpx;
        font-size: 28rpx;
        color: #666;
        
        &.active {
          color: #ff4d4f;
          border-bottom: 2px solid #ff4d4f;
        }
      }
    }
  }
  
  .episode-groups {
    .group-tabs {
      display: flex;
      padding: 20rpx 30rpx;
      border-bottom: 1px solid #eee;
      
      .group-tab {
        padding: 10rpx 20rpx;
        margin-right: 20rpx;
        background: #f5f5f5;
        border-radius: 20rpx;
        font-size: 24rpx;
        color: #666;
        
        &.active {
          background: #ff4d4f;
          color: #fff;
        }
      }
    }
    
    .episode-grid {
      height: 400rpx;
      padding: 20rpx 30rpx;
      display: flex;
      flex-wrap: wrap;
      
      .episode-item {
        width: 80rpx;
        height: 60rpx;
        margin: 10rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        
        &.active {
          background: #ff4d4f;
          color: #fff;
        }
        
        .episode-number {
          font-size: 24rpx;
        }
        
        .playing-indicator {
          position: absolute;
          bottom: 2rpx;
          right: 2rpx;
          color: #fff;
          font-size: 20rpx;
        }
      }
    }
  }
}
</style>