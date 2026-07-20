import { ComingSoonV3 } from '../components/ComingSoonV3';

export function AnniversaryScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="纪念日"
      icon="🎁"
      description="记录重要的日子，AI角色会在特殊日子给你惊喜和祝福"
      features={[
        '添加生日、纪念日、节日等重要日期',
        '自动提醒，提前几天通知',
        '每年重复，永不遗忘',
        '与角色关联，收到专属祝福',
        '日历集成显示',
      ]}
      onBack={onBack}
    />
  );
}
