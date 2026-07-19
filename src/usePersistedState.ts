import { useEffect, useRef, useState } from 'react';
import { loadState, saveState } from './store';
import type { AppSettings, PersistShape } from './types';

export function usePersistedState() {
  const [state, setState] = useState<PersistShape>(() => loadState());
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  const updateSettings = (patch: Partial<AppSettings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const replaceState = (next: PersistShape) => setState(next);

  return { state, setState, updateSettings, replaceState };
}
