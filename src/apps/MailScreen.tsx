import React, { useState, useRef, useEffect } from 'react';
import { Inbox, Send, Star, Trash2, Mail as MailIcon, Plus, Search, CornerUpLeft, Sparkles, Layers } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { ListGroup, Row } from '../components/ui';
import { uid } from '../utils';
import { askAI, extractJson } from '../api';
import type { ApiConfig, Mail, UserIdentity } from '../types';

type Folder = 'inbox' | 'sent' | 'draft' | 'trash';

export function MailScreen({
  api,
  mails,
  users,
  activeUserId,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  mails: Mail[];
  users: UserIdentity[];
  activeUserId: string | null;
  onChange: (m: Mail[]) => void;
  onBack: () => void;
}) {
  const [folder, setFolder] = useState<Folder>('inbox');
  const [reading, setReading] = useState<Mail | null>(null);
  const [composing, setComposing] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Mail | null>(null);
  const [q, setQ] = useState('');

  // compose form
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiWriting, setAiWriting] = useState(false);
  const [composeSenderId, setComposeSenderId] = useState('');

  // Keep a ref to prevent stale closures in AI reply timeout
  const mailsRef = useRef(mails);
  useEffect(() => {
    mailsRef.current = mails;
  }, [mails]);

  const currentUser = users.find((u) => u.id === activeUserId) ?? users[0];

  // Filter mails based on selected folder and search query
  const list = mails
    .filter((m) => m.folder === folder && (m.subject.includes(q) || m.from.includes(q) || m.to.includes(q)))
    .sort((a, b) => b.ts - a.ts);

  const unread = mails.filter((m) => m.folder === 'inbox' && !m.read).length;

  const markRead = (m: Mail) => {
    if (!m.read) onChange(mails.map((x) => x.id === m.id ? { ...x, read: true } : x));
    setReading(m);
  };

  const toggleStar = (m: Mail) => onChange(mails.map((x) => x.id === m.id ? { ...x, starred: !x.starred } : x));

  const moveToTrash = (m: Mail) => onChange(mails.map((x) => x.id === m.id ? { ...x, folder: 'trash' } : x));
  const deleteForever = (m: Mail) => onChange(mails.filter((x) => x.id !== m.id));

  // Auto AI reply generator
  const triggerAutoReply = (sentMail: Mail, senderIdentity: UserIdentity) => {
    setTimeout(async () => {
      try {
        const recipientName = sentMail.to;
        const senderName = senderIdentity.nickname;
        const senderType = senderIdentity.isAlt ? '匿名小号/临时邮箱' : '主邮箱账号';
        const senderSig = senderIdentity.signature || '无';

        const sys = `你在模拟手机电子邮件应用。你当前的身份是收信人「${recipientName}」。
你刚刚收到了一封来自「${senderName}」(${senderType})的邮件。
发件人签名：${senderSig}
邮件主题：${sentMail.subject}
邮件内容：
${sentMail.body}

请你作为「${recipientName}」给发件人写一封回复邮件。字数在150字以内，符合人物性格或专业语境，注意发件人是否是小号身份（如果是匿名小号，可以体现出好奇、询问、或者针对其试探做出合理的反应）。
只输出格式正确的 JSON，包含 subject（通常是 Re: ${sentMail.subject}）和 body 两个字段：
{
  "subject": "邮件主题",
  "body": "邮件回复正文内容"
}
不要有任何额外的修饰文字！`;

        const replyRaw = await askAI(api, sys, '请生成对该邮件的回复：', { temperature: 0.85, maxTokens: 400 });
        let parsed: { subject: string; body: string };
        try {
          parsed = extractJson<{ subject: string; body: string }>(replyRaw);
        } catch {
          parsed = { subject: `Re: ${sentMail.subject}`, body: replyRaw };
        }

        const replyMail: Mail = {
          id: uid(),
          from: `${recipientName}@yangyang.mail`,
          to: `${senderIdentity.nickname}@yangyang.mail`,
          subject: parsed.subject,
          body: parsed.body,
          ts: Date.now(),
          read: false,
          starred: false,
          folder: 'inbox',
        };

        onChange([replyMail, ...mailsRef.current]);
      } catch (e) {
        console.error('Email auto-reply simulation failed', e);
      }
    }, 2500);
  };

  const aiCompose = async () => {
    if (!subject.trim()) return;
    const currentComposeSender = users.find((u) => u.id === composeSenderId) ?? currentUser;
    setAiWriting(true);
    try {
      const prompt = `你在帮用户写邮件。写信人身份是：${currentComposeSender?.nickname || '我'}${currentComposeSender?.isAlt ? '（匿名小号）' : ''}，签名是：${currentComposeSender?.signature || '无'}。
语气专业得体，正文200字以内。只输出正文，不要标题。`;
      const text = await askAI(api, prompt, `主题：${subject}\n收件人：${to || '同事'}\n请写一封邮件正文：`, { temperature: 0.7, maxTokens: 400 });
      setBody(text.trim());
    } catch (e) {
      setBody(`（AI 生成失败：${(e as Error).message}）`);
    } finally {
      setAiWriting(false);
    }
  };

  const send = () => {
    if (!to.trim() || !subject.trim()) return;
    const currentComposeSender = users.find((u) => u.id === composeSenderId) ?? currentUser;
    const fromAddress = `${currentComposeSender?.nickname || 'me'} <${currentComposeSender?.isAlt ? 'alt_' : 'main_'}${currentComposeSender?.id || 'main'}@yangyang.mail>`;
    
    const m: Mail = {
      id: uid(),
      from: fromAddress,
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      ts: Date.now(),
      read: true,
      starred: false,
      folder: 'sent',
    };
    
    onChange([m, ...mails]);
    
    // Trigger auto-reply simulation
    if (currentComposeSender) {
      triggerAutoReply(m, currentComposeSender);
    }

    setTo('');
    setSubject('');
    setBody('');
    setComposing(false);
  };

  const folders: { key: Folder; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'inbox', label: '收件箱', icon: <Inbox size={16} />, badge: unread },
    { key: 'sent', label: '已发送', icon: <Send size={16} /> },
    { key: 'draft', label: '草稿箱', icon: <MailIcon size={16} /> },
    { key: 'trash', label: '已删除', icon: <Trash2 size={16} /> },
  ];

  if (reading) {
    return (
      <AppScreen title={reading.subject} onBack={() => setReading(null)} noPad right={folder === 'trash' ? <button onClick={() => { deleteForever(reading); setReading(null); }} className="tap txt-dim"><Trash2 size={18} /></button> : undefined}>
        <div className="flex flex-col h-full">
          <div className="px-5 pt-4 pb-3 border-b border-[var(--border)] shrink-0">
            <div className="text-[15px] font-medium">{reading.subject}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 rounded-full icon-bg flex items-center justify-center text-[11px] txt-accent select-none">{(reading.from[0] || '?').toUpperCase()}</div>
              <div className="text-[12px]"><span className="txt-dim">{reading.from}</span> <span className="txt-faint">→ {reading.to}</span></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 text-[14px] leading-relaxed whitespace-pre-wrap txt-dim">{reading.body}</div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)] shrink-0">
            <button onClick={() => toggleStar(reading)} className="tap w-10 h-10 rounded-full glass flex items-center justify-center"><Star size={18} className={reading.starred ? 'txt-accent fill-current' : ''} /></button>
            {folder !== 'trash' && <button onClick={() => { moveToTrash(reading); setReading(null); }} className="tap flex-1 h-10 rounded-full glass flex items-center justify-center gap-2 text-[14px]"><Trash2 size={16} /> 删除</button>}
            {folder === 'trash' && <button onClick={() => { const r = { ...reading, folder: 'inbox' as const }; onChange(mails.map((x) => x.id === reading.id ? r : x)); setReading(r); }} className="tap flex-1 h-10 rounded-full glass flex items-center justify-center gap-2 text-[14px]"><CornerUpLeft size={16} /> 恢复</button>}
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="邮箱" onBack={onBack} right={<button onClick={() => { setComposeSenderId(currentUser?.id || ''); setComposing(true); }} className="tap text-[var(--accent)]"><Plus size={22} /></button>}>
      {currentUser && (
        <div className="px-4 py-1.5 bg-[var(--icon-bg-active)]/20 text-[11px] text-[var(--accent)] text-center border-b border-[var(--border)] flex items-center justify-center gap-1 mb-3 rounded-xl shrink-0">
          <Sparkles size={11} className="animate-pulse" />
          <span>当前邮箱：</span>
          <span className="font-bold">{currentUser.nickname}</span>
          <span className="txt-faint">({currentUser.isAlt ? 'alt_' : 'main_'}{currentUser.id.slice(0, 4)}@yangyang.mail)</span>
          {currentUser.isAlt && <span className="ml-1 px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-semibold">免限制</span>}
        </div>
      )}

      {/* folder tabs */}
      <div className="flex gap-1.5 mb-4 -mx-1 overflow-x-auto no-scrollbar">
        {folders.map((f) => (
          <button key={f.key} onClick={() => setFolder(f.key)} className={`tap shrink-0 px-3 h-9 rounded-full text-[13px] flex items-center gap-1.5 ${folder === f.key ? 'icon-bg-active txt-accent font-medium' : 'glass txt-dim'}`}>
            {f.icon} {f.label}
            {f.badge ? <span className="ml-0.5 px-1.5 py-px rounded-full text-[10px] text-white" style={{ background: 'var(--danger)' }}>{f.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 glass rounded-xl px-3 h-10 mb-4">
        <Search size={16} className="txt-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索邮件" className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[var(--text-faint)]" />
      </div>

      {list.length === 0 ? (
        <div className="glass rounded-2xl py-10 text-center txt-faint text-sm">{folder === 'inbox' ? '收件箱是空的' : '这里没有邮件'}</div>
      ) : (
        <ListGroup>
          {list.map((m) => (
            <Row
              key={m.id}
              label={<span className={m.read ? '' : 'font-bold'}>{m.subject}</span>}
              hint={<span>{m.from} · {new Date(m.ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}</span>}
              onClick={() => markRead(m)}
              right={<button onClick={(e) => { e.stopPropagation(); toggleStar(m); }} className="tap"><Star size={16} className={m.starred ? 'txt-accent fill-current' : 'txt-faint'} /></button>}
            />
          ))}
        </ListGroup>
      )}

      {/* compose */}
      <Modal open={composing} onClose={() => setComposing(false)} title="写邮件">
        <div className="space-y-3">
          {/* Sender Picker */}
          <div>
            <label className="text-[11px] txt-faint block mb-1">发件人账号</label>
            <div className="space-y-1 max-h-[110px] overflow-y-auto no-scrollbar">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setComposeSenderId(u.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left border text-[12px] ${composeSenderId === u.id ? 'border-[var(--accent)] bg-[var(--icon-bg-active)] txt-accent' : 'border-[var(--border)] glass txt-dim'}`}
                >
                  <span className="font-semibold flex items-center gap-1">
                    <Layers size={11} /> {u.nickname} {u.isAlt && <span className="text-[8px] px-1 rounded bg-amber-500/10 text-amber-500">小号</span>}
                  </span>
                  <span className="text-[10px] txt-faint truncate max-w-[150px]">{u.nickname}@yangyang.mail</span>
                </button>
              ))}
            </div>
          </div>

          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="收件人 (例如：苏晴 或 boss@yangyang.mail)" className="w-full glass rounded-xl px-3 h-11 text-[13px] outline-none bg-transparent" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="主题" className="w-full glass rounded-xl px-3 h-11 text-[13px] outline-none bg-transparent" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="正文内容…" rows={4} className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none bg-transparent resize-none" />
          
          <div className="flex gap-3 pt-1">
            <button onClick={aiCompose} disabled={aiWriting || !subject.trim()} className="tap flex-1 h-11 rounded-full glass font-medium text-[13px] disabled:opacity-50">{aiWriting ? '生成中…' : 'AI 帮写'}</button>
            <button onClick={send} disabled={!to.trim() || !subject.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[13px] text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发送</button>
          </div>
        </div>
      </Modal>

      <Confirm open={!!confirmDel} title="永久删除" message="确定永久删除这封邮件？" danger onConfirm={() => { if (confirmDel) deleteForever(confirmDel); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
