import { useState } from 'react';
import { Plus, Search, Eye, MessageSquare, Pin, Trash2, Send, Sparkles } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { ListGroup, Row } from '../components/ui';
import { uid } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, ForumPost, UserIdentity } from '../types';

const BOARDS = ['综合', '技术', '日常', '故事', '求助'];

export function ForumScreen({
  api,
  me,
  posts,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  posts: ForumPost[];
  onChange: (p: ForumPost[]) => void;
  onBack: () => void;
}) {
  const [board, setBoard] = useState('综合');
  const [q, setQ] = useState('');
  const [active, setActive] = useState<ForumPost | null>(null);
  const [composing, setComposing] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ForumPost | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [aiWriting, setAiWriting] = useState(false);
  const [replyText, setReplyText] = useState('');

  const filtered = posts.filter((p) => (board === '综合' || p.board === board) && (p.title.includes(q) || p.body.includes(q)));
  const sorted = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts);

  const update = (id: string, fn: (p: ForumPost) => ForumPost) => onChange(posts.map((p) => p.id === id ? fn(p) : p));

  const publish = () => {
    if (!title.trim()) return;
    const p: ForumPost = { id: uid(), title: title.trim(), authorName: me?.nickname ?? '匿名', authorAvatar: me?.avatar, body: body.trim(), board: board === '综合' ? '日常' : board, views: 0, replies: [], ts: Date.now() };
    onChange([p, ...posts]); setTitle(''); setBody(''); setComposing(false);
  };

  const aiPost = async () => {
    setAiWriting(true);
    try {
      const sys = '你在模拟论坛发帖。请生成一个有趣的帖子，标题+正文，正文100-200字，口语化。只输出"标题\n正文"，不要额外解释。';
      const raw = await askAI(api, sys, `板块：${board === '综合' ? '日常' : board}\n请生成一条帖子：`, { temperature: 0.9, maxTokens: 400 });
      const [t, ...rest] = raw.split('\n');
      const p: ForumPost = { id: uid(), title: t.trim(), authorName: 'AI用户', body: rest.join('\n').trim(), board: board === '综合' ? '日常' : board, views: Math.floor(Math.random()*200), replies: [], ts: Date.now() };
      onChange([p, ...posts]); setComposing(false);
    } catch (e) { alert(`AI生成失败：${(e as Error).message}`); }
    finally { setAiWriting(false); }
  };

  const reply = (p: ForumPost) => {
    if (!replyText.trim()) return;
    update(p.id, (x) => ({ ...x, replies: [...x.replies, { id: uid(), authorName: me?.nickname ?? '匿名', authorAvatar: me?.avatar, text: replyText.trim(), ts: Date.now() }] }));
    setReplyText('');
    setActive((a) => a ? { ...a, replies: [...a.replies, { id: uid(), authorName: me?.nickname ?? '匿名', authorAvatar: me?.avatar, text: replyText.trim(), ts: Date.now() }] } : a);
  };

  const aiReply = async (p: ForumPost) => {
    setAiWriting(true);
    try {
      const sys = '你在论坛回帖，以网友身份简短回复，10-50字，口语化。只输出回复内容。';
      const text = await askAI(api, sys, `帖子标题：${p.title}\n正文：${p.body}\n请回复：`, { temperature: 0.9, maxTokens: 100 });
      const r = { id: uid(), authorName: 'AI网友', text: text.trim(), ts: Date.now() };
      update(p.id, (x) => ({ ...x, replies: [...x.replies, r] }));
      setActive((a) => a ? { ...a, replies: [...a.replies, r] } : a);
    } catch (e) { alert(`生成失败：${(e as Error).message}`); }
    finally { setAiWriting(false); }
  };

  const del = (p: ForumPost) => onChange(posts.filter((x) => x.id !== p.id));

  if (active) {
    const p = posts.find((x) => x.id === active.id) ?? active;
    return (
      <AppScreen title={p.title} onBack={() => setActive(null)} noPad right={<button onClick={() => del(p)} className="tap txt-dim"><Trash2 size={18} /></button>}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
            <div className="font-title text-lg mb-2">{p.title}</div>
            <div className="flex items-center gap-2 mb-3">
              {p.authorAvatar ? <img src={p.authorAvatar} className="w-7 h-7 rounded-full object-cover" alt="" /> : <div className="w-7 h-7 rounded-full icon-bg flex items-center justify-center text-[11px] txt-accent">{(p.authorName[0] || '?')}</div>}
              <span className="text-[13px] txt-dim">{p.authorName}</span>
              <span className="text-[11px] txt-faint">{new Date(p.ts).toLocaleDateString('zh-CN')}</span>
              <span className="ml-auto text-[11px] txt-faint flex items-center gap-0.5"><Eye size={11} /> {p.views}</span>
            </div>
            <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap mb-5">{p.body}</div>
            <div className="border-t border-[var(--border)] pt-4">
              <div className="text-[13px] txt-dim mb-3 flex items-center gap-1"><MessageSquare size={14} /> {p.replies.length}条回复</div>
              {p.replies.length === 0 && <div className="text-[13px] txt-faint mb-3">还没有回复，来抢沙发</div>}
              {p.replies.map((r) => (
                <div key={r.id} className="flex gap-2.5 mb-3.5">
                  {r.authorAvatar ? <img src={r.authorAvatar} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" /> : <div className="w-7 h-7 rounded-full icon-bg flex items-center justify-center text-[11px] txt-accent shrink-0">{(r.authorName[0] || '?')}</div>}
                  <div><div className="text-[12px] txt-faint">{r.authorName}</div><div className="text-[14px] txt-dim mt-0.5">{r.text}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2 shrink-0">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && reply(p)} placeholder="回复…" className="flex-1 glass rounded-full px-4 h-10 text-[14px] outline-none bg-transparent" />
            <button onClick={() => aiReply(p)} disabled={aiWriting} className="tap w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-50"><Sparkles size={18} className="txt-accent" /></button>
            <button onClick={() => reply(p)} disabled={!replyText.trim()} className="tap w-10 h-10 rounded-full flex items-center justify-center text-[var(--bg)] disabled:opacity-40" style={{ background: 'var(--accent)' }}><Send size={18} /></button>
          </div>
        </div>
        {aiWriting && <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-4 py-2 text-[12px] animate-sheet-up">AI 生成中…</div>}
      </AppScreen>
    );
  }

  return (
    <AppScreen title="论坛" onBack={onBack} right={<button onClick={() => setComposing(true)} className="tap text-[var(--accent)]"><Plus size={22} /></button>}>
      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {BOARDS.map((b) => <button key={b} onClick={() => setBoard(b)} className={`tap shrink-0 px-3 h-8 rounded-full text-[12px] ${board === b ? 'icon-bg-active txt-accent font-medium' : 'glass txt-dim'}`}>{b}</button>)}
      </div>
      <div className="flex items-center gap-2 glass rounded-xl px-3 h-10 mb-4"><Search size={16} className="txt-faint" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索帖子" className="flex-1 bg-transparent outline-none text-[14px]" /></div>
      {sorted.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center txt-faint text-sm">还没有帖子，点右上角 + 发帖</div>
      ) : (
        <ListGroup>
          {sorted.map((p) => (
            <Row
              key={p.id}
              label={<span className="flex items-center gap-1.5">{p.pinned && <Pin size={13} className="txt-accent" />}{p.title}</span>}
              hint={<span>{p.authorName} · {p.replies.length}回复 · {p.views}浏览</span>}
              onClick={() => { setActive(p); update(p.id, (x) => ({ ...x, views: x.views + 1 })); }}
              right={<button onClick={(e) => { e.stopPropagation(); setConfirmDel(p); }} className="tap txt-dim"><Trash2 size={15} /></button>}
            />
          ))}
        </ListGroup>
      )}

      <Modal open={composing} onClose={() => setComposing(false)} title="发帖">
        <div className="text-[12px] txt-dim mb-1">板块：{board === '综合' ? '日常' : board}</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="正文" rows={5} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" />
        <div className="flex gap-3">
          <button onClick={aiPost} disabled={aiWriting} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><Sparkles size={16} className="txt-accent" /> {aiWriting ? '生成中…' : 'AI 发帖'}</button>
          <button onClick={publish} disabled={!title.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发布</button>
        </div>
      </Modal>

      <Confirm open={!!confirmDel} title="删除帖子" message={`确定删除「${confirmDel?.title}」？`} danger onConfirm={() => { if (confirmDel) del(confirmDel); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
