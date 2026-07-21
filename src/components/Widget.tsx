import React, { useState, useEffect } from 'react';
import { Music2, Play, Pause, Image as ImageIcon, Quote, Footprints, Sparkles, KeyRound, BookOpen, Camera } from 'lucide-react';
import type { MusicTrack, AlbumImage } from '../types';
import { cls } from '../utils';

type ShortcutsAction = 'assistant' | 'apiPreset' | 'manual';

export function Widget({
  kind,
  music,
  album,
  playing,
  currentName,
  onTogglePlay,
  onShortcut,
}: {
  kind: 'fullCalendar' | 'quoteSteps' | 'helloClock' | 'monthStrip' | 'vinylPhoto' | 'miniMusicCal' | 'shortcuts';
  music: MusicTrack[];
  album: AlbumImage[];
  playing: boolean;
  currentName?: string;
  onTogglePlay: () => void;
  onShortcut: (a: ShortcutsAction) => void;
}) {
  switch (kind) {
    case 'fullCalendar': return <FullCalendarWidget />;
    case 'quoteSteps': return <QuoteStepsWidget />;
    case 'helloClock': return <HelloClockWidget />;
    case 'monthStrip': return <MonthStripWidget />;
    case 'vinylPhoto': return <VinylPhotoWidget music={music} album={album} playing={playing} currentName={currentName} onTogglePlay={onTogglePlay} />;
    case 'miniMusicCal': return <MiniMusicCalWidget music={music} playing={playing} currentName={currentName} onTogglePlay={onTogglePlay} />;
    case 'shortcuts': return <ShortcutsWidget onAction={onShortcut} />;
  }
}

/* Minimal card: soft translucent, no border, subtle shadow */
function Card({ children, className = '', noPad }: { children: React.ReactNode; className?: string; noPad?: boolean }) {
  return (
    <div className={`glass rounded-[22px] ${noPad ? '' : 'p-4'} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Full Month Calendar (page 2 main) ---------- */
function FullCalendarWidget() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const today = d.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="font-title text-[17px] txt-accent">{year}年{month + 1}月</div>
        <div className="text-[11px] txt-faint">0个日程</div>
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {weeks.map((w, i) => (
          <div key={i} className="text-[11px] txt-faint pb-1">{w}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center py-0.5">
            {day && (
              <div
                className={cls(
                  'w-7 h-7 flex items-center justify-center text-[13px] rounded-full transition-all',
                  day === today ? 'font-medium' : 'txt-dim',
                )}
                style={day === today ? { background: 'var(--accent)', color: 'var(--bg)' } : undefined}
              >
                {day}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Quote + Steps side by side (page 2 bottom) ---------- */
function QuoteStepsWidget() {
  const stepCount = 6557;
  const pct = Math.min(stepCount / 10000, 1);
  const circumference = 2 * Math.PI * 26;

  return (
    <div className="flex gap-3">
      <Card className="flex-1">
        <div className="text-[11px] txt-faint mb-2 flex items-center gap-1">
          <Quote size={11} /> 今日箴言
        </div>
        <div className="font-title text-[15px] leading-relaxed txt-accent mb-2">
          把日子过成诗，<br />不必声张。
        </div>
        <div className="text-[11px] txt-faint">一日一记</div>
      </Card>
      <Card className="w-[124px] flex flex-col items-center justify-center">
        <div className="relative w-14 h-14 mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="26" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="26" fill="none" stroke="var(--accent)" strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints size={12} className="txt-dim mb-0.5" />
            <div className="text-[12px] font-medium txt-accent tabular-nums">{stepCount.toLocaleString()}</div>
          </div>
        </div>
        <div className="text-[10px] txt-faint">步数</div>
      </Card>
    </div>
  );
}

/* ---------- Hello Clock (page 1 top) with real moon phase ---------- */
function moonPhase(date: Date): { phase: number; emoji: string; name: string } {
  // Conway's algorithm
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= (year < 2000) ? 4 : 8.3;
  r = Math.floor(r + 0.5) % 30;
  const phase = r < 0 ? r + 30 : r; // 0..29

  const names: Record<number, { name: string; emoji: string }> = {
    0: { name: '新月', emoji: '🌑' },
    1: { name: '蛾眉月', emoji: '🌒' },
    2: { name: '蛾眉月', emoji: '🌒' },
    3: { name: '蛾眉月', emoji: '🌒' },
    4: { name: '蛾眉月', emoji: '🌒' },
    5: { name: '蛾眉月', emoji: '🌒' },
    6: { name: '上弦月', emoji: '🌓' },
    7: { name: '盈凸月', emoji: '🌔' },
    8: { name: '盈凸月', emoji: '🌔' },
    9: { name: '盈凸月', emoji: '🌔' },
    10: { name: '盈凸月', emoji: '🌔' },
    11: { name: '盈凸月', emoji: '🌔' },
    12: { name: '满月', emoji: '🌕' },
    13: { name: '亏凸月', emoji: '🌖' },
    14: { name: '亏凸月', emoji: '🌖' },
    15: { name: '亏凸月', emoji: '🌖' },
    16: { name: '亏凸月', emoji: '🌖' },
    17: { name: '亏凸月', emoji: '🌖' },
    18: { name: '下弦月', emoji: '🌗' },
    19: { name: '残月', emoji: '🌘' },
    20: { name: '残月', emoji: '🌘' },
    21: { name: '残月', emoji: '🌘' },
    22: { name: '残月', emoji: '🌘' },
    23: { name: '残月', emoji: '🌘' },
    24: { name: '新月', emoji: '🌑' },
  };
  const fallback = { name: '新月', emoji: '🌑' };
  const info = names[phase] ?? fallback;
  return { phase, ...info };
}

function HelloClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][time.getDay()];
  const dateStr = `${time.getFullYear()}/${(time.getMonth() + 1).toString().padStart(2, '0')}/${time.getDate().toString().padStart(2, '0')} ${week}`;
  const moon = moonPhase(time);

  return (
    <Card className="!border-none !py-3 !px-4 shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-[10px] txt-faint tracking-[0.15em] mb-0.5">HELLO</div>
          <div className="text-[11px] txt-dim mb-1 flex items-center gap-1.5">
            <span>{dateStr}</span>
            <span className="txt-faint">•</span>
            <span>北京</span>
          </div>
          <div className="font-title text-[36px] leading-none txt-accent tabular-nums">
            {hh}<span className="animate-pulse-soft">:</span>{mm}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="text-[24px] leading-none">{moon.emoji}</div>
          <div className="text-[10px] txt-faint mt-1">{moon.name}</div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Month Strip (page 1) ---------- */
function MonthStripWidget() {
  const d = new Date();
  const curMonth = d.getMonth();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <Card className="py-3">
      <div className="flex items-center justify-between">
        {months.map((m, i) => (
          <div
            key={m}
            className={cls(
              'text-[11px] tracking-wider transition-all',
              i === curMonth ? 'font-bold txt-accent scale-110' : 'txt-faint',
            )}
          >
            {m}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Vinyl + Photo side by side (page 1) ----------
   Reference: vinyl disc floats with NO card border.
   Photo is a soft rounded image with no heavy frame. */
function VinylPhotoWidget({ music, album, playing, currentName, onTogglePlay }: { music: MusicTrack[]; album: AlbumImage[]; playing: boolean; currentName?: string; onTogglePlay: () => void }) {
  return (
    <div className="flex gap-3 items-stretch">
      {/* vinyl disc — borderless, floats on wallpaper */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[130px]">
        <div
          className={cls(
            'w-20 h-20 rounded-full relative mb-2',
            playing && 'animate-spin-slow',
          )}
          style={{
            background: 'radial-gradient(circle, var(--icon-bg-active) 18%, var(--icon-bg) 38%, var(--bg-elev) 100%)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
          }}
        >
          <div className="absolute inset-3 rounded-full border" style={{ borderColor: 'var(--border)' }} />
          <div className="absolute inset-6 rounded-full border" style={{ borderColor: 'var(--border)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>
        <div className="text-[12px] txt-dim mb-1">{currentName ?? '自由编辑'}</div>
        <button
          onClick={onTogglePlay}
          disabled={music.length === 0}
          className="tap flex items-center gap-1 text-[11px] px-3 py-1 rounded-full disabled:opacity-40"
          style={{ background: 'var(--icon-bg)' }}
        >
          {playing ? <Pause size={11} /> : <Play size={11} />} {playing ? '暂停' : '播放'}
        </button>
      </div>
      {/* photo — 拍立得风格，保持原来大小 */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[130px]">
        {album.length > 0 ? (
          <>
            <div
              className="relative w-full"
              style={{ transform: 'rotate(-3deg)' }}
            >
              {/* 拍立得相框 - 保持原来的宽度 */}
              <div
                className="bg-white rounded-[10px] shadow-2xl mx-auto"
                style={{
                  maxWidth: '150px',
                  padding: '6px 6px 20px 6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {/* 照片 - 正方形 */}
                <img
                  src={album[0].url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-[6px]"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  }}
                />
              </div>
              {/* 胶带装饰 */}
              <div
                className="absolute -top-1 left-1/2 w-12 h-3 opacity-40"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 10%, rgba(255,255,255,0.6) 90%, transparent)',
                  backdropFilter: 'blur(1px)',
                  transform: 'translateX(-50%) rotate(2deg)',
                }}
              />
            </div>
            <div className="flex items-center gap-1 text-[10px] txt-faint mt-2">
              <ImageIcon size={10} /> 相册
            </div>
          </>
        ) : (
          <div
            className="relative w-full"
            style={{ transform: 'rotate(-3deg)' }}
          >
            {/* 空拍立得 - 保持原来的宽度 */}
            <div
              className="bg-white rounded-[10px] shadow-2xl flex flex-col items-center justify-center mx-auto"
              style={{
                maxWidth: '150px',
                padding: '6px 6px 20px 6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <div className="w-full aspect-square flex flex-col items-center justify-center rounded-[6px]" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <Camera size={24} className="text-gray-300 mb-1" />
                <div className="text-[10px] text-gray-400">添加照片</div>
              </div>
            </div>
            {/* 胶带装饰 */}
            <div
              className="absolute -top-1 left-1/2 w-12 h-3 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 10%, rgba(255,255,255,0.6) 90%, transparent)',
                backdropFilter: 'blur(1px)',
                transform: 'translateX(-50%) rotate(2deg)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Mini Music + Calendar side by side (page 1) ----------
   Reference: music has NO border/frame, just a small disc + text inline. */
function MiniMusicCalWidget({ music, playing, currentName, onTogglePlay }: { music: MusicTrack[]; playing: boolean; currentName?: string; onTogglePlay: () => void }) {
  const d = new Date();
  const week = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()];

  return (
    <div className="flex gap-3">
      {/* mini music — borderless inline row */}
      <div className="flex-1 flex items-center gap-3 px-1">
        <div
          className={cls('w-10 h-10 rounded-full flex items-center justify-center shrink-0', playing && 'animate-spin-slow')}
          style={{ background: 'radial-gradient(circle, var(--icon-bg-active) 25%, var(--icon-bg) 70%)' }}
        >
          <Music2 size={16} className="icon-line" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium truncate txt-dim">{currentName ?? '未导入音乐'}</div>
          <div className="text-[10px] txt-faint">音乐</div>
        </div>
        <button
          onClick={onTogglePlay}
          disabled={music.length === 0}
          className="tap w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: 'var(--icon-bg)' }}
        >
          {playing ? <Pause size={13} className="icon-line" /> : <Play size={13} className="icon-line ml-0.5" />}
        </button>
      </div>
      {/* mini calendar */}
      <Card className="w-[88px] flex flex-col items-center justify-center" noPad>
        <div className="font-title text-[26px] leading-none txt-accent pt-3">{d.getDate()}</div>
        <div className="text-[10px] txt-faint mt-1">今天</div>
        <div className="text-[10px] txt-faint pb-3">{week}</div>
      </Card>
    </div>
  );
}

/* ---------- Shortcuts widget (3 entries) ---------- */
function ShortcutsWidget({ onAction }: { onAction: (a: ShortcutsAction) => void }) {
  const items = [
    { id: 'assistant' as const, name: '羊羊助手', desc: '问答 AI', icon: Sparkles },
    { id: 'apiPreset' as const, name: 'API 预设', desc: '手动切换', icon: KeyRound },
    { id: 'manual' as const, name: '使用手册', desc: '查看说明', icon: BookOpen },
  ];
  return (
    <Card>
      <div className="flex items-center gap-1.5 mb-3 txt-dim text-[12px]">
        <Sparkles size={14} /> 快捷方式
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onAction(it.id)}
            className="tap flex flex-col items-center gap-1.5 p-2.5 rounded-2xl"
            style={{ background: 'var(--icon-bg)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--icon-bg-active)' }}>
              <it.icon size={18} className="icon-line" />
            </div>
            <div className="text-center">
              <div className="text-[12px] font-medium">{it.name}</div>
              <div className="text-[10px] txt-faint">{it.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

export type { ShortcutsAction };
