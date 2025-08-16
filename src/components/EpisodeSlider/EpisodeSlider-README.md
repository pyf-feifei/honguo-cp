# EpisodeSlider 剧集滑动组件

一个专为连续剧播放设计的垂直滑动组件，支持上下滑动切换剧集、进度条拖拽、自动播放等功能。

## 🚀 特性

- ✅ **垂直滑动切换** - 上下滑动切换剧集
- ✅ **虚拟列表** - 只渲染3个视频项，性能优异
- ✅ **双层进度条** - 显示播放进度和缓冲进度
- ✅ **进度条拖拽** - 支持拖拽调整播放进度
- ✅ **自动播放** - 剧集结束自动播放下一集
- ✅ **加载状态** - 显示视频加载状态
- ✅ **集数指示器** - 显示当前播放集数
- ✅ **广告过滤** - 智能过滤广告片段
- ✅ **流畅播放** - 优化 HLS 配置，减少卡顿

## 📦 文件结构

```
src/components/
├── EpisodeSlider.nvue           # 核心滑动组件
├── EpisodeSliderExample.nvue    # 使用示例
└── EpisodeSlider-README.md      # 文档说明
```

## 🎯 组件说明

### EpisodeSlider

#### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| videoList | Array | [] | 视频列表数据 |
| initialIndex | Number | 0 | 初始播放的集数索引 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| indexChange | index | 当前播放集数变化时触发 |

#### 视频数据格式

```javascript
const videoList = [
  {
    title: "第01集",
    url: "https://example.com/video1.m3u8"
  },
  {
    title: "第02集", 
    url: "https://example.com/video2.m3u8"
  }
  // ...更多集数
]
```

## 📝 使用示例

### 基础用法

```vue
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
import EpisodeSlider from './EpisodeSlider.nvue'

export default {
  components: {
    EpisodeSlider
  },
  
  data() {
    return {
      videoList: [
        {
          title: "第01集",
          url: "https://svip.ryplay16.com/20250528/65528_1afe2c0e/index.m3u8"
        },
        {
          title: "第02集",
          url: "https://svip.ryplay16.com/20250528/65526_5995675a/index.m3u8"
        }
        // ...更多集数
      ]
    }
  },
  
  methods: {
    onIndexChange(index) {
      console.log('当前播放集数:', index + 1, this.videoList[index].title)
    }
  }
}
</script>

<style>
.container {
  flex: 1;
  background-color: #000000;
}
</style>
```

## 🎮 操作说明

### 滑动操作
- **向上滑动**: 切换到下一集
- **向下滑动**: 切换到上一集
- **点击播放按钮**: 播放/暂停当前视频

### 进度条操作
- **拖拽进度条**: 调整播放进度
- **拖拽时显示时间**: 显示当前时间/总时长

### 自动播放
- 当前集播放结束后，自动播放下一集
- 延迟1秒后自动切换

## 🎨 样式特性

### 视觉效果
- **全屏播放**: 视频占满整个屏幕
- **黑色背景**: 沉浸式观看体验
- **半透明控件**: 不遮挡视频内容
- **流畅动画**: 滑动切换有平滑过渡

### 进度条样式
- **双层设计**: 下层显示缓冲进度(半透明)，上层显示播放进度(白色)
- **默认状态**: 细线条，半透明
- **拖拽状态**: 加粗显示，显示拖拽手柄
- **时间显示**: 拖拽时显示当前时间
- **缓冲指示**: 实时显示视频缓冲状态

### 指示器
- **集数指示器**: 右上角显示当前集数
- **加载指示器**: 视频加载时显示旋转动画

## ⚡ 性能优化

### 虚拟列表
- 只渲染当前集和前后各一集，共3个视频项
- 大幅减少内存占用和渲染开销

### HLS 播放优化
- **缓冲策略**: 优化缓冲长度(30s)，减少内存占用
- **低延迟模式**: 启用低延迟播放，减少卡顿
- **预加载策略**: 使用 metadata 预加载，加快启动速度
- **广告过滤**: 智能过滤广告片段，提升观看体验

### 智能播放控制
- 切换集数时自动暂停其他视频
- 避免多个视频同时播放
- 实时缓冲进度显示

### 事件优化
- 进度条拖拽时暂停视频，避免卡顿
- 拖拽结束后恢复播放
- 缓冲事件监听，实时更新进度

## 🔧 技术实现

### 滑动检测
- 基于 touchstart/touchmove/touchend 事件
- 支持快速滑动和长距离滑动检测
- 限制滑动范围，避免过度滑动

### 虚拟列表管理
- 动态计算可见项范围
- 自动更新视频元素引用
- 智能处理边界情况

### 进度条实现
- 基于触摸事件的自定义进度条
- 双层进度条设计：缓冲进度 + 播放进度
- 实时计算拖拽位置和时间
- 支持精确的时间定位
- 缓冲事件监听和状态更新

### 广告过滤实现
- 基于 HLS 播放列表分析的广告检测
- 多重检测机制：时长分析、URL模式、分布检测
- 纯文本处理，无网络请求开销
- 安全保障机制，防止误删正常内容

## 📱 兼容性

- ✅ App端 (nvue)
- ✅ iOS
- ✅ Android
- ❌ H5 (需要适配)
- ❌ 小程序 (需要适配)

## 🐛 常见问题

### Q: 视频不能播放？
A: 检查视频URL是否正确，确保网络连接正常。

### Q: 视频播放卡顿？
A: ✅ 已优化 HLS 配置，减少缓冲时长和启用低延迟模式。如仍有问题，检查网络状况。

### Q: 看不到缓冲进度？
A: ✅ 已实现双层进度条显示。确保使用最新版本组件。

### Q: 广告过滤器导致视频无法播放完？
A: ✅ 已重写广告检测逻辑。如需禁用广告过滤，调用 `disableAdFilter()` 方法。

### Q: 滑动不够灵敏？
A: 可以调整滑动阈值，修改 `isQuickSwipe` 和 `isLongSwipe` 的判断条件。

### Q: 进度条拖拽不准确？
A: 确保进度条容器的宽度计算正确，检查 `boundingClientRect` 是否获取成功。

### Q: 自动播放下一集不工作？
A: 检查 `onVideoEnded` 事件是否正常触发，确保 `currentIndex` 范围正确。

### Q: 如何控制广告过滤器？
A: 使用 `enableAdFilter()` 启用或 `disableAdFilter()` 禁用广告过滤功能。

## 📄 License

MIT License
