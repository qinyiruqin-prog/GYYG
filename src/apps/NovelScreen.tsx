import { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Bookmark } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { ListGroup, Row, PrimaryButton } from '../components/ui';
import { uid } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, Novel } from '../types';

const COVER = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=400`;

const SEED_NOVELS: Novel[] = [
  {
    id: 'nv1', title: '深海回响', author: '林深', cover: COVER('1528369415105'),
    chapters: [
      { id: 'c1', title: '第一章 沉没的灯塔', content: '海雾在凌晨三点最浓。老灯塔看守人陈默推开锈迹斑斑的铁门，咸湿的海风灌进他灰色的风衣。灯塔的光已经停了三天，据说是因为零件老化，但陈默知道真正的原因——海底有什么东西在生长。\n\n他顺着螺旋楼梯向上爬，每一级木台阶都发出疲惫的呻吟。到达塔顶时，他看见海面上浮着一片不属于这个世界的幽蓝。' },
      { id: 'c2', title: '第二章 蓝色来客', content: '那片蓝光不是磷火，也不是船灯。它随着海浪的节奏明灭，像某种巨大生物的呼吸。陈默举起望远镜，镜片里映出一双眼睛——不是鱼的眼睛，更像人的，却大得不可思议。\n\n"你终于看见我了。"一个声音直接在他脑海响起，不是耳朵听到的。陈默手一抖，望远镜掉在塔顶的石板上。' },
    ],
    addedAt: Date.now(), lastReadChapter: 'c1',
  },
  {
    id: 'nv2', title: '旧书店与时间旅行者', author: '苏念', cover: COVER('1374235'),
    chapters: [
      { id: 'c3', title: '第一章 第七本书', content: '巷子尽头那家旧书店没有招牌，只有一块褪色的木牌写着"营业中"。林晚推门进去时，铜铃发出一声古老的叹息。\n\n"找什么？"老人从书堆后抬起头，眼镜片厚得像瓶底。\n\n"一本……能改变过去的书。"林晚说这话时自己都觉得荒唐，但老人只是点了点头，从最里层的架子上抽出一本没有书名的书，封面是深绿色的皮革，烫金的数字"7"嵌在中央。' },
    ],
    addedAt: Date.now(),
  },
];

export function NovelScreen({
  api,
  novels,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  novels: Novel[];
  onChange: (n: Novel[]) => void;
  onBack: () => void;
}) {
  const [active, setActive] = useState<Novel | null>(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [confirmDel, setConfirmDel] = useState<Novel | null>(null);

  const list = novels.length > 0 ? novels : SEED_NOVELS;
  if (novels.length === 0) onChange(SEED_NOVELS);

  const update = (id: string, fn: (n: Novel) => Novel) => onChange(list.map((n) => n.id === id ? fn(n) : n));

  const openNovel = (n: Novel) => {
    const startIdx = n.lastReadChapter ? n.chapters.findIndex((c) => c.id === n.lastReadChapter) : 0;
    setActive(n); setChapterIdx(Math.max(0, startIdx));
    if (n.chapters[startIdx]) update(n.id, (x) => ({ ...x, lastReadChapter: n.chapters[startIdx].id }));
  };

  const aiCreate = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    try {
      const sys = '你是小说作者。请根据标题写一个小说第一章，约300字，文笔细腻有画面感。只输出章节正文，不要标题。';
      const content = await askAI(api, sys, `小说标题：${title}\n作者风格参考：${author || '不限'}\n请写第一章正文：`, { temperature: 0.85, maxTokens: 600 });
      const n: Novel = { id: uid(), title: title.trim(), author: author.trim() || '佚名', cover: COVER(['1374235','1528369415105','1029141','256541'][Math.floor(Math.random()*4)]), chapters: [{ id: uid(), title: '第一章', content: content.trim() }], addedAt: Date.now() };
      onChange([n, ...list]); setTitle(''); setAuthor(''); setAdding(false);
    } catch (e) { alert(`生成失败：${(e as Error).message}`); }
    finally { setGenerating(false); }
  };

  const aiNextChapter = async (n: Novel) => {
    setGenerating(true);
    try {
      const last = n.chapters[n.chapters.length - 1];
      const sys = '你是小说作者，请续写下一章，约300字，承接上文剧情。只输出正文。';
      const content = await askAI(api, sys, `小说《${n.title}》上一章结尾：\n${last.content.slice(-200)}\n请续写下一章：`, { temperature: 0.85, maxTokens: 600 });
      const ch = { id: uid(), title: `第${n.chapters.length + 1}章`, content: content.trim() };
      const next = { ...n, chapters: [...n.chapters, ch] };
      update(n.id, () => next); setActive(next); setChapterIdx(next.chapters.length - 1);
    } catch (e) { alert(`续写失败：${(e as Error).message}`); }
    finally { setGenerating(false); }
  };

  // reading view
  if (active) {
    const ch = active.chapters[chapterIdx];
    return (
      <AppScreen title={active.title} onBack={() => setActive(null)} noPad right={<button onClick={() => aiNextChapter(active)} disabled={generating} className="tap txt-accent"><Sparkles size={20} /></button>}>
        <div className="flex flex-col h-full">
          <div className="px-5 pt-3 pb-2 border-b border-[var(--border)] shrink-0">
            <div className="text-[13px] txt-faint">{active.author}</div>
            <div className="font-title text-[15px] txt-accent mt-0.5">{ch.title}</div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 text-[15px] leading-[1.8] txt-dim whitespace-pre-wrap font-serif" style={{ fontFamily: 'var(--font-title, serif)' }}>
            {ch.content}
          </div>
          <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between shrink-0">
            <button onClick={() => setChapterIdx((i) => Math.max(0, i - 1))} disabled={chapterIdx === 0} className="tap w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-[12px] txt-faint tabular-nums">{chapterIdx + 1} / {active.chapters.length}</span>
            <button onClick={() => setChapterIdx((i) => Math.min(active.chapters.length - 1, i + 1))} disabled={chapterIdx === active.chapters.length - 1} className="tap w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
          {chapterIdx === active.chapters.length - 1 && (
            <div className="px-5 pb-4 shrink-0">
              <button onClick={() => aiNextChapter(active)} disabled={generating} className="tap w-full h-11 rounded-full glass font-medium flex items-center justify-center gap-2 disabled:opacity-50"><Sparkles size={16} className="txt-accent" /> {generating ? 'AI 续写中…' : 'AI 续写下一章'}</button>
            </div>
          )}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="小说" onBack={onBack} right={<button onClick={() => setAdding(true)} className="tap text-[var(--accent)]"><Plus size={22} /></button>}>
      <div className="text-[12px] txt-faint mb-3">书架 · {list.length}本</div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {list.map((n) => (
          <button key={n.id} onClick={() => openNovel(n)} className="tap text-left group">
            <div className="aspect-[3/4] rounded-lg overflow-hidden mb-1.5 shadow-md relative">
              <img src={n.cover} className="w-full h-full object-cover" alt="" />
              {n.lastReadChapter && <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}><Bookmark size={11} className="text-[var(--bg)]" /></div>}
            </div>
            <div className="text-[12px] line-clamp-2 leading-tight">{n.title}</div>
            <div className="text-[10px] txt-faint mt-0.5">{n.author}</div>
          </button>
        ))}
      </div>

      <ListGroup>
        {list.map((n) => (
          <Row key={n.id} label={n.title} hint={`${n.author} · ${n.chapters.length}章`} onClick={() => openNovel(n)} right={<button onClick={(e) => { e.stopPropagation(); setConfirmDel(n); }} className="tap txt-dim"><Trash2 size={15} /></button>} />
        ))}
      </ListGroup>

      <Modal open={adding} onClose={() => setAdding(false)} title="新建小说">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="书名" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="作者（可选）" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" />
        <PrimaryButton onClick={aiCreate} disabled={generating || !title.trim()} loading={generating}>{generating ? 'AI 创作中…' : 'AI 创作第一章'}</PrimaryButton>
      </Modal>

      <Confirm open={!!confirmDel} title="删除小说" message={`确定删除《${confirmDel?.title}》？`} danger onConfirm={() => { if (confirmDel) onChange(list.filter((n) => n.id !== confirmDel.id)); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
