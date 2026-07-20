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
  const importInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text) as UserIdentity | UserIdentity[];
      const importList = Array.isArray(imported) ? imported : [imported];

      importList.forEach((u) => {
        // 确保有必需字段，生成新ID避免冲突
        const newUser: UserIdentity = {
          ...u,
          id: uid(),
          createdAt: Date.now(),
        };
        onSave(newUser);
      });

      alert(`成功导入 ${importList.length} 个身份`);
    } catch (err) {
      alert('导入失败：JSON格式错误');
    }
  };

  return (
    <AppScreen
      title="用户身份"
      onBack={onBack}
      right={
        <div className="flex items-center gap-2">
          <button
            onClick={() => importInputRef.current?.click()}
            className="tap text-[var(--accent)] text-[15px] font-medium"
          >
            导入
          </button>
          <button onClick={startNew} className="tap text-[var(--accent)] text-[15px] font-medium">新建</button>
        </div>
      }
    >
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => handleImportJson(e.target.files?.[0])}
      />

      <div className="text-[12px] txt-faint mb-3">
        可创建多个身份（含小号）。每个身份有独立昵称、头像、签名与图片提示词模板，用于与不同角色分区互动。支持导入JSON格式配置文件。
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
      <div className="max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
        {/* 头像上传区 */}
        <div className="glass-strong rounded-2xl p-4 mb-4">
          <div className="text-[13px] font-medium mb-3 txt-accent">头像设置</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => avatarInput.current?.click()}
              className="tap relative w-20 h-20 rounded-full overflow-hidden glass-strong flex items-center justify-center border-2 border-[var(--border)]"
            >
              {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : <Camera size={24} className="txt-dim" />}
            </button>
            <div className="flex-1">
              <div className="text-[13px] mb-1">点击上传头像</div>
              <div className="text-[11px] txt-faint">支持 JPG、PNG 格式</div>
            </div>
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImg(e.target.files?.[0], 'avatar')} />
          </div>
        </div>

        {/* 基本信息 */}
        <div className="glass-strong rounded-2xl p-4 mb-4">
          <div className="text-[13px] font-medium mb-3 txt-accent">基本信息</div>
          <TextField label="昵称 *" value={u.nickname} onChange={(v) => setU({ ...u, nickname: v })} placeholder="请输入昵称" />
          <TextField label="个性签名" value={u.signature} onChange={(v) => setU({ ...u, signature: v })} placeholder="一句话介绍自己" />
        </div>

        {/* AI绘图设置 */}
        <div className="glass-strong rounded-2xl p-4 mb-4">
          <div className="text-[13px] font-medium mb-3 txt-accent">AI绘图设置</div>

          <label className="block mb-3">
            <div className="text-[12px] txt-dim mb-2 flex items-center gap-1">
              <span>图片生成提示词模板</span>
              <span className="text-[10px] glass px-2 py-0.5 rounded-full">可选</span>
            </div>
            <textarea
              value={u.imagePromptTemplate}
              onChange={(e) => setU({ ...u, imagePromptTemplate: e.target.value })}
              placeholder="例如：20岁女性，长发，温柔气质，现代都市风格。生成该用户相关图片时会自动添加此描述。"
              rows={4}
              className="w-full glass-strong rounded-xl px-3 py-2.5 text-[13px] outline-none resize-none bg-transparent placeholder:text-[var(--text-faint)] border border-[var(--border)] focus:border-[var(--accent)] transition-colors"
            />
          </label>

          <div className="mb-3">
            <div className="text-[12px] txt-dim mb-2 flex items-center gap-1">
              <span>人脸参考图</span>
              <span className="text-[10px] glass px-2 py-0.5 rounded-full">可选</span>
            </div>
            <button
              onClick={() => faceInput.current?.click()}
              className="tap w-full h-24 rounded-xl glass-strong flex items-center justify-center overflow-hidden border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              {u.faceRef ? (
                <img src={u.faceRef} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="text-center">
                  <Camera size={24} className="txt-dim mx-auto mb-1" />
                  <div className="text-[11px] txt-faint">上传人脸参考图</div>
                </div>
              )}
            </button>
            <input ref={faceInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImg(e.target.files?.[0], 'faceRef')} />
          </div>
        </div>

        {/* 高级选项 */}
        <div className="glass-strong rounded-2xl p-4 mb-4">
          <div className="text-[13px] font-medium mb-3 txt-accent">高级选项</div>
          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-[var(--surface)] transition-colors">
            <input
              type="checkbox"
              checked={u.isAlt}
              onChange={(e) => setU({ ...u, isAlt: e.target.checked })}
              className="w-5 h-5 mt-0.5 accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-[14px] mb-1">设为小号</div>
              <div className="text-[11px] txt-faint">用于匿名接触角色，不暴露正式身份。适合探索性互动。</div>
            </div>
          </label>
        </div>

        {err && <div className="text-[12px] text-[var(--danger)] mb-2 text-center p-2 glass-strong rounded-lg">{err}</div>}
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border)]">
        <button onClick={onClose} className="tap flex-1 h-11 rounded-full glass-strong font-medium">取消</button>
        <div className="flex-1"><PrimaryButton onClick={save}>保存身份</PrimaryButton></div>
      </div>
    </Modal>
  );
}
