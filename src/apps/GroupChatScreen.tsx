import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import type { Character, UserIdentity, ChatThread, ChatMessage } from '../types';

interface GroupChatScreenProps {
  characters: Character[];
  users: UserIdentity[];
  activeUserId: string | null;
  groupChats: GroupChat[];
  onBack: () => void;
  onCreateGroup: (group: Omit<GroupChat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onOpenGroupChat: (groupId: string) => void;
}

export interface GroupChat {
  id: string;
  name: string;
  avatar?: string; // emoji or data URL
  description?: string;
  ownerId: string; // 创建者（用户ID）
  memberIds: string[]; // 成员ID列表（用户+角色混合）
  memberTypes: Record<string, 'user' | 'character'>; // 标记每个成员是用户还是角色
  messages: GroupChatMessage[];
  createdAt: number;
  updatedAt: number;
  settings?: {
    allowMemberInvite?: boolean; // 是否允许成员邀请
    muteNotifications?: boolean; // 是否静音
    showMemberCount?: boolean; // 是否显示成员数
  };
}

export interface GroupChatMessage extends ChatMessage {
  senderId: string; // 发送者ID（用户或角色）
  senderType: 'user' | 'character';
  senderName: string;
  senderAvatar?: string;
  mentionIds?: string[]; // @提及的成员ID
  replyToId?: string; // 回复的消息ID
}

export function GroupChatScreen({
  characters,
  users,
  activeUserId,
  groupChats,
  onBack,
  onCreateGroup,
  onOpenGroupChat,
}: GroupChatScreenProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('👥');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const activeUser = users.find(u => u.id === activeUserId);

  // 所有可选成员（用户+角色）
  const allMembers = [
    ...users.filter(u => u.id !== activeUserId).map(u => ({ ...u, type: 'user' as const })),
    ...characters.map(c => ({ ...c, type: 'character' as const })),
  ];

  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert('请输入群名称');
      return;
    }

    if (selectedMembers.length === 0) {
      alert('请至少选择一个成员');
      return;
    }

    // 构建成员类型映射
    const memberTypes: Record<string, 'user' | 'character'> = {};
    allMembers.forEach(m => {
      if (selectedMembers.includes(m.id)) {
        memberTypes[m.id] = m.type;
      }
    });

    // 自己也是成员
    if (activeUserId) {
      memberTypes[activeUserId] = 'user';
    }

    onCreateGroup({
      name: groupName,
      avatar: groupAvatar,
      description: groupDescription || undefined,
      ownerId: activeUserId || '',
      memberIds: activeUserId ? [activeUserId, ...selectedMembers] : selectedMembers,
      memberTypes,
      messages: [],
      settings: {
        allowMemberInvite: true,
        muteNotifications: false,
        showMemberCount: true,
      },
    });

    // 重置表单
    setGroupName('');
    setGroupAvatar('👥');
    setGroupDescription('');
    setSelectedMembers([]);
    setShowCreateForm(false);

    alert('群聊创建成功！');
  };

  const avatarEmojis = ['👥', '💬', '🎉', '🎮', '📚', '🍕', '🎵', '⚽', '🌟', '💼'];

  return (
    <AppScreen title="群聊" onBack={onBack}>
      {!showCreateForm ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">👥 群聊功能</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 创建多人群聊，与多个AI角色同时互动</div>
              <div>• 角色之间会互相对话和互动</div>
              <div>• 支持@提及功能</div>
              <div>• 每个角色根据自己的人设回复</div>
            </div>
          </div>

          {/* 创建群聊按钮 */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-4 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap flex items-center justify-center gap-2"
          >
            <span className="text-[18px]">➕</span>
            <span>创建群聊</span>
          </button>

          {/* 群聊列表 */}
          {groupChats.length > 0 ? (
            <>
              <div className="text-[13px] font-medium mb-2 txt-accent">
                我的群聊 ({groupChats.length})
              </div>
              <ListGroup>
                {groupChats.map(group => {
                  const lastMsg = group.messages[group.messages.length - 1];
                  const memberCount = group.memberIds.length;

                  return (
                    <Row
                      key={group.id}
                      icon={group.avatar || '👥'}
                      label={group.name}
                      hint={
                        lastMsg
                          ? `${lastMsg.senderName}: ${lastMsg.content.substring(0, 20)}${lastMsg.content.length > 20 ? '...' : ''}`
                          : `${memberCount}人`
                      }
                      onClick={() => onOpenGroupChat(group.id)}
                      right={
                        lastMsg && (
                          <div className="text-[11px] txt-faint">
                            {new Date(lastMsg.ts).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )
                      }
                    />
                  );
                })}
              </ListGroup>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-[48px] mb-2">👥</div>
              <div className="text-[14px] txt-dim mb-1">还没有群聊</div>
              <div className="text-[12px] txt-faint">点击上方按钮创建你的第一个群聊</div>
            </div>
          )}
        </>
      ) : (
        /* 创建群聊表单 */
        <div className="space-y-4">
          {/* 群头像 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">群头像</div>
            <div className="flex gap-2 flex-wrap">
              {avatarEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setGroupAvatar(emoji)}
                  className={`w-12 h-12 rounded-xl text-[24px] tap flex items-center justify-center ${
                    groupAvatar === emoji
                      ? 'bg-[var(--accent)] scale-110'
                      : 'glass-strong'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 群名称 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">群名称</div>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="输入群名称"
              maxLength={20}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 群描述 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">群描述（可选）</div>
            <input
              type="text"
              value={groupDescription}
              onChange={e => setGroupDescription(e.target.value)}
              placeholder="简单介绍这个群"
              maxLength={50}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 选择成员 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">
              选择成员 ({selectedMembers.length}人)
            </div>
            <div className="p-3 glass-strong rounded-xl max-h-[400px] overflow-y-auto">
              {allMembers.map(member => {
                const isSelected = selectedMembers.includes(member.id);
                const isUser = member.type === 'user';

                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className="flex items-center gap-3 p-2 rounded-lg tap hover:bg-white/5"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[20px] glass-strong">
                      {('avatar' in member && member.avatar) || (isUser ? '👤' : '🤖')}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] txt-accent flex items-center gap-2">
                        {'nickname' in member ? member.nickname : member.name}
                        {isUser && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            用户
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] txt-faint">
                        {'signature' in member ? member.signature : ''}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--accent)] border-[var(--accent)]'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      {isSelected && <span className="text-white text-[12px]">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setGroupName('');
                setGroupAvatar('👥');
                setGroupDescription('');
                setSelectedMembers([]);
              }}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              取消
            </button>
            <button
              onClick={handleCreateGroup}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              创建
            </button>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
