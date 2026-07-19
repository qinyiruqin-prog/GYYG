import { useRef, useState } from 'react';
import { Camera, Trash2, Star } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, TextField, PrimaryButton } from '../components/ui';
import { Confirm, Modal } from '../components/Sheet';
import type { UserIdentity } from '../types';
import { uid, fileToDataUrl } from '../utils';

export function IdentityScreen({
  users,
  activeUserId,
  onSave,
  onDelete,
  onSetActive,
  onBack,
}: {
  users: UserIdentity[];
  activeUserId: string | null;
  onSave: (u: UserIdentity) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState<UserIdentity | null>(null);
  const [confirmDel, setConfirmDel] = useState<UserIdentity | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startNew = () => {
    setIsNew(true);
    setEditing({
      id: uid(),
      nickname: '',
      signature: '',
      imagePromptTemplate: '',
      isAlt: false,
      createdAt: Date.now(),
    });
  };
  const startEdit = (u: UserIdentity) => {
    setIsNew(false);
    setEditing({ ...u });
  };

  return (
    <AppScreen
      title="用户身份"
      onBack={onBack}
      right={
        <button onClick={startNew} className="tap text-[var(--accent)] text-[15px] font-medium">新建</button>
      }
    >
      <div className="text-[12px] txt-faint mb-3">
        可创建多个身份（含小号）。每个身份有独立昵称、头像、签名与图片提示词模板，用于与不同角色分区互动。
      </div>

      <ListGroup>
        {users.length === 0 && (
          <div className="px-4 py-8 text-center txt-faint text-sm">还没有身份，点右上角新建一个吧</div>
        )}
        {users.map((u) => (
          <Row
            key={u.id}
            label={
              <span className="flex items-center gap-2">
                {u.avatar ? (
                  <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-2)] flex items-center justify-center text-white text-xs">
                    {u.nickname.slice(0, 1) || '?'}
                  </div>
                )}
                <span>{u.nickname || '未命名'}</span>
                {u.isAlt && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-strong)] txt-dim">小号</span>}
                {activeUserId === u.id && <Star size={13} className="text-[var(--accent)] fill-[var(--accent)]" />}
              </span>
            }
            hint={u.signature || '未设置签名'}
            onClick={() => startEdit(u)}
            right={
              <div className="flex items-center gap-2">
                {activeUserId !== u.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetActive(u.id); }}
                    className="tap text-[12px] px-2 py-1 rounded-full glass txt-accent"
                  >设为当前</button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDel(u); }}
                  className="tap txt-dim"
                ><Trash2 size={16} /></button>
              </div>
            }
          />
        ))}
      </ListGroup>

      {editing && (
        <IdentityEditor
          isNew={isNew}
          value={editing}
          onClose={() => setEditing(null)}
          onSave={(u) => { onSave(u); setEditing(null); }}
        />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除身份"
        message={`确定删除「${confirmDel?.nickname}」？该身份相关聊天记录将保留，但身份信息将被移除。`}
        danger
        onConfirm={() => { if (confirmDel) onDelete(confirmDel.id); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </AppScreen>
  );
}

function IdentityEditor({
  isNew,
  value,
  onClose,
  onSave,
}: {
  isNew: boolean;
  value: UserIdentity;
  onClose: () => void;
  onSave: (u: UserIdentity) => void;
}) {
  const [u, setU] = useState<UserIdentity>(value);
  const avatarInput = useRef<HTMLInputElement>(null);
  const faceInput = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');

  const pickImg = async (file: File | undefined, key: 'avatar' | 'faceRef') => {
    if (!file) return;
    const url = await fileToDataUrl(file);
    setU((p) => ({ ...p, [key]: url }));
  };

  const save = () => {
    if (!u.nickname.trim()) { setErr('请填写昵称'); return; }
    onSave(u);
  };

  return (
    <Modal open onClose={onClose} title={isNew ? '新建身份' : '编辑身份'}>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => avatarInput.current?.click()}
          className="tap relative w-16 h-16 rounded-full overflow-hidden glass flex items-center justify-center"
        >
          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : <Camera size={20} className="txt-dim" />}
        </button>
        <div className="flex-1">
          <div className="text-[13px] mb-0.5">头像</div>
          <div className="text-[11px] txt-faint">点击上传</div>
        </div>
        <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImg(e.target.files?.[0], 'avatar')} />
      </div>

      <TextField label="昵称" value={u.nickname} onChange={(v) => setU({ ...u, nickname: v })} placeholder="User1" />
      <TextField label="签名" value={u.signature} onChange={(v) => setU({ ...u, signature: v })} placeholder="一句话介绍自己" />

      <label className="block mb-3">
        <div className="text-[12px] txt-dim mb-1">用户生成图片提示词模板</div>
        <textarea
          value={u.imagePromptTemplate}
          onChange={(e) => setU({ ...u, imagePromptTemplate: e.target.value })}
          placeholder="生成该用户相关图片时统一带上的描述"
          rows={3}
          className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none resize-none bg-transparent placeholder:text-[var(--text-faint)]"
        />
      </label>

      <div className="mb-4">
        <div className="text-[12px] txt-dim mb-1">人脸参考图（可选，绘图参考）</div>
        <button
          onClick={() => faceInput.current?.click()}
          className="tap w-full h-20 rounded-xl glass flex items-center justify-center overflow-hidden"
        >
          {u.faceRef ? <img src={u.faceRef} className="w-full h-full object-cover" alt="" /> : <Camera size={20} className="txt-dim" />}
        </button>
        <input ref={faceInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImg(e.target.files?.[0], 'faceRef')} />
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={u.isAlt}
          onChange={(e) => setU({ ...u, isAlt: e.target.checked })}
          className="w-4 h-4 accent-[var(--accent)]"
        />
        <span className="text-[14px]">设为小号（用于匿名接触角色，不暴露正式身份）</span>
      </label>

      {err && <div className="text-[12px] text-[var(--danger)] mb-2 text-center">{err}</div>}

      <div className="flex gap-3">
        <button onClick={onClose} className="tap flex-1 h-11 rounded-full glass">取消</button>
        <div className="flex-1"><PrimaryButton onClick={save}>保存</PrimaryButton></div>
      </div>
    </Modal>
  );
}
