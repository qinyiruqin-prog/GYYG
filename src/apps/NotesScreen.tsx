import { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Calendar, Sparkles, Check, CheckSquare, Save, X, Lightbulb } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { uid, cls } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, MemoNote } from '../types';

const CATEGORIES = ['全部', '生活', '工作', '灵感', '备忘'];

export function NotesScreen({
  api,
  memos = [],
  onChangeMemos,
  onBack,
}: {
  api: ApiConfig;
  memos: MemoNote[];
  onChangeMemos: (memos: MemoNote[]) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [active, setActive] = useState<MemoNote | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCat, setEditCat] = useState('生活');
  const [editContent, setEditContent] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState('');

  // filter
  const filtered = memos.filter((m) => {
    const matchCat = cat === '全部' || m.category === cat;
    const matchQ = m.title.toLowerCase().includes(q.toLowerCase()) || m.content.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const handleOpenNote = (note: MemoNote) => {
    setActive(note);
    setIsEdit(false);
    setEditTitle(note.title);
    setEditCat(note.category);
    setEditContent(note.content);
    setAiTips('');
  };

  const handleCreateNew = () => {
    setActive(null);
    setIsEdit(true);
    setEditTitle('');
    setEditCat('生活');
    setEditContent('');
    setAiTips('');
  };

  const handleSave = () => {
    if (!editTitle.trim() && !editContent.trim()) return;
    
    const finalTitle = editTitle.trim() || '未命名备忘';
    
    if (active) {
      // update
      const updated = memos.map((m) =>
        m.id === active.id
          ? { ...m, title: finalTitle, category: editCat, content: editContent, updatedAt: Date.now() }
          : m
      );
      onChangeMemos(updated);
      setActive({ ...active, title: finalTitle, category: editCat, content: editContent, updatedAt: Date.now() });
    } else {
      // insert
      const newNote: MemoNote = {
        id: 'memo-' + uid(),
        title: finalTitle,
        content: editContent,
        category: editCat,
        updatedAt: Date.now(),
      };
      onChangeMemos([newNote, ...memos]);
      setActive(newNote);
    }
    setIsEdit(false);
  };

  const handleDelete = (id: string) => {
    onChangeMemos(memos.filter((m) => m.id !== id));
    setActive(null);
    setIsEdit(false);
  };

  const handleAiPolish = async () => {
    if (!editContent.trim()) return;
    setAiLoading(true);
    setAiTips('');
    try {
      const prompt = `请帮我润色并重构以下备忘录草稿内容。
要求：
1. 保持原有语义，使其逻辑更清晰、排版更美观、结构化、用词得体。
2. 可以添加合适的 Emoji。
3. 请分段整理，或者整理成 markdown 待办清单。
4. **只返回润色后的正文内容，不要有任何多余的解释、回复或 markdown 围栏。**

草稿正文：
${editContent}`;

      const res = await askAI(api, '你是一个贴心的手机备忘录智能助手。请严格按照要求进行内容润色，直接返回润色后的文本。', prompt);
      if (res) {
        setEditContent(res.trim());
        setAiTips('✨ 已使用 AI 智能排版和润色');
      }
    } catch (err) {
      setAiTips('❌ 润色失败：' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiTitle = async () => {
    if (!editContent.trim()) return;
    setAiLoading(true);
    setAiTips('');
    try {
      const prompt = `请根据以下备忘录内容，为其生成一个简短、吸引人且契合主旨的标题。
要求：
1. 长度控制在 10 个字以内。
2. 可以包含一个符合主题的表情符号 (Emoji)。
3. **只返回标题文本，不要包含引号、解释或任何多余文字。**

备忘内容：
${editContent}`;

      const res = await askAI(api, '你是一个高效率的标题生成器。', prompt);
      if (res) {
        setEditTitle(res.replace(/[“‘’”]/g, '').trim());
        setAiTips('✨ AI 标题生成成功');
      }
    } catch (err) {
      setAiTips('❌ 标题生成失败：' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  // Detail view
  if (active || isEdit) {
    return (
      <AppScreen
        title={isEdit ? (active ? '编辑备忘' : '新建备忘') : '查看备忘'}
        onBack={() => {
          if (isEdit && !active) {
            setIsEdit(false);
          } else if (isEdit && active) {
            setIsEdit(false);
          } else {
            setActive(null);
          }
        }}
        right={
          isEdit ? (
            <button onClick={handleSave} className="tap px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
              <Save size={12} /> 保存
            </button>
          ) : (
            <div className="flex gap-1">
              <button onClick={() => setIsEdit(true)} className="tap p-2 glass text-indigo-400 rounded-full">
                <Edit3 size={15} />
              </button>
              <button onClick={() => handleDelete(active!.id)} className="tap p-2 glass text-rose-400 rounded-full">
                <Trash2 size={15} />
              </button>
            </div>
          )
        }
      >
        <div className="flex flex-col h-full space-y-4">
          {/* Category picker inside edit mode */}
          {isEdit ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.slice(1).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditCat(c)}
                    className={cls(
                      'tap px-3.5 py-1 rounded-full text-xs font-medium transition-colors',
                      editCat === c ? 'bg-indigo-600 text-white' : 'glass txt-dim'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="请输入备忘录标题..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-neutral-900/60 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none text-white focus:border-indigo-500/50"
                />
                {api.chat.baseUrl && editContent.trim() && (
                  <button
                    onClick={handleAiTitle}
                    disabled={aiLoading}
                    className="tap h-9 px-3 glass hover:bg-neutral-800 text-indigo-400 rounded-xl text-xs flex items-center gap-1 font-semibold border border-indigo-500/20 shrink-0"
                    title="AI 自动提取标题"
                  >
                    <Sparkles size={12} /> AI 标题
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="border-b border-neutral-800/80 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {active!.category}
                </span>
                <span className="text-[11px] txt-faint flex items-center gap-1">
                  <Calendar size={11} /> {new Date(active!.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-tight">{active!.title}</h2>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col relative min-h-[160px]">
            {isEdit ? (
              <textarea
                placeholder="开始记录这一刻的想法、灵感或任务清单..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full flex-1 bg-transparent border-0 resize-none outline-none text-sm text-neutral-200 leading-relaxed placeholder-neutral-500"
              />
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed py-1">
                {active!.content || <span className="txt-faint italic">无内容</span>}
              </div>
            )}
          </div>

          {/* AI Assistance Toolbar in Edit Mode */}
          {isEdit && api.chat.baseUrl && (
            <div className="border-t border-neutral-800/60 pt-3 flex flex-col gap-2 bg-neutral-950/20 p-2.5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> AI 灵感口袋
                </span>
                {aiTips && <span className="text-[10px] text-neutral-400">{aiTips}</span>}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAiPolish}
                  disabled={aiLoading || !editContent.trim()}
                  className="tap flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles size={12} /> {aiLoading ? '润色中...' : '智能润色 & 排版'}
                </button>
              </div>
            </div>
          )}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="备忘录"
      onBack={onBack}
      right={
        <button onClick={handleCreateNew} className="tap p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full">
          <Plus size={16} />
        </button>
      }
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Search & Categories */}
        <div className="space-y-3 shrink-0">
          <div className="flex items-center gap-2 glass rounded-2xl px-3 h-10 border border-neutral-800/60">
            <Search size={15} className="txt-faint" />
            <input
              type="text"
              placeholder="搜索标题或备忘内容..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder-neutral-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cls(
                  'tap shrink-0 px-3.5 h-7 rounded-full text-xs font-medium transition-colors',
                  cat === c ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'glass txt-dim'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-neutral-900/50 flex items-center justify-center border border-neutral-800/80">
                <Lightbulb size={20} className="text-neutral-600" />
              </div>
              <div className="text-xs">
                {memos.length === 0 ? '还没有任何备忘录，快来新建一条吧！' : '没有找到符合条件的备忘'}
              </div>
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => handleOpenNote(m)}
                className="tap p-3.5 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/60 border border-neutral-800/60 transition-colors flex flex-col space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    {m.category}
                  </span>
                  <span className="text-[10px] txt-faint">
                    {new Date(m.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-100 text-xs truncate leading-snug">{m.title}</h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {m.content || <span className="txt-faint italic">无正文</span>}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppScreen>
  );
}
