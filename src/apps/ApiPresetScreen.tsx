import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, PrimaryButton } from '../components/ui';
import { Confirm, Modal } from '../components/Sheet';
import type { ApiConfig, ApiPreset } from '../types';
import { uid } from '../utils';

export function ApiPresetScreen({
  api,
  presets,
  activePresetId,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  presets: ApiPreset[];
  activePresetId: string | null;
  onChange: (presets: ApiPreset[], activeId: string | null) => void;
  onBack: () => void;
}) {
  const [nameInput, setNameInput] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiPreset | null>(null);

  const saveCurrent = () => {
    const name = nameInput.trim() || `预设 ${presets.length + 1}`;
    const p: ApiPreset = { id: uid(), name, chat: { ...api.chat }, voice: { ...api.voice }, image: { ...api.image } };
    onChange([...presets, p], p.id);
    setShowSave(false);
    setNameInput('');
  };

  const apply = (p: ApiPreset) => {
    // applying = mark active; the parent will copy preset into api
    onChange(presets, p.id);
  };

  const del = (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    const active = activePresetId === id ? (next[0]?.id ?? null) : activePresetId;
    onChange(next, active);
  };

  const activeName = presets.find((p) => p.id === activePresetId)?.name;

  return (
    <AppScreen
      title="API 预设"
      onBack={onBack}
      right={<button onClick={() => setShowSave(true)} className="tap text-[var(--accent)] text-[15px] font-medium">保存</button>}
    >
      <div className="text-[12px] txt-faint mb-3 leading-relaxed">
        把当前「API 配置中心」里的 Chat / 语音 / 绘图 配置存为一个命名预设，可一键切换。在「我的 → API 配置中心」修改后，回到这里点「保存」即可更新或新建。
      </div>

      <div className="glass rounded-2xl p-3 mb-4 flex items-center gap-2">
        <div className="text-[12px] txt-dim">当前生效：</div>
        <div className="font-medium txt-accent">{activeName ?? '未选择预设（使用手动配置）'}</div>
      </div>

      <ListGroup>
        {presets.length === 0 && (
          <div className="px-4 py-8 text-center txt-faint text-sm">还没有预设，点右上角「保存」把当前配置存为预设</div>
        )}
        {presets.map((p) => (
          <Row
            key={p.id}
            label={p.name}
            hint={`${p.chat.model || '未设模型'} · ${p.chat.baseUrl ? 'Chat 已配' : 'Chat 未配'}`}
            onClick={() => apply(p)}
            right={
              <div className="flex items-center gap-2">
                {activePresetId === p.id && <Check size={16} className="txt-accent" />}
                <button onClick={(e) => { e.stopPropagation(); setConfirmDel(p); }} className="tap txt-dim">
                  <Trash2 size={15} />
                </button>
              </div>
            }
          />
        ))}
      </ListGroup>

      <Modal open={showSave} onClose={() => setShowSave(false)} title="保存当前配置为预设">
        <div className="mb-3">
          <div className="text-[12px] txt-dim mb-1">预设名称</div>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="例如：中转站A / 官方直连"
            className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent placeholder:text-[var(--text-faint)]"
          />
        </div>
        <PrimaryButton onClick={saveCurrent}>保存并切换到该预设</PrimaryButton>
      </Modal>

      <Confirm
        open={!!confirmDel}
        title="删除预设"
        message={`确定删除预设「${confirmDel?.name}」？`}
        danger
        onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </AppScreen>
  );
}

/* helper: when active preset changes, copy its values into live api */
export function presetToApi(p: ApiPreset): ApiConfig {
  return { chat: { ...p.chat }, voice: { ...p.voice }, image: { ...p.image } };
}
