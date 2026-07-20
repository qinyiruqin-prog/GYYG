import { useEffect, useState } from 'react';
import { PhoneShell } from './components/PhoneShell';
import { usePersistedState } from './usePersistedState';
import { applyTheme } from './themes';

export default function App() {
  const { state, updateSettings, replaceState } = usePersistedState();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    applyTheme(state.settings.themeId);
  }, [state.settings.themeId]);

  // 注册 Service Worker 并监听更新
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW 注册成功:', registration);

          // 监听更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // 定期检查更新（每小时）
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((err) => {
          console.error('SW 注册失败:', err);
        });

      // 监听 SW 消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-4 relative">
      {/* 更新提示 */}
      {updateAvailable && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-banner-down">
          <div className="glass-strong rounded-full px-6 py-3 flex items-center gap-3 shadow-2xl border-2 border-[var(--accent)]">
            <span className="text-[13px]">🎉 新版本可用</span>
            <button
              onClick={handleUpdate}
              className="tap bg-[var(--accent)] text-black px-4 py-1.5 rounded-full text-[12px] font-medium"
            >
              立即更新
            </button>
          </div>
        </div>
      )}

      {/* 设备框架 - 大屏显示手机外框，小屏全屏 */}
      <div
        className="relative w-full h-[100dvh] transition-all duration-500 ease-in-out overflow-hidden bg-black flex flex-col pt-[calc(env(safe-area-inset-top,10px)+4px)] pb-[env(safe-area-inset-bottom,10px)] sm:pt-0 sm:pb-0 sm:h-[860px] sm:max-h-[92vh] sm:w-[420px] sm:max-w-[95vw] sm:rounded-[52px] sm:border-[10px] sm:border-black sm:shadow-2xl"
      >
        <PhoneShell state={state} settings={state.settings} updateSettings={updateSettings} replaceState={replaceState} />
      </div>
    </div>
  );
}
