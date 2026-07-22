import { useEffect, useRef, useState } from 'react';
import { loadState, saveState } from './store';
import type { AppSettings, PersistShape } from './types';

export function usePersistedState() {
  const [state, setState] = useState<PersistShape>(() => loadState());
  const first = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    // 防抖保存：避免频繁写入 localStorage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveState(state);
    }, 300); // 300ms 防抖

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // 页面卸载前强制保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveState(state);
      console.log('🚪 页面关闭前保存数据');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 页面隐藏时也保存（切换标签页、最小化等）
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveState(state);
        console.log('👁️ 页面隐藏时保存数据');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state]);

  const updateSettings = (patch: Partial<AppSettings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const replaceState = (next: PersistShape) => setState(next);

  return { state, setState, updateSettings, replaceState };
}
