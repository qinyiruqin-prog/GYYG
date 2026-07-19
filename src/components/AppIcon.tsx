import { useRef } from 'react';
import { Icon } from './Icon';
import { getApp } from '../apps';
import { cls } from '../utils';

export function AppIcon({
  appId,
  size = 'md',
  onOpen,
  jiggle,
  onLongPress,
  onRemove,
  showLabel = true,
}: {
  key?: any;
  appId: string;
  size?: 'sm' | 'md' | 'lg';
  onOpen: () => void;
  jiggle?: boolean;
  onLongPress?: () => void;
  onRemove?: () => void;
  showLabel?: boolean;
}) {
  const meta = getApp(appId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong = useRef(false);

  if (!meta) return null;

  const isBall = !!meta.shortcutBall;
  const iconSz = size === 'lg' ? 30 : size === 'sm' ? 22 : 26;

  const start = () => {
    didLong.current = false;
    timerRef.current = setTimeout(() => {
      didLong.current = true;
      onLongPress?.();
    }, 550);
  };
  const cancel = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const tap = () => { if (!didLong.current && !jiggle) onOpen(); };

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerMove={cancel}
      onClick={tap}
      className={cls('flex flex-col items-center gap-1 relative select-none tap', jiggle && 'animate-jiggle')}
      style={{ width: size === 'sm' ? 52 : 60 }}
    >
      <div className="relative">
        {isBall ? (
          /* emoji ball — a filled circle with emoji, floats on wallpaper */
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: size === 'sm' ? 40 : 48,
              height: size === 'sm' ? 40 : 48,
              fontSize: size === 'sm' ? 20 : 24,
              background: 'var(--icon-bg-active)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              lineHeight: 1,
            }}
          >
            {meta.emoji}
          </div>
        ) : (
          <div className="flex items-center justify-center" style={{ width: 44, height: 44 }}>
            <Icon name={meta.icon} size={iconSz} className="icon-line" />
          </div>
        )}

        {jiggle && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md"
            style={{ background: 'var(--danger)', lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {showLabel && (
        <span
          className="text-[11px] truncate max-w-[60px] text-center leading-tight"
          style={{ color: 'var(--text-dim)' }}
        >
          {meta.name}
        </span>
      )}
    </button>
  );
}
