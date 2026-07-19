import { useState } from 'react';
import { Heart, MessageCircle, Send, Sparkles, Globe, Trash2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, SquarePost, UserIdentity, Character } from '../types';

export function SocialScreen({
  api,
  me,
  characters,
  posts,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  characters: Character[];
  posts: SquarePost[];
  onChange: (p: SquarePost[]) => void;
  onBack: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [confirmDel, setConfirmDel] = useState<SquarePost | null>(null);
  const [commenting, setCommenting] = useState<SquarePost | null>(null);
  const [commentText, setCommentText] = useState('');

  const sorted = [...posts].sort((a, b) => b.ts - a.ts);

  const post = () => {
    if (!text.trim()) return;
    const p: SquarePost = { id: uid(), authorName: me?.nickname ?? '匿名', authorAvatar: me?.avatar, text: text.trim(), likes: 0, comments: [], ts: Date.now() };
    onChange([p, ...posts]); setText(''); setComposing(false);
  };

  const aiPost = async () => {
    setGenerating(true);
    try {
      const names = characters.slice(0, 5).map((c) => c.name).join('、') || '路人甲';
      const sys = '你在模拟一个公共广场/微博。以某个虚拟网友身份发一条动态，15-80字，口语化真实，可以带话题。只输出正文。';
      const content = await askAI(api, sys, `可能的人物：${names}\n请发一条广场动态：`, { temperature: 0.95, maxTokens: 120 });
      const c = characters[Math.floor(Math.random() * characters.length)];
      const p: SquarePost = { id: uid(), authorName: c?.name ?? 'AI网友', authorAvatar: c?.avatar, text: content.trim(), likes: Math.floor(Math.random() * 50), comments: [], ts: Date.now(), aiGenerated: true };
      onChange([p, ...posts]); setComposing(false);
    } catch (e) { alert(`生成失败：${(e as Error).message}`); }
    finally { setGenerating(false); }
  };

  const like = (id: string) => onChange(posts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  const comment = () => {
    if (!commentText.trim() || !commenting) return;
    onChange(posts.map((p) => p.id === commenting.id ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? '我', text: commentText.trim(), ts: Date.now() }] } : p));
    setCommentText(''); setCommenting(null);
  };
  const del = (id: string) => onChange(posts.filter((p) => p.id !== id));

  return (
    <AppScreen title="广场" onBack={onBack} noPad right={<button onClick={() => setComposing(true)} className="tap text-[var(--accent)]"><Send size={22} /></button>}>
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 shrink-0">
        <Globe size={18} className="txt-accent" />
        <div className="text-[13px] txt-dim">公共广场 · 所有人可见</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center txt-faint mt-16">广场还很安静，发第一条吧</div>
        ) : sorted.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2.5 mb-2.5">
              {p.authorAvatar ? <img src={p.authorAvatar} className="w-9 h-9 rounded-full object-cover" alt="" /> : <div className="w-9 h-9 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent">{(p.authorName[0] || '?')}</div>}
              <div className="flex-1"><div className="text-[14px] font-medium">{p.authorName}{p.aiGenerated && <span className="ml-1 text-[10px] txt-faint">· AI</span>}</div><div className="text-[11px] txt-faint">{new Date(p.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div></div>
              {(p.authorName === me?.nickname || p.aiGenerated) && <button onClick={() => setConfirmDel(p)} className="tap txt-dim"><Trash2 size={14} /></button>}
            </div>
            <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap mb-3">{p.text}</div>
            {p.image && <img src={p.image} className="w-full max-h-60 object-cover rounded-xl mb-3" alt="" />}
            <div className="flex items-center gap-5 text-[13px] txt-faint">
              <button onClick={() => like(p.id)} className="tap flex items-center gap-1.5"><Heart size={15} className="txt-accent" /> {p.likes}</button>
              <button onClick={() => { setCommenting(p); setCommentText(''); }} className="tap flex items-center gap-1.5"><MessageCircle size={15} /> {p.comments.length}</button>
            </div>
            {p.comments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                {p.comments.map((c) => <div key={c.id} className="text-[13px]"><span className="txt-accent">{c.authorName}：</span><span className="txt-dim">{c.text}</span></div>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={composing} onClose={() => setComposing(false)} title="发动态">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="说点什么…（广场所有人可见）" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" autoFocus />
        <div className="flex gap-3">
          <button onClick={aiPost} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI 发帖'}</button>
          <button onClick={post} disabled={!text.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发布</button>
        </div>
      </Modal>

      <Modal open={!!commenting} onClose={() => setCommenting(null)} title="评论">
        <div className="mb-3 text-[13px] txt-dim bg-[var(--bg-elev)] rounded-xl p-3 line-clamp-3">{commenting?.text}</div>
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && comment()} placeholder="写下评论…" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <button onClick={comment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发送</button>
      </Modal>

      <Confirm open={!!confirmDel} title="删除动态" message="确定删除这条广场动态？" danger onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
