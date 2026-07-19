import { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Trash2, UserRound, Sparkles } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { ListGroup, Row } from '../components/ui';
import { uid, fmtTime } from '../utils';
import { askAI } from '../api';
import type { ApiConfig, Contact, SmsThread, SmsMessage, UserIdentity } from '../types';

export function SmsScreen({
  api,
  contacts,
  threads,
  users,
  activeUserId,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  contacts: Contact[];
  threads: SmsThread[];
  users: UserIdentity[];
  activeUserId: string | null;
  onChange: (threads: SmsThread[]) => void;
  onBack: () => void;
}) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [confirmDel, setConfirmDel] = useState<SmsThread | null>(null);

  const active = threads.find((t) => t.id === activeThreadId) ?? null;
  const activeContact = contacts.find((c) => c.id === active?.contactId) ?? null;

  const updateThread = (id: string, fn: (t: SmsThread) => SmsThread) =>
    onChange(threads.map((t) => (t.id === id ? fn(t) : t)));

  const startThread = (contactId: string) => {
    const existing = threads.find((t) => t.contactId === contactId);
    if (existing) { setActiveThreadId(existing.id); setPicking(false); return; }
    const t: SmsThread = { id: uid(), contactId, messages: [], updatedAt: Date.now() };
    onChange([t, ...threads]);
    setActiveThreadId(t.id);
    setPickingGuarded(false);
  };

  const setPickingGuarded = (val: boolean) => setPicking(val);

  if (active && activeContact) {
    return (
      <SmsConversation
        api={api}
        contact={activeContact}
        thread={active}
        users={users}
        activeUserId={activeUserId}
        onSend={(msgs) => updateThread(active.id, (t) => ({ ...t, messages: msgs, updatedAt: Date.now() }))}
        onBack={() => setActiveThreadId(null)}
        onDelete={() => { onChange(threads.filter((t) => t.id !== active.id)); setActiveThreadId(null); }}
      />
    );
  }

  return (
    <AppScreen title="短信" onBack={onBack} right={<button onClick={() => setPicking(true)} className="tap text-[var(--accent)]"><Plus size={22} /></button>}>
      {threads.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center txt-faint text-sm">没有短信对话，点右上角 + 选择联系人</div>
      ) : (
        <ListGroup>
          {[...threads].sort((a, b) => b.updatedAt - a.updatedAt).map((t) => {
            const c = contacts.find((x) => x.id === t.contactId);
            const last = t.messages[t.messages.length - 1];
            return (
              <Row
                key={t.id}
                label={
                  <span className="flex items-center gap-3">
                    {c?.avatar ? <img src={c.avatar} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center"><MessageSquare size={18} className="icon-color" /></div>}
                    <span>{c?.name ?? '未知'}</span>
                  </span>
                }
                hint={last ? `${last.from === 'me' ? '我：' : ''}${last.content.slice(0, 30)}` : '开始对话'}
                onClick={() => setActiveThreadId(t.id)}
                right={<button onClick={(e) => { e.stopPropagation(); setConfirmDel(t); }} className="tap txt-dim"><Trash2 size={15} /></button>}
              />
            );
          })}
        </ListGroup>
      )}

      <Modal open={picking} onClose={() => setPicking(false)} title="选择联系人发短信">
        {contacts.length === 0 ? (
          <div className="text-center txt-faint py-6">没有联系人，先去通讯录添加</div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => startThread(c.id)} className="tap w-full flex items-center gap-3 p-2.5 rounded-xl glass">
                {c.avatar ? <img src={c.avatar} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center"><UserRound size={18} className="icon-color" /></div>}
                <div className="flex-1 text-left"><div className="text-[15px]">{c.name}</div><div className="text-[12px] txt-faint">{c.phone}</div></div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Confirm open={!!confirmDel} title="删除对话" message="确定删除这条短信记录？" danger onConfirm={() => { if (confirmDel) onChange(threads.filter((t) => t.id !== confirmDel.id)); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}

function SmsConversation({
  api, contact, thread, users, activeUserId, onSend, onBack, onDelete,
}: {
  api: ApiConfig;
  contact: Contact;
  thread: SmsThread;
  users: UserIdentity[];
  activeUserId: string | null;
  onSend: (msgs: SmsMessage[]) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread.messages, loading]);

  const currentUser = users.find((u) => u.id === activeUserId) ?? users[0];

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const mine: SmsMessage = { id: uid(), from: 'me', content: text, ts: Date.now() };
    const next = [...thread.messages, mine];
    onSend(next);
    setLoading(true);
    try {
      const senderName = currentUser?.nickname || '我';
      const senderType = currentUser?.isAlt ? '对方开的匿名小号' : '对方的主号';
      const senderSig = currentUser?.signature || '';

      const sys = `你在模拟手机短信聊天。
对方（收信人）是：「${contact.name}」${contact.signature ? `，个性签名：${contact.signature}` : ''}。
发件人（写信给你的用户）是：「${senderName}」(${senderType})${senderSig ? `，其签名是：${senderSig}` : ''}。

请以「${contact.name}」的身份用简短、口语化的短信风格回复（控制在60字以内），像真人发短信一样自然。
请根据发件人的身份（如果是主号，代表你们是熟人；如果是小号/陌生人，你可能会感到好奇、疑惑或防备，这取决于你的个性和签名）进行合理的剧情互动。不要解释自己是AI。`;

      const reply = await askAI(api, sys, `发件人（${senderName}）发来短信：${text}\n请以${contact.name}的身份回复：`, { temperature: 0.9, maxTokens: 120 });
      onSend([...next, { id: uid(), from: 'them', content: reply, ts: Date.now() }]);
    } catch (e) {
      onSend([...next, { id: uid(), from: 'them', content: `（发送失败：${(e as Error).message}）`, ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen title={contact.name} onBack={onBack} noPad right={<button onClick={onDelete} className="tap txt-dim"><Trash2 size={18} /></button>}>
      {currentUser && (
        <div className="px-4 py-1.5 bg-[var(--icon-bg-active)]/20 text-[11px] text-[var(--accent)] text-center border-b border-[var(--border)] flex items-center justify-center gap-1 shrink-0">
          <Sparkles size={11} className="animate-pulse" />
          <span>发送身份：</span>
          <span className="font-bold">{currentUser.nickname}</span>
          {currentUser.isAlt && <span className="ml-1 px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-semibold">小号(免限制)</span>}
        </div>
      )}
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
          {thread.messages.length === 0 && <div className="text-center txt-faint text-sm mt-10">还没有消息，发一条吧</div>}
          {thread.messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.from === 'me' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-[14px] leading-relaxed ${m.from === 'me' ? 'rounded-br-md text-white' : 'glass rounded-bl-md'}`} style={m.from === 'me' ? { background: 'var(--accent)', color: 'var(--bg)' } : undefined}>{m.content}</div>
              <div className="text-[10px] txt-faint mt-0.5 px-1 tabular-nums">{fmtTime(new Date(m.ts))}</div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start"><div className="glass rounded-2xl rounded-bl-md px-3.5 py-3 flex items-center gap-1">{[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-current txt-faint animate-pulse-soft" style={{ animationDelay: `${i*0.2}s` }} />)}</div></div>
          )}
          <div ref={endRef} />
        </div>
        <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2 shrink-0 bg-neutral-950/20">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="短信内容…" className="flex-1 glass rounded-full px-4 h-10 text-[14px] outline-none bg-transparent placeholder:text-[var(--text-faint)]" />
          <button onClick={send} disabled={loading || !input.trim()} className="tap w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 shrink-0" style={{ background: 'var(--accent)', color: 'var(--bg)' }}><Send size={18} /></button>
        </div>
      </div>
    </AppScreen>
  );
}
