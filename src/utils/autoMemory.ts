import { askAI } from '../api';
import type { ApiConfig, Character, UserIdentity, Memory, Message } from '../types';

const INTERACTION_COUNT_KEY = 'interaction_counts';
const MEMORY_INTERVAL = 30; // 每30次互动总结一次

interface InteractionCount {
  [key: string]: number; // characterId -> count
}

/**
 * 获取互动计数
 */
function getInteractionCounts(): InteractionCount {
  try {
    const data = localStorage.getItem(INTERACTION_COUNT_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

/**
 * 保存互动计数
 */
function saveInteractionCounts(counts: InteractionCount) {
  try {
    localStorage.setItem(INTERACTION_COUNT_KEY, JSON.stringify(counts));
  } catch (err) {
    console.warn('Failed to save interaction counts:', err);
  }
}

/**
 * 增加互动计数，如果达到阈值返回true
 */
export function incrementInteractionCount(characterId: string): boolean {
  const counts = getInteractionCounts();
  counts[characterId] = (counts[characterId] || 0) + 1;
  saveInteractionCounts(counts);

  return counts[characterId] % MEMORY_INTERVAL === 0;
}

/**
 * 自动总结记忆
 */
export async function autoSummarizeMemory(
  api: ApiConfig,
  character: Character,
  user: UserIdentity,
  recentMessages: Message[],
  existingMemories: Memory[],
  context: {
    type: 'chat' | 'game' | 'forum' | 'moment' | 'sms' | 'email' | 'other';
    additionalContext?: string;
  }
): Promise<Memory | null> {
  try {
    // 提取最近30条消息作为上下文
    const messagesToSummarize = recentMessages.slice(-30);
    if (messagesToSummarize.length === 0) return null;

    // 构建消息历史文本
    const messageHistory = messagesToSummarize
      .map((m) => {
        if (m.role === 'user') {
          return `${user.nickname}: ${m.content}`;
        } else {
          return `${character.name}: ${m.content}`;
        }
      })
      .join('\n');

    // 构建已有记忆摘要
    const existingMemorySummary = existingMemories
      .filter(m => m.characterId === character.id)
      .slice(-5) // 最近5条记忆
      .map(m => `- ${m.title}: ${m.content}`)
      .join('\n');

    const contextTypeText = {
      chat: '聊天对话',
      game: '游戏互动',
      forum: '论坛交流',
      moment: '朋友圈互动',
      sms: '短信往来',
      email: '邮件沟通',
      other: '其他互动',
    };

    const sys = `你是记忆总结助手。根据${character.name}和${user.nickname}的${contextTypeText[context.type]}记录，提取重要的记忆点。

记忆类型：
- important: 重大事件、承诺、决定
- conversation: 有价值的对话内容
- event: 发生的具体事件
- emotion: 情感变化、心情

已有记忆摘要：
${existingMemorySummary || '暂无'}

请分析以下互动内容，提取1-2个最重要的记忆点。每个记忆包含：
- type: 记忆类型
- title: 简短标题（5-15字）
- content: 详细内容（30-100字）
- importance: 重要度（0-100，越重要数值越大）
- tags: 2-3个标签

只提取真正有价值的内容，日常寒暄不需要记录。如果没有值得记录的内容，返回空数组。

返回JSON格式：[{"type":"...","title":"...","content":"...","importance":80,"tags":["tag1","tag2"]}]`;

    const prompt = `${context.additionalContext ? context.additionalContext + '\n\n' : ''}互动记录：\n${messageHistory}\n\n请提取重要记忆（如无重要内容返回[]）：`;

    const response = await askAI(api, sys, prompt, { temperature: 0.7, maxTokens: 500 });

    // 解析JSON响应
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    const memories = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(memories) || memories.length === 0) return null;

    // 取第一个记忆（最重要的）
    const memData = memories[0];
    const newMemory: Memory = {
      id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2),
      characterId: character.id,
      userId: user.id,
      type: memData.type || 'conversation',
      title: memData.title || '互动记忆',
      content: memData.content || '',
      importance: memData.importance || 50,
      tags: memData.tags || [],
      ts: Date.now(),
      lastAccessed: Date.now(),
    };

    return newMemory;
  } catch (err) {
    console.error('Auto summarize memory failed:', err);
    return null;
  }
}

/**
 * 检查并自动总结记忆
 */
export async function checkAndAutoSummarize(
  api: ApiConfig,
  character: Character,
  user: UserIdentity,
  recentMessages: Message[],
  existingMemories: Memory[],
  context: {
    type: 'chat' | 'game' | 'forum' | 'moment' | 'sms' | 'email' | 'other';
    additionalContext?: string;
  },
  onMemoryCreated: (memory: Memory) => void
): Promise<void> {
  // 检查是否需要总结
  const shouldSummarize = incrementInteractionCount(character.id);

  if (shouldSummarize) {
    console.log(`[AutoMemory] Triggering auto-summarize for ${character.name} (30 interactions reached)`);

    const memory = await autoSummarizeMemory(
      api,
      character,
      user,
      recentMessages,
      existingMemories,
      context
    );

    if (memory) {
      console.log(`[AutoMemory] Created memory: ${memory.title}`);
      onMemoryCreated(memory);
    } else {
      console.log(`[AutoMemory] No significant memory to record`);
    }
  }
}
