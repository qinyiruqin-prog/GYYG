import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, PrimaryButton } from '../components/ui';
import { Modal, Confirm } from '../components/Sheet';
import { cls } from '../utils';

export interface CalendarEvent {
  id: string;
  date: string;   // YYYY-M-D
  title: string;
  color: string;  // accent | success | warning | danger
}

const WEEKS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

function dateKey(y: number, m: number, d: number) { return `${y}-${m}-${d}`; }
function parseKey(k: string) { const [y,m,d] = k.split('-').map(Number); return { y, m, d }; }

export function CalendarScreen({
  events,
  onChange,
  onBack,
}: {
  events: CalendarEvent[];
  onChange: (e: CalendarEvent[]) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('accent');
  const [confirmDel, setConfirmDel] = useState<CalendarEvent | null>(null);

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const eventsForDay = (k: string) => events.filter((e) => e.date === k);
  const selectedEvents = eventsForDay(selected).sort((a, b) => a.title.localeCompare(b.title));

  const prevMonth = () => setView((v) => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextMonth = () => setView((v) => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });
  const goToday = () => { setView({ y: today.getFullYear(), m: today.getMonth() }); setSelected(dateKey(today.getFullYear(), today.getMonth(), today.getDate())); };

  const addEvent = () => {
    if (!title.trim()) return;
    onChange([...events, { id: crypto.randomUUID(), date: selected, title: title.trim(), color }]);
    setTitle(''); setColor('accent'); setAdding(false);
  };

  const delEvent = (id: string) => onChange(events.filter((e) => e.id !== id));

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const colorMap: Record<string, string> = { accent: 'var(--accent)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' };

  return (
    <AppScreen
      title="日历"
      onBack={onBack}
      right={<button onClick={() => setAdding(true)} className="tap text-[var(--accent)] text-[15px] font-medium flex items-center gap-0.5"><Plus size={18} /></button>}
    >
      {/* month header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="tap w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronLeft size={18} /></button>
        <button onClick={goToday} className="font-title text-lg txt-accent tap">{view.y}年{MONTHS[view.m]}</button>
        <button onClick={nextMonth} className="tap w-9 h-9 rounded-full glass flex items-center justify-center"><ChevronRight size={18} /></button>
      </div>

      {/* weekday labels */}
      <div className="grid grid-cols-7 gap-0 mb-2 text-center">
        {WEEKS.map((w, i) => (
          <div key={i} className="text-[12px] txt-faint py-1">{w}</div>
        ))}
      </div>

      {/* calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />;
          const k = dateKey(view.y, view.m, day);
          const isToday = k === todayKey;
          const isSelected = k === selected;
          const dayEvents = eventsForDay(k);
          return (
            <button
              key={i}
              onClick={() => setSelected(k)}
              className={cls(
                'aspect-square flex flex-col items-center justify-center rounded-xl transition-all tap relative',
                isSelected && 'scale-[0.92]',
              )}
              style={isSelected ? { background: 'var(--icon-bg-active)' } : undefined}
            >
              <span
                className={cls('text-[14px] tabular-nums', isToday && 'font-bold')}
                style={isToday ? { color: 'var(--accent)' } : { color: 'var(--text-dim)' }}
              >
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className="w-1 h-1 rounded-full" style={{ background: colorMap[e.color] ?? 'var(--accent)' }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* selected day events */}
      <div className="mt-5">
        <div className="text-[13px] txt-dim mb-2 px-1">
          {(() => { const { m, d } = parseKey(selected); return `${m}月${d}日 · ${selectedEvents.length}个日程`; })()}
        </div>
        {selectedEvents.length === 0 ? (
          <div className="glass rounded-2xl py-8 text-center txt-faint text-sm">这一天没有日程，点右上角 + 添加</div>
        ) : (
          <ListGroup>
            {selectedEvents.map((e) => (
              <Row
                key={e.id}
                label={<span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: colorMap[e.color] }} />{e.title}</span>}
                right={<button onClick={(ev) => { ev.stopPropagation(); setConfirmDel(e); }} className="tap txt-dim"><Trash2 size={15} /></button>}
              />
            ))}
          </ListGroup>
        )}
      </div>

      {/* add event modal */}
      <Modal open={adding} onClose={() => setAdding(false)} title="添加日程">
        <div className="text-[12px] txt-dim mb-1">{(() => { const { m, d } = parseKey(selected); return `日期：${view.y}年${m}月${d}日`; })()}</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="日程标题"
          className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent placeholder:text-[var(--text-faint)] mb-3"
          autoFocus
        />
        <div className="flex gap-2 mb-4">
          {['accent','success','warning','danger'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cls('tap w-8 h-8 rounded-full transition-all', color === c && 'ring-2 ring-offset-2 ring-offset-transparent scale-110')}
              style={{ background: colorMap[c], boxShadow: color === c ? `0 0 0 2px ${colorMap[c]}` : 'none' }}
            />
          ))}
        </div>
        <PrimaryButton onClick={addEvent} disabled={!title.trim()}>添加</PrimaryButton>
      </Modal>

      <Confirm
        open={!!confirmDel}
        title="删除日程"
        message={`确定删除「${confirmDel?.title}」？`}
        danger
        onConfirm={() => { if (confirmDel) delEvent(confirmDel.id); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </AppScreen>
  );
}
