import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import type { ApiConfig } from '../types';

type Msg = { role: 'user' | 'assistant'; content: string };

export function AssistantScreen({ api, onBack }: { api: ApiConfig; onBack: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: '你好呀，我是羊羊助手！我对羊羊机的各种功能都很熟悉，有什么关于使用羊羊机的问题尽管问我。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const next = [...msgs, { role: 'user' as const, content: text }];
    setMsgs(next);
    setLoading(true);
    try {
      const reply = await callChat(api.chat, next);
      setMsgs([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMsgs([...next, { role: 'assistant', content: `出错了：${(e as Error).message}。请先在「API 预设」或「我的 → API 配置中心」配置 Chat 接口。` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen title="羊羊助手" onBack={onBack} noPad>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                  m.role === 'user' ? 'rounded-br-md text-white' : 'glass rounded-bl-md'
                }`}
                style={m.role === 'user' ? { background: 'var(--accent)', color: 'var(--bg)' } : undefined}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-md px-3.5 py-3 flex items-center gap-1">
                {[0,1,2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-current txt-faint animate-pulse-soft" style={{ animationDelay: `${i*0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="问点什么…"
            className="flex-1 glass rounded-full px-4 h-10 text-[14px] outline-none bg-transparent placeholder:text-[var(--text-faint)]"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="tap w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}

async function callChat(chat: ApiConfig['chat'], history: Msg[]): Promise<string> {
  if (!chat.baseUrl) throw new Error('未配置 Chat API');
  const base = chat.baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chat.apiKey}` },
    body: JSON.stringify({
      model: chat.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是「羊羊助手」，羊羊机（一个网页版手机风格 AI 角色聊天系统）的内置帮助助手。你对羊羊机的功能了如指掌，专门解答用户关于羊羊机使用方法的问题。\n\n羊羊机的主要功能模块包括：\n- 桌面框架：仿手机桌面，多页滑动、小组件（音乐/日历/相册）、快捷方式球\n- API 配置中心：配置 Chat/语音/绘图 三类 OpenAI 兼容接口，支持「拉取」按钮自动获取可用模型列表\n- API 预设：保存多套 API 配置一键切换\n- 主题：水墨黑白等多种主题可切换\n- 用户身份：创建多个身份（含头像、签名、绘图模板），可设主副号\n- 分区与对应关系：将用户与角色分组管理\n- 本地资源：导入本地音乐和图片\n- 数据备份：导出/导入全部数据\n- 通讯录：管理联系人，可关联 AI 角色，发起聊天或短信\n- 聊天 / 短信：与 AI 角色对话，支持短信模式\n- 朋友圈 / 小红书 / 论坛 / 广场：AI 生成内容的社交场景\n- 小说：阅读小说并记录进度\n- 商城 / 外卖：模拟购物与点餐\n- 世界书：配置关键词触发的世界观设定，聊天中自动注入\n- 音乐 / 相册：本地资源播放与浏览\n\n回答要精炼友好，用中文。如果用户问的不是羊羊机相关问题，可以简短引导回羊羊机话题。' },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(空回复)';
}
