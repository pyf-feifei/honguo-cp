<template>
  <view class="data-source-selector">
    <view class="selector-trigger" @click="showPicker = true">
      <view class="trigger-content">
        <text class="source-name">{{ currentSourceName }}</text>
        <up-icon name="arrow-down" color="#666" size="12"></up-icon>
      </view>
    </view>

    <!-- 数据源选择弹窗 -->
    <up-action-sheet
      :show="showPicker"
      :actions="sourceActions"
      title="选择数据源"
      :closeOnClickAction="true"
      :closeOnClickOverlay="true"
      @close="showPicker = false"
      @select="handleSourceSelect"
      :round="20"
    >
      <template #header>
        <view class="picker-header">
          <text class="picker-title">选择数据源</text>
          <text class="picker-subtitle">不同数据源的内容可能有所不同</text>
        </view>
      </template>
    </up-action-sheet>
  </view>
</template>

<script>
import { dataSourceManager } from '../../api/dataSources.js'

export default {
  name: 'DataSourceSelector',
  props: {
    value: {
      type: String,
      default: 'djzyw',
    },
  },
  data() {
    return {
      showPicker: false,
      currentSource: this.value,
    }
  },
  computed: {
    // 当前数据源名称
    currentSourceName() {
      // @@@修复数据源名称显示 - 使用本地状态而不是全局状态
      const source = dataSourceManager.sources[this.currentSource]
      return source ? source.name : '选择数据源'
    },

    // 数据源选项
    sourceActions() {
      return dataSourceManager.getAvailableSources().map((source) => ({
        name: source.name,
        key: source.key,
        disabled: false,
      }))
    },
  },
  watch: {
    value(newVal) {
      this.currentSource = newVal
      dataSourceManager.switchSource(newVal)
    },
  },
  methods: {
    // 处理数据源选择
    handleSourceSelect(item) {
      if (item.key && item.key !== this.currentSource) {
        this.currentSource = item.key
        dataSourceManager.switchSource(item.key)

        // 通知父组件数据源已切换
        this.$emit('input', item.key)
        this.$emit('change', item.key)

        // 显示切换成功提示
        uni.showToast({
          title: `已切换到${item.name}`,
          icon: 'none',
          duration: 1500,
        })
      }
      this.showPicker = false
    },
  },
  mounted() {
    // 初始化时设置数据源
    dataSourceManager.switchSource(this.currentSource)
  },
}
</script>

<style lang="scss" scoped>
.data-source-selector {
  display: flex;
  align-items: center;
}

.selector-trigger {
  padding: 8rpx 16rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  border: 1rpx solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background: #e8e8e8;
    transform: scale(0.98);
  }
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.source-name {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.picker-header {
  padding: 20rpx 0;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.picker-subtitle {
  display: block;
  font-size: 24rpx;
  color: #666;
}
</style>
