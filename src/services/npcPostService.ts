import { SocialPost, Character, Memory } from '../types';
import { uid } from '../utils';

/**
 * NPC自动发帖服务
 * 根据角色性格、记忆、互动历史生成帖子
 */

interface PostGenerationContext {
  character: Character;
  memories: Memory[];
  recentPosts: SocialPost[];
  lastPostTime: number;
  personality: string;
}

// 角色性格特征库
const PERSONALITY_TRAITS = {
  cheerful: ['开心', '高兴', '兴奋', '😊', '✨', '🌟'],
  serious: ['深思', '思考', '理性', '📝', '💭', '🤔'],
  playful: ['调皮', '好玩', '有趣', '😜', '🎮', '🎭'],
  caring: ['关心', '温暖', '陪伴', '❤️', '💕', '🤗'],
  adventurous: ['冒险', '探索', '新奇', '🚀', '🌍', '⛰️'],
};

// 帖子模板
const POST_TEMPLATES = [
  '今天{时间}，{情感}。{内容}',
  '{情感}！{内容}',
  '{内容} {情感}',
  '突然想到{内容}，{情感}',
  '{时间}{内容}，#生活 {情感}',
];

const TIME_EXPRESSIONS = [
  '早上醒来时',
  '午餐时间',
  '下午茶时',
  '傍晚散步',
  '夜晚独处时',
  '突然间',
];

const EMOTIONS = [
  '感觉很棒💪',
  '心里暖暖的❤️',
  '有点累呢😴',
  '超级开心😊',
  '在思考人生🤔',
  '发现了新东西✨',
];

const INTERESTS = [
  '逛街',
  '看电影',
  '听音乐',
  '画画',
  '写日记',
  '冥想',
  '运动',
  '阅读',
  '烹饪',
  '摄影',
];

/**
 * 生成NPC帖子内容
 */
export function generateNPCPost(context: PostGenerationContext): Partial<SocialPost> {
  const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
  const timeExpr = TIME_EXPRESSIONS[Math.floor(Math.random() * TIME_EXPRESSIONS.length)];
  const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
  const interest = INTERESTS[Math.floor(Math.random() * INTERESTS.length)];

  // 从角色名推断性格（简化版）
  let traits: string[] = [];
  if (context.character.name.includes('开') || context.character.name.includes('乐')) {
    traits = PERSONALITY_TRAITS.cheerful;
  } else if (context.character.name.includes('思') || context.character.name.includes('静')) {
    traits = PERSONALITY_TRAITS.serious;
  } else if (context.character.name.includes('小') || context.character.name.includes('调')) {
    traits = PERSONALITY_TRAITS.playful;
  } else if (context.character.name.includes('温') || context.character.name.includes('心')) {
    traits = PERSONALITY_TRAITS.caring;
  } else {
    traits = PERSONALITY_TRAITS.adventurous;
  }

  const content = template
    .replace('{时间}', timeExpr)
    .replace('{情感}', emotion)
    .replace('{内容}', `最近在${interest}，感觉发现了新的乐趣`);

  return {
    platform: context.recentPosts[0]?.platform || 'weibo',
    authorName: context.character.name,
    authorAvatar: context.character.avatar,
    authorId: context.character.id,
    content: content.trim().slice(0, 280), // 推特限制280字
    likes: Math.floor(Math.random() * 50),
    reposts: Math.floor(Math.random() * 20),
    comments: [],
    ts: Date.now(),
  };
}

/**
 * 根据用户帖子生成NPC回复
 */
export function generateNPCReply(
  userPost: SocialPost,
  character: Character,
  relationship: 'friend' | 'acquaintance' | 'stranger' = 'friend'
): string {
  const replies: Record<string, string[]> = {
    friend: [
      '这太有趣了！👏',
      '完全同意！',
      '你说得对，我也这样想过',
      '哈哈，太可爱了😄',
      '这就是我喜欢你的原因💕',
      '我们得聊聊这个！',
    ],
    acquaintance: [
      '感谢分享！',
      '这很有意思',
      '学到了新东西',
      '点赞支持🙌',
      '同意你的观点',
    ],
    stranger: [
      '不错的想法',
      '值得思考',
      '👍',
      '有趣',
      '受教了',
    ],
  };

  const replyList = replies[relationship];
  return replyList[Math.floor(Math.random() * replyList.length)];
}

/**
 * 判断NPC是否应该发帖
 * 根据发帖频率和时间间隔
 */
export function shouldNPCPost(lastPostTime: number, postFrequency: 'high' | 'medium' | 'low' = 'medium'): boolean {
  const intervals = {
    high: 3600000, // 1小时
    medium: 7200000, // 2小时
    low: 14400000, // 4小时
  };

  const interval = intervals[postFrequency];
  return Date.now() - lastPostTime > interval;
}

/**
 * 生成一批NPC帖子（用于刷新）
 */
export function generateNPCPostBatch(
  characters: Character[],
  existingPosts: SocialPost[],
  platform: 'weibo' | 'twitter' = 'weibo'
): SocialPost[] {
  const newPosts: SocialPost[] = [];
  const activeCharacters = characters.slice(0, 3); // 每次最多3个角色发帖

  activeCharacters.forEach((char) => {
    const lastPost = existingPosts.find((p) => p.authorId === char.id);
    const lastPostTime = lastPost?.ts || 0;

    if (shouldNPCPost(lastPostTime, 'medium')) {
      const postData = generateNPCPost({
        character: char,
        memories: [],
        recentPosts: existingPosts.filter((p) => p.platform === platform),
        lastPostTime,
        personality: char.name,
      });

      newPosts.push({
        id: uid(),
        ...postData,
        platform,
      } as SocialPost);
    }
  });

  return newPosts;
}
