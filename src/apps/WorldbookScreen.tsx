import { useState, useRef } from 'react';
import { Plus, Trash2, BookMarked, ChevronUp, ChevronDown, KeyRound, Upload, FileText } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { PrimaryButton } from '../components/ui';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import type { WorldEntry } from '../types';

export function WorldbookScreen({
  entries,
  onChange,
  onBack,
}: {
  entries: WorldEntry[];
  onChange: (e: WorldEntry[]) => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState<WorldEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirmDel, setConfirmDel] = useState<WorldEntry | null>(null);
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState(0);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...entries].sort((a, b) => b.priority - a.priority);

  const save = () => {
    if (!key.trim()) return;
    if (editing) {
      onChange(entries.map((e) => e.id === editing.id ? { ...e, key: key.trim(), content: content.trim(), priority } : e));
    } else {
      onChange([...entries, { id: uid(), key: key.trim(), content: content.trim(), priority }]);
    }
    reset();
  };

  const reset = () => { setKey(''); setContent(''); setPriority(0); setEditing(null); setAdding(false); };

  const edit = (e: WorldEntry) => { setEditing(e); setKey(e.key); setContent(e.content); setPriority(e.priority); setAdding(true); };

  const del = (id: string) => onChange(entries.filter((e) => e.id !== id));

  const handleFileImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseAndAdd(text);
      } catch (err: any) {
        alert('文件解析失败：' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const parseAndAdd = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      const newEntries: WorldEntry[] = [];
      
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          const k = item.key || item.keyword || item.name || '';
          const c = item.content || item.value || item.desc || '';
          if (k && c) {
            newEntries.push({ id: uid(), key: k, content: c, priority: Number(item.priority || 0) });
          }
        });
      } else if (parsed.world || parsed.entries) {
        const entriesList = parsed.world ?? parsed.entries;
        if (Array.isArray(entriesList)) {
          entriesList.forEach((item: any) => {
            const k = item.key || item.keyword || item.keys?.[0] || '';
            const c = item.content || item.value || '';
            if (k && c) {
              newEntries.push({ id: uid(), key: k, content: c, priority: Number(item.priority || 0) });
            }
          });
        }
      } else {
        const k = parsed.key || parsed.keyword || '';
        const c = parsed.content || parsed.value || '';
        if (k && c) {
          newEntries.push({ id: uid(), key: k, content: c, priority: Number(parsed.priority || 0) });
        }
      }

      if (newEntries.length > 0) {
        onChange([...entries, ...newEntries]);
        alert(`成功导入 ${newEntries.length} 条世界书词条！`);
        setImporting(false);
        setPastedText('');
      } else {
        alert('未识别到有效的世界书词条。JSON需包含 key 与 content 字段！');
      }
    } catch {
      // split by line format: "key: content" or "key：content"
      const lines = text.split('\n');
      const newEntries: WorldEntry[] = [];
      lines.forEach((line) => {
        const index = line.indexOf(':');
        const zhIndex = line.indexOf('：');
        const splitIdx = index !== -1 ? index : zhIndex;
        if (splitIdx > 0) {
          const k = line.substring(0, splitIdx).trim();
          const c = line.substring(splitIdx + 1).trim();
          if (k && c && k.length < 25) {
            newEntries.push({ id: uid(), key: k, content: c, priority: 0 });
          }
        }
      });

      if (newEntries.length > 0) {
        onChange([...entries, ...newEntries]);
        alert(`从文本中识别并成功导入 ${newEntries.length} 条词条！`);
        setImporting(false);
        setPastedText('');
      } else {
        alert('未能从文本中解析出词条。请使用“关键词：具体内容”的格式，每行一个。或者使用 JSON 格式。');
      }
    }
  };

  return (
    <AppScreen title="世界书" onBack={onBack} right={<button onClick={() => { reset(); setAdding(true); }} className="tap text-[var(--accent)]"><Plus size={22} /></button>}>
      <div className="text-[12px] txt-faint mb-4 leading-relaxed">
        世界书为 AI 角色提供背景设定。当聊天中出现「关键词」时，对应的世界观条目会自动注入到对话上下文，让 AI 更懂你的世界。优先级越高越先注入。
      </div>

      <div className="glass rounded-2xl p-3 mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="txt-accent" />
          <div className="text-[13px] txt-dim">共 {entries.length} 条词条 · 用于「聊天」应用</div>
        </div>
        <button onClick={() => setImporting(true)} className="tap text-[11px] px-2 py-1 bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/15 rounded-lg flex items-center gap-1 cursor-pointer">
          <Upload size={12} /> 导入文档
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center txt-faint text-sm">还没有词条，点右上角 + 添加</div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((e) => (
            <div key={e.id} className="glass rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] txt-accent" style={{ background: 'var(--icon-bg-active)' }}>{e.key}</span>
                  <span className="text-[11px] txt-faint">优先级 {e.priority}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onChange(entries.map((x) => x.id === e.id ? { ...x, priority: x.priority + 1 } : x))} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><ChevronUp size={14} /></button>
                  <button onClick={() => onChange(entries.map((x) => x.id === e.id ? { ...x, priority: x.priority - 1 } : x))} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><ChevronDown size={14} /></button>
                  <button onClick={() => edit(e)} className="tap w-7 h-7 rounded-full glass flex items-center justify-center"><BookMarked size={14} /></button>
                  <button onClick={() => setConfirmDel(e)} className="tap w-7 h-7 rounded-full glass flex items-center justify-center text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="text-[13px] txt-dim leading-relaxed">{e.content}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={reset} title={editing ? '编辑词条' : '新建词条'}>
        <div className="text-[12px] txt-dim mb-1">触发关键词</div>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="例如：星陨城 / 暗影组织" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <div className="text-[12px] txt-dim mb-1">世界观内容</div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="当关键词出现时注入给 AI 的设定描述…" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" />
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[12px] txt-dim">优先级</span>
          <input type="range" min={0} max={10} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
          <span className="text-[14px] tabular-nums w-6 text-center txt-accent">{priority}</span>
        </div>
        <PrimaryButton onClick={save} disabled={!key.trim()}>{editing ? '保存修改' : '添加词条'}</PrimaryButton>
      </Modal>

      <Confirm open={!!confirmDel} title="删除词条" message={`确定删除关键词「${confirmDel?.key}」的词条？`} danger onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />

      <Modal open={importing} onClose={() => { setImporting(false); setPastedText(''); }} title="导入世界书文档">
        <div className="text-[12px] txt-dim mb-3 leading-relaxed">
          您可以选择直接上传 <strong>.json</strong> 或 <strong>.txt</strong> 文档，也可以在下方粘贴内容导入。
        </div>

        {/* File Drag / Selector */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="tap border border-dashed border-[var(--border)] rounded-2xl p-6 text-center bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors mb-4 cursor-pointer"
        >
          <FileText size={24} className="mx-auto text-indigo-400 mb-2" />
          <div className="text-[13px] font-medium">点击选择或拖拽文件到这里</div>
          <div className="text-[11px] txt-faint mt-1">支持：SillyTavern 世界书 JSON、标准 JSON 数组、或 TXT 文本</div>
        </div>
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".json,.txt" 
          className="hidden" 
          onChange={(e) => handleFileImport(e.target.files?.[0])} 
        />

        <div className="text-[12px] txt-dim mb-1.5">或：直接粘贴文本/JSON</div>
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="粘贴格式如:&#13;关键词：具体的世界观介绍描述&#13;或者 JSON: [{&quot;key&quot;:&quot;星陨城&quot;,&quot;content&quot;:&quot;一个古老的城市...&quot;}]"
          rows={6}
          className="w-full glass rounded-xl px-3 py-2.5 text-[13px] outline-none bg-transparent resize-none mb-4 placeholder:text-neutral-600 font-mono"
        />

        <div className="flex gap-3">
          <button onClick={() => { setImporting(false); setPastedText(''); }} className="tap flex-1 h-11 rounded-full glass">取消</button>
          <button 
            onClick={() => parseAndAdd(pastedText)} 
            disabled={!pastedText.trim()} 
            className="tap flex-1 h-11 rounded-full font-semibold cursor-pointer disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            解析并导入
          </button>
        </div>
      </Modal>
    </AppScreen>
  );
}
