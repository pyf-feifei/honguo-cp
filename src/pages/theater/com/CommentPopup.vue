<template>
  <view class="comment-popup-container">
    <up-popup
      :show="show"
      mode="bottom"
      :round="20"
      :closeable="true"
      :closeOnClickOverlay="true"
      @close="handleClose"
      :customStyle="{
        height: '70vh',
        backgroundColor: '#ffffff'
      }"
    >
      <view class="comment-popup">
        <!-- 标题栏 -->
        <view class="popup-header">
          <text class="header-title">评论 ({{ commentList.length }})</text>
          <view class="header-close" @click="handleClose">
            <up-icon name="close" size="20"></up-icon>
          </view>
        </view>
        
        <!-- 评论列表 -->
        <scroll-view 
          class="comment-list" 
          scroll-y
          :show-scrollbar="false"
          @scrolltolower="loadMoreComments"
        >
          <view v-if="commentList.length === 0" class="empty-state">
            <image src="/static/empty-comment.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text">暂无评论，快来抢沙发吧！</text>
          </view>
          
          <view 
            v-for="(comment, index) in commentList" 
            :key="index"
            class="comment-item"
          >
            <view class="comment-header">
              <image :src="comment.avatar" class="user-avatar" mode="aspectFill" />
              <view class="user-info">
                <text class="user-name">{{ comment.username }}</text>
                <text class="comment-time">{{ comment.time }}</text>
              </view>
              <view class="like-btn" @click="likeComment(index)">
                <up-icon 
                  :name="comment.liked ? 'heart-fill' : 'heart'" 
                  :color="comment.liked ? '#ff4757' : '#666'"
                  size="18"
                ></up-icon>
                <text class="like-count">{{ comment.likes }}</text>
              </view>
            </view>
            
            <view class="comment-content">
              <text class="content-text">{{ comment.content }}</text>
            </view>
            
            <!-- 回复 -->
            <view v-if="comment.replies && comment.replies.length > 0" class="replies">
              <view 
                v-for="(reply, rIndex) in comment.replies" 
                :key="rIndex"
                class="reply-item"
              >
                <text class="reply-user">{{ reply.username }}：</text>
                <text class="reply-content">{{ reply.content }}</text>
              </view>
            </view>
          </view>
          
          <!-- 加载更多 -->
          <view v-if="loading" class="loading-more">
            <up-loading-icon mode="circle"></up-loading-icon>
            <text class="loading-text">加载中...</text>
          </view>
        </scroll-view>
        
        <!-- 底部输入框 -->
        <view class="comment-input-wrap">
          <view class="input-container">
            <input 
              v-model="inputContent"
              class="comment-input"
              type="text"
              placeholder="写下你的评论..."
              confirm-type="send"
              @confirm="sendComment"
            />
            <view class="send-btn" @click="sendComment">
              <up-icon name="arrow-upward" color="#fff" size="20"></up-icon>
            </view>
          </view>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script>
export default {
  name: 'CommentPopup',
  props: {
    // 是否显示
    modelValue: {
      type: Boolean,
      default: false
    },
    // 视频数据
    videoData: {
      type: Object,
      default: () => ({})
    },
    // 视频索引
    videoIndex: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      show: this.modelValue,
      commentList: [],
      inputContent: '',
      loading: false,
      page: 1,
      hasMore: true
    }
  },
  
  watch: {
    modelValue(val) {
      this.show = val
      if (val) {
        this.loadComments()
      }
    }
  },
  
  mounted() {
    // 模拟加载评论数据
    this.loadComments()
  },
  
  methods: {
    // 加载评论
    loadComments() {
      // 模拟评论数据
      this.commentList = [
        {
          id: 1,
          username: '用户1',
          avatar: '/static/avatar1.png',
          content: '这个视频真的太精彩了！',
          time: '2小时前',
          likes: 234,
          liked: false,
          replies: [
            {
              username: '回复者1',
              content: '确实很不错'
            }
          ]
        },
        {
          id: 2,
          username: '用户2',
          avatar: '/static/avatar2.png',
          content: '期待下一集',
          time: '5小时前',
          likes: 128,
          liked: true,
          replies: []
        }
      ]
    },
    
    // 加载更多评论
    loadMoreComments() {
      if (!this.hasMore || this.loading) return
      
      this.loading = true
      setTimeout(() => {
        // 模拟加载更多
        this.page++
        if (this.page > 3) {
          this.hasMore = false
        } else {
          // 添加更多评论
          const newComments = [
            {
              id: Date.now(),
              username: `用户${this.commentList.length + 1}`,
              avatar: '/static/avatar3.png',
              content: '新加载的评论内容',
              time: '刚刚',
              likes: 0,
              liked: false,
              replies: []
            }
          ]
          this.commentList.push(...newComments)
        }
        this.loading = false
      }, 1000)
    },
    
    // 点赞评论
    likeComment(index) {
      const comment = this.commentList[index]
      comment.liked = !comment.liked
      comment.likes += comment.liked ? 1 : -1
    },
    
    // 发送评论
    sendComment() {
      if (!this.inputContent.trim()) {
        uni.showToast({
          title: '请输入评论内容',
          icon: 'none'
        })
        return
      }
      
      // 添加新评论到列表顶部
      const newComment = {
        id: Date.now(),
        username: '我',
        avatar: '/static/my-avatar.png',
        content: this.inputContent,
        time: '刚刚',
        likes: 0,
        liked: false,
        replies: []
      }
      
      this.commentList.unshift(newComment)
      this.inputContent = ''
      
      // 发送评论事件
      this.$emit('send', {
        content: newComment.content,
        videoData: this.videoData,
        videoIndex: this.videoIndex
      })
      
      uni.showToast({
        title: '评论成功',
        icon: 'success'
      })
    },
    
    // 关闭弹窗
    handleClose() {
      this.show = false
      this.$emit('update:modelValue', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.comment-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;
    
    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .header-close {
      padding: 10rpx;
    }
  }
  
  .comment-list {
    flex: 1;
    padding: 0 30rpx;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      
      .empty-icon {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 30rpx;
      }
      
      .empty-text {
        color: #999;
        font-size: 28rpx;
      }
    }
    
    .comment-item {
      padding: 30rpx 0;
      border-bottom: 1px solid #f5f5f5;
      
      .comment-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        
        .user-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          margin-right: 20rpx;
          background-color: #f0f0f0;
        }
        
        .user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .user-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .comment-time {
            font-size: 24rpx;
            color: #999;
          }
        }
        
        .like-btn {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .like-count {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
      
      .comment-content {
        margin-left: 80rpx;
        margin-bottom: 20rpx;
        
        .content-text {
          font-size: 28rpx;
          color: #333;
          line-height: 1.6;
        }
      }
      
      .replies {
        margin-left: 80rpx;
        padding: 20rpx;
        background-color: #f8f8f8;
        border-radius: 8rpx;
        
        .reply-item {
          margin-bottom: 10rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .reply-user {
            font-size: 26rpx;
            color: #4a90e2;
            margin-right: 10rpx;
          }
          
          .reply-content {
            font-size: 26rpx;
            color: #666;
          }
        }
      }
    }
    
    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30rpx 0;
      gap: 10rpx;
      
      .loading-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .comment-input-wrap {
    padding: 20rpx 30rpx;
    border-top: 1px solid #f0f0f0;
    background-color: #fff;
    
    .input-container {
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 10rpx 10rpx 10rpx 30rpx;
      
      .comment-input {
        flex: 1;
        height: 60rpx;
        font-size: 28rpx;
        background: transparent;
      }
      
      .send-btn {
        width: 60rpx;
        height: 60rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>