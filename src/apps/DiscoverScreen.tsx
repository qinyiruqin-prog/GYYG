import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { UserPlus, MessageCircle, Heart } from 'lucide-react';

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

export function DiscoverScreen({ onBack }: { onBack: () => void }) {
  const [recommendations] = useState<RecommendedUser[]>(MOCK_RECOMMENDATIONS);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleAdd = (userId: string) => {
    setAdded(new Set([...added, userId]));
    // TODO: 实际添加好友逻辑
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
        {recommendations.map((user) => (
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
              {added.has(user.id) ? (
                <button
                  disabled
                  className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-medium txt-dim"
                  style={{ background: 'var(--icon-bg)' }}
                >
                  <Heart size={14} className="fill-current" />
                  已添加
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAdd(user.id)}
                    className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-medium tap"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                  >
                    <UserPlus size={14} />
                    添加好友
                  </button>
                  <button
                    className="h-9 w-9 rounded-xl flex items-center justify-center tap"
                    style={{ background: 'var(--icon-bg)' }}
                  >
                    <MessageCircle size={14} className="txt-dim" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* 换一批按钮 */}
        <button
          className="w-full h-11 rounded-2xl glass-strong tap text-[14px] font-medium"
          onClick={() => {
            // TODO: 重新加载推荐
          }}
        >
          换一批推荐
        </button>
      </div>
    </AppScreen>
  );
}
