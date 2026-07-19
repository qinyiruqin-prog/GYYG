import { useEffect, useState } from 'react';
import * as Lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Icon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const Cmp = (Lucide as unknown as Record<string, LucideIcon>)[name];
  if (!Cmp) return null;
  return <Cmp size={size} className={className} strokeWidth={1.4} />;
}

/* ---------- battery helper ---------- */
export function useBatteryLevel() {
  const [level, setLevel] = useState(0.82);
  useEffect(() => {
    let mounted = true;
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener: (e: string, cb: () => void) => void }> };
    if (nav.getBattery) {
      nav.getBattery().then((b) => {
        if (!mounted) return;
        const update = () => setLevel(b.level);
        update();
        b.addEventListener('levelchange', update);
      }).catch(() => {});
    } else {
      // simulate slight drain
      const t = setInterval(() => setLevel((l) => Math.max(0.12, l - 0.001)), 60000);
      return () => clearInterval(t);
    }
    return () => { mounted = false; };
  }, []);
  return level;
}

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
