import { useEffect } from 'react';
import { PhoneShell } from './components/PhoneShell';
import { usePersistedState } from './usePersistedState';
import { applyTheme } from './themes';

export default function App() {
  const { state, updateSettings, replaceState } = usePersistedState();

  useEffect(() => {
    applyTheme(state.settings.themeId);
  }, [state.settings.themeId]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-4 relative">
      {/* device frame on larger screens; full-bleed on phones */}
      <div 
        className="relative w-full h-[100dvh] transition-all duration-500 ease-in-out overflow-hidden bg-black flex flex-col pt-[calc(env(safe-area-inset-top,10px)+4px)] pb-[env(safe-area-inset-bottom,10px)] sm:pt-0 sm:pb-0 sm:h-[860px] sm:max-h-[92vh] sm:w-[420px] sm:rounded-[52px] sm:border-[10px] sm:border-black sm:shadow-2xl"
      >
        <PhoneShell state={state} settings={state.settings} updateSettings={updateSettings} replaceState={replaceState} />
      </div>
    </div>
  );
}
