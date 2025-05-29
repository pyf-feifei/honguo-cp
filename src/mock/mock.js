export const bookType = [
  { id: 464, name: '逆袭' },
  { id: 1152, name: '虐渣' },
  { id: 465, name: '重生' },
  { id: 585, name: '豪门恩怨' },
  { id: 1145, name: '现代言情' },
  { id: 1294, name: '情感流' },
  { id: 463, name: '女性成长' },
  { id: 469, name: '现实' },
  { id: 714, name: '家庭' },
  { id: 1292, name: '世情' },
  { id: 417, name: '逆袭' },
  { id: 721, name: '奇幻脑洞' },
  { id: 916, name: '穿越' },
  { id: 917, name: '喜剧' },
  { id: 1129, name: '都市' },
  { id: 416, name: '复仇' },
  { id: 837, name: '亲情' },
  { id: 1173, name: '战神' },
  { id: 476, name: '强者回归' },
  { id: 838, name: '情感' },
  { id: 840, name: '权谋' },
  { id: 444, name: '古装' },
  { id: 466, name: '虐恋' },
  { id: 1147, name: '总裁' },
  { id: 589, name: '萌宝' },
  { id: 470, name: '悬疑' },
  { id: 468, name: '古代言情' },
  { id: 717, name: '欢喜冤家' },
  { id: 1101, name: '权谋' },
  { id: 462, name: '甜宠' },
]

export const books = [
  {
    bookId: '41000116278',
    bookName: '我爱的人，伤我最深',
    coverWap:
      'https://seoali.zqkanshu.com/cppartner/4x1/41x0/410x0/41000116278/41000116278.jpg?t=202101010000&imageView2/0/w/200/h/267',
    introduction:
      "林悦，原本拥有一个精彩的人生，研发出了跨时代的科技量子AI，一个真正的人工智能生命，本来迎接林悦的是无尽的荣耀，但是，意外发生了。在AI发布会的那天，原本属于林悦的荣耀却被量子公司研发部的总经理方书瑶给掠夺，当量子公司董事长江启铭喊出'方书瑶'三个字时，林悦的世界崩塌了，自己辛辛苦苦十余年，倾尽了所有的心血，到头了却被一个外人给抢了去，林悦起身在发布会上辩解，然而，没有人相信林悦的话。",
    bookTypeThree: [464, 1152, 465, 585, 1145, 1294, 463],
    totalChapterNum: '66',
    followCount: '6.33万',
    actor: '晓杨',
    actress: '高明君',
    status: 1,
    statusDesc: '完本',
  },
  {
    bookId: '41000116275',
    bookName: '难填欲壑',
    coverWap:
      'https://seoali.zqkanshu.com/cppartner/4x1/41x0/410x0/41000116275/41000116275.jpg?t=1747982952719&imageView2/0/w/200/h/267',
    introduction:
      '温氏集团总裁的豪宅地下室住着一家楚姓人，温临予不在家时，楚家人就出来挥霍温家财物，像贪婪阴暗的老鼠。身为护工身份的楚宁从小家境贫寒，踏入温家后，被财富迷了心智，几年后楚宁不再满足于做一名保姆，她越来越嫉妒温临予对植物人阮知微的深情专一，她想要取代阮知微成为新的温夫人。温临予的妻子阮知微虽在一场车祸事故中成为了植物人，但意识清醒，她每天都在楚家人的折磨下活着，期盼自己快点醒来，想把这一切告诉自己的老公温临予。于是楚家人的一场地下室的罪恶图谋开始了。',
    bookTypeThree: [1152, 469, 585, 714, 1292, 1294],
    totalChapterNum: '50',
    followCount: '6.33万',
    actor: '郑天阳',
    actress: '徐心语',
    status: 1,
    statusDesc: '完本',
  },
  {
    bookId: '41000116268',
    bookName: '负可敌国',
    coverWap:
      'https://seoali.zqkanshu.com/cppartner/4x1/41x0/410x0/41000116268/41000116268.jpg?t=1747968396775&imageView2/0/w/200/h/267',
    introduction:
      '负债三万的秦远被债主打的昏迷过去，竟直接穿到了负债三万亿的秦远身上！欠债三万的时候他是孙子，求着债主宽限些时日，可当他负债三万亿的时候，一切都变了，债主们和蔼可亲，哪怕他只是得了个小小的感冒都能吸引无数名医！别人靠着努力赚钱过上了皇帝般的生活，而秦远，只能靠着欠钱过着太上皇一样的悠哉日子。',
    bookTypeThree: [417, 721, 916, 917, 1129],
    totalChapterNum: '55',
    followCount: '6.32万',
    actor: '王昭',
    actress: '劳佳琦',
    status: 1,
    statusDesc: '完本',
  },
]

export function fetchBooks() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(books), 500)
  })
}
export function fetchBookType() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(bookType), 200)
  })
}
