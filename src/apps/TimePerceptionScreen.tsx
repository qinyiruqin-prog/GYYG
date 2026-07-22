import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import { Clock, MapPin, Globe } from 'lucide-react';
import type { AppSettings } from '../types';

const TIMEZONES = [
  { name: '北京 (Beijing)', value: 'Asia/Shanghai' },
  { name: '纽约 (New York)', value: 'America/New_York' },
  { name: '东京 (Tokyo)', value: 'Asia/Tokyo' },
  { name: '伦敦 (London)', value: 'Europe/London' },
  { name: '巴黎 (Paris)', value: 'Europe/Paris' },
  { name: '悉尼 (Sydney)', value: 'Australia/Sydney' },
];

export function TimePerceptionScreen({
  settings,
  updateSettings,
  onBack,
}: {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  onBack: () => void;
}) {
  return (
    <AppScreen title="时间感知" onBack={onBack}>
      <div className="p-4 space-y-6">
        {/* 感知开关 */}
        <ListGroup>
          <Row
            label="时间感知"
            icon={<Clock size={18} className="txt-accent" />}
            right={
              <button
                onClick={() => updateSettings({ useRealTime: !(settings.useRealTime !== false) })}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                  settings.useRealTime !== false ? 'bg-[var(--accent)] justify-end' : 'bg-neutral-600 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </button>
            }
          />
        </ListGroup>

        {/* 自定义时间设置 (仅在关闭感知时可见) */}
        {settings.useRealTime === false && (
          <div className="glass rounded-xl p-4 space-y-3">
            <label className="text-[12px] txt-dim block">自定义时间 (ISO格式)</label>
            <input
              type="datetime-local"
              value={settings.customTime ? settings.customTime.slice(0, 16) : ''}
              onChange={(e) => updateSettings({ customTime: new Date(e.target.value).toISOString() })}
              className="w-full glass rounded-lg px-3 h-10 text-[13px] outline-none bg-transparent border border-[var(--border)]"
            />
          </div>
        )}

        {/* 时区设置 */}
        <div className="text-[13px] font-medium txt-accent">地区时区</div>
        <ListGroup>
          {TIMEZONES.map((tz) => (
            <Row
              key={tz.value}
              label={tz.name}
              icon={<Globe size={16} className="txt-faint" />}
              onClick={() => updateSettings({ timezone: tz.value })}
              right={settings.timezone === tz.value ? <CheckIcon /> : null}
            />
          ))}
        </ListGroup>
      </div>
    </AppScreen>
  );
}

function CheckIcon() {
  return <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--bg)]">✓</div>;
}