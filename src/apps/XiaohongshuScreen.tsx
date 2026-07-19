import { useState } from 'react';
import { Heart, Bookmark, Search, Sparkles } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { uid } from '../utils';
import { askAIJson } from '../api';
import type { ApiConfig, Note, UserIdentity } from '../types';

const COVER = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const SEED_NOTES: Note[] = [
  { id: 'n1', title: '京都三日漫游指南', authorName: '小旅人', cover: COVER('2435091'), body: '清水寺的晨雾、岚山的竹林、伏见稻荷的千鸟居……秋天的京都美得像一幅画。这篇整理了三条人少景美的步行路线，适合喜欢慢游的你。', likes: 2341, collects: 892, comments: [], tags: ['旅行', '京都', '自由行'], ts: Date.now() - 86400000 },
  { id: 'n2', title: '在家也能做的拉丝芝士热狗', authorName: '厨房日记', cover: COVER('1639557'), body: '外酥里嫩，咬开满口芝士拉丝！只需要手抓饼、芝士片、热狗肠三样主料，空气炸锅180度10分钟搞定。详细步骤看正文～', likes: 5621, collects: 3200, comments: [], tags: ['美食', '食谱', '空气炸锅'], ts: Date.now() - 172800000 },
  { id: 'n3', title: '学生党平价穿搭｜秋冬基础款', authorName: '穿搭研究所', cover: COVER('996329'), body: '预算500搞定一周穿搭！优衣库+GU基础款组合，颜色选大地色系怎么搭都不会出错。搭配要点：上宽下窄，层次感靠叠穿。', likes: 8900, collects: 5600, comments: [], tags: ['穿搭', '平价', '学生党'], ts: Date.now() - 259200000 },
  { id: 'n4', title: '我的手账排版小技巧', authorName: '手账星球', cover: COVER('606547'), body: '分享5个让手账瞬间高级的排版法则：留白、对齐、主次、色彩呼应、季节元素。新手也能做出ins风手账！', likes: 3400, collects: 1800, comments: [], tags: ['手账', '文具', '生活美学'], ts: Date.now() - 345600000 },
];

export function XiaohongshuScreen({
  api,
  me,
  notes,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  notes: Note[];
  onChange: (n: Note[]) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState<Note | null>(null);
  const [composing, setComposing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [commentText, setCommentText] = useState('');

  const list = (notes.length > 0 ? notes : SEED_NOTES).filter((n) => n.title.includes(q) || n.tags.some((t) => t.includes(q)) || n.authorName.includes(q));
  const safe = notes.length > 0 ? notes : SEED_NOTES;
  if (notes.length === 0) onChange(SEED_NOTES);

  const like = (id: string) => onChange(safe.map((n) => n.id === id ? { ...n, likes: n.likes + 1 } : n));
  const collect = (id: string) => onChange(safe.map((n) => n.id === id ? { ...n, collects: n.collects + 1 } : n));
  const comment = (n: Note) => {
    if (!commentText.trim()) return;
    onChange(safe.map((x) => x.id === n.id ? { ...x, comments: [...x.comments, { id: uid(), authorName: me?.nickname ?? '我', text: commentText.trim(), ts: Date.now() }] } : x));
    setCommentText('');
    setActive((a) => a ? { ...a, comments: [...a.comments, { id: uid(), authorName: me?.nickname ?? '我', text: commentText.trim(), ts: Date.now() }] } : a);
  };

  const aiGenerate = async () => {
    setGenerating(true);
    try {
      const sys = '你在生成小红书风格的种草笔记。标题吸引人，正文口语化、有emoji、分点清晰，200字以内。同时输出3-5个标签。返回JSON：{"title":"","body":"","tags":["",""]}';
      const data = await askAIJson<{ title: string; body: string; tags: string[] }>(api, sys, '请随机生成一篇生活类种草笔记', { temperature: 0.9, maxTokens: 400 });
      const n: Note = { id: uid(), title: data.title, authorName: me?.nickname ?? '我', authorAvatar: me?.avatar, cover: COVER(['1639557','996329','606547','2435091','1099680','1213710'][Math.floor(Math.random()*6)]), body: data.body, likes: 0, collects: 0, comments: [], tags: data.tags ?? [], ts: Date.now() };
      onChange([n, ...safe]);
      setComposing(false);
    } catch (e) { alert(`AI生成失败：${(e as Error).message}`); }
    finally { setGenerating(false); }
  };

  const publish = () => {
    if (!title.trim()) return;
    const n: Note = { id: uid(), title: title.trim(), authorName: me?.nickname ?? '我', authorAvatar: me?.avatar, cover: COVER('1639557'), body: body.trim(), likes: 0, collects: 0, comments: [], tags: tags.split(/[#,，\s]+/).filter(Boolean), ts: Date.now() };
    onChange([n, ...safe]); setTitle(''); setBody(''); setTags(''); setComposing(false);
  };

  // detail view
  if (active) {
    const n = safe.find((x) => x.id === active.id) ?? active;
    return (
      <AppScreen title="" onBack={() => setActive(null)} noPad headerSolid={false}>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <img src={n.cover} className="w-full h-72 object-cover" alt="" />
            <div className="px-4 py-4">
              <div className="font-title text-xl mb-3">{n.title}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent">{(n.authorName[0] || '?')}</div>
                <div className="text-[14px]">{n.authorName}</div>
              </div>
              <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap">{n.body}</div>
              {n.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-4">{n.tags.map((t) => <span key={t} className="px-2.5 py-1 rounded-full text-[12px] txt-accent" style={{ background: 'var(--icon-bg-active)' }}>#{t}</span>)}</div>}
              <div className="border-t border-[var(--border)] mt-5 pt-4">
                <div className="text-[13px] txt-dim mb-3">评论 {n.comments.length}</div>
                {n.comments.length === 0 ? <div className="text-[13px] txt-faint mb-3">还没有评论，来抢沙发</div> : n.comments.map((c) => <div key={c.id} className="mb-3 text-[14px]"><span className="txt-accent">{c.authorName}：</span><span className="txt-dim">{c.text}</span></div>)}
              </div>
            </div>
          </div>
          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2 shrink-0">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && comment(n)} placeholder="说点什么…" className="flex-1 glass rounded-full px-4 h-10 text-[14px] outline-none bg-transparent" />
            <button onClick={() => like(n.id)} className="tap w-10 h-10 rounded-full glass flex items-center justify-center"><Heart size={18} className="txt-accent" /></button>
            <button onClick={() => collect(n.id)} className="tap w-10 h-10 rounded-full glass flex items-center justify-center"><Bookmark size={18} className="txt-accent" /></button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="小红书" onBack={onBack} noPad right={<button onClick={() => setComposing(true)} className="tap text-[var(--accent)]"><Sparkles size={22} /></button>}>
      <div className="px-3 pt-3 pb-2 sticky top-0 app-bg z-10">
        <div className="flex items-center gap-2 glass rounded-full px-3.5 h-10">
          <Search size={16} className="txt-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索笔记" className="flex-1 bg-transparent outline-none text-[14px]" />
        </div>
      </div>
      {/* masonry-ish two-column */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {list.map((n) => (
            <button key={n.id} onClick={() => setActive(n)} className="tap glass rounded-2xl overflow-hidden text-left">
              <img src={n.cover} className="w-full aspect-[3/4] object-cover" alt="" />
              <div className="p-2">
                <div className="text-[13px] line-clamp-2 leading-snug">{n.title}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] txt-faint truncate">{n.authorName}</span>
                  <span className="flex items-center gap-0.5 text-[11px] txt-faint"><Heart size={11} className="txt-accent" /> {n.likes > 999 ? `${(n.likes/1000).toFixed(1)}k` : n.likes}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* compose / AI generate */}
      <Modal open={composing} onClose={() => setComposing(false)} title="发布笔记">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="正文内容" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签（空格分隔）" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" />
        <div className="flex gap-3">
          <button onClick={aiGenerate} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium disabled:opacity-50">{generating ? '生成中…' : 'AI 生成'}</button>
          <button onClick={publish} disabled={!title.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发布</button>
        </div>
      </Modal>
    </AppScreen>
  );
}
