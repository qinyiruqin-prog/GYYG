import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Modal } from './Sheet';
import type { Character, Contact } from '../types';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  onShare: (targetId: string, targetType: 'chat' | 'weibo' | 'twitter') => void;
  title?: string;
}

export function ShareSheet({ open, onClose, onShare, title = '分享到' }: ShareSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'social'>('chat');

  // 从localStorage获取联系人和角色
  const getContacts = (): Contact[] => {
    try {
      const raw = localStorage.getItem('yangyangji:v1');
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data?.settings?.contacts || [];
    } catch {
      return [];
    }
  };

  const getCharacters = (): Character[] => {
    try {
      const raw = localStorage.getItem('yangyangji:v1');
      if (!raw) return [];
      const data = JSON.parse(raw);
      return data?.settings?.characters || [];
    } catch {
      return [];
    }
  };

  const contacts = getContacts();
  const characters = getCharacters();

  // 合并联系人和角色作为聊天对象
  const chatTargets = [
    ...contacts.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, type: 'contact' as const })),
    ...characters.map(c => ({ id: c.id, name: c.name, avatar: c.avatar, type: 'character' as const }))
  ];

  // 社交媒体好友（这里暂时使用角色列表，实际应该有专门的社交好友列表）
  const socialFriends = characters.map(c => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    platforms: ['weibo', 'twitter'] as const
  }));

  // 过滤结果
  const filteredChatTargets = chatTargets.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSocialFriends = socialFriends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (targetId: string, targetType: 'chat' | 'weibo' | 'twitter') => {
    onShare(targetId, targetType);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col h-[400px]">
        {/* 搜索框 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 bg-[var(--surface)] rounded-full px-3 h-10">
            <Search size={16} className="txt-faint" />
            <input
              type="text"
              placeholder="搜索联系人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[14px] txt-accent"
            />
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex gap-4 border-b border-[var(--border)] mb-3">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2 px-2 text-[14px] font-medium relative ${
              activeTab === 'chat' ? 'txt-accent' : 'txt-faint'
            }`}
          >
            聊天列表
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`pb-2 px-2 text-[14px] font-medium relative ${
              activeTab === 'social' ? 'txt-accent' : 'txt-faint'
            }`}
          >
            社交好友
            {activeTab === 'social' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />
            )}
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="space-y-1">
              {filteredChatTargets.length === 0 ? (
                <div className="text-center txt-faint text-[13px] py-8">
                  {searchQuery ? '没有找到匹配的联系人' : '暂无联系人'}
                </div>
              ) : (
                filteredChatTargets.map(target => (
                  <button
                    key={target.id}
                    onClick={() => handleShare(target.id, 'chat')}
                    className="tap w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface)]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[16px] shrink-0">
                      {target.avatar || '👤'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[14px] font-medium txt-accent">{target.name}</div>
                      <div className="text-[12px] txt-faint">
                        {target.type === 'contact' ? '联系人' : '角色'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-1">
              {filteredSocialFriends.length === 0 ? (
                <div className="text-center txt-faint text-[13px] py-8">
                  {searchQuery ? '没有找到匹配的好友' : '暂无社交好友'}
                </div>
              ) : (
                filteredSocialFriends.map(friend => (
                  <div key={friend.id} className="p-3 rounded-xl glass">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[16px] shrink-0">
                        {friend.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-medium txt-accent">{friend.name}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-13">
                      {friend.platforms.includes('weibo') && (
                        <button
                          onClick={() => handleShare(friend.id, 'weibo')}
                          className="tap flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[12px] font-medium txt-accent hover:bg-[var(--accent)] hover:text-white"
                        >
                          📱 微博私信
                        </button>
                      )}
                      {friend.platforms.includes('twitter') && (
                        <button
                          onClick={() => handleShare(friend.id, 'twitter')}
                          className="tap flex-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[12px] font-medium txt-accent hover:bg-blue-500 hover:text-white"
                        >
                          🐦 Twitter DM
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
