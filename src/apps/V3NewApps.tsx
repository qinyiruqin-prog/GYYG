import { ComingSoonV3 } from '../components/ComingSoonV3';
export { OfflineModeScreen } from './OfflineModeScreen';

// 群聊
export function GroupChatScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="群聊"
      icon="👥"
      description="创建多人聊天群，与多个AI角色同时互动"
      features={[
        '创建群聊，添加多个用户和角色',
        '群名称、群头像自定义',
        '@提及功能，精准回复',
        '群消息实时同步',
        '角色之间会互相对话',
      ]}
      onBack={onBack}
    />
  );
}

// 查手机
export function PhoneCheckScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="查手机"
      icon="🔍"
      description="偷偷查看角色的聊天记录、朋友圈和相册，有被发现的风险哦"
      features={[
        '查看角色的聊天记录',
        '浏览角色的朋友圈',
        '查看角色的相册',
        '有概率被角色发现',
        'AI生成角色的真实反应',
      ]}
      onBack={onBack}
    />
  );
}

// 线下模式已经从单独的文件导出了

export function CoupleSpaceScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="情侣空间"
      icon="💑"
      description="专属的情侣空间，记录你们的美好时光"
      features={[
        'AI生成情侣头像',
        '情侣相册和时间轴',
        '恋爱天数自动计算',
        '锁手机功能（角色可以锁你的手机）',
        '纪念日提醒',
      ]}
      onBack={onBack}
    />
  );
}

export function HomeSystemScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="家园"
      icon="🏠"
      description="你和角色的温馨小家，可以一起做饭、换装、同居"
      features={[
        '厨房：做饭、分享美食',
        '衣橱：换装、搭配服装',
        '代收快递功能',
        '房间装修和添加家具',
        '与角色同居',
      ]}
      onBack={onBack}
    />
  );
}

export function TurtleSoupScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="海龟汤"
      icon="🐢"
      description="经典推理游戏，和AI角色一起猜谜"
      features={[
        '海量谜题库',
        '提问系统，AI智能回答',
        '提示功能',
        '难度分级',
        '解谜记录和排行榜',
      ]}
      onBack={onBack}
    />
  );
}

export function GamesScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="游戏"
      icon="🎮"
      description="和AI角色一起玩小游戏"
      features={[
        '麻将：经典国粹',
        '斗地主：三人对战',
        '更多小游戏持续更新',
        '与角色对战',
        '战绩记录',
      ]}
      onBack={onBack}
    />
  );
}

export function WeiboScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="微博"
      icon="📱"
      description="类微博的社交平台，发布动态与角色互动"
      features={[
        '发布微博，支持图片',
        '热门话题和标签',
        '转发、评论、点赞',
        '角色会发微博',
        '实时热搜榜',
      ]}
      onBack={onBack}
    />
  );
}

export function TwitterScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="X (原推特)"
      icon="🐦"
      description="推特风格的社交平台"
      features={[
        '发布推文（280字限制）',
        '转推功能',
        '话题标签 #',
        '时间线展示',
        '角色互动',
      ]}
      onBack={onBack}
    />
  );
}

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

export function DiscoverScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="发现"
      icon="✨"
      description="可能感兴趣的人，发现更多AI角色"
      features={[
        '随机推荐角色小号',
        '基于标签的智能推荐',
        '共同好友显示',
        '添加好友流程',
        '陌生人可以互相评论',
      ]}
      onBack={onBack}
    />
  );
}

export function AltAccountsScreen({ onBack }: { onBack: () => void }) {
  return (
    <ComingSoonV3
      title="小号管理"
      icon="👤"
      description="管理你的所有小号，快速切换身份"
      features={[
        '查看所有主号和小号',
        '快速切换小号',
        '小号独立人设',
        '层级关系显示',
        '一键创建新小号',
      ]}
      onBack={onBack}
    />
  );
}
