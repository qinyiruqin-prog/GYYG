// 人机网友生成系统

const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林'];
const GIVEN_NAMES = ['明', '华', '强', '军', '建', '伟', '芳', '娜', '静', '丽', '敏', '艳', '磊', '鹏', '杰', '涛', '浩', '轩', '宇', '婷', '雪', '梅', '玲', '倩'];

const NICKNAMES = [
  '路过的网友', '吃瓜群众', '热心市民', '匿名用户', '神秘人',
  '不愿透露姓名的人', '某网友', '路人甲', '观众', '潜水员',
  '萌新', '老司机', '技术宅', '划水党', '打工人',
  '代码搬运工', '深夜emo', '早起鸟', '夜猫子', '社恐人士'
];

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  'https://api.dicebear.com/7.x/bottts/svg?seed=',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=',
];

export interface BotUser {
  name: string;
  avatar?: string;
}

/**
 * 生成随机人机网友
 */
export function generateBotUser(): BotUser {
  const useRealName = Math.random() > 0.5;

  if (useRealName) {
    // 生成真实姓名
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const givenName = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
    const name = surname + givenName;

    // 随机头像
    const avatarType = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const avatar = avatarType + encodeURIComponent(name) + Math.random();

    return { name, avatar };
  } else {
    // 使用昵称
    const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)] + Math.floor(Math.random() * 999);
    return { name };
  }
}

/**
 * 生成预制帖子内容
 */
export const PRESET_POSTS = [
  {
    title: '大家都用什么编辑器写代码？',
    body: '我一直用VSCode，感觉还不错。最近听说Cursor很火，有人用过吗？体验怎么样？',
    board: '技术',
  },
  {
    title: '今天加班到凌晨3点',
    body: '项目上线前夕，测试出了一堆bug。连续改了10个小时，眼睛都花了。大家有什么解压方法吗？',
    board: '日常',
  },
  {
    title: '推荐一部最近在看的小说',
    body: '《三体》真的太好看了！看到黑暗森林法则的时候起了一身鸡皮疙瘩。强烈推荐给喜欢科幻的朋友！',
    board: '故事',
  },
  {
    title: '求助：如何学习前端开发？',
    body: '大学计算机专业，想往前端方向发展。应该从哪里开始学起？HTML/CSS/JS都要学吗？有什么好的学习路线推荐吗？',
    board: '求助',
  },
  {
    title: '分享一个写代码的小技巧',
    body: '发现了一个很实用的快捷键，Ctrl+D可以选中下一个相同的词，配合多光标编辑简直神器。之前都是傻傻地一个个改。',
    board: '技术',
  },
  {
    title: '今天终于搞定了困扰我一周的bug',
    body: '原来是少了一个分号...找了一周，差点怀疑人生。有时候最简单的问题反而最难发现。',
    board: '日常',
  },
  {
    title: '大家有什么好的学习方法吗？',
    body: '最近学新技术总是记不住，看完就忘。是我年纪大了吗😂 有没有什么提高学习效率的方法？',
    board: '求助',
  },
  {
    title: '周末去爬山了，风景真不错',
    body: '好久没出门运动了，今天去了郊区的山上，空气超级好。拍了很多照片，感觉整个人都放松了。',
    board: '日常',
  },
];

/**
 * 生成预制评论
 */
export const COMMENT_TEMPLATES = [
  '哈哈哈笑死我了',
  '同感！我也遇到过这种情况',
  '楼主说得对',
  '有道理，学到了',
  '这个观点我不太认同',
  '支持一下！',
  '太真实了',
  '确实如此',
  '我也是这么想的',
  '感谢分享！',
  '666',
  '强！',
  '我觉得还行吧',
  '可以试试看',
  '这个方法不错',
  '马克一下',
  '收藏了',
  '顶',
  '沙发',
  '前排',
  '路过',
  '围观',
];
