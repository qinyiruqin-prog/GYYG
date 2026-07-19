import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cls } from '../utils';

/* A standard in-app screen with a header (title + back) and scrollable body.
   Every app uses this so there is always an obvious way back. */
export function AppScreen({
  title,
  onBack,
  right,
  children,
  noPad,
  headerSolid = true,
}: {
  title: ReactNode;
  onBack: () => void;
  right?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
  headerSolid?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col app-bg animate-app-open overflow-hidden">
      <div
        className={cls(
          'pt-[calc(env(safe-area-inset-top,10px)+30px)] pb-2.5 px-2 flex items-center gap-1 shrink-0 border-b border-[var(--border)]',
          headerSolid ? 'app-bg-soft' : 'transparent',
        )}
      >
        <button onClick={onBack} className="tap h-9 px-2 flex items-center gap-0.5 rounded-full text-[var(--accent)]">
          <ChevronLeft size={24} />
          <span className="text-[15px]">返回</span>
        </button>
        <div className="flex-1 text-center font-title text-base truncate px-2">{title}</div>
        <div className="min-w-[2rem] flex justify-end items-center pr-2">{right}</div>
      </div>
      <div className={cls('flex-1 overflow-y-auto no-scrollbar', !noPad && 'px-4 py-4')}>{children}</div>
    </div>
  );
}

/* A plain full-bleed app container for apps that manage their own layout. */
export function AppShell({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 z-30 app-bg animate-app-open overflow-hidden">{children}</div>;
}
