import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { UserPlus, User, Check, Star } from 'lucide-react';
import type { UserIdentity } from '../types';

interface AccountManagerScreenProps {
  onBack: () => void;
  users?: UserIdentity[];
  activeUserId?: string;
  onSwitch?: (userId: string) => void;
  onCreate?: () => void;
}

export function AccountManagerScreen({
  onBack,
  users = [],
  activeUserId,
  onSwitch,
  onCreate,
}: AccountManagerScreenProps) {
  const [filter, setFilter] = useState<'all' | 'main' | 'alt'>('all');

  // 筛选账号
  const filteredUsers = users.filter((u) => {
    if (filter === 'main') return !u.isAlt;
    if (filter === 'alt') return u.isAlt;
    return true;
  });

  const mainCount = users.filter((u) => !u.isAlt).length;
  const altCount = users.filter((u) => u.isAlt).length;

  return (
    <AppScreen title="账号管理" onBack={onBack}>
      <div className="space-y-4">
        {/* 筛选器 */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-all ${
              filter === 'all' ? 'bg-[var(--accent)] text-white' : 'glass txt-dim'
            }`}
          >
            全部 ({users.length})
          </button>
          <button
            onClick={() => setFilter('main')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-all ${
              filter === 'main' ? 'bg-[var(--accent)] text-white' : 'glass txt-dim'
            }`}
          >
            主号 ({mainCount})
          </button>
          <button
            onClick={() => setFilter('alt')}
            className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-all ${
              filter === 'alt' ? 'bg-[var(--accent)] text-white' : 'glass txt-dim'
            }`}
          >
            小号 ({altCount})
          </button>
        </div>

        {/* 账号列表 */}
        {filteredUsers.length > 0 ? (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isActive = user.id === activeUserId;
              const isMain = !user.isAlt;

              return (
                <button
                  key={user.id}
                  onClick={() => !isActive && onSwitch?.(user.id)}
                  disabled={isActive}
                  className={`w-full glass rounded-2xl p-4 text-left transition-all ${
                    isActive ? 'ring-2 ring-[var(--accent)]' : 'tap'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 头像 */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] glass-strong">
                        {user.avatar || '👤'}
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                          <Check size={12} strokeWidth={3} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-[15px] font-medium truncate">
                          {user.nickname || '未命名用户'}
                        </div>
                        {isMain ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-bold">主号</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-full glass text-[10px] txt-dim font-medium">
                            小号
                          </div>
                        )}
                      </div>
                      {user.signature && (
                        <div className="text-[12px] txt-dim truncate">
                          {user.signature}
                        </div>
                      )}
                      {user.onlineName && (
                        <div className="text-[11px] txt-faint mt-1">
                          网名：{user.onlineName}
                        </div>
                      )}
                    </div>

                    {/* 当前使用标识 */}
                    {isActive && (
                      <div className="text-[11px] txt-accent font-medium">
                        使用中
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* 空状态 */
          <div className="glass rounded-2xl p-8 text-center">
            <User size={48} className="txt-faint mx-auto mb-3" />
            <div className="text-[14px] txt-dim mb-2">
              {filter === 'main' && '还没有主号'}
              {filter === 'alt' && '还没有小号'}
              {filter === 'all' && '还没有任何账号'}
            </div>
            <div className="text-[12px] txt-faint">
              点击下方按钮创建新身份
            </div>
          </div>
        )}

        {/* 创建新身份 */}
        <button
          onClick={onCreate}
          className="w-full h-14 rounded-2xl glass-strong tap flex items-center justify-center gap-2 text-[15px] font-medium"
        >
          <UserPlus size={18} />
          创建新身份
        </button>

        {/* 说明卡片 */}
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="text-[12px] font-medium txt-accent mb-2">💡 使用说明</div>
          <div className="text-[11px] txt-dim leading-relaxed space-y-1.5">
            <div>• 主号：你的主要身份，可以创建多个</div>
            <div>• 小号：用于特定场景的匿名身份</div>
            <div>• 点击账号卡片即可快速切换身份</div>
            <div>• 当前使用的账号会显示"使用中"标识</div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
