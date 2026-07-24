import type { AppSettings, PersistShape } from './types';

const KEY = 'yangyangji:v1';

export const defaultSettings = (): AppSettings => ({
  themeId: 'midnight',
  api: {
    chat: { baseUrl: '', apiKey: '', model: '' },
    voice: { provider: 'minimax', baseUrl: '', apiKey: '', model: '' },
    image: { baseUrl: '', apiKey: '', model: '', stylePrompt: '' },
  },
  users: [],
  activeUserId: null,
  presets: [],
  activePresetId: null,
  partitions: [],
  desktop: {
    pages: [
      // 第1页 - 11个图标
      ['moments', 'contacts', 'sms', 'mail', 'waimai', 'xiaohongshu', 'novel', 'shop', 'forum', 'calendar', 'worldbook'],
      // 第2页 - 12个图标（account_manager在最后）
      ['generator', 'social', 'truth_or_dare', 'period', 'notes_app', 'weather', 'calculator', 'browser', 'diary', 'wallet', 'memory', 'account_manager'],
      // 第3页 - 14个图标
      ['me', 'anniversary', 'group_chat', 'phone_check', 'couple_space', 'home_system', 'kitchen', 'turtle_soup', 'games', 'weibo', 'twitter', 'weight', 'discover', 'closet', 'time_perception']
    ],
    widgets: [
      // 第1页小部件
      { id: 'weather-widget', type: 'weather', page: 0, position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'calendar-widget', type: 'calendar', page: 0, position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },

      // 第2页小部件
      { id: 'memo-widget', type: 'memo', page: 1, position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'todo-widget', type: 'todo', page: 1, position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },

      // 第3页小部件
      { id: 'clock-widget', type: 'clock', page: 2, position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'battery-widget', type: 'battery', page: 2, position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },

      // 第4页小部件（v3.0新功能）
      { id: 'music-widget', type: 'music', page: 3, position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'shortcuts-widget', type: 'shortcuts', page: 3, position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },

      // 第5页小部件（统计和快捷）
      { id: 'stats-widget', type: 'stats', page: 4, position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'recent-widget', type: 'recent', page: 4, position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
    ],
  },
  music: [],
  albumImages: [],
  calendarEvents: [],
  characters: [],
  autoNpc: true,
  activeInteractMode: 'manual',
  activeInteractEnabled: true,
  storyEvents: [],
  chatThreads: [],
  contacts: [],
  smsThreads: [],
  mails: [],
  moments: [],
  notes: [],
  memos: [],
  diaries: [],
  novels: [],
  products: [],
  cart: [],
  orders: [],
  forumPosts: [],
  worldEntries: [],
  squarePosts: [
    {
      id: 'square-init-1',
      authorName: '路过的云',
      authorAvatar: '☁️',
      text: '今天天气真好！阳光明媚，心情也跟着好起来了 ☀️',
      likes: 12,
      comments: [
        { id: 'sq-c1', authorName: '微风', text: '确实！出去走走吧', ts: Date.now() - 2 * 3600 * 1000 }
      ],
      ts: Date.now() - 5 * 3600 * 1000,
      aiGenerated: false
    },
    {
      id: 'square-init-2',
      authorName: '夜猫子',
      authorAvatar: '🦉',
      text: '深夜食堂营业中...有人一起吃夜宵吗 🍜',
      imageDescriptions: ['温馨的深夜拉面店，暖黄色灯光'],
      likes: 23,
      comments: [],
      ts: Date.now() - 8 * 3600 * 1000,
      aiGenerated: false
    },
    {
      id: 'square-init-3',
      authorName: '书虫',
      authorAvatar: '📚',
      text: '刚读完一本好书，推荐给大家！#读书分享',
      likes: 8,
      comments: [
        { id: 'sq-c2', authorName: '爱书人', text: '什么书？求书名！', ts: Date.now() - 6 * 3600 * 1000 }
      ],
      ts: Date.now() - 12 * 3600 * 1000,
      aiGenerated: false
    }
  ],
  socialPosts: [
    // 微博预置帖子 - 真实的长文风格
    {
      id: 'weibo-init-1',
      platform: 'weibo',
      authorId: 'weibo-user-1',
      authorName: '深夜食堂老板娘',
      authorAvatar: '🍜',
      content: `今天店里来了一位特别的客人，一个人坐在角落里静静地吃着拉面。看她的样子应该是加班到很晚，眼睛里都是疲惫。我给她加了个温泉蛋，她抬起头对我笑了笑，说"谢谢老板娘，这是今天最温暖的时刻"。

其实开这家小店这么多年，见过太多这样的都市人。白天西装革履在写字楼里奔波，深夜一个人来到小店，卸下伪装，享受一碗热腾腾的面。有时候我觉得，我这碗面治愈的不只是肚子，更是那些疲惫的心灵。

生活不易，但总有温暖的瞬间。希望每个深夜回家的你，都能找到属于自己的那碗面🍜❤️

#深夜食堂 #城市温度 #一碗面的故事`,
      imageDescriptions: ['昏黄灯光下的拉面特写，冒着热气的汤面'],
      likes: 8234,
      reposts: 1256,
      comments: [
        { id: 'wb-c1', authorName: '加班狗小王', content: '看哭了...昨晚加班到12点，也是一个人吃的面😭', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'wb-c2', authorName: '夜猫子', content: '老板娘这碗面我也想吃！地址在哪？', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'wb-c3', authorName: '治愈系博主', content: '这就是人间烟火气啊，有温度的小店才是城市的灵魂', ts: Date.now() - 4 * 3600 * 1000 },
        { id: 'wb-c4', authorName: '美食探店', content: '转发了！这种有故事的店必须支持', ts: Date.now() - 5 * 3600 * 1000 },
        { id: 'wb-c5', authorName: '路过的云', content: '深夜的食物总是格外治愈❤️', ts: Date.now() - 6 * 3600 * 1000 }
      ],
      isHot: true,
      topic: '深夜食堂',
      ts: Date.now() - 4 * 3600 * 1000
    },
    {
      id: 'weibo-init-2',
      platform: 'weibo',
      authorId: 'weibo-user-2',
      authorName: '旅行摄影师Leo',
      authorAvatar: '📷',
      content: `今天在西藏拍到了此生最震撼的日出！

凌晨4点就起床，顶着零下的温度爬到山顶。等待的过程中冷得发抖，相机都快冻僵了。但当第一缕阳光穿过云层，照亮雪山的那一刻，所有的辛苦都值了。

这趟西藏之行已经是第15天了，从拉萨到纳木错，从羊卓雍措到珠峰大本营，每一个地方都让我震撼。高反、缺氧、路况艰险...这些都不算什么，因为眼前的美景让一切都变得渺小。

有人问我，为什么要这么辛苦地去旅行？我想说，当你站在世界屋脊，看着太阳从雪山升起，你会明白什么叫做"人生值得"。那种感动，那种震撼，是任何语言都无法形容的。

明天继续前行，下一站：冈仁波齐。期待更多的奇迹🏔️✨

#西藏旅行 #日出 #人生必去的50个地方`,
      imageDescriptions: ['壮丽的雪山日出，金色阳光洒在雪峰上'],
      likes: 15782,
      reposts: 3421,
      comments: [
        { id: 'wb-c6', authorName: '向往自由', content: '太美了！！！明年一定要去一次西藏', ts: Date.now() - 1 * 3600 * 1000 },
        { id: 'wb-c7', authorName: '摄影爱好者', content: '请问用的什么相机和镜头？这光影太绝了', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'wb-c8', authorName: '高反患者', content: '想去但是怕高反...博主有什么建议吗？', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'wb-c9', authorName: '西藏导游小扎西', content: '欢迎来到我的家乡！看到这么多人喜欢西藏真开心', ts: Date.now() - 4 * 3600 * 1000 },
        { id: 'wb-c10', authorName: '文艺青年', content: '看完立刻想辞职去旅行...但是账户余额劝我冷静', ts: Date.now() - 5 * 3600 * 1000 },
        { id: 'wb-c11', authorName: '旅行达人', content: '收藏了！准备做攻略', ts: Date.now() - 6 * 3600 * 1000 }
      ],
      isHot: true,
      topic: '西藏旅行',
      ts: Date.now() - 10 * 3600 * 1000
    },
    {
      id: 'weibo-init-3',
      platform: 'weibo',
      authorId: 'weibo-user-3',
      authorName: '互联网打工人阿强',
      authorAvatar: '💻',
      content: `刚刚被老板叫去谈话，说我这个月KPI没达标...

坐在工位上愣了好久。这个月我加班到深夜无数次，周末也在改bug，项目上线的时候连着72小时没睡。我以为我已经很努力了，但原来在老板眼里，这些都不算什么，只看那个冷冰冰的数字。

想起三年前刚入职的时候，满腔热血，觉得自己一定能在互联网行业闯出一片天。现在呢？头发越来越少，眼袋越来越重，银行卡里的数字增长远远跟不上房租的速度。

有时候真的很想辞职，去做自己喜欢的事情。但是房贷、父母的期待、生活的压力...这些现实把我死死地钉在工位上。

今晚又要加班了。给自己点个外卖吧，奶茶加珍珠，至少给自己一点甜。

致所有还在坚持的打工人：加油，我们都会好起来的💪

#打工人的日常 #互联网加班 #生活不易`,
      likes: 21453,
      reposts: 5678,
      comments: [
        { id: 'wb-c12', authorName: '同样的打工人', content: '兄弟抱抱...我也是，昨天刚被老板骂了一顿😭', ts: Date.now() - 1 * 3600 * 1000 },
        { id: 'wb-c13', authorName: '职场HR', content: '其实很多时候不是你不够努力，而是公司的考核机制有问题', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'wb-c14', authorName: '前互联网人', content: '我已经辞职了，现在在老家开了个小店，虽然赚得少但是心情好多了', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'wb-c15', authorName: '励志博主', content: '坚持住！每个人都有低谷期，熬过去就是晴天', ts: Date.now() - 4 * 3600 * 1000 },
        { id: 'wb-c16', authorName: '资深程序员', content: '做了10年程序员的我想说：身体最重要，别为了工作毁了健康', ts: Date.now() - 5 * 3600 * 1000 },
        { id: 'wb-c17', authorName: '奶茶爱好者', content: '奶茶加珍珠！这就是打工人的倔强', ts: Date.now() - 6 * 3600 * 1000 },
        { id: 'wb-c18', authorName: '跳槽达人', content: '建议考虑换个公司，有些公司文化确实有毒', ts: Date.now() - 7 * 3600 * 1000 }
      ],
      isHot: true,
      topic: '打工人的日常',
      ts: Date.now() - 15 * 3600 * 1000
    },
    // 推特预置帖子 - 英文，需要翻译
    {
      id: 'twitter-init-1',
      platform: 'twitter',
      authorId: 'twitter-user-1',
      authorName: 'Sarah Chen',
      authorAvatar: '👩‍💻',
      content: `Just finished a 12-hour coding marathon and finally fixed that bug that's been haunting me for 3 days!

The feeling when your code finally works is indescribable. It's like solving a puzzle that's been taunting you, and suddenly everything clicks into place.

To all the developers out there struggling with a tough problem: don't give up! Take a break, clear your mind, and come back with fresh eyes. Sometimes the solution is simpler than you think.

#coding #developer #nevergiveup`,
      likes: 3421,
      reposts: 892,
      comments: [
        { id: 'tw-c1', authorName: 'DevMaster', content: 'Been there! That feeling is the best part of coding 🚀', ts: Date.now() - 1 * 3600 * 1000 },
        { id: 'tw-c2', authorName: 'CodeNewbie', content: 'I needed to hear this today. Currently stuck on a React problem', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'tw-c3', authorName: 'TechLead', content: 'Great advice! Taking breaks is underrated in our industry', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'tw-c4', authorName: 'PythonDev', content: 'Congrats! What was the bug about?', ts: Date.now() - 4 * 3600 * 1000 }
      ],
      ts: Date.now() - 3 * 3600 * 1000
    },
    {
      id: 'twitter-init-2',
      platform: 'twitter',
      authorId: 'twitter-user-2',
      authorName: 'Coffee Chronicles',
      authorAvatar: '☕',
      content: `There's something magical about that first sip of morning coffee ☕✨

The aroma fills the room, the warmth spreads through your hands, and suddenly the world doesn't seem so overwhelming anymore. It's not just a drink - it's a ritual, a moment of peace before the chaos begins.

What's your coffee order? Mine: oat milk latte with an extra shot 💫

#coffee #morningritual #coffeelover`,
      imageDescriptions: ['精致的咖啡拉花艺术，心形图案'],
      likes: 5632,
      reposts: 1203,
      comments: [
        { id: 'tw-c5', authorName: 'BaristaLife', content: 'As a barista, this warms my heart! ❤️☕', ts: Date.now() - 1 * 3600 * 1000 },
        { id: 'tw-c6', authorName: 'TeaLover', content: 'I\'m more of a tea person but I respect the coffee culture!', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'tw-c7', authorName: 'CoffeAddict', content: 'Iced americano, no matter the weather 😎', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'tw-c8', authorName: 'MorningPerson', content: 'Coffee is the reason I wake up every day!', ts: Date.now() - 4 * 3600 * 1000 }
      ],
      ts: Date.now() - 6 * 3600 * 1000
    },
    {
      id: 'twitter-init-3',
      platform: 'twitter',
      authorId: 'twitter-user-3',
      authorName: 'Travel Diaries',
      authorAvatar: '✈️',
      content: `Just landed in Tokyo! 🇯🇵

This is my 5th time visiting Japan and it never gets old. The perfect blend of ancient tradition and modern innovation, the incredible food scene, the politeness of people - everything about this country amazes me.

Planning to visit: Senso-ji Temple, TeamLab Borderless, and of course, lots of ramen spots 🍜

Any Tokyo recommendations from locals? Drop them below! 👇

#Tokyo #Japan #TravelDiaries`,
      imageDescriptions: ['东京塔夜景，霓虹灯闪烁的城市'],
      likes: 8934,
      reposts: 2156,
      comments: [
        { id: 'tw-c9', authorName: 'TokyoLocal', content: 'Try the ramen shop in Shibuya - Ichiran! Best in the city', ts: Date.now() - 1 * 3600 * 1000 },
        { id: 'tw-c10', authorName: 'FoodieJapan', content: 'Don\'t miss the fish market breakfast at Tsukiji!', ts: Date.now() - 2 * 3600 * 1000 },
        { id: 'tw-c11', authorName: 'JapanGuide', content: 'TeamLab is incredible! Book tickets in advance', ts: Date.now() - 3 * 3600 * 1000 },
        { id: 'tw-c12', authorName: 'TravelBlogger', content: 'So jealous! Japan is on my bucket list', ts: Date.now() - 4 * 3600 * 1000 },
        { id: 'tw-c13', authorName: 'SushiLover', content: 'You have to try the sushi at Sukiyabashi Jiro!', ts: Date.now() - 5 * 3600 * 1000 }
      ],
      ts: Date.now() - 9 * 3600 * 1000
    }
  ],
  restaurants: [],
  friendRequests: [],
  periodRecords: [],
  periodCycleDays: 28,
  periodDurationDays: 5,
  userBalance: 5240,
  walletFlows: [
    {
      id: 'flow-init-1',
      type: 'income',
      amount: 5000,
      fromName: '系统银行',
      toName: '我的钱包',
      category: '系统发放',
      description: '羊羊机账户初始化赠送基础资金',
      ts: Date.now() - 4 * 24 * 3600 * 1000
    },
    {
      id: 'flow-init-2',
      type: 'income',
      amount: 300,
      fromName: '主线任务',
      toName: '我的钱包',
      category: '每日签到',
      description: '连续登录羊羊机4天福利礼包',
      ts: Date.now() - 2 * 24 * 3600 * 1000
    },
    {
      id: 'flow-init-3',
      type: 'expense',
      amount: 60,
      fromName: '我的钱包',
      toName: '外卖商家',
      category: '购买外卖',
      description: '点了份香辣烤鱼外卖单人套餐',
      ts: Date.now() - 1 * 24 * 3600 * 1000
    }
  ]
});

export function loadState(): PersistShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      console.log('📂 首次加载，使用默认设置');
      return { version: 1, settings: defaultSettings() };
    }
    const parsed = JSON.parse(raw) as PersistShape;
    const defs = defaultSettings();
    if (!parsed.settings) parsed.settings = defs;

    // 深度合并，确保所有字段都存在
    parsed.settings = { ...defs, ...parsed.settings };
    parsed.settings.api = { ...defs.api, ...parsed.settings.api };

    // 确保关键数组字段存在且是数组
    if (!Array.isArray(parsed.settings.characters)) parsed.settings.characters = [];
    if (!Array.isArray(parsed.settings.worldEntries)) parsed.settings.worldEntries = [];
    if (!Array.isArray(parsed.settings.forumPosts)) parsed.settings.forumPosts = [];

    console.log(`📂 加载数据: 角色 ${parsed.settings.characters.length} 个, 世界书 ${parsed.settings.worldEntries.length} 条, 论坛帖子 ${parsed.settings.forumPosts.length} 个`);

    // ensure presets/activePresetId exist (added in redesign)
    if (!parsed.settings.presets) parsed.settings.presets = [];
    if (!parsed.settings.activePresetId) parsed.settings.activePresetId = null;
    if (!parsed.settings.friendRequests) parsed.settings.friendRequests = [];
    if (!parsed.settings.memos) parsed.settings.memos = [];
    if (!parsed.settings.diaries) parsed.settings.diaries = [];
    if (!parsed.settings.installedWebApps) parsed.settings.installedWebApps = [];

    // 确保社交媒体帖子存在
    if (!parsed.settings.squarePosts || parsed.settings.squarePosts.length === 0) {
      parsed.settings.squarePosts = defs.squarePosts;
    }
    if (!parsed.settings.socialPosts || parsed.settings.socialPosts.length === 0) {
      parsed.settings.socialPosts = defs.socialPosts;
    }

    if (!parsed.settings.users || parsed.settings.users.length === 0) {
      const defaultUser = {
        id: 'default-owner',
        nickname: '主人',
        signature: '好好生活，慢慢相遇',
        imagePromptTemplate: '一个温和的年轻读者',
        isAlt: false,
        createdAt: Date.now(),
      };
      parsed.settings.users = [defaultUser];
      parsed.settings.activeUserId = defaultUser.id;
    }
    // ensure desktop has valid pages with known app ids; refresh if stale
    const known = new Set([...defs.desktop.pages.flat(), 'sheep', 'generator', 'period', 'notes_app', 'weather', 'calculator', 'browser', 'diary', 'wallet']);
    const pages = parsed.settings.desktop?.pages ?? [];
    const allValid = pages.length === 3 && pages.every((p) => p.every((id) => known.has(id) || id.startsWith('web-')));
    if (!allValid) {
      parsed.settings.desktop = defs.desktop;
    }
    // ensure shortcut ball is present on page 1 (first page)
    if (!parsed.settings.desktop.pages[0]?.includes('sheep')) {
      const p0 = [...(parsed.settings.desktop.pages[0] ?? [])];
      p0.unshift('sheep');
      parsed.settings.desktop.pages[0] = p0;
    }
    // migrate: add generator app to desktop if missing
    const allIds = parsed.settings.desktop.pages.flat();
    if (!allIds.includes('generator')) {
      const last = parsed.settings.desktop.pages.length - 1;
      parsed.settings.desktop.pages[last] = [...(parsed.settings.desktop.pages[last] ?? []), 'generator'];
    }
    // migrate: add diary app to desktop if missing
    if (!allIds.includes('diary')) {
      const last = parsed.settings.desktop.pages.length - 1;
      parsed.settings.desktop.pages[last] = [...(parsed.settings.desktop.pages[last] ?? []), 'diary'];
    }
    // migrate: add wallet app to desktop if missing
    if (!allIds.includes('wallet')) {
      const last = parsed.settings.desktop.pages.length - 1;
      parsed.settings.desktop.pages[last] = [...(parsed.settings.desktop.pages[last] ?? []), 'wallet'];
    }
    // migrate: add kitchen app to desktop if missing
    if (!allIds.includes('kitchen')) {
      // 添加到第4页（索引3）
      const targetPage = 3;
      if (parsed.settings.desktop.pages[targetPage]) {
        parsed.settings.desktop.pages[targetPage] = [...parsed.settings.desktop.pages[targetPage], 'kitchen'];
      } else {
        const last = parsed.settings.desktop.pages.length - 1;
        parsed.settings.desktop.pages[last] = [...(parsed.settings.desktop.pages[last] ?? []), 'kitchen'];
      }
    }
    // migrate: wallet settings
    if (parsed.settings.userBalance === undefined) parsed.settings.userBalance = defs.userBalance;
    if (parsed.settings.walletFlows === undefined) parsed.settings.walletFlows = defs.walletFlows;

    // migrate: image config stylePrompt field
    parsed.settings.api.image = { ...defs.api.image, ...parsed.settings.api.image };
    if (typeof parsed.settings.api.image.stylePrompt !== 'string') parsed.settings.api.image.stylePrompt = '';
    // migrate: character imagePromptTemplate / faceRef fields
    parsed.settings.characters = parsed.settings.characters.map((c, idx) => ({
      ...c,
      imagePromptTemplate: typeof c.imagePromptTemplate === 'string' ? c.imagePromptTemplate : '',
      faceRef: c.faceRef,
      balance: typeof c.balance === 'number' ? c.balance : 1500 + (idx * 250) % 1200,
    }));
    return parsed;
  } catch (err) {
    console.error('❌ 加载数据失败:', err);
    return { version: 1, settings: defaultSettings() };
  }
}

export function saveState(state: PersistShape) {
  try {
    const serialized = JSON.stringify(state);
    const sizeInMB = (new Blob([serialized]).size / 1024 / 1024).toFixed(2);
    console.log(`[💾 保存] 数据大小: ${sizeInMB}MB, 角色数: ${state.settings.characters?.length || 0}, 世界书条目: ${state.settings.worldEntries?.length || 0}`);
    localStorage.setItem(KEY, serialized);
    console.log('✅ 数据保存成功');
  } catch (e) {
    console.error('❌ 保存失败:', e);
    // 如果是 QuotaExceededError，尝试清理旧数据
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      alert('存储空间不足！数据可能无法保存。请导出备份后清理数据。');
    } else {
      console.warn('save failed', e);
    }
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

/* ---------- export / import a single backup file ---------- */
export function exportData(state: PersistShape): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.download = `yangyangji-backup-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<PersistShape> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PersistShape;
        if (!parsed.settings) throw new Error('文件格式不正确');
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
