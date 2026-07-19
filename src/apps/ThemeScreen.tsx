import { AppScreen } from '../components/AppScreen';
import { THEMES } from '../themes';
import { Check } from 'lucide-react';

export function ThemeScreen({
  current,
  onPick,
  onBack,
}: {
  current: string;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <AppScreen title="主题" onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const active = current === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="rounded-2xl overflow-hidden relative tap"
              style={{ background: t.vars['--bg-soft'], color: t.vars['--text'], border: `1px solid ${active ? t.vars['--accent'] : t.vars['--border']}` }}
            >
              <div className="h-24 relative" style={{ background: t.vars['--wallpaper'] }}>
                <div className="absolute left-3 top-3 w-8 h-8 rounded-lg" style={{ background: t.vars['--icon-bg'], boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                <div className="absolute left-3 top-14 w-8 h-8 rounded-lg" style={{ background: t.vars['--icon-bg-active'] }} />
                <div className="absolute right-3 top-3 w-10 h-5 rounded-full" style={{ background: t.vars['--accent'], opacity: 0.7 }} />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5" style={{ background: t.vars['--bg-soft'] }}>
                <span className="font-title text-[15px]">{t.name}</span>
                {active && <Check size={16} style={{ color: t.vars['--accent'] }} />}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-5 text-[12px] txt-faint text-center">共 {THEMES.length} 套配色 · 切换后全局联动</div>
    </AppScreen>
  );
}
