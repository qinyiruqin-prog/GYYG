import { useState } from 'react';
import { Brain, Plus, Star, Tag, Search, Trash2, Link as LinkIcon } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import type { Memory, Character } from '../types';

const MEMORY_TYPES = [
  { id: 'important', name: '重要', color: '#ef4444', emoji: '⭐' },
  { id: 'conversation', name: '对话', color: '#3b82f6', emoji: '💬' },
  { id: 'event', name: '事件', color: '#8b5cf6', emoji: '📅' },
  { id: 'emotion', name: '情感', color: '#ec4899', emoji: '❤️' },
] as const;

export function MemoryScreen({
  characters,
  memories,
  onChange,
  onBack,
}: {
  characters: Character[];
  memories: Memory[];
  onChange: (m: Memory[]) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filterCharId, setFilterCharId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [composing, setComposing] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [detail, setDetail] = useState<Memory | null>(null);
  const [confirmDel, setConfirmDel] = useState<Memory | null>(null);

  // 表单字段
  const [charId, setCharId] = useState('');
  const [type, setType] = useState<Memory['type']>('conversation');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState(50);
  const [tags, setTags] = useState('');

  const filtered = memories
    .filter((m) => {
      if (filterCharId !== 'all' && m.characterId !== filterCharId) return false;
      if (filterType !== 'all' && m.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.tags?.some((t) => t.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => b.importance - a.importance);

  const resetForm = () => {
    setCharId('');
    setType('conversation');
    setTitle('');
    setContent('');
    setImportance(50);
    setTags('');
  };

  const save = () => {
    if (!charId || !title.trim() || !content.trim()) return;
    const m: Memory = {
      id: uid(),
      characterId: charId,
      type,
      title: title.trim(),
      content: content.trim(),
      importance,
      tags: tags.split(/[,，\s]+/).filter(Boolean),
      ts: Date.now(),
    };
    onChange([...memories, m]);
    resetForm();
    setComposing(false);
  };

  const update = () => {
    if (!editing || !charId || !title.trim() || !content.trim()) return;
    onChange(memories.map((m) => m.id === editing.id ? { ...m, characterId: charId, type, title: title.trim(), content: content.trim(), importance, tags: tags.split(/[,，\s]+/).filter(Boolean) } : m));
    resetForm();
    setEditing(null);
  };

  const del = (id: string) => onChange(memories.filter((m) => m.id !== id));

  const openEdit = (m: Memory) => {
    setEditing(m);
    setCharId(m.characterId);
    setType(m.type);
    setTitle(m.title);
    setContent(m.content);
    setImportance(m.importance);
    setTags(m.tags?.join(' ') || '');
  };

  // 详情页
  if (detail) {
    const m = memories.find((x) => x.id === detail.id) ?? detail;
    const char = characters.find((c) => c.id === m.characterId);
    const typeInfo = MEMORY_TYPES.find((t) => t.id === m.type);
    return (
      <AppScreen title="记忆详情" onBack={() => setDetail(null)} noPad>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            {char?.avatar ? (
              <img src={char.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-12 h-12 rounded-full icon-bg flex items-center justify-center text-[15px] txt-accent">{char?.name[0] || '?'}</div>
            )}
            <div className="flex-1">
              <div className="text-[15px] font-medium">{char?.name || '未知角色'}</div>
              <div className="text-[12px] txt-faint">{typeInfo?.emoji} {typeInfo?.name}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-[14px] txt-accent mb-0.5">
                <Star size={14} fill="currentColor" />
                <span className="font-bold">{m.importance}</span>
              </div>
              <div className="text-[11px] txt-faint">重要度</div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="text-[16px] font-medium mb-3">{m.title}</div>
            <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap">{m.content}</div>
          </div>
          {m.tags && m.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Tag size={14} className="txt-faint" />
              <div className="flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full text-[12px] glass txt-accent">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="text-[12px] txt-faint">
            创建于 {new Date(m.ts).toLocaleString('zh-CN')}
            {m.lastAccessed && <span className="block mt-1">最后访问 {new Date(m.lastAccessed).toLocaleString('zh-CN')}</span>}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { openEdit(m); setDetail(null); }} className="tap flex-1 h-11 rounded-full glass font-medium">编辑</button>
            <button onClick={() => { setConfirmDel(m); setDetail(null); }} className="tap flex-1 h-11 rounded-full glass font-medium txt-accent">删除</button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="记忆系统"
      onBack={onBack}
      noPad
      right={
        <button onClick={() => { resetForm(); setComposing(true); }} className="tap text-[var(--accent)]">
          <Plus size={22} />
        </button>
      }
    >
      {/* 筛选栏 */}
      <div className="px-4 pt-3 pb-2 border-b border-[var(--border)] space-y-2 shrink-0">
        <div className="flex items-center gap-2 glass rounded-full px-3.5 h-10">
          <Search size={16} className="txt-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索记忆..." className="flex-1 bg-transparent outline-none text-[14px]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setFilterCharId('all')} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterCharId === 'all' ? 'txt-accent' : 'txt-faint'} ${filterCharId === 'all' ? 'glass' : ''}`}>全部角色</button>
          {characters.map((c) => (
            <button key={c.id} onClick={() => setFilterCharId(c.id)} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterCharId === c.id ? 'txt-accent' : 'txt-faint'} ${filterCharId === c.id ? 'glass' : ''}`}>{c.name}</button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setFilterType('all')} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterType === 'all' ? 'txt-accent' : 'txt-faint'} ${filterType === 'all' ? 'glass' : ''}`}>全部类型</button>
          {MEMORY_TYPES.map((t) => (
            <button key={t.id} onClick={() => setFilterType(t.id)} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterType === t.id ? 'txt-accent' : 'txt-faint'} ${filterType === t.id ? 'glass' : ''}`}>{t.emoji} {t.name}</button>
          ))}
        </div>
      </div>

      {/* 记忆列表 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
        {filtered.length === 0 ? (
          <div className="text-center txt-faint mt-16">
            {memories.length === 0 ? '还没有记忆，添加第一条吧' : '没有找到匹配的记忆'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => {
              const char = characters.find((c) => c.id === m.characterId);
              const typeInfo = MEMORY_TYPES.find((t) => t.id === m.type);
              return (
                <div key={m.id} className="glass rounded-2xl p-3 tap" onClick={() => setDetail(m)}>
                  <div className="flex items-start gap-2.5 mb-2">
                    {char?.avatar ? (
                      <img src={char.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent shrink-0">{char?.name[0] || '?'}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-medium">{m.title}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: `${typeInfo?.color}20`, color: typeInfo?.color }}>{typeInfo?.emoji}</span>
                      </div>
                      <div className="text-[13px] txt-dim line-clamp-2">{m.content}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-0.5 text-[12px] txt-accent">
                        <Star size={11} fill="currentColor" />
                        <span className="font-medium">{m.importance}</span>
                      </div>
                      <div className="text-[10px] txt-faint">{char?.name}</div>
                    </div>
                  </div>
                  {m.tags && m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.tags.slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[11px] txt-faint" style={{ background: 'var(--icon-bg)' }}>{t}</span>
                      ))}
                      {m.tags.length > 3 && <span className="px-1.5 py-0.5 text-[11px] txt-faint">+{m.tags.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      <Modal open={composing || !!editing} onClose={() => { setComposing(false); setEditing(null); resetForm(); }} title={editing ? '编辑记忆' : '添加记忆'}>
        <select value={charId} onChange={(e) => setCharId(e.target.value)} className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3">
          <option value="">选择角色</option>
          {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as Memory['type'])} className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3">
          {MEMORY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="记忆标题" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="记忆内容" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" />
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] txt-dim">重要度</span>
            <span className="text-[14px] txt-accent font-medium">{importance}</span>
          </div>
          <input type="range" min="0" max="100" value={importance} onChange={(e) => setImportance(parseInt(e.target.value))} className="w-full" />
        </div>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签（空格分隔）" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" />
        <button onClick={editing ? update : save} disabled={!charId || !title.trim() || !content.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>
          {editing ? '保存' : '添加'}
        </button>
      </Modal>

      {/* 删除确认 */}
      <Confirm open={!!confirmDel} title="删除记忆" message="确定删除这条记忆？删除后无法恢复。" danger onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
