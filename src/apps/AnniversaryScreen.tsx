import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';

interface AnniversaryScreenProps {
  anniversaries: Anniversary[];
  onBack: () => void;
  onAdd: (anniversary: Omit<Anniversary, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export interface Anniversary {
  id: string;
  title: string;
  date: number; // 时间戳
  type: 'birthday' | 'love' | 'friendship' | 'custom';
  reminder: boolean; // 是否提醒
  reminderDays: number; // 提前几天提醒
  description?: string;
  emoji?: string;
  createdAt: number;
}

export function AnniversaryScreen({
  anniversaries,
  onBack,
  onAdd,
  onDelete,
}: AnniversaryScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<Anniversary['type']>('custom');
  const [reminder, setReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🎉');

  const typeLabels: Record<Anniversary['type'], string> = {
    birthday: '生日',
    love: '恋爱纪念日',
    friendship: '友谊纪念日',
    custom: '自定义',
  };

  const emojiOptions = ['🎉', '🎂', '💕', '🎁', '🌟', '💐', '🎈', '🥳'];

  const handleAdd = () => {
    if (!title || !date) {
      alert('请填写完整信息');
      return;
    }

    onAdd({
      title,
      date: new Date(date).getTime(),
      type,
      reminder,
      reminderDays,
      description: description || undefined,
      emoji: emoji || undefined,
    });

    // 重置表单
    setTitle('');
    setDate('');
    setType('custom');
    setReminder(true);
    setReminderDays(7);
    setDescription('');
    setEmoji('🎉');
    setShowForm(false);

    alert('纪念日添加成功！');
  };

  const getDaysUntil = (dateTs: number) => {
    const now = Date.now();
    const target = new Date(dateTs);
    const currentYear = new Date().getFullYear();

    // 设置今年的纪念日
    target.setFullYear(currentYear);

    // 如果今年的纪念日已经过了，显示明年的
    if (target.getTime() < now) {
      target.setFullYear(currentYear + 1);
    }

    const diff = target.getTime() - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // 按照即将到来的顺序排序
  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    const daysA = getDaysUntil(a.date);
    const daysB = getDaysUntil(b.date);
    return daysA - daysB;
  });

  return (
    <AppScreen title="纪念日" onBack={onBack}>
      {!showForm ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">🎁 纪念日提醒</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 记录重要的日子，不再忘记</div>
              <div>• 自动计算距离纪念日的天数</div>
              <div>• 提前提醒，准备惊喜</div>
              <div>• 生日、恋爱纪念日、自定义</div>
            </div>
          </div>

          {/* 添加按钮 */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap flex items-center justify-center gap-2"
          >
            <span className="text-[18px]">➕</span>
            <span>添加纪念日</span>
          </button>

          {/* 纪念日列表 */}
          {sortedAnniversaries.length > 0 ? (
            <div className="space-y-2">
              {sortedAnniversaries.map(ann => {
                const daysUntil = getDaysUntil(ann.date);
                const originalDate = new Date(ann.date);

                return (
                  <div
                    key={ann.id}
                    className="p-4 glass-strong rounded-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-[32px]">{ann.emoji || '🎉'}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-[14px] txt-accent font-medium">
                            {ann.title}
                          </div>
                          <div className="text-[10px] px-2 py-0.5 bg-[var(--accent)]/20 rounded txt-accent">
                            {typeLabels[ann.type]}
                          </div>
                        </div>

                        <div className="text-[12px] txt-faint mb-2">
                          {originalDate.getMonth() + 1}月{originalDate.getDate()}日
                        </div>

                        {ann.description && (
                          <div className="text-[11px] txt-dim mb-2">
                            {ann.description}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {daysUntil === 0 ? (
                            <div className="text-[12px] px-2 py-1 bg-red-500/20 text-red-400 rounded font-medium">
                              🎉 今天！
                            </div>
                          ) : daysUntil <= 7 ? (
                            <div className="text-[12px] px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                              ⏰ 还有 {daysUntil} 天
                            </div>
                          ) : (
                            <div className="text-[11px] txt-faint">
                              还有 {daysUntil} 天
                            </div>
                          )}

                          {ann.reminder && (
                            <div className="text-[10px] txt-faint flex items-center gap-1">
                              <span>🔔</span>
                              <span>提前{ann.reminderDays}天提醒</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`确定删除"${ann.title}"吗？`)) {
                            onDelete(ann.id);
                          }
                        }}
                        className="text-[20px] tap opacity-50 hover:opacity-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-[48px] mb-2">📅</div>
              <div className="text-[14px] txt-dim mb-1">还没有纪念日</div>
              <div className="text-[12px] txt-faint">点击上方按钮添加重要的日子</div>
            </div>
          )}
        </>
      ) : (
        /* 添加表单 */
        <div className="space-y-4">
          {/* Emoji */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">选择图标</div>
            <div className="flex gap-2 flex-wrap">
              {emojiOptions.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-12 h-12 rounded-xl text-[24px] tap flex items-center justify-center ${
                    emoji === e ? 'bg-[var(--accent)] scale-110' : 'glass-strong'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* 类型 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">类型</div>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(typeLabels) as Anniversary['type'][]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-xl text-[13px] tap ${
                    type === t
                      ? 'bg-[var(--accent)] text-white'
                      : 'glass-strong txt-accent'
                  }`}
                >
                  {typeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">标题</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：小明的生日"
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 日期 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">日期</div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none"
            />
          </div>

          {/* 描述 */}
          <div>
            <div className="text-[13px] font-medium mb-2 txt-accent">描述（可选）</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="添加一些备注..."
              rows={3}
              className="w-full p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none resize-none"
            />
          </div>

          {/* 提醒设置 */}
          <div className="p-4 glass-strong rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] txt-accent">开启提醒</div>
              <input
                type="checkbox"
                checked={reminder}
                onChange={e => setReminder(e.target.checked)}
                className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
              />
            </div>

            {reminder && (
              <div>
                <div className="text-[13px] txt-accent mb-2">
                  提前 {reminderDays} 天提醒
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={reminderDays}
                  onChange={e => setReminderDays(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px] txt-faint mt-1">
                  <span>1天</span>
                  <span>30天</span>
                </div>
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setTitle('');
                setDate('');
                setDescription('');
              }}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              添加
            </button>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
