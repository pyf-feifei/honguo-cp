// Mock数据 - 重新设计的数据结构
const users = [
  {
    id: '1',
    nickname: '用户1',
    avatar: 'https://p3.douyinpic.com/aweme/200x200/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    phone: '13800138000',
    vipLevel: 1,
    vipExpireTime: new Date('2024-12-31'),
    coins: 1000,
    createTime: new Date('2024-01-01'),
  },
  {
    id: '2',
    nickname: '用户2',
    avatar: 'https://p3.douyinpic.com/aweme/200x200/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    phone: '13800138001',
    vipLevel: 0,
    vipExpireTime: null,
    coins: 500,
    createTime: new Date('2024-01-02'),
  },
]

// 短剧表 - 扩展字段
const dramas = [
  {
    id: '1',
    title: '终究藏不住',
    cover: 'https://p3.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    description: '甜宠 总裁 现代言情',
    tags: ['甜宠', '总裁', '现代言情'],
    totalEpisodes: 75,
    playCount: 134000, // 13.4万播放
    likeCount: 1000,
    commentCount: 500,
    collectCount: 800, // 收藏数
    isVip: false,
    price: 0,
    status: 'completed', // 完结状态
    updateStatus: '全75集', // 更新状态显示
    hotRank: 1, // 热度排名
    isNew: true, // 是否新剧
    createTime: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: '打工奇遇',
    cover: 'https://p6.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    description: '高手下山 都市 情感',
    tags: ['高手下山', '都市', '情感'],
    totalEpisodes: 60,
    playCount: 89000,
    likeCount: 800,
    commentCount: 400,
    collectCount: 600,
    isVip: true,
    price: 10,
    status: 'updating',
    updateStatus: '更新至45集',
    hotRank: 2,
    isNew: false,
    createTime: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: '判官笔写休夫书',
    cover: 'https://p9.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    description: '朝升榜TOP4',
    tags: ['古装', '权谋', '复仇'],
    totalEpisodes: 80,
    playCount: 235300, // 235.3万播放
    likeCount: 2000,
    commentCount: 1200,
    collectCount: 1500,
    isVip: false,
    price: 0,
    status: 'completed',
    updateStatus: '全80集',
    hotRank: 3,
    isNew: true,
    createTime: new Date('2024-01-03'),
  },
]

// 剧集表 - 扩展字段支持视频播放
const episodes = [
  {
    id: '1',
    dramaId: '1',
    title: '第1集：医疗产业大佬林教授的养女好嫁，是哈佛毕业的神秘天才N博士，她受...展开',
    episodeNumber: 1,
    duration: 300, // 秒
    videoUrl: 'https://v95-bj.douyinvod.com/fe2268ced6661788beecb13da444682b/682f41ae/video/tos/cn/tos-cn-ve-15c001-alinc2/ooe8lnrARACvNpAAoAfDsLXIsgb9gN8AkTBcEb/?a=1128&ch=0&cr=0&dr=0&er=0&cd=0%7C0%7C0%7C0&cv=1&br=2174&bt=2174&cs=0&ds=4&ft=QE6gGbLeffPd52~SI1jNvAq-antLjrK-e2WCRkau~3WeejVhWL6&mime_type=video_mp4&qs=0&rc=ZGU2OTk2NWc1ZDdlZTxpNUBpanQzb2Q6ZnV2bDMzNGkzM0BiMDMuMmI0NjIxNWEzYS41YSM1MmwucjRvX2tgLS1kLS9zcw%3D%3D&btag=c0000e00088000&cquery=100y&dy_q=1747923863&feature_id=f0150a16a324336cda5d6dd0b69ed299&l=20250522222423B5516CE11A985005E857',
    coverImage: 'https://p3.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    likeCount: 76, // 单集点赞数
    commentCount: 12,
    isVip: false,
    price: 0,
    playCount: 5600, // 单集播放数
    createTime: new Date('2024-01-01'),
  },
  {
    id: '2',
    dramaId: '1',
    title: '第2集：心动时刻',
    episodeNumber: 2,
    duration: 280,
    videoUrl: 'https://v95-bj.douyinvod.com/fe2268ced6661788beecb13da444682b/682f41ae/video/tos/cn/tos-cn-ve-15c001-alinc2/ooe8lnrARACvNpAAoAfDsLXIsgb9gN8AkTBcEb/?a=1128&ch=0&cr=0&dr=0&er=0&cd=0%7C0%7C0%7C0&cv=1&br=2174&bt=2174&cs=0&ds=4&ft=QE6gGbLeffPd52~SI1jNvAq-antLjrK-e2WCRkau~3WeejVhWL6&mime_type=video_mp4&qs=0&rc=ZGU2OTk2NWc1ZDdlZTxpNUBpanQzb2Q6ZnV2bDMzNGkzM0BiMDMuMmI0NjIxNWEzYS41YSM1MmwucjRvX2tgLS1kLS9zcw%3D%3D&btag=c0000e00088000&cquery=100y&dy_q=1747923863&feature_id=f0150a16a324336cda5d6dd0b69ed299&l=20250522222423B5516CE11A985005E857',
    coverImage: 'https://p6.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    likeCount: 89,
    commentCount: 15,
    isVip: true,
    price: 5,
    playCount: 4200,
    createTime: new Date('2024-01-01'),
  },
  // 为第一部剧添加更多集数
  ...Array.from({ length: 73 }, (_, index) => ({
    id: `episode_${index + 3}`,
    dramaId: '1',
    title: `第${index + 3}集：剧情发展`,
    episodeNumber: index + 3,
    duration: 300,
    videoUrl: 'https://v95-bj.douyinvod.com/fe2268ced6661788beecb13da444682b/682f41ae/video/tos/cn/tos-cn-ve-15c001-alinc2/ooe8lnrARACvNpAAoAfDsLXIsgb9gN8AkTBcEb/?a=1128&ch=0&cr=0&dr=0&er=0&cd=0%7C0%7C0%7C0&cv=1&br=2174&bt=2174&cs=0&ds=4&ft=QE6gGbLeffPd52~SI1jNvAq-antLjrK-e2WCRkau~3WeejVhWL6&mime_type=video_mp4&qs=0&rc=ZGU2OTk2NWc1ZDdlZTxpNUBpanQzb2Q6ZnV2bDMzNGkzM0BiMDMuMmI0NjIxNWEzYS41YSM1MmwucjRvX2tgLS1kLS9zcw%3D%3D&btag=c0000e00088000&cquery=100y&dy_q=1747923863&feature_id=f0150a16a324336cda5d6dd0b69ed299&l=20250522222423B5516CE11A985005E857',
    coverImage: 'https://p3.douyinpic.com/aweme/100x100/tos-cn-v-2774c002/oECVoEBEz2brHA9swhtYBOAAHfnPAyAWXNBsGo.jpeg',
    likeCount: Math.floor(Math.random() * 100) + 20,
    commentCount: Math.floor(Math.random() * 20) + 5,
    isVip: index > 10, // 前10集免费
    price: index > 10 ? 3 : 0,
    playCount: Math.floor(Math.random() * 3000) + 1000,
    createTime: new Date('2024-01-01'),
  })),
]

// 用户点赞表 - 新增
const userLikes = [
  {
    id: '1',
    userId: '1',
    targetType: 'drama', // drama/episode
    targetId: '1',
    createTime: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '1',
    targetType: 'episode',
    targetId: '1',
    createTime: new Date('2024-01-01'),
  },
]

// 用户收藏表 - 扩展
const favorites = [
  {
    id: '1',
    userId: '1',
    dramaId: '1',
    createTime: new Date('2024-01-01'),
  },
]

// 观看历史表 - 扩展
const watchHistory = [
  {
    id: '1',
    userId: '1',
    dramaId: '1',
    episodeId: '1',
    progress: 150, // 观看进度(秒)
    duration: 300, // 总时长(秒)
    lastWatchTime: new Date('2024-01-01'),
    createTime: new Date('2024-01-01'),
  },
]

// 评论表 - 扩展
const comments = [
  {
    id: '1',
    userId: '1',
    targetType: 'drama', // drama/episode
    targetId: '1',
    content: '这部电视剧真不错！',
    likeCount: 10,
    replyCount: 3,
    createTime: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: '1',
    targetType: 'episode',
    targetId: '1',
    content: '这一集太精彩了！',
    likeCount: 5,
    replyCount: 1,
    createTime: new Date('2024-01-01'),
  },
]

// 分类标签表 - 新增
const categories = [
  { id: '1', name: '推荐', sort: 1, isDefault: true },
  { id: '2', name: '新剧', sort: 2, isDefault: false },
  { id: '3', name: '排行榜', sort: 3, isDefault: false },
  { id: '4', name: '经典好剧', sort: 4, isDefault: false },
  { id: '5', name: '追光计划', sort: 5, isDefault: false },
  { id: '6', name: '精选', sort: 6, isDefault: false },
  { id: '7', name: '古装', sort: 7, isDefault: false },
  { id: '8', name: '重生', sort: 8, isDefault: false },
  { id: '9', name: '家庭', sort: 9, isDefault: false },
  { id: '10', name: '恋爱', sort: 10, isDefault: false },
  { id: '11', name: '穿越', sort: 11, isDefault: false },
]

// 剧集分组表 - 新增(用于选集功能)
const episodeGroups = [
  {
    id: '1',
    dramaId: '1',
    name: '1-30',
    startEpisode: 1,
    endEpisode: 30,
    sort: 1,
  },
  {
    id: '2',
    dramaId: '1',
    name: '31-60',
    startEpisode: 31,
    endEpisode: 60,
    sort: 2,
  },
  {
    id: '3',
    dramaId: '1',
    name: '61-75',
    startEpisode: 61,
    endEpisode: 75,
    sort: 3,
  },
]

export default {
  users,
  dramas,
  episodes,
  userLikes,
  favorites,
  watchHistory,
  comments,
  categories,
  episodeGroups,
}
