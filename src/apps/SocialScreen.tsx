import { useState } from 'react';
import { Heart, MessageCircle, Send, Sparkles, Globe, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal, Confirm } from '../components/Sheet';
import { SocialImage } from '../components/SocialImage';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateSocialImage } from '../services/imageGenService';
import type { ApiConfig, SquarePost, UserIdentity, Character } from '../types';

export function SocialScreen({
  api,
  me,
  characters,
  posts,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  characters: Character[];
  posts: SquarePost[];
  onChange: (p: SquarePost[]) => void;
  onBack: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string>('');
  const [imageDescription, setImageDescription] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [confirmDel, setConfirmDel] = useState<SquarePost | null>(null);
  const [commenting, setCommenting] = useState<SquarePost | null>(null);
  const [commentText, setCommentText] = useState('');

  const sorted = [...posts].sort((a, b) => b.ts - a.ts);

  const post = () => {
    if (!text.trim()) return;
    const p: SquarePost = {
      id: uid(),
      authorName: me?.nickname ?? '匿名',
      authorAvatar: me?.avatar,
      text: text.trim(),
      image: image || undefined,
      imageDescription: imageDescription || undefined,
      likes: 0,
      comments: [],
      ts: Date.now()
    };
    onChange([p, ...posts]);
    setText('');
    setImage('');
    setImageDescription('');
    setComposing(false);
  };

  const aiPost = async () => {
    setGenerating(true);
    try {
      const names = characters.slice(0, 5).map((c) => c.name).join('、') || '路人甲';
      const sys = '你在模拟一个公共广场/微博。以某个虚拟网友身份发一条动态，15-80字，口语化真实，可以带话题。只输出正文。';
      const content = await askAI(api, sys, `可能的人物：${names}\n请发一条广场动态：`, { temperature: 0.95, maxTokens: 120 });
      const c = characters[Math.floor(Math.random() * characters.length)];
      const useImage = Math.random() > 0.6;

      let postImage: string | undefined = undefined;
      let postImageDesc: string | undefined = undefined;

      if (useImage) {
        const imagePrompt = `根据这条动态生成一张配图：${content.substring(0, 100)}`;
        const descSys = '你是图片描述生成器。根据动态内容，用10-20字描述一张适合的配图。只输出描述，不要引号。';
        const imageDesc = await askAI(api, descSys, imagePrompt, { temperature: 0.8, maxTokens: 50 });

        const imageResult = await generateSocialImage(api, imageDesc.trim());

        if (imageResult.url) {
          postImage = imageResult.url;
        } else {
          postImageDesc = imageResult.description;
        }
      }

      const p: SquarePost = {
        id: uid(),
        authorName: c?.name ?? 'AI网友',
        authorAvatar: c?.avatar,
        text: content.trim(),
        image: postImage,
        imageDescription: postImageDesc,
        likes: Math.floor(Math.random() * 50),
        comments: [],
        ts: Date.now(),
        aiGenerated: true
      };
      onChange([p, ...posts]);
      setComposing(false);
    } catch (e) {
      alert(`生成失败：${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const like = (id: string) => onChange(posts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  const comment = () => {
    if (!commentText.trim() || !commenting) return;
    onChange(posts.map((p) => p.id === commenting.id ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? '我', text: commentText.trim(), ts: Date.now() }] } : p));
    setCommentText('');
    setCommenting(null);
  };
  const del = (id: string) => onChange(posts.filter((p) => p.id !== id));

  const addImage = async () => {
    if (image || imageDescription) return;
    setGeneratingImage(true);
    try {
      const descSys = '你是图片描述生成器。生成一个10-20字的图片内容描述。只输出描述。';
      const imageDesc = await askAI(api, descSys, '请生成一个适合广场动态的配图描述：', { temperature: 0.9, maxTokens: 50 });

      const imageResult = await generateSocialImage(api, imageDesc.trim());

      if (imageResult.url) {
        setImage(imageResult.url);
      } else {
        setImageDescription(imageResult.description);
      }
    } catch (e) {
      alert(`图片生成失败：${(e as Error).message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const removeImage = () => {
    setImage('');
    setImageDescription('');
  };

  return (
    <AppScreen title="广场" onBack={onBack} noPad right={<button onClick={() => setComposing(true)} className="tap text-[var(--accent)]"><Send size={22} /></button>}>
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 shrink-0">
        <Globe size={18} className="txt-accent" />
        <div className="text-[13px] txt-dim">公共广场 · 所有人可见</div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center txt-faint mt-16">广场还很安静，发第一条吧</div>
        ) : sorted.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2.5 mb-2.5">
              {p.authorAvatar ? <img src={p.authorAvatar} className="w-9 h-9 rounded-full object-cover" alt="" /> : <div className="w-9 h-9 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent">{(p.authorName[0] || '?')}</div>}
              <div className="flex-1"><div className="text-[14px] font-medium">{p.authorName}{p.aiGenerated && <span className="ml-1 text-[10px] txt-faint">· AI</span>}</div><div className="text-[11px] txt-faint">{new Date(p.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div></div>
              {(p.authorName === me?.nickname || p.aiGenerated) && <button onClick={() => setConfirmDel(p)} className="tap txt-dim"><Trash2 size={14} /></button>}
            </div>
            <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap mb-3">{p.text}</div>
            {(p.image || p.imageDescription) && (
              <div className="mb-3">
                <SocialImage
                  url={p.image}
                  description={p.imageDescription || ''}
                  hasApi={!!p.image}
                  className="max-h-60 rounded-xl"
                />
              </div>
            )}
            <div className="flex items-center gap-5 text-[13px] txt-faint">
              <button onClick={() => like(p.id)} className="tap flex items-center gap-1.5"><Heart size={15} className="txt-accent" /> {p.likes}</button>
              <button onClick={() => { setCommenting(p); setCommentText(''); }} className="tap flex items-center gap-1.5"><MessageCircle size={15} /> {p.comments.length}</button>
            </div>
            {p.comments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                {p.comments.map((c) => <div key={c.id} className="text-[13px]"><span className="txt-accent">{c.authorName}：</span><span className="txt-dim">{c.text}</span></div>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={composing} onClose={() => setComposing(false)} title="发动态">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="说点什么…（广场所有人可见）" rows={4} className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3" autoFocus />

        {(image || imageDescription) && (
          <div className="relative mb-3">
            <SocialImage
              url={image}
              description={imageDescription}
              hasApi={!!image}
              className="max-h-48 rounded-xl"
            />
            <button onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center tap">
              <X size={16} className="text-white" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <button onClick={addImage} disabled={!!(image || imageDescription) || generatingImage} className="tap glass rounded-lg p-2 disabled:opacity-50">
            <ImageIcon size={20} className="txt-accent" />
          </button>
          <span className="text-[12px] txt-faint">
            {generatingImage ? '生成中...' : (image || imageDescription) ? '已添加图片' : '添加图片'}
          </span>
        </div>

        <div className="flex gap-3">
          <button onClick={aiPost} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"><Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI 发帖'}</button>
          <button onClick={post} disabled={!text.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发布</button>
        </div>
      </Modal>

      <Modal open={!!commenting} onClose={() => setCommenting(null)} title="评论">
        <div className="mb-3 text-[13px] txt-dim bg-[var(--bg-elev)] rounded-xl p-3 line-clamp-3">{commenting?.text}</div>
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && comment()} placeholder="写下评论…" className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3" autoFocus />
        <button onClick={comment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>发送</button>
      </Modal>

      <Confirm open={!!confirmDel} title="删除动态" message="确定删除这条广场动态？" danger onConfirm={() => { if (confirmDel) del(confirmDel.id); setConfirmDel(null); }} onCancel={() => setConfirmDel(null)} />
    </AppScreen>
  );
}
