import { Memory } from '../types';

/**
 * 三层记忆系统
 * - 长期记忆：永久保存（用户标记、AI总结、角色档案）
 * - 短期记忆：7天内（最近对话、互动、临时状态）
 * - 暂时记忆：当前会话（实时对话、环境、游戏状态）
 */

export type MemoryLayer = 'long-term' | 'short-term' | 'temporary';

export interface LayeredMemory extends Memory {
  layer: MemoryLayer;
  expiresAt?: number; // Unix时间戳，到期后自动删除
  isAutoSummarized?: boolean; // 是否由AI自动总结
  relatedMemories?: string[]; // 关联的记忆ID
}

/**
 * 记忆分层规则
 */
export const MEMORY_LAYER_RULES = {
  'long-term': {
    label: '长期记忆',
    description: '永久保存的重要信息',
    icon: '🧠',
    minImportance: 70, // 重要度70以上或手动标记
    autoDelete: false,
  },
  'short-term': {
    label: '短期记忆',
    description: '近期的对话和互动',
    icon: '💭',
    minImportance: 30,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7天毫秒
  },
  'temporary': {
    label: '暂时记忆',
    description: '当前会话信息',
    icon: '✨',
    minImportance: 0,
    ttl: 24 * 60 * 60 * 1000, // 1天毫秒
  },
};

/**
 * 根据内存特征判断应该分配到哪一层
 */
export function determineMemoryLayer(memory: Memory): MemoryLayer {
  // 重要度70+自动归入长期记忆
  if (memory.importance >= 70) {
    return 'long-term';
  }

  // 特定类型的记忆归入长期
  if (memory.type === 'important' || memory.type === 'event') {
    return 'long-term';
  }

  // 对话和情感归入短期
  if (memory.type === 'conversation' || memory.type === 'emotion') {
    return 'short-term';
  }

  // 其他默认短期
  return 'short-term';
}

/**
 * 清理过期的记忆
 */
export function cleanupExpiredMemories(memories: LayeredMemory[]): LayeredMemory[] {
  const now = Date.now();
  return memories.filter((m) => {
    if (!m.expiresAt) return true; // 没有过期时间的永久保留
    return m.expiresAt > now;
  });
}

/**
 * 获取特定角色的分层记忆
 */
export function getCharacterMemoriesByLayer(
  memories: LayeredMemory[],
  characterId: string,
  layer?: MemoryLayer
): LayeredMemory[] {
  return memories
    .filter((m) => m.characterId === characterId && (!layer || m.layer === layer))
    .sort((a, b) => b.ts - a.ts);
}

/**
 * AI自动总结多条记忆
 */
export function summarizeMemories(memories: Memory[]): string {
  if (memories.length === 0) return '';

  const titles = memories.map((m) => m.title).join('、');
  const contents = memories.map((m) => m.content).join('\n');

  return `这段时间的要点：${titles}\n\n详情：${contents}`;
}

/**
 * 创建自动总结的长期记忆
 */
export function createAutoSummaryMemory(
  characterId: string,
  memories: Memory[],
  period: 'daily' | 'weekly' = 'daily'
): LayeredMemory {
  const summary = summarizeMemories(memories);
  const now = Date.now();

  return {
    id: `summary-${characterId}-${now}`,
    characterId,
    type: 'important',
    title: `${period === 'daily' ? '每日' : '每周'}总结`,
    content: summary,
    importance: 75,
    tags: ['自动总结', period],
    layer: 'long-term',
    isAutoSummarized: true,
    ts: now,
  };
}

/**
 * 关联相似的记忆
 */
export function linkRelatedMemories(memories: Memory[], targetMemory: Memory, maxLinks: number = 3): string[] {
  const keywords = targetMemory.tags || [];
  const relatedIds: string[] = [];

  memories
    .filter((m) => m.id !== targetMemory.id)
    .forEach((m) => {
      const matchCount = (m.tags || []).filter((tag) => keywords.includes(tag)).length;
      if (matchCount > 0) {
        relatedIds.push({ id: m.id, matches: matchCount });
      }
    });

  return relatedIds.sort((a, b) => b.matches - a.matches).slice(0, maxLinks).map(r => r.id);
}

/**
 * 搜索记忆并自动匹配相关内容
 */
export function searchMemoriesWithContext(memories: LayeredMemory[], query: string): LayeredMemory[] {
  const lowerQuery = query.toLowerCase();
  const results: Array<{ memory: LayeredMemory; relevance: number }> = [];

  memories.forEach((m) => {
    let relevance = 0;

    // 标题匹配权重最高
    if (m.title.toLowerCase().includes(lowerQuery)) {
      relevance += 3;
    }

    // 内容匹配
    if (m.content.toLowerCase().includes(lowerQuery)) {
      relevance += 1;
    }

    // 标签匹配
    if (m.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
      relevance += 2;
    }

    // 长期记忆权重更高
    if (m.layer === 'long-term') {
      relevance += 1;
    }

    if (relevance > 0) {
      results.push({ memory: m, relevance });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance).map((r) => r.memory);
}
