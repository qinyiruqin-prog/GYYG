import { useState } from 'react';
import { RefreshCw, Copy, Send, Sparkles, Smile, Flame, HelpCircle, Eye } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { cls } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, Character, ChatThread, ChatMessage } from '../types';
import { uid } from '../utils';

// Local curated banks
const TRUTH_BANK = {
  gossip: [
    '你最后一次哭是因为什么事？',
    '你手机里最不想让人看到的秘密是什么？',
    '你曾经对在座的/联系人里的哪位产生过一丝好感？',
    '你最长的一次单身时间是多少年？',
    '如果可以重来，你最想改写人生中的哪一个决定？',
  ],
  funny: [
    '你做过最丢脸、现在想起来还想钻地缝的事情是什么？',
    '你洗澡的时候会不会唱歌？最喜欢唱哪一首？',
    '如果不考虑法律和道德，你最想做的一件恶作剧是什么？',
    '你偷偷模仿过谁？模仿一下！',
    '如果变成一只动物，你觉得自己最像什么，为什么？',
  ],
  heartbeat: [
    '你理想中的约会场景是怎样的？描述得越详细越好。',
    '如果要在你认识的人里选一个人流落荒岛，你会选谁？',
    '你相信一见钟情还是日久生情？为什么？',
    '你做过关于恋爱最甜的一个梦是什么？',
    '对方做过什么微小的举动，会瞬间击中你的心？',
  ],
  deep: [
    '你最害怕失去什么？',
    '当世界末日来临时，你最想和谁说最后一句话？',
    '你认为人生中最重要的三样东西是什么？',
    '你觉得自己最大的缺点是什么，有尝试改变吗？',
    '曾经有什么人对你产生过极其深远的影响？',
  ]
};

const DARE_BANK = {
  gossip: [
    '向你的一个好友发送“我发现你的秘密了……”，然后5分钟不回微信。',
    '用夸张的深情语气朗读一段商品说明书。',
    '把手机最近的一张表情包发给联系人里的第一个异性。',
    '给列表里的一位好友点赞他所有的朋友圈动态。',
  ],
  funny: [
    '学大猩猩捶胸口并大喊三声“我是万兽之王！”',
    '闭眼摸索一件物品，用极尽夸张的语言赞美它一分钟。',
    '用脚写出你最近聊天的那个人的名字。',
    '假装自己是一个刚学会说话的机器人，和身边的人对话3轮。',
  ],
  heartbeat: [
    '给最近联系的人发一句：“其实我一直觉得你很特别。”',
    '闭上眼睛深呼吸，发一条语音唱一段你觉得最温柔的歌词。',
    '向你选定的角色发送一句土味情话。',
    '用极其宠溺的语气发一句：“小笨蛋，快去睡觉啦。”',
  ],
  deep: [
    '写下一句你一直藏在心里没对任何人说过的感激或真心话。',
    '录制5秒的沉默呼吸声发送给对方，并配文“听听风的声音”。',
    '向对方倾诉你最近感到压力最大的一件事。',
  ]
};

type Category = 'gossip' | 'funny' | 'heartbeat' | 'deep';

export function TruthOrDareScreen({
  api,
  characters,
  chatThreads,
  onSendMsgToThread,
  onBack,
}: {
  api: ApiConfig;
  characters: Character[];
  chatThreads: ChatThread[];
  onSendMsgToThread: (charId: string, text: string) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<'truth' | 'dare'>('truth');
  const [category, setCategory] = useState<Category>('heartbeat');
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || '');
  const [cardText, setCardText] = useState<string>('点击下方按钮抽取一个有趣的真心话/大冒险吧！');
  const [aiLoading, setAiLoading] = useState(false);

  const drawNormal = () => {
    const bank = mode === 'truth' ? TRUTH_BANK : DARE_BANK;
    const list = bank[category] || bank['funny'];
    const idx = Math.floor(Math.random() * list.length);
    setCardText(list[idx]);
  };

  const drawAiCustom = async () => {
    if (!selectedCharId) {
      alert('请先选择一个角色进行拷问！');
      return;
    }
    const targetChar = characters.find((c) => c.id === selectedCharId);
    if (!targetChar) return;

    setAiLoading(true);
    setCardText('✨ AI 正在契合角色人设深度生成专属挑战中...');
    try {
      const systemPrompt = `你是一个恋爱与真心话大冒险游戏专家。
你要根据指定角色的姓名、个性和背景设定，为用户定制生成一个专属的【${mode === 'truth' ? '真心话问题' : '大冒险指令'}】。
生成的内容必须极其契合他们的关系、调性与该角色的性格，具有一定的挑逗性、戏剧张力或情感深度，让两人的聊天变得无比刺激有趣。

规则：
1. 只输出一句可玩的【${mode === 'truth' ? '真心话问题' : '大冒险指令'}】正文，不要有任何其他解释。
2. 问题/指令应由用户发给该角色。例如：
   真心话：“如果我突然抱着你，你会推开我还是抱得更紧？不准逃避，快回答！”
   大冒险：“立刻发一张你此时此刻眼神的特写照片，不许挑角度，5秒内必须发！”
3. 务必字数精简，语气自然，充满沉浸式角色扮演的张力。`;

      const userPrompt = `目标角色名：${targetChar.name}
性格人设：${targetChar.persona}
当前大分类：${category} (gossip:八卦, funny:搞怪, heartbeat:心动/暧昧, deep:深刻)
请生成一句给 ${targetChar.name} 的专属${mode === 'truth' ? '真心话问题' : '大冒险指令'}`;

      const res = await askAI(api, systemPrompt, userPrompt);
      setCardText(res.replace(/^["'「]+|["'」]+$/g, '').trim());
    } catch (err: any) {
      setCardText('AI 生成失败了。原因为：' + (err.message || '网络连接异常'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendToChat = () => {
    if (!selectedCharId) {
      alert('请先在上方选择一个联系人！');
      return;
    }
    const targetChar = characters.find((c) => c.id === selectedCharId);
    if (!targetChar) return;

    if (cardText.startsWith('点击下方') || cardText.startsWith('✨ AI') || !cardText.trim()) {
      alert('请先抽取一个有效的游戏挑战内容！');
      return;
    }

    const prefix = mode === 'truth' ? `🎲 [真心话挑战] ` : `⚡ [大冒险指令] `;
    onSendMsgToThread(selectedCharId, prefix + cardText);
  };

  const categories = [
    { id: 'heartbeat', label: '💖 心动暧昧', icon: Flame },
    { id: 'funny', label: '🤡 欢乐搞怪', icon: Smile },
    { id: 'gossip', label: '🔥 八卦猛料', icon: HelpCircle },
    { id: 'deep', label: '🌌 灵魂拷问', icon: Eye },
  ];

  return (
    <AppScreen title="真心话大冒险" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
        
        {/* Top select character and mode */}
        <div className="p-4 border-b border-neutral-800 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-neutral-400 font-semibold shrink-0">选择游戏玩伴：</span>
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 outline-none focus:border-indigo-500 transition-colors"
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} ({char.signature || '无签名'})
                </option>
              ))}
              {characters.length === 0 && <option value="">暂无可互动的角色</option>}
            </select>
          </div>

          {/* Mode switch pills */}
          <div className="flex gap-2 p-1 bg-neutral-900 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('truth')}
              className={cls(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1',
                mode === 'truth' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              ❓ 真心话 (Truth)
            </button>
            <button
              type="button"
              onClick={() => setMode('dare')}
              className={cls(
                'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1',
                mode === 'dare' ? 'bg-purple-600 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              ⚡ 大冒险 (Dare)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-6">
          
          {/* Categories select */}
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as Category)}
                  className={cls(
                    'flex items-center gap-1.5 p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer',
                    category === cat.id
                      ? 'bg-neutral-800/80 border-indigo-500 text-indigo-400 font-bold shadow-lg shadow-indigo-500/5'
                      : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                  )}
                >
                  <IconComp size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Card Display Container */}
          <div className="flex-1 min-h-[160px] flex items-center justify-center relative my-4">
            <div className="w-full h-full rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-between">
                <span>{mode === 'truth' ? '❓ Truth Card' : '⚡ Dare Card'}</span>
                <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full text-[9px]">
                  {categories.find((c) => c.id === category)?.label.split(' ')[1]}
                </span>
              </div>
              <p className="text-[14px] font-medium leading-relaxed text-neutral-200 text-center py-4 select-text">
                {cardText}
              </p>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>羊羊机娱乐工坊 🎲</span>
                {cardText && !cardText.startsWith('点击') && !cardText.startsWith('✨') && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cardText);
                      alert('内容已成功复制到剪贴板！');
                    }}
                    className="flex items-center gap-0.5 hover:text-neutral-300 transition-colors"
                  >
                    <Copy size={11} /> 复制
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Draw triggers */}
          <div className="space-y-3 shrink-0">
            <div className="flex gap-2">
              {/* Normal random draw */}
              <button
                type="button"
                onClick={drawNormal}
                disabled={aiLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 text-neutral-200 cursor-pointer"
              >
                <RefreshCw size={14} className={cls(aiLoading && 'animate-spin')} />
                随机抽卡
              </button>

              {/* AI customized draw */}
              <button
                type="button"
                onClick={drawAiCustom}
                disabled={aiLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 text-white cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} />
                ✨ AI 专属拷问
              </button>
            </div>

            {/* Quick send to selected chat */}
            {selectedCharId && (
              <button
                type="button"
                onClick={handleSendToChat}
                disabled={aiLoading || !cardText || cardText.startsWith('点击') || cardText.startsWith('✨')}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 font-bold text-xs text-neutral-950 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 cursor-pointer"
              >
                <Send size={13} />
                直接发送挑战并开启聊天
              </button>
            )}
          </div>

        </div>

      </div>
    </AppScreen>
  );
}
