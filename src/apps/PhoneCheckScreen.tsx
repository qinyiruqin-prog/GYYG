import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import type { Character, ChatThread, Moment } from '../types';

interface PhoneCheckScreenProps {
  characters: Character[];
  chatThreads: ChatThread[];
  moments: Moment[];
  onBack: () => void;
  onCheckPhone: (charId: string) => Promise<{ caught: boolean; reaction?: string }>;
}

export function PhoneCheckScreen({
  characters,
  chatThreads,
  moments,
  onBack,
  onCheckPhone,
}: PhoneCheckScreenProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    caught: boolean;
    reaction?: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'chats' | 'moments' | null>(null);

  const selectedChar = characters.find(c => c.id === selectedCharId);

  const handleCheck = async () => {
    if (!selectedCharId) return;

    setChecking(true);
    setCheckResult(null);

    // 模拟检查过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await onCheckPhone(selectedCharId);
      setCheckResult({
        success: true,
        caught: result.caught,
        reaction: result.reaction,
      });
    } catch (err) {
      setCheckResult({
        success: false,
        caught: false,
      });
    } finally {
      setChecking(false);
    }
  };

  // 获取选中角色的聊天记录
  const charChats = chatThreads.filter(t => t.characterId === selectedCharId);

  // 获取选中角色的朋友圈
  const charMoments = moments.filter(m => m.characterId === selectedCharId);

  return (
    <AppScreen title="查手机" onBack={onBack}>
      {/* 说明 */}
      <div className="mb-4 p-4 glass-strong rounded-2xl">
        <div className="text-[13px] font-medium mb-2 txt-accent">🔍 查手机功能</div>
        <div className="text-[12px] txt-faint space-y-1">
          <div>• 偷偷查看角色的聊天记录、朋友圈</div>
          <div>• <span className="text-red-400">有被发现的风险！</span>被发现概率：30%</div>
          <div>• 被发现后，AI会生成角色的真实反应</div>
          <div>• 可能影响你和角色的关系</div>
        </div>
      </div>

      {!viewMode && !checkResult && (
        <>
          {/* 选择角色 */}
          <div className="text-[13px] font-medium mb-2 txt-accent">选择要查看的角色</div>
          <ListGroup>
            {characters.map(char => (
              <Row
                key={char.id}
                icon={char.avatar || '👤'}
                label={char.name}
                hint={char.signature}
                onClick={() => setSelectedCharId(char.id)}
                right={
                  selectedCharId === char.id ? (
                    <span className="text-[var(--accent)]">✓</span>
                  ) : null
                }
              />
            ))}
          </ListGroup>

          {/* 查看按钮 */}
          {selectedCharId && (
            <button
              onClick={handleCheck}
              disabled={checking}
              className="mt-4 w-full py-3 bg-red-500 text-white rounded-xl font-medium tap disabled:opacity-50"
            >
              {checking ? '正在偷偷查看...' : '🔍 开始查看'}
            </button>
          )}

          {checking && (
            <div className="mt-4 p-4 glass-strong rounded-2xl animate-pulse">
              <div className="text-center">
                <div className="text-[32px] mb-2">🤫</div>
                <div className="text-[13px] txt-accent">正在偷偷查看...</div>
                <div className="text-[11px] txt-faint mt-1">请保持安静...</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 查看结果 */}
      {checkResult && !viewMode && (
        <div className="space-y-4">
          {checkResult.caught ? (
            /* 被发现了 */
            <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl">
              <div className="text-center mb-3">
                <div className="text-[48px] mb-2">😱</div>
                <div className="text-[16px] font-medium text-red-400 mb-2">被发现了！</div>
                <div className="text-[13px] txt-accent mb-4">
                  {selectedChar?.name} 发现你在偷看TA的手机...
                </div>
              </div>

              {checkResult.reaction && (
                <div className="p-3 glass-strong rounded-xl mb-4">
                  <div className="text-[12px] txt-faint mb-1">TA的反应：</div>
                  <div className="text-[13px] txt-accent">{checkResult.reaction}</div>
                </div>
              )}

              <div className="text-[11px] txt-faint text-center">
                这可能会影响你们的关系...
              </div>
            </div>
          ) : (
            /* 成功查看 */
            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-2xl">
              <div className="text-center mb-3">
                <div className="text-[48px] mb-2">🤫</div>
                <div className="text-[16px] font-medium text-green-400 mb-2">查看成功！</div>
                <div className="text-[13px] txt-accent">
                  {selectedChar?.name} 没有发现你在偷看
                </div>
              </div>
            </div>
          )}

          {/* 查看选项 */}
          {!checkResult.caught && (
            <div className="space-y-2">
              <button
                onClick={() => setViewMode('chats')}
                className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent flex items-center justify-center gap-2"
              >
                <span className="text-[20px]">💬</span>
                <span>查看聊天记录 ({charChats.length})</span>
              </button>

              <button
                onClick={() => setViewMode('moments')}
                className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent flex items-center justify-center gap-2"
              >
                <span className="text-[20px]">📷</span>
                <span>查看朋友圈 ({charMoments.length})</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setCheckResult(null);
              setSelectedCharId('');
            }}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            返回
          </button>
        </div>
      )}

      {/* 聊天记录视图 */}
      {viewMode === 'chats' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-medium txt-accent">
              {selectedChar?.name} 的聊天记录
            </div>
            <button
              onClick={() => setViewMode(null)}
              className="text-[12px] txt-faint tap"
            >
              返回
            </button>
          </div>

          {charChats.length > 0 ? (
            charChats.map(chat => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <div key={chat.id} className="p-3 glass-strong rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[20px]">{selectedChar?.avatar || '👤'}</div>
                    <div>
                      <div className="text-[13px] txt-accent font-medium">
                        与 {chat.charAltName || '某人'} 的聊天
                      </div>
                      {lastMsg && (
                        <div className="text-[11px] txt-faint">
                          {new Date(lastMsg.ts).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {lastMsg && (
                    <div className="text-[12px] txt-dim pl-7">
                      {lastMsg.content.substring(0, 50)}
                      {lastMsg.content.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <div className="text-[32px] mb-2">📭</div>
              <div className="text-[13px] txt-dim">暂无聊天记录</div>
            </div>
          )}
        </div>
      )}

      {/* 朋友圈视图 */}
      {viewMode === 'moments' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-medium txt-accent">
              {selectedChar?.name} 的朋友圈
            </div>
            <button
              onClick={() => setViewMode(null)}
              className="text-[12px] txt-faint tap"
            >
              返回
            </button>
          </div>

          {charMoments.length > 0 ? (
            charMoments.map(moment => (
              <div key={moment.id} className="p-3 glass-strong rounded-xl">
                <div className="flex items-start gap-2">
                  <div className="text-[20px]">{selectedChar?.avatar || '👤'}</div>
                  <div className="flex-1">
                    <div className="text-[13px] txt-accent font-medium mb-1">
                      {selectedChar?.name}
                    </div>
                    <div className="text-[12px] txt-dim mb-2">{moment.text}</div>
                    {moment.media && moment.media.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {moment.media.slice(0, 3).map((m, i) => (
                          <div
                            key={i}
                            className="aspect-square bg-[var(--surface)] rounded-lg flex items-center justify-center text-[24px]"
                          >
                            📷
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] txt-faint">
                      {new Date(moment.ts).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="text-[32px] mb-2">📭</div>
              <div className="text-[13px] txt-dim">暂无朋友圈</div>
            </div>
          )}
        </div>
      )}
    </AppScreen>
  );
}
