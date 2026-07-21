import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { UserPlus, CheckCircle, User } from 'lucide-react';
import type { UserIdentity } from '../types';

interface AltAccountsScreenProps {
  onBack: () => void;
  users?: UserIdentity[];
  activeUserId?: string;
  onSwitch?: (userId: string) => void;
  onCreate?: () => void;
}

export function AltAccountsScreen({
  onBack,
  users = [],
  activeUserId,
  onSwitch,
  onCreate,
}: AltAccountsScreenProps) {
  // 分离主号和小号
  const mainAccounts = users.filter((u) => !u.isAlt);
  const altAccounts = users.filter((u) => u.isAlt);

  return (
    <AppScreen title="小号管理" onBack={onBack}>
      <div className="space-y-4">
        {/* 当前账号 */}
        {activeUserId && (
          <div className="glass rounded-2xl p-4">
            <div className="text-[11px] txt-faint mb-2">当前身份</div>
            {users
              .filter((u) => u.id === activeUserId)
              .map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[24px] shrink-0"
                    style={{ background: 'var(--icon-bg-active)' }}
                  >
                    {user.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[15px] font-medium truncate">{user.nickname}</div>
                      <CheckCircle size={14} className="txt-accent" />
                    </div>
                    {user.signature && (
                      <div className="text-[12px] txt-dim truncate">{user.signature}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 主号列表 */}
        {mainAccounts.length > 0 && (
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent px-1">
              主号 ({mainAccounts.length})
            </div>
            <div className="space-y-2">
              {mainAccounts.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSwitch?.(user.id)}
                  disabled={user.id === activeUserId}
                  className={`w-full glass rounded-2xl p-4 text-left tap ${
                    user.id === activeUserId ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[24px] shrink-0"
                      style={{ background: 'var(--icon-bg-active)' }}
                    >
                      {user.avatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-[14px] font-medium truncate">{user.nickname}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--bg)] font-bold">
                          主号
                        </span>
                      </div>
                      {user.signature && (
                        <div className="text-[11px] txt-dim truncate">{user.signature}</div>
                      )}
                    </div>
                    {user.id === activeUserId && (
                      <CheckCircle size={16} className="txt-accent shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 小号列表 */}
        {altAccounts.length > 0 && (
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent px-1">
              小号 ({altAccounts.length})
            </div>
            <div className="space-y-2">
              {altAccounts.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSwitch?.(user.id)}
                  disabled={user.id === activeUserId}
                  className={`w-full glass rounded-2xl p-4 text-left tap ${
                    user.id === activeUserId ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[24px] shrink-0"
                      style={{ background: 'var(--icon-bg-active)' }}
                    >
                      {user.avatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate mb-0.5">
                        {user.nickname}
                      </div>
                      {user.signature && (
                        <div className="text-[11px] txt-dim truncate">{user.signature}</div>
                      )}
                    </div>
                    {user.id === activeUserId && (
                      <CheckCircle size={16} className="txt-accent shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {users.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <User size={48} className="txt-faint mx-auto mb-3" />
            <div className="text-[14px] txt-dim mb-2">还没有创建任何身份</div>
            <div className="text-[12px] txt-faint">点击下方按钮创建你的第一个身份</div>
          </div>
        )}

        {/* 创建新身份按钮 */}
        <button
          onClick={onCreate}
          className="w-full h-12 rounded-2xl glass-strong tap flex items-center justify-center gap-2 text-[14px] font-medium"
        >
          <UserPlus size={16} />
          创建新身份
        </button>

        {/* 说明 */}
        <div className="glass rounded-2xl p-4">
          <div className="text-[11px] txt-faint space-y-1">
            <div>💡 主号：你的主要身份，可以有多个</div>
            <div>💡 小号：标记为小号的身份，用于特定场景</div>
            <div>💡 点击身份卡片可快速切换当前身份</div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
