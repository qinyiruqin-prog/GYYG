import { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music2, ListMusic, X } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { cls } from '../utils';
import type { MusicTrack } from '../types';

export function MusicScreen({
  tracks,
  playing,
  currentIdx,
  onPlay,
  onToggle,
  onNext,
  onPrev,
  onBack,
}: {
  tracks: MusicTrack[];
  playing: boolean;
  currentIdx: number;
  onPlay: (idx: number) => void;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
}) {
  const [showList, setShowList] = useState(false);
  const current = tracks[currentIdx];
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number>(0);

  // poll audio element for progress
  useEffect(() => {
    const tick = () => {
      const a = document.querySelector('audio');
      if (a) {
        setProgress(a.currentTime || 0);
        setDuration(a.duration || 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AppScreen title="音乐" onBack={onBack} noPad>
      <div className="flex flex-col h-full">
        {/* album art area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div
            className={cls(
              'w-44 h-44 rounded-full flex items-center justify-center mb-8 relative',
              playing && 'animate-spin-slow',
            )}
            style={{
              background: 'radial-gradient(circle, var(--icon-bg-active) 15%, var(--icon-bg) 35%, var(--bg-elev) 80%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-4 rounded-full border" style={{ borderColor: 'var(--border)' }} />
            <div className="absolute inset-8 rounded-full border" style={{ borderColor: 'var(--border)' }} />
            <div className="absolute inset-12 rounded-full border" style={{ borderColor: 'var(--border)' }} />
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Music2 size={14} className="text-[var(--bg)]" />
            </div>
          </div>

          {/* track info */}
          <div className="text-center mb-6 w-full">
            <div className="font-title text-xl txt-accent truncate">{current?.name ?? '未导入音乐'}</div>
            <div className="text-[13px] txt-faint mt-1">{current?.artist ?? '未知艺术家'}</div>
          </div>

          {/* progress bar */}
          <div className="w-full mb-6">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
            <div className="flex justify-between text-[11px] txt-faint mt-1.5 tabular-nums">
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* controls */}
          <div className="flex items-center gap-8">
            <button onClick={onPrev} disabled={tracks.length === 0} className="tap txt-dim disabled:opacity-30">
              <SkipBack size={26} />
            </button>
            <button
              onClick={onToggle}
              disabled={tracks.length === 0}
              className="tap w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-30"
              style={{ background: 'var(--accent)' }}
            >
              {playing ? <Pause size={28} className="text-[var(--bg)]" /> : <Play size={28} className="text-[var(--bg)] ml-1" />}
            </button>
            <button onClick={onNext} disabled={tracks.length === 0} className="tap txt-dim disabled:opacity-30">
              <SkipForward size={26} />
            </button>
          </div>
        </div>

        {/* playlist toggle bar */}
        <button
          onClick={() => setShowList(true)}
          className="tap flex items-center gap-2 px-5 py-3 border-t border-[var(--border)] txt-dim text-[14px]"
        >
          <ListMusic size={18} />
          <span className="flex-1 text-left truncate">{current?.name ?? '播放列表'}</span>
          <span className="text-[12px] txt-faint">{tracks.length}首</span>
        </button>
      </div>

      {/* playlist sheet */}
      {showList && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setShowList(false)} />
          <div className="relative animate-slide-up glass-strong rounded-t-[28px] max-h-[70%] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <div className="font-title text-base">播放列表 · {tracks.length}首</div>
              <button onClick={() => setShowList(false)} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="px-3 pb-5 overflow-y-auto no-scrollbar flex-1">
              {tracks.length === 0 ? (
                <div className="py-10 text-center txt-faint text-sm">还没有音乐，去「我的 → 本地资源」导入</div>
              ) : (
                tracks.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => { onPlay(i); setShowList(false); }}
                    className={cls('tap w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left', i === currentIdx && 'icon-bg-active')}
                  >
                    <span className="w-5 text-center text-[12px] txt-faint tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cls('text-[14px] truncate', i === currentIdx && 'txt-accent font-medium')}>{t.name}</div>
                      <div className="text-[11px] txt-faint truncate">{t.artist ?? '未知艺术家'}</div>
                    </div>
                    {i === currentIdx && playing && (
                      <div className="flex items-end gap-0.5 h-4">
                        {[0,1,2].map((b) => (
                          <span key={b} className="w-0.5 rounded-full animate-pulse-soft" style={{ height: `${4 + b * 3}px`, background: 'var(--accent)', animationDelay: `${b*0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
