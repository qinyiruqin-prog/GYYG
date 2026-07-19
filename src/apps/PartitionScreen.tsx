import { useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, PrimaryButton } from '../components/ui';
import { Confirm, Modal } from '../components/Sheet';
import type { Partition, UserIdentity } from '../types';
import { uid, cls } from '../utils';

export function PartitionScreen({
  users,
  partitions,
  onChange,
  onBack,
}: {
  users: UserIdentity[];
  partitions: Partition[];
  onChange: (next: Partition[]) => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState<Partition | null>(null);
  const [confirmDel, setConfirmDel] = useState<Partition | null>(null);

  const add = () => setEditing({ id: uid(), name: '', userIds: [], charIds: [] });

  const save = (p: Partition) => {
    const exists = partitions.some((x) => x.id === p.id);
    onChange(exists ? partitions.map((x) => (x.id === p.id ? p : x)) : [...partitions, p]);
    setEditing(null);
  };
  const del = (id: string) => onChange(partitions.filter((p) => p.id !== id));

  return (
    <AppScreen title="分区与对应关系" onBack={onBack} right={<button onClick={add} className="tap text-[var(--accent)] text-[15px] font-medium">新建</button>}>
      <div className="text-[12px] txt-faint mb-3 leading-relaxed">
        分区决定哪些身份可以与哪些角色互动。未放入同一分区的角色之间互不感知，也感知不到对方与用户的互动。
        角色将在「角色卡系统」阶段创建后可选。
      </div>

      {partitions.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center">
          <Users size={32} className="mx-auto txt-faint mb-2" />
          <div className="txt-faint text-sm">还没有分区</div>
          <div className="mt-4 px-8"><PrimaryButton onClick={add}>创建第一个分区</PrimaryButton></div>
        </div>
      ) : (
        <ListGroup>
          {partitions.map((p) => (
            <Row
              key={p.id}
              label={p.name || '未命名分区'}
              hint={`${p.userIds.length} 个身份 · ${p.charIds.length} 个角色`}
              onClick={() => setEditing({ ...p })}
              right={
                <button onClick={(e) => { e.stopPropagation(); setConfirmDel(p); }} className="tap txt-dim">
                  <Trash2 size={16} />
                </button>
              }
            />
          ))}
        </ListGroup>
      )}

      {editing && (
        <PartitionEditor value={editing} users={users} onClose={() => setEditing(null)} onSave={save} />
      )}

      <Confirm
        open={!!confirmDel}
        title="删除分区"
        message={`确定删除分区「${confirmDel?.name}」？`}
        danger
        onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </AppScreen>
  );
}

function PartitionEditor({
  value,
  users,
  onClose,
  onSave,
}: {
  value: Partition;
  users: UserIdentity[];
  onClose: () => void;
  onSave: (p: Partition) => void;
}) {
  const [p, setP] = useState<Partition>(value);
  const toggleUser = (id: string) =>
    setP((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(id) ? prev.userIds.filter((x) => x !== id) : [...prev.userIds, id],
    }));

  return (
    <Modal open onClose={onClose} title="编辑分区">
      <div className="mb-3">
        <div className="text-[12px] txt-dim mb-1">分区名称</div>
        <input
          value={p.name}
          onChange={(e) => setP({ ...p, name: e.target.value })}
          placeholder="例如：主线 / 平行世界"
          className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent placeholder:text-[var(--text-faint)]"
        />
      </div>

      <div className="text-[12px] txt-dim mb-2">选择身份（可多选）</div>
      {users.length === 0 ? (
        <div className="glass rounded-xl py-6 text-center txt-faint text-sm mb-4">请先在「用户身份」创建身份</div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-5">
          {users.map((u) => {
            const on = p.userIds.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className={cls(
                  'tap px-3 py-1.5 rounded-full text-[13px] border',
                  on ? 'border-[var(--accent)] txt-accent' : 'border-[var(--border)] txt-dim',
                )}
              >
                {u.nickname}{u.isAlt ? '（小号）' : ''}
              </button>
            );
          })}
        </div>
      )}

      <div className="text-[12px] txt-dim mb-2">角色</div>
      <div className="glass rounded-xl py-6 text-center txt-faint text-sm mb-5">
        角色卡系统将在后续阶段开放，届时可在此勾选角色
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="tap flex-1 h-11 rounded-full glass">取消</button>
        <div className="flex-1"><PrimaryButton onClick={() => onSave(p)}>保存</PrimaryButton></div>
      </div>
    </Modal>
  );
}
