import { useState } from 'react';
import { Plus, Search, Phone, UserRound, MessageCircle } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, PrimaryButton } from '../components/ui';
import { Modal, Confirm } from '../components/Sheet';
import { uid } from '../utils';
import type { Contact } from '../types';

export function ContactsScreen({
  contacts,
  characters,
  onSave,
  onDelete,
  onStartChat,
  onStartSms,
  onBack,
}: {
  contacts: Contact[];
  characters: { id: string; name: string; avatar?: string; signature: string }[];
  onSave: (c: Contact) => void;
  onDelete: (id: string) => void;
  onStartChat: (characterId: string) => void;
  onStartSms: (contactId: string) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [confirmDel, setConfirmDel] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [signature, setSignature] = useState('');
  const [linkedChar, setLinkedChar] = useState<string>('');

  const filtered = contacts.filter((c) => c.name.includes(q) || c.phone.includes(q));
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'zh'));

  const save = () => {
    if (!name.trim()) return;
    const char = characters.find((c) => c.id === linkedChar);
    const c: Contact = {
      id: uid(),
      name: name.trim(),
      phone: phone.trim() || '未填写',
      signature: signature.trim() || (char?.signature ?? ''),
      characterId: linkedChar || undefined,
      avatar: char?.avatar,
      createdAt: Date.now(),
    };
    onSave(c);
    setAdding(false); setName(''); setPhone(''); setSignature(''); setLinkedChar('');
  };

  return (
    <AppScreen
      title="通讯录"
      onBack={onBack}
      right={<button onClick={() => setAdding(true)} className="tap text-[var(--accent)] text-[15px] font-medium"><Plus size={22} /></button>}
    >
      <div className="flex items-center gap-2 glass rounded-xl px-3 h-10 mb-4">
        <Search size={16} className="txt-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索姓名或号码" className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[var(--text-faint)]" />
      </div>

      {sorted.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center txt-faint text-sm">没有联系人，点右上角 + 添加</div>
      ) : (
        <ListGroup>
          {sorted.map((c) => (
            <Row
              key={c.id}
              label={
                <span className="flex items-center gap-3">
                  {c.avatar ? <img src={c.avatar} className="w-9 h-9 rounded-full object-cover" alt="" /> : <div className="w-9 h-9 rounded-full icon-bg flex items-center justify-center"><UserRound size={18} className="icon-color" /></div>}
                  <span>{c.name}</span>
                </span>
              }
              hint={c.phone}
              onClick={() => setDetail(c)}
              right={c.characterId ? <span className="text-[11px] txt-accent px-2 py-0.5 rounded-full" style={{ background: 'var(--icon-bg-active)' }}>AI</span> : undefined}
            />
          ))}
        </ListGroup>
      )}

      {/* detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              {detail.avatar ? <img src={detail.avatar} className="w-20 h-20 rounded-full object-cover" alt="" /> : <div className="w-20 h-20 rounded-full icon-bg flex items-center justify-center"><UserRound size={36} className="icon-color" /></div>}
              <div className="font-title text-lg mt-2">{detail.name}</div>
              <div className="txt-faint text-[13px]">{detail.signature}</div>
            </div>
            <div className="glass rounded-xl p-3 text-[14px] flex items-center gap-2"><Phone size={16} className="txt-accent" /> {detail.phone}</div>
            {detail.characterId && <div className="text-[12px] txt-accent text-center">已关联 AI 角色</div>}
            <div className="flex gap-3">
              <button onClick={() => { if (detail.characterId) { onStartChat(detail.characterId); setDetail(null); } }} disabled={!detail.characterId} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-2 disabled:opacity-30"><MessageCircle size={16} /> 聊天</button>
              <button onClick={() => { onStartSms(detail.id); setDetail(null); }} className="tap flex-1 h-11 rounded-full font-medium flex items-center justify-center gap-2 text-[var(--bg)]" style={{ background: 'var(--accent)' }}><Phone size={16} /> 短信</button>
            </div>
            <button onClick={() => { setConfirmDel(detail); setDetail(null); }} className="tap w-full h-10 rounded-full text-[var(--danger)] glass">删除联系人</button>
          </div>
        )}
      </Modal>

      {/* add */}
      <Modal open={adding} onClose={() => setAdding(false)} title="新建联系人">
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent" autoFocus />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent" />
          <input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="个性签名" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent" />
          {characters.length > 0 && (
            <div>
              <div className="text-[12px] txt-dim mb-1">关联 AI 角色（可选）</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setLinkedChar('')} className={`tap px-3 h-8 rounded-full text-[13px] glass ${!linkedChar ? 'icon-bg-active txt-accent' : ''}`}>无</button>
                {characters.map((c) => (
                  <button key={c.id} onClick={() => setLinkedChar(c.id)} className={`tap px-3 h-8 rounded-full text-[13px] glass ${linkedChar === c.id ? 'icon-bg-active txt-accent' : ''}`}>{c.name}</button>
                ))}
              </div>
            </div>
          )}
          <PrimaryButton onClick={save} disabled={!name.trim()}>保存</PrimaryButton>
        </div>
      </Modal>

      <Confirm open={!!confirmDel} title="删除联系人" message={`确定删除「${confirmDel?.name}」？`} danger onConfirm={() => { if (confirmDel) onDelete(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
