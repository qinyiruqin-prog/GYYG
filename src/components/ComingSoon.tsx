import { AppScreen } from './AppScreen';
import { Icon } from './Icon';
import { getApp } from '../apps';

export function ComingSoon({ appId, onBack }: { appId: string; onBack: () => void }) {
  const meta = getApp(appId);
  return (
    <AppScreen title={meta?.name ?? '应用'} onBack={onBack}>
      <div className="h-full flex flex-col items-center justify-center text-center -mt-16">
        <div className="w-20 h-20 rounded-[22px] icon-bg flex items-center justify-center mb-5">
          {meta && <Icon name={meta.icon} size={40} className="icon-color" />}
        </div>
        <div className="font-title text-2xl mb-2">{meta?.name}</div>
        <div className="txt-dim text-sm">敬请期待 · 后续阶段实现</div>
        <div className="mt-2 txt-faint text-xs">羊羊机 · {meta?.name} 模块建设中</div>
      </div>
    </AppScreen>
  );
}
