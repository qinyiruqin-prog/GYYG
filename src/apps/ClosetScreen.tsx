import { useState } from 'react';
import { Shirt, Plus, Star, Search, Sparkles } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import { askAIJson } from '../api';
import type { ApiConfig, Outfit, Character } from '../types';

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const STYLES = ['休闲', '正式', '运动', '甜美', '街头', '复古', '简约', '时尚'];
const OCCASIONS = ['日常', '上班', '约会', '聚会', '运动', '旅行', '居家'];

const PIECE_TYPES = [
  { id: 'top', name: '上装', emoji: '👕' },
  { id: 'bottom', name: '下装', emoji: '👖' },
  { id: 'dress', name: '连衣裙', emoji: '👗' },
  { id: 'shoes', name: '鞋子', emoji: '👟' },
  { id: 'accessory', name: '配饰', emoji: '👜' },
] as const;

const SEED_OUTFITS: Outfit[] = [
  { id: 'o1', name: '休闲日常', pieces: [{ type: 'top', image: SAMPLE_IMAGES[0] }, { type: 'bottom', image: SAMPLE_IMAGES[1] }], style: '休闲', occasion: '日常', favorite: false, ts: Date.now() },
  { id: 'o2', name: '正式通勤', pieces: [{ type: 'dress', image: SAMPLE_IMAGES[2] }, { type: 'shoes', image: SAMPLE_IMAGES[0] }], style: '正式', occasion: '上班', favorite: true, ts: Date.now() },
];

export function ClosetScreen({
  api,
  characters,
  outfits,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  characters: Character[];
  outfits: Outfit[];
  onChange: (o: Outfit[]) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState('');
  const [filterStyle, setFilterStyle] = useState<string>('all');
  const [filterCharId, setFilterCharId] = useState<string>('all');
  const [composing, setComposing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState<Outfit | null>(null);
  const [confirmDel, setConfirmDel] = useState<Outfit | null>(null);

  // 表单字段
  const [name, setName] = useState('');
  const [charId, setCharId] = useState('');
  const [style, setStyle] = useState('休闲');
  const [occasion, setOccasion] = useState('日常');
  const [pieces, setPieces] = useState<Outfit['pieces']>([]);

  const allOutfits = outfits.length > 0 ? outfits : SEED_OUTFITS;
  if (outfits.length === 0) onChange(SEED_OUTFITS);

  const filtered = allOutfits
    .filter((o) => {
      if (filterStyle !== 'all' && o.style !== filterStyle) return false;
      if (filterCharId !== 'all' && o.characterId !== filterCharId) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.name.toLowerCase().includes(q) || o.style.toLowerCase().includes(q) || o.occasion?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || b.ts - a.ts);

  const resetForm = () => {
    setName('');
    setCharId('');
    setStyle('休闲');
    setOccasion('日常');
    setPieces([]);
  };

  const addPiece = (type: Outfit['pieces'][0]['type']) => {
    setPieces([...pieces, { type, image: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)] }]);
  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const save = () => {
    if (!name.trim() || pieces.length === 0) return;
    const o: Outfit = {
      id: uid(),
      name: name.trim(),
      characterId: charId || undefined,
      pieces,
      style,
      occasion,
      favorite: false,
      ts: Date.now(),
    };
    onChange([...allOutfits, o]);
    resetForm();
    setComposing(false);
  };

  const toggleFavorite = (id: string) => {
    onChange(allOutfits.map((o) => o.id === id ? { ...o, favorite: !o.favorite } : o));
  };

  const del = (id: string) => onChange(allOutfits.filter((o) => o.id !== id));

  const aiGenerate = async () => {
    setGenerating(true);
    try {
      const sys = '你在生成服装搭配。返回JSON：{"name":"搭配名","style":"风格","occasion":"场合","pieces":[{"type":"top/bottom/dress/shoes/accessory"}]}';
      const data = await askAIJson<{ name: string; style: string; occasion: string; pieces: { type: Outfit['pieces'][0]['type'] }[] }>(api, sys, '请生成一套日常服装搭配：', { temperature: 0.8, maxTokens: 300 });
      const o: Outfit = {
        id: uid(),
        name: data.name,
        pieces: data.pieces.map((p) => ({ type: p.type, image: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)] })),
        style: data.style,
        occasion: data.occasion,
        favorite: false,
        ts: Date.now(),
      };
      onChange([...allOutfits, o]);
      setComposing(false);
    } catch (e) {
      alert(`AI生成失败：${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  // 详情页
  if (detail) {
    const o = allOutfits.find((x) => x.id === detail.id) ?? detail;
    const char = characters.find((c) => c.id === o.characterId);
    return (
      <AppScreen title={o.name} onBack={() => setDetail(null)} noPad>
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[13px] glass txt-accent">{o.style}</span>
              {o.occasion && <span className="px-3 py-1 rounded-full text-[13px] glass txt-dim">{o.occasion}</span>}
            </div>
            <button onClick={() => { toggleFavorite(o.id); setDetail({ ...o, favorite: !o.favorite }); }} className="tap">
              <Star size={20} className={o.favorite ? 'txt-accent' : 'txt-faint'} fill={o.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          {char && (
            <div className="flex items-center gap-2 mb-4">
              {char.avatar ? (
                <img src={char.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full icon-bg flex items-center justify-center text-[12px] txt-accent">{char.name[0]}</div>
              )}
              <span className="text-[13px] txt-dim">{char.name}的搭配</span>
            </div>
          )}
          <div className="space-y-3">
            {o.pieces.map((piece, i) => {
              const typeInfo = PIECE_TYPES.find((t) => t.id === piece.type);
              return (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <img src={piece.image} className="w-full aspect-[4/3] object-cover" alt="" />
                  <div className="p-3 text-[14px] txt-dim">
                    {typeInfo?.emoji} {typeInfo?.name}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setConfirmDel(o); setDetail(null); }} className="tap flex-1 h-11 rounded-full glass font-medium txt-accent">删除</button>
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="衣柜"
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索搭配..." className="flex-1 bg-transparent outline-none text-[14px]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setFilterStyle('all')} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterStyle === 'all' ? 'txt-accent glass' : 'txt-faint'}`}>全部风格</button>
          {STYLES.map((s) => (
            <button key={s} onClick={() => setFilterStyle(s)} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterStyle === s ? 'txt-accent glass' : 'txt-faint'}`}>{s}</button>
          ))}
        </div>
        {characters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setFilterCharId('all')} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterCharId === 'all' ? 'txt-accent glass' : 'txt-faint'}`}>全部角色</button>
            {characters.map((c) => (
              <button key={c.id} onClick={() => setFilterCharId(c.id)} className={`tap px-3 h-8 rounded-full text-[13px] shrink-0 ${filterCharId === c.id ? 'txt-accent glass' : 'txt-faint'}`}>{c.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* 搭配列表 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
        {filtered.length === 0 ? (
          <div className="text-center txt-faint py-8">{allOutfits.length === 0 ? '还没有搭配，创建第一套吧' : '没有找到匹配的搭配'}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((o) => {
              const char = characters.find((c) => c.id === o.characterId);
              return (
                <div key={o.id} className="tap glass rounded-2xl overflow-hidden" onClick={() => setDetail(o)}>
                  <div className="relative">
                    <img src={o.pieces[0]?.image || SAMPLE_IMAGES[0]} className="w-full aspect-[3/4] object-cover" alt="" />
                    {o.favorite && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <Star size={14} className="text-yellow-400" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-[14px] font-medium mb-1 line-clamp-1">{o.name}</div>
                    <div className="flex items-center gap-2 text-[12px] txt-faint mb-1">
                      <span>{o.style}</span>
                      {o.occasion && <span>· {o.occasion}</span>}
                    </div>
                    {char && <div className="text-[11px] txt-faint">{char.name}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 创建搭配模态框 */}
      <Modal open={composing} onClose={() => { setComposing(false); resetForm(); }} title="创建搭配">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="搭配名称" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        {characters.length > 0 && (
          <select value={charId} onChange={(e) => setCharId(e.target.value)} className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3">
            <option value="">不指定角色</option>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div className="flex gap-3 mb-3">
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="flex-1 glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent">
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="flex-1 glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent">
            {OCCASIONS.map((occ) => <option key={occ} value={occ}>{occ}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <div className="text-[13px] txt-dim mb-2">单品 ({pieces.length})</div>
          {pieces.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {pieces.map((piece, i) => {
                const typeInfo = PIECE_TYPES.find((t) => t.id === piece.type);
                return (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={piece.image} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => removePiece(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap text-white text-[18px]">×</button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center">{typeInfo?.emoji}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {PIECE_TYPES.map((t) => (
              <button key={t.id} onClick={() => addPiece(t.id)} className="tap px-3 h-9 rounded-full glass text-[13px]">{t.emoji} {t.name}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={aiGenerate} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI 生成'}
          </button>
          <button onClick={save} disabled={!name.trim() || pieces.length === 0} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>创建</button>
        </div>
      </Modal>

      {/* 删除确认 */}
      <Confirm open={!!confirmDel} title="删除搭配" message="确定删除这套搭配？" danger onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
