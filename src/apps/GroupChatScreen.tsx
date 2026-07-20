import { ComingSoonV3 } from '../components/ComingSoonV3';

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
