import { ComingSoonV3 } from '../components/ComingSoonV3';
export { OfflineModeScreen } from './OfflineModeScreen';
export { GroupChatScreen } from './GroupChatScreen';
export { PhoneCheckScreen } from './PhoneCheckScreen';
export { CoupleSpaceScreen } from './CoupleSpaceScreen';
export { HomeSystemScreen } from './HomeSystemScreen';
export { AnniversaryScreen } from './AnniversaryScreen';
export { TurtleSoupScreen } from './TurtleSoupScreen';
export { GamesScreen } from './GamesScreen';
export { DiscoverScreen } from './DiscoverScreen';
export { AltAccountsScreen } from './AltAccountsScreen';
export { WeiboScreen } from './WeiboScreen';
export { TwitterScreen } from './TwitterScreen';

// 所有核心v3.0功能已从单独文件导出

export function MemoryScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="记忆系统"
      icon="🧠"
      description="AI角色的记忆中枢，使用向量技术增强记忆"
      features={[
        '记忆存储和管理',
        '向量嵌入技术',
        '相似度搜索',
        '重要度评分',
        '记忆关联图谱',
      ]}
      onBack={onBack}
    />
  );
}

export function WeightManageScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="体重管理"
      icon="⚖️"
      description="记录体重、设定目标、AI角色陪你一起健身"
      features={[
        '体重记录和BMI计算',
        '设定目标体重',
        '进度可视化',
        '对比照片',
        '角色监督和鼓励',
      ]}
      onBack={onBack}
    />
  );
}

