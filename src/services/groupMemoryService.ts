import { Memory } from '../types';
import { LayeredMemory, MemoryLayer } from './memoryLayerService';

/**
 * 群聊记忆共享系统
 * 群内的对话和互动会被记录到所有群成员的记忆中
 */

export interface GroupMemory extends LayeredMemory {
  groupId: string; // 所属群聊ID
  sharedWith: string[]; // 与哪些成员共享（角色ID列表）
  originalMemoryId?: string; // 原始记忆ID（如果是从个人转换过来的）
}

/**
 * 根据群聊对话生成群体记忆
 */
export function createGroupMemory(
  groupId: string,
  groupName: string,
  participants: string[], // 参与者ID
  conversationSummary: string,
  importance: number = 50
): GroupMemory {
  return {
    id: `group-mem-${groupId}-${Date.now()}`,
    characterId: participants[0], // 以第一个参与者为主记忆所有者
    type: 'conversation',
    title: `群聊「${groupName}」`,
    content: conversationSummary,
    importance,
    tags: ['群聊', groupName],
    layer: 'short-term' as MemoryLayer,
    ts: Date.now(),
    groupId,
    sharedWith: participants.slice(1), // 与其他参与者共享
  };
}

/**
 * 将个人记忆升级为群体共享记忆
 */
export function elevateToGroupMemory(
  personalMemory: Memory,
  groupId: string,
  groupName: string,
  sharedWith: string[]
): GroupMemory {
  return {
    ...personalMemory,
    id: `group-${personalMemory.id}`,
    title: `[${groupName}] ${personalMemory.title}`,
    tags: [...(personalMemory.tags || []), '群共享'],
    layer: 'short-term' as MemoryLayer,
    groupId,
    sharedWith,
    originalMemoryId: personalMemory.id,
  };
}

/**
 * 获取群组的所有共享记忆
 */
export function getGroupMemories(memories: GroupMemory[], groupId: string): GroupMemory[] {
  return memories.filter((m) => m.groupId === groupId).sort((a, b) => b.ts - a.ts);
}

/**
 * 获取特定成员在群中的记忆视角
 * （所有群体记忆+个人相关的私密记忆）
 */
export function getMemberGroupView(
  memories: GroupMemory[],
  groupId: string,
  memberId: string
): GroupMemory[] {
  return memories.filter((m) => {
    // 包含这个群的所有记忆
    if (m.groupId === groupId) return true;
    // 或者这个成员是直接所有者
    if (m.characterId === memberId && m.groupId === groupId) return true;
    return false;
  });
}

/**
 * 群聊记忆同步：当群内有新对话时同步到所有成员的记忆
 */
export function syncGroupMemoryToMembers(
  existingMemories: Memory[],
  groupMemory: GroupMemory,
  memberIds: string[]
): Memory[] {
  const newMemories = [...existingMemories];

  // 为每个成员创建或更新对应的记忆引用
  memberIds.forEach((memberId) => {
    // 检查是否已存在该群的记忆
    const existing = newMemories.find(
      (m) => (m as GroupMemory).groupId === groupMemory.groupId && m.characterId === memberId
    );

    if (!existing) {
      newMemories.push({
        ...groupMemory,
        id: `${groupMemory.id}-${memberId}`,
        characterId: memberId,
      });
    }
  });

  return newMemories;
}

/**
 * 在群内引用其他成员的个人记忆
 * 例如："上次你说过..."
 */
export function createCrossMemoryReference(
  personalMemory: Memory,
  groupId: string,
  groupName: string,
  referredBy: string // 引用这个记忆的人
): GroupMemory {
  return {
    id: `ref-${personalMemory.id}-${referredBy}-${Date.now()}`,
    characterId: personalMemory.characterId,
    type: 'conversation',
    title: `[${groupName}] ${referredBy}引用了你的：${personalMemory.title}`,
    content: `群里的 ${referredBy} 提到：${personalMemory.content}`,
    importance: personalMemory.importance,
    tags: [...(personalMemory.tags || []), '被引用'],
    layer: 'short-term' as MemoryLayer,
    ts: Date.now(),
    groupId,
    sharedWith: [referredBy],
  };
}

/**
 * 生成群聊总结（自动调用）
 */
export function generateGroupSummary(groupMemories: GroupMemory[], groupName: string): string {
  const messageCount = groupMemories.length;
  const participants = [...new Set(groupMemories.map((m) => m.characterId))];
  const topics = [...new Set(groupMemories.flatMap((m) => m.tags || []))];

  return `群聊「${groupName}」有 ${messageCount} 条记忆，
参与者：${participants.length} 人，
主要话题：${topics.slice(0, 5).join('、')}`;
}
