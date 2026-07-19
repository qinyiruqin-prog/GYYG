import { useState } from 'react';
import { Camera, Heart, MessageCircle, Send, Sparkles, Trash2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, Moment, UserIdentity, Character } from '../types';

export function MomentsScreen({
  api,
  users,
  activeUserId,
  characters,
  moments,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  users: UserIdentity[];
  activeUserId: string | null;
  characters: Character[];
  moments: Moment[];
  onChange: (m: Moment[]) => void;
  onBack: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [commenting, setCommenting] = useState<Moment | null>(null);
  const [commentText, setCommentText] = useState('');

  const me = users.find((u) => u.id === activeUserId) ?? users[0];
  const sorted = [...moments].sort((a, b) => b.ts - a.ts);

  const post = () => {
    if (!text.trim() || !me) return;
    const m: Moment = { id: uid(), authorId: me.id, authorName: me.nickname, authorAvatar: me.avatar, text: text.trim(), images: [], likes: [], comments: [], ts: Date.now() };
    onChange([m, ...moments]);
    setText(''); setComposing(false);
  };

  const aiPost = async () => {
    if (!me) return;
    setGenerating(true);
    try {
      const chars = characters.slice(0, 6).map((c) => c.name).join('、') || '几个朋友';
      const sys = `你在模拟一个微信朋友圈。请以某个角色/朋友的身份生成一条朋友圈动态，内容真实自然，像真人发的，20-80字。只输出动态正文，不要解释。`;
      const content = await askAI(api, sys, `用户身份是「${me.nickname}」。朋友圈里可能出现的人物：${chars}。请随机选一个人物发一条朋友圈。`, { temperature: 0.95, maxTokens: 120 });
      const aiChar = characters[Math.floor(Math.random() * characters.length)];
      const m: Moment = { id: uid(), authorId: aiChar?.id ?? 'ai', authorName: aiChar?.name ?? 'AI朋友', authorAvatar: aiChar?.avatar, text: content.trim(), images: [], likes: [], comments: [], ts: Date.now(), aiGenerated: true };
      onChange([m, ...moments]);
      setComposing(false);
    } catch (e) {
      const m: Moment = { id: uid(), authorId: 'ai', authorName: 'AI朋友', text: `（生成失败：${(e as Error).message}）`, images: [], likes: [], comments: [], ts: Date.now() };
      onChange([m, ...moments]);
      setComposing(false);
    } finally {
      setGenerating(false);
    }
  };

  const toggleLike = (id: string) => {
    if (!me) return;
    onChange(moments.map((m) => m.id === id ? { ...m, likes: m.likes.includes(me.nickname) ? m.likes.filter((n) => n !== me.nickname) : [...m.likes, me.nickname] } : m));
  };

  const addComment = () => {
    if (!commentText.trim() || !commenting || !me) return;
    onChange(moments.map((m) => m.id === commenting.id ? { ...m, comments: [...m.comments, { id: uid(), authorName: me.nickname, text: commentText.trim(), ts: Date.now() }] } : m));
    setCommentText(''); setCommenting(null);
  };

  const del = (id: string) => onChange(moments.filter((m) => m.id !== id));

  return (
    <AppScreen title="朋友圈" onBack={onBack} noPad right={<button onClick={() => setComposing(true)} className="tap text-[var(--accent)]"><Camera size={22} /></button>}>
      {/* cover banner */}
      <div className="h-32 relative shrink-0" style={{ background: 'linear-gradient(135deg, var(--icon-bg-active), var(--bg-elev))' }}>
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          {me && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white drop-shadow">{me.nickname}</span>
              {me.avatar ? <img src={me.avatar} className="w-12 h-12 rounded-lg object-cover border-2 border-white/80" alt="" /> : <div className="w-12 h-12 rounded-lg icon-bg border-2 border-white/80" />}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center txt-faint mt-16">还没有动态，点右上角发布</div>
        ) : sorted.map((m) => (
          <div key={m.id} className="flex gap-3">
            {m.authorAvatar ? <img src={m.authorAvatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" /> : <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center shrink-0"><Camera size={18} className="icon-color" /></div>}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] txt-accent font-medium">{m.authorName}{m.aiGenerated && <span className="ml-1 text-[10px] txt-faint">· AI</span>}</div>
              <div className="text-[14px] leading-relaxed mt-0.5 whitespace-pre-wrap">{m.text}</div>
              {m.images.length > 0 && <div className="grid grid-cols-3 gap-1 mt-2">{m.images.map((img, i) => <img key={i} src={img} className="aspect-square rounded-md object-cover" alt="" />)}</div>}
              <div className="flex items-center gap-4 mt-2 text-[12px] txt-faint">
                <button onClick={() => toggleLike(m.id)} className="tap flex items-center gap-1"><Heart size={14} className={m.likes.length ? 'txt-accent fill-current' : ''} /> {m.likes.length || ''}</button>
                <button onClick={() => { setCommenting(m); setCommentText(''); }} className="tap flex items-center gap-1"><MessageCircle size={14} /> {m.comments.length || ''}</button>
                {(m.authorId === me?.id || m.aiGenerated) && <button onClick={() => del(m.id)} className="tap ml-auto"><Trash2 size={13} /></button>}
              </div>
              {m.comments.length > 0 && (
                <div className="glass rounded-xl mt-2 p-2.5 space-y-1.5">
                  {m.comments.map((c) => <div key={c.id} className="text-[13px]"><span className="txt-accent">{c.authorName}：</span><span className="txt-dim">{c.text}</span></div>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* compose */}
      <Modal open={composing} onClose={() => setComposing(false)} title="发朋友圈">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="这一刻的想法…" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none placeholder:text-[var(--text-faint)] mb-3" autoFocus />
        <div className="flex gap-3">
          <button onClick={aiPost} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI帮写'}</button>
          <button onClick={post} disabled={!text.trim()} className="tap flex-1 h-11 rounded-full font-medium flex items-center justify-center gap-1.5 text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}><Send size={16} /> 发表</button>
        </div>
      </Modal>

      {/* comment */}
      <Modal open={!!commenting} onClose={() => setCommenting(null)} title="评论">
        <div className="mb-3 text-[13px] txt-dim bg-[var(--bg-elev)] rounded-xl p-3">{commenting?.text.slice(0, 60)}</div>
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addComment()} placeholder="写下你的评论…" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <button onClick={addComment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发送</button>
      </Modal>

      <Confirm open={confirmClear} title="清空朋友圈" message="确定删除所有动态？" danger onConfirm={() => { onChange([]); setConfirmClear(false); }} onCancel={() => setConfirmClear(false)} />
    </AppScreen>
  );
}
