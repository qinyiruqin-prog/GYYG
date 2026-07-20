import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import type { Character, UserIdentity, ChatMessage } from '../types';

interface OfflineModeScreenProps {
  characters: Character[];
  users: UserIdentity[];
  activeUserId: string | null;
  onBack: () => void;
  onSaveOfflineActivity: (activity: OfflineActivity) => void;
  offlineActivities: OfflineActivity[];
}

export interface OfflineActivity {
  id: string;
  userId: string;
  characterId: string;
  activityType: 'date' | 'meeting' | 'event' | 'daily' | 'custom';
  title: string;
  description: string;
  location?: string;
  duration?: number; // 分钟
  mood?: 'happy' | 'normal' | 'sad' | 'excited' | 'angry';
  tags?: string[];
  photos?: string[]; // data URLs
  ts: number;
}

export function OfflineModeScreen({
  characters,
  users,
  activeUserId,
  onBack,
  onSaveOfflineActivity,
  offlineActivities,
}: OfflineModeScreenProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [activityType, setActivityType] = useState<OfflineActivity['activityType']>('date');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(60);
  const [mood, setMood] = useState<OfflineActivity['mood']>('happy');
  const [showForm, setShowForm] = useState(false);

  const activeUser = users.find(u => u.id === activeUserId);
  const selectedChar = characters.find(c => c.id === selectedCharId);

  const handleSave = () => {
    if (!selectedCharId || !title || !description) {
      alert('请填写完整信息');
      return;
    }

    const activity: OfflineActivity = {
      id: `offline_${Date.now()}`,
      userId: activeUserId || '',
      characterId: selectedCharId,
      activityType,
      title,
      description,
      location: location || undefined,
      duration: duration || undefined,
      mood,
      ts: Date.now(),
    };

    onSaveOfflineActivity(activity);

    // 重置表单
    setTitle('');
    setDescription('');
    setLocation('');
    setDuration(60);
    setMood('happy');
    setShowForm(false);

    alert('线下活动已记录！这段记忆会在线上聊天中被AI记住。');
  };

  const activityTypeLabels: Record<OfflineActivity['activityType'], string> = {
    date: '约会',
    meeting: '见面',
    event: '活动',
    daily: '日常',
    custom: '自定义',
  };

  const moodEmojis: Record<OfflineActivity['mood'], string> = {
    happy: '😊',
    normal: '😐',
    sad: '😢',
    excited: '🤩',
    angry: '😠',
  };

  // 获取当前角色的所有活动
  const currentActivities = offlineActivities
    .filter(a => a.characterId === selectedCharId)
    .sort((a, b) => b.ts - a.ts);

  return (
    <AppScreen title="线下模式" onBack={onBack}>
      {/* 说明 */}
      <div className="mb-4 p-4 glass-strong rounded-2xl">
        <div className="text-[13px] font-medium mb-2 txt-accent">📍 什么是线下模式？</div>
        <div className="text-[12px] txt-faint space-y-1">
          <div>• <strong>线上模式</strong>：在微信上发消息、打电话</div>
          <div>• <strong>线下模式</strong>：记录和角色的现实见面、约会、活动</div>
          <div>• <strong>记忆互通</strong>：AI会记住所有线下发生的事，在线上聊天时提及</div>
          <div className="mt-2 text-[11px] txt-dim">
            例如：线下记录了「去咖啡馆约会」，之后线上聊天时AI会说「今天的咖啡真好喝」
          </div>
        </div>
      </div>

      {/* 选择角色 */}
      {!showForm && (
        <>
          <div className="text-[13px] font-medium mb-2 txt-accent">选择角色</div>
          <ListGroup>
            {characters.map(char => (
              <Row
                key={char.id}
                label={char.name}
                hint={char.signature}
                icon={char.avatar || '👤'}
                onClick={() => setSelectedCharId(char.id)}
                right={
                  selectedCharId === char.id ? (
                    <span className="text-[var(--accent)]">✓</span>
                  ) : null
                }
              />
            ))}
          </ListGroup>

          {selectedCharId && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              记录线下活动
            </button>
          )}
        </>
      )}

      {/* 记录表单 */}
      {showForm && selectedChar && (
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[24px]">{selectedChar.avatar || '👤'}</span>
              <div>
                <div className="text-[14px] font-medium">{selectedChar.name}</div>
                <div className="text-[11px] txt-faint">记录与TA的线下活动</div>
              </div>
            </div>
          </div>

          {/* 活动类型 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">活动类型</div>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(activityTypeLabels) as OfflineActivity['activityType'][]).map(type => (
                <button
                  key={type}
                  onClick={() => setActivityType(type)}
                  className={`px-4 py-2 rounded-xl text-[13px] tap ${
                    activityType === type
                      ? 'bg-[var(--accent)] text-white'
                      : 'glass-strong txt-accent'
                  }`}
                >
                  {activityTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">活动标题</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：咖啡馆约会"
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 详细描述 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">详细描述</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="详细描述你们做了什么、聊了什么、发生了什么有趣的事..."
              rows={6}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none resize-none"
            />
            <div className="text-[11px] txt-faint mt-1">
              描述越详细，AI在线上聊天时记得越清楚
            </div>
          </div>

          {/* 地点 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">地点（可选）</div>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="例如：星巴克、公园、电影院"
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 时长 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">
              时长：{duration}分钟
            </div>
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[11px] txt-faint">
              <span>15分钟</span>
              <span>8小时</span>
            </div>
          </div>

          {/* 心情 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">整体心情</div>
            <div className="flex gap-2">
              {(Object.keys(moodEmojis) as OfflineActivity['mood'][]).map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex-1 py-3 rounded-xl text-[24px] tap ${
                    mood === m ? 'bg-[var(--accent)]/20 scale-110' : 'glass-strong'
                  }`}
                >
                  {moodEmojis[m]}
                </button>
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setDescription('');
                setLocation('');
              }}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              保存记录
            </button>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {selectedCharId && !showForm && currentActivities.length > 0 && (
        <div className="mt-6">
          <div className="text-[13px] font-medium mb-2 txt-accent">
            与 {selectedChar?.name} 的线下记录
          </div>
          <div className="space-y-2">
            {currentActivities.map(activity => (
              <div key={activity.id} className="p-4 glass-strong rounded-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{moodEmojis[activity.mood || 'happy']}</span>
                    <div>
                      <div className="text-[14px] font-medium txt-accent">
                        {activity.title}
                      </div>
                      <div className="text-[11px] txt-faint">
                        {activityTypeLabels[activity.activityType]} ·
                        {activity.location && ` ${activity.location} · `}
                        {new Date(activity.ts).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {activity.duration && (
                    <div className="text-[11px] txt-faint">
                      {activity.duration}分钟
                    </div>
                  )}
                </div>
                <div className="text-[12px] txt-dim">{activity.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppScreen>
  );
}
