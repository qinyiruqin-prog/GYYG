import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal, BatteryMedium, BatteryLow, BatteryFull } from 'lucide-react';
import { useBatteryLevel, useOnline } from './Icon';
import { fmtTime } from '../utils';

export function StatusBar({ style = 'light' }: { style?: 'light' | 'dark' }) {
  const [now, setNow] = useState(new Date());
  const battery = useBatteryLevel();
  const online = useOnline();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  const dark = style === 'dark';
  const color = dark ? 'text-white' : 'text-black';
  const pct = Math.round(battery * 100);
  const BatteryIcon = pct > 70 ? BatteryFull : pct > 25 ? BatteryMedium : BatteryLow;

  return (
    <div className={`absolute top-0 inset-x-0 z-40 h-11 px-7 flex items-center justify-between text-[13px] font-semibold pointer-events-none ${color}`}>
      <div className="tabular-nums tracking-tight">{fmtTime(now)}</div>
      <div className="flex items-center gap-1.5">
        {online ? (
          <>
            <Signal size={15} strokeWidth={2.4} />
            <Wifi size={15} strokeWidth={2.4} />
          </>
        ) : (
          <WifiOff size={15} strokeWidth={2.4} />
        )}
        <span className="tabular-nums text-[11px] opacity-90 w-7 text-right">{pct}%</span>
        <BatteryIcon size={18} strokeWidth={1.8} />
      </div>
    </div>
  );
}
