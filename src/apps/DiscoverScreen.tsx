import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { UserPlus, MessageCircle, Heart, RefreshCw } from 'lucide-react';
import { askAIJson } from '../api';
import type { ApiConfig, Character, UserIdentity } from '../types';

interface RecommendedUser {
  id: string;
  name: string;
  avatar: string;
  signature: string;
  tags: string[];
  mutualFriends: number;
  isMain: boolean;
}

// 模拟推荐数据
const MOCK_RECOMMENDATIONS: RecommendedUser[] = [
  {
    id: 'rec1',
    name: '温柔的小鹿',
    avatar: '🦌',
    signature: '喜欢安静地看书，偶尔写写诗',
    tags: ['文艺', '温柔', '治愈系'],
    mutualFriends: 3,
    isMain: false,
  },
  {
    id: 'rec2',
    name: '活力少女',
    avatar: '🌸',
    signature: '每天都要开心鸭！',
    tags: ['元气', '可爱', '二次元'],
    mutualFriends: 5,
    isMain: false,
  },
  {
    id: 'rec3',
    name: '神秘猫咪',
    avatar: '🐱',
    signature: '喵～',
    tags: ['高冷', '傲娇', '猫系'],
    mutualFriends: 1,
    isMain: false,
  },
  {
    id: 'rec4',
    name: '知心姐姐',
    avatar: '💝',
    signature: '愿意倾听你的烦恼',
    tags: ['成熟', '温暖', '知性'],
    mutualFriends: 2,
    isMain: false,
  },
  {
    id: 'rec5',
    name: '运动达人',
    avatar: '⚡',
    signature: '跑步、健身、热爱生活',
    tags: ['活力', '健康', '阳光'],
    mutualFriends: 0,
    isMain: false,
  },
];

export function DiscoverScreen({
  api,
  me,
  characters,
  onAddCharacter,
  onStartChat,
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  characters: Character[];
  onAddCharacter: (character: Character) => void;
  onStartChat: (characterId: string) => void;
  onBack: () => void;
}) {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>(MOCK_RECOMMENDATIONS);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleAdd = (user: RecommendedUser) => {
    // 创建新角色
    const newChar: Character = {
      id: 'char-' + Date.now() + '-' + Math.random().toString(36).substring(2),
      name: user.name,
      avatar: user.avatar,
      signature: user.signature,
      persona: `性格标签：${user.tags.join('、')}。${user.signature}`,
      createdAt: Date.now(),
    };

    onAddCharacter(newChar);
    setAdded(new Set([...added, user.id]));
  };

  const handleChat = (user: RecommendedUser) => {
    // 查找对应的角色
    const char = characters.find(c => c.name === user.name && c.avatar === user.avatar);
    if (char) {
      onStartChat(char.id);
    }
  };

  const generateNewRecommendations = async () => {
    setLoading(true);
    try {
      const sys = '你是角色推荐系统。请生成5个虚拟角色推荐。每个角色包含：name(中文名，2-4字)、avatar(单个emoji)、signature(个性签名，10-20字)、tags(3个性格标签数组)。返回JSON数组。';
      const prompt = `用户兴趣：${me?.signature || '不限'}。请生成5个不同类型、有特色的角色。`;

      const data = await askAIJson<Array<{ name: string; avatar: string; signature: string; tags: string[] }>>(
        api,
        sys,
        prompt,
        { temperature: 0.95, maxTokens: 600 }
      );

      const newRecs: RecommendedUser[] = data.map((d, idx) => ({
        id: 'ai-rec-' + Date.now() + '-' + idx,
        name: d.name,
        avatar: d.avatar,
        signature: d.signature,
        tags: d.tags || [],
        mutualFriends: Math.floor(Math.random() * 8),
        isMain: false,
      }));

      setRecommendations(newRecs);
      setAdded(new Set()); // 清空已添加记录
    } catch (err) {
      console.error('Generate recommendations failed:', err);
      alert('生成推荐失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen title="发现" onBack={onBack}>
      <div className="space-y-3">
        {/* 推荐说明 */}
        <div className="glass rounded-2xl p-4">
          <div className="text-[13px] txt-dim text-center">
            ✨ 为你推荐可能感兴趣的角色
          </div>
        </div>

        {/* 推荐列表 */}
        {recommendations.map((user) => {
          const isAdded = added.has(user.id);
          const existingChar = characters.find(c => c.name === user.name && c.avatar === user.avatar);

          return (
            <div key={user.id} className="glass rounded-2xl p-4">
              {/* 头像和基本信息 */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] shrink-0"
                  style={{ background: 'var(--icon-bg-active)' }}
                >
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-[15px] font-medium truncate">{user.name}</div>
                    {user.isMain && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--bg)] font-bold">
                        主号
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] txt-dim line-clamp-2">{user.signature}</div>
                </div>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {user.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-full txt-dim"
                    style={{ background: 'var(--icon-bg)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 共同好友 */}
              {user.mutualFriends > 0 && (
                <div className="text-[11px] txt-faint mb-3">
                  {user.mutualFriends} 位共同好友
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {isAdded || existingChar ? (
                  <button
                    onClick={() => existingChar && handleChat(user)}
                    className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-medium tap"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                  >
                    <MessageCircle size={14} />
                    开始聊天
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAdd(user)}
                      className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-medium tap"
                      style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                    >
                      <UserPlus size={14} />
                      添加好友
                    </button>
                    <button
                      onClick={() => handleAdd(user)}
                      className="h-9 w-9 rounded-xl flex items-center justify-center tap"
                      style={{ background: 'var(--icon-bg)' }}
                    >
                      <MessageCircle size={14} className="txt-dim" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* 换一批按钮 */}
        <button
          className="w-full h-11 rounded-2xl glass-strong tap text-[14px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={generateNewRecommendations}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'AI 生成中...' : '换一批推荐'}
        </button>
      </div>
    </AppScreen>
  );
}
