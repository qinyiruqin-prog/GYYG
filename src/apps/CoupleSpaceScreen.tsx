import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import type { Character } from '../types';

interface CoupleSpaceScreenProps {
  characters: Character[];
  couples: CoupleRelation[];
  onBack: () => void;
  onCreateCouple: (charId: string, anniversary: number) => void;
  onGenerateCoupleAvatar: (charId: string) => Promise<string>;
  onLockPhone: (charId: string, duration: number) => void;
}

export interface CoupleRelation {
  id: string;
  characterId: string;
  userId: string;
  anniversary: number; // 纪念日时间戳
  coupleAvatars?: {
    user: string; // data URL
    character: string; // data URL
  };
  timeline: CoupleEvent[];
  settings: {
    allowLockPhone: boolean; // 是否允许角色锁手机
    lockDuration: number; // 锁定时长（分钟）
  };
  createdAt: number;
}

export interface CoupleEvent {
  id: string;
  type: 'anniversary' | 'date' | 'gift' | 'quarrel' | 'makeup' | 'custom';
  title: string;
  description: string;
  ts: number;
  mood?: 'happy' | 'sweet' | 'sad' | 'angry';
}

export function CoupleSpaceScreen({
  characters,
  couples,
  onBack,
  onCreateCouple,
  onGenerateCoupleAvatar,
  onLockPhone,
}: CoupleSpaceScreenProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [anniversary, setAnniversary] = useState('');
  const [generating, setGenerating] = useState(false);

  const selectedChar = characters.find(c => c.id === selectedCharId);
  const coupleRelation = couples.find(c => c.characterId === selectedCharId);

  const handleCreateCouple = () => {
    if (!selectedCharId) {
      alert('请选择角色');
      return;
    }

    if (!anniversary) {
      alert('请选择纪念日');
      return;
    }

    const anniversaryTs = new Date(anniversary).getTime();
    onCreateCouple(selectedCharId, anniversaryTs);
    setShowCreateForm(false);
    alert('情侣空间创建成功！');
  };

  const handleGenerateAvatar = async () => {
    if (!selectedCharId) return;

    setGenerating(true);
    try {
      await onGenerateCoupleAvatar(selectedCharId);
      alert('情侣头像生成成功！');
    } catch (err) {
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleLockPhone = (duration: number) => {
    if (!selectedCharId) return;

    const confirmed = confirm(
      `确定让 ${selectedChar?.name} 锁定你的手机 ${duration} 分钟吗？\n锁定期间无法使用羊羊机。`
    );

    if (confirmed) {
      onLockPhone(selectedCharId, duration);
      alert(`手机已被 ${selectedChar?.name} 锁定 ${duration} 分钟！`);
    }
  };

  // 计算恋爱天数
  const getLoveDays = (anniversaryTs: number) => {
    const now = Date.now();
    const diff = now - anniversaryTs;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const eventTypeLabels: Record<CoupleEvent['type'], string> = {
    anniversary: '纪念日',
    date: '约会',
    gift: '礼物',
    quarrel: '吵架',
    makeup: '和好',
    custom: '自定义',
  };

  const moodEmojis: Record<NonNullable<CoupleEvent['mood']>, string> = {
    happy: '😊',
    sweet: '🥰',
    sad: '😢',
    angry: '😠',
  };

  return (
    <AppScreen title="情侣空间" onBack={onBack}>
      {/* 说明 */}
      <div className="mb-4 p-4 glass-strong rounded-2xl">
        <div className="text-[13px] font-medium mb-2 txt-accent">💑 情侣空间</div>
        <div className="text-[12px] txt-faint space-y-1">
          <div>• 专属的情侣空间，记录美好时光</div>
          <div>• AI生成情侣头像</div>
          <div>• 恋爱天数自动计算</div>
          <div>• 锁手机功能（角色可以锁定你的手机）</div>
          <div>• 情侣时间轴</div>
        </div>
      </div>

      {!showCreateForm && !coupleRelation && (
        <>
          {/* 选择角色 */}
          <div className="text-[13px] font-medium mb-2 txt-accent">选择你的TA</div>
          <ListGroup>
            {characters.map(char => {
              const hasCouple = couples.some(c => c.characterId === char.id);
              return (
                <Row
                  key={char.id}
                  icon={char.avatar || '👤'}
                  label={char.name}
                  hint={hasCouple ? '已建立情侣空间' : char.signature}
                  onClick={() => !hasCouple && setSelectedCharId(char.id)}
                  right={
                    hasCouple ? (
                      <span className="text-[var(--accent)]">💑</span>
                    ) : selectedCharId === char.id ? (
                      <span className="text-[var(--accent)]">✓</span>
                    ) : null
                  }
                />
              );
            })}
          </ListGroup>

          {selectedCharId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              建立情侣空间
            </button>
          )}
        </>
      )}

      {/* 创建表单 */}
      {showCreateForm && selectedChar && (
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl text-center">
            <div className="text-[48px] mb-2">💑</div>
            <div className="text-[14px] font-medium txt-accent mb-1">
              与 {selectedChar.name} 建立情侣空间
            </div>
            <div className="text-[11px] txt-faint">{selectedChar.signature}</div>
          </div>

          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">纪念日</div>
            <input
              type="date"
              value={anniversary}
              onChange={e => setAnniversary(e.target.value)}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
            <div className="text-[11px] txt-faint mt-1">选择你们在一起的日期</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSelectedCharId('');
                setAnniversary('');
              }}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              取消
            </button>
            <button
              onClick={handleCreateCouple}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              创建
            </button>
          </div>
        </div>
      )}

      {/* 情侣空间主界面 */}
      {coupleRelation && selectedChar && (
        <div className="space-y-4">
          {/* 顶部卡片 */}
          <div className="p-4 glass-strong rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-[32px]">👤</div>
                <div className="text-[24px]">💕</div>
                <div className="text-[32px]">{selectedChar.avatar || '👤'}</div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold txt-accent">
                  {getLoveDays(coupleRelation.anniversary)}
                </div>
                <div className="text-[11px] txt-faint">天</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-[13px] txt-accent mb-1">
                我们在一起的第 {getLoveDays(coupleRelation.anniversary)} 天
              </div>
              <div className="text-[11px] txt-faint">
                {new Date(coupleRelation.anniversary).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* 功能按钮 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGenerateAvatar}
              disabled={generating}
              className="p-4 glass-strong rounded-xl tap disabled:opacity-50"
            >
              <div className="text-[32px] mb-1">🎨</div>
              <div className="text-[13px] txt-accent font-medium">
                {generating ? '生成中...' : '生成情侣头像'}
              </div>
              <div className="text-[10px] txt-faint">AI生成专属头像</div>
            </button>

            <button
              onClick={() => handleLockPhone(30)}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">🔒</div>
              <div className="text-[13px] txt-accent font-medium">锁手机</div>
              <div className="text-[10px] txt-faint">让TA锁定30分钟</div>
            </button>

            <button
              onClick={() => alert('时间轴功能开发中...')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">📅</div>
              <div className="text-[13px] txt-accent font-medium">情侣时间轴</div>
              <div className="text-[10px] txt-faint">记录美好瞬间</div>
            </button>

            <button
              onClick={() => alert('相册功能开发中...')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">📷</div>
              <div className="text-[13px] txt-accent font-medium">情侣相册</div>
              <div className="text-[10px] txt-faint">专属相册</div>
            </button>
          </div>

          {/* 时间轴 */}
          {coupleRelation.timeline.length > 0 && (
            <div>
              <div className="text-[13px] font-medium mb-2 txt-accent">我们的故事</div>
              <div className="space-y-2">
                {coupleRelation.timeline.slice(0, 5).map(event => (
                  <div key={event.id} className="p-3 glass-strong rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="text-[20px]">
                        {event.mood ? moodEmojis[event.mood] : '📌'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-[13px] txt-accent font-medium">
                            {event.title}
                          </div>
                          <div className="text-[10px] px-1.5 py-0.5 bg-[var(--accent)]/20 rounded txt-accent">
                            {eventTypeLabels[event.type]}
                          </div>
                        </div>
                        <div className="text-[12px] txt-dim mb-1">
                          {event.description}
                        </div>
                        <div className="text-[10px] txt-faint">
                          {new Date(event.ts).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppScreen>
  );
}
