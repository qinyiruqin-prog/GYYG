import React, { useState } from 'react';
import { Sparkles, Wand2, User, UserRound, BookMarked, Check, Loader2, Download, RefreshCw } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { PrimaryButton } from '../components/ui';
import { Modal } from '../components/Sheet';
import { uid } from '../utils';
import { generatePersonaPack, type GeneratedPack } from '../api';
import type { ApiConfig, Character, UserIdentity, WorldEntry } from '../types';

const WORD_OPTIONS = [1000, 1200, 1500, 1800, 2000];

export function GeneratorScreen({
  api,
  onAddCharacter,
  onAddUser,
  onAddWorldEntries,
  onBack,
}: {
  api: ApiConfig;
  onAddCharacter: (c: Character) => void;
  onAddUser: (u: UserIdentity) => void;
  onAddWorldEntries: (e: WorldEntry[]) => void;
  onBack: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [wordCount, setWordCount] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<GeneratedPack | null>(null);
  const [saved, setSaved] = useState<{ char?: boolean; user?: boolean; world?: boolean }>({});
  const [preview, setPreview] = useState<'char' | 'user' | 'world' | null>(null);

  const run = async () => {
    if (!keyword.trim()) { setErr('请输入关键词'); return; }
    if (!api.chat.baseUrl) { setErr('请先在「我的 → API 配置」中配置 Chat API'); return; }
    setLoading(true); setErr(''); setResult(null); setSaved({});
    try {
      const pack = await generatePersonaPack(api, keyword.trim(), wordCount);
      if (!pack.char?.name) throw new Error('生成结果不完整，请重试');
      setResult(pack);
    } catch (e) {
      setErr((e as Error).message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const saveChar = () => {
    if (!result) return;
    const c: Character = {
      id: uid(),
      name: result.char.name,
      avatar: '',
      signature: result.char.signature || '',
      persona: result.char.persona,
      greeting: result.char.greeting || `你好，我是${result.char.name}。`,
      imagePromptTemplate: result.char.imagePromptTemplate || '',
      createdAt: Date.now(),
    };
    onAddCharacter(c);
    setSaved((s) => ({ ...s, char: true }));
  };
  const saveUser = () => {
    if (!result) return;
    const u: UserIdentity = {
      id: uid(),
      nickname: result.user.nickname || 'User',
      signature: result.user.signature || '',
      imagePromptTemplate: result.user.imagePromptTemplate || '',
      isAlt: false,
      createdAt: Date.now(),
    };
    onAddUser(u);
    setSaved((s) => ({ ...s, user: true }));
  };
  const saveWorld = () => {
    if (!result) return;
    const entries: WorldEntry[] = (result.world ?? []).map((w) => ({
      id: uid(),
      key: w.key,
      content: w.content,
      priority: w.priority ?? 0,
    }));
    onAddWorldEntries(entries);
    setSaved((s) => ({ ...s, world: true }));
  };
  const saveAll = () => { saveChar(); saveUser(); saveWorld(); };

  const ready = !!result;

  return (
    <AppScreen title="人设生成器" onBack={onBack}>
      <div className="text-[12px] txt-faint mb-4 leading-relaxed">
        输入关键词，AI 一键生成配套的 <span className="txt-accent">AI 角色卡</span>、<span className="txt-accent">用户人设卡</span> 与 <span className="txt-accent">世界书词条</span>，可直接保存到本机使用。
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-4 space-y-4 mb-4">
        <div>
          <div className="text-[12px] txt-dim mb-1.5 flex items-center gap-1.5"><Wand2 size={13} /> 关键词 / 主题描述</div>
          <textarea
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例：赛博朋克世界的黑客少女、古代书院的清冷夫子、末日废土里的流浪商人…"
            rows={2}
            className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none bg-transparent placeholder:text-[var(--text-faint)]"
          />
        </div>
        <div>
          <div className="text-[12px] txt-dim mb-1.5">生成字数范围</div>
          <div className="flex flex-wrap gap-2">
            {WORD_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWordCount(w)}
                className={`tap px-3.5 h-9 rounded-full text-[13px] transition-all ${wordCount === w ? 'text-white' : 'glass txt-dim'}`}
                style={wordCount === w ? { background: 'var(--accent)' } : undefined}
              >
                {w}字
              </button>
            ))}
          </div>
        </div>
        {err && <div className="text-[12px] text-[var(--danger)] text-center">{err}</div>}
        <PrimaryButton onClick={run} disabled={loading || !keyword.trim()}>
          {loading ? (
            <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> 正在生成…</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Sparkles size={16} /> 生成人设卡</span>
          )}
        </PrimaryButton>
      </div>

      {/* Results */}
      {ready && result && (
        <div className="space-y-3 animate-fade-in">
          {/* Char card */}
          <ResultCard
            icon={<User size={15} />}
            title="AI 角色卡"
            name={result.char.name}
            subtitle={result.char.signature}
            onPreview={() => setPreview('char')}
            saved={saved.char}
            onSave={saveChar}
          />
          {/* User card */}
          <ResultCard
            icon={<UserRound size={15} />}
            title="用户人设卡"
            name={result.user.nickname}
            subtitle={result.user.signature}
            onPreview={() => setPreview('user')}
            saved={saved.user}
            onSave={saveUser}
          />
          {/* World entries */}
          <ResultCard
            icon={<BookMarked size={15} />}
            title="世界书词条"
            name={`${result.world?.length ?? 0} 条词条`}
            subtitle={result.world?.map((w) => w.key).join('、') || '无'}
            onPreview={() => setPreview('world')}
            saved={saved.world}
            onSave={saveWorld}
          />

          <div className="flex gap-3 pt-1">
            <button onClick={run} className="tap flex-1 h-11 rounded-full glass text-[14px] flex items-center justify-center gap-2 txt-dim">
              <RefreshCw size={15} /> 重新生成
            </button>
            <button
              onClick={saveAll}
              className="tap flex-1 h-11 rounded-full font-medium text-[14px] flex items-center justify-center gap-2 text-[var(--bg)]"
              style={{ background: 'var(--accent)' }}
            >
              <Download size={15} /> 全部保存
            </button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview === 'char' ? 'AI 角色卡' : preview === 'user' ? '用户人设卡' : '世界书词条'}
      >
        {preview === 'char' && result && (
          <div className="space-y-3">
            <Field label="角色名" value={result.char.name} />
            <Field label="签名" value={result.char.signature} />
            <Field label="开场白" value={result.char.greeting} />
            <Field label="外观生图提示词" value={result.char.imagePromptTemplate} />
            <div>
              <div className="text-[12px] txt-dim mb-1">人设</div>
              <div className="glass rounded-xl p-3 text-[13px] leading-relaxed txt-dim whitespace-pre-wrap max-h-[40vh] overflow-y-auto no-scrollbar">{result.char.persona}</div>
            </div>
          </div>
        )}
        {preview === 'user' && result && (
          <div className="space-y-3">
            <Field label="昵称" value={result.user.nickname} />
            <Field label="签名" value={result.user.signature} />
            <Field label="图片提示词模板" value={result.user.imagePromptTemplate} />
          </div>
        )}
        {preview === 'world' && result && (
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto no-scrollbar">
            {(result.world ?? []).map((w, i) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium txt-accent">{w.key}</span>
                  <span className="text-[10px] txt-faint px-1.5 py-0.5 rounded-full glass">优先级 {w.priority}</span>
                </div>
                <div className="text-[12px] leading-relaxed txt-dim">{w.content}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AppScreen>
  );
}

function ResultCard({
  icon, title, name, subtitle, onPreview, onSave, saved,
}: {
  icon: React.ReactNode;
  title: string;
  name: string;
  subtitle: string;
  onPreview: () => void;
  onSave: () => void;
  saved?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl icon-bg flex items-center justify-center shrink-0">
        <span className="icon-color">{icon}</span>
      </div>
      <button onClick={onPreview} className="flex-1 text-left min-w-0 tap">
        <div className="text-[12px] txt-faint">{title}</div>
        <div className="text-[15px] font-medium truncate">{name}</div>
        <div className="text-[12px] txt-faint truncate">{subtitle}</div>
      </button>
      <button
        onClick={onSave}
        disabled={saved}
        className={`tap h-9 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 shrink-0 transition-all ${saved ? 'glass txt-accent' : 'text-[var(--bg)]'}`}
        style={!saved ? { background: 'var(--accent)' } : undefined}
      >
        {saved ? <><Check size={14} /> 已保存</> : '保存'}
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] txt-dim mb-1">{label}</div>
      <div className="glass rounded-xl p-3 text-[13px] leading-relaxed whitespace-pre-wrap">{value || '（空）'}</div>
    </div>
  );
}
