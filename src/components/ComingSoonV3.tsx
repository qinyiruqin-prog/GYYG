import { AppScreen } from '../components/AppScreen';

export function ComingSoonV3({
  title,
  icon,
  description,
  features,
  onBack,
}: {
  title: string;
  icon: string;
  description: string;
  features?: string[];
  onBack: () => void;
}) {
  return (
    <AppScreen title={title} onBack={onBack}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        {/* 图标 */}
        <div className="text-8xl mb-6 animate-pulse-soft">{icon}</div>

        {/* 标题 */}
        <div className="text-2xl font-medium mb-3 text-center">{title}</div>

        {/* 描述 */}
        <div className="text-[14px] txt-dim text-center mb-6 max-w-md">
          {description}
        </div>

        {/* v3.0 标签 */}
        <div className="px-4 py-2 rounded-full glass-strong mb-6">
          <span className="text-[12px] font-medium">🚀 v3.0 新功能</span>
        </div>

        {/* 功能列表 */}
        {features && features.length > 0 && (
          <div className="w-full max-w-md mb-6">
            <div className="text-[13px] font-medium mb-3 txt-accent">即将推出：</div>
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 glass-strong rounded-lg p-3">
                  <span className="text-[16px]">✨</span>
                  <span className="text-[13px] txt-dim flex-1">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 状态信息 */}
        <div className="glass-strong rounded-2xl p-4 w-full max-w-md">
          <div className="text-[12px] txt-faint text-center">
            <div className="mb-2">📊 开发进度</div>
            <div className="mb-3">
              <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>类型系统：✅ 完成</div>
            <div>UI界面：🔨 开发中</div>
            <div className="mt-3 text-[11px]">
              此功能已规划完成，UI正在开发中
            </div>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
