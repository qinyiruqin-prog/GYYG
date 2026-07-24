import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Send, Sparkles, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { SocialImage } from '../components/SocialImage';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateNPCPostBatch } from '../services/npcPostService';
import { generateSocialImage } from '../services/imageGenService';
import type { ApiConfig, SocialPost, UserIdentity, Character } from '../types';

export function TwitterScreen({
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
  posts: SocialPost[];
  onChange: (p: SocialPost[]) => void;
  onBack: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [commenting, setCommenting] = useState<SocialPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [detail, setDetail] = useState<SocialPost | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const twitterPosts = posts.filter((p) => p.platform === 'twitter').sort((a, b) => b.ts - a.ts);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const npcPosts = generateNPCPostBatch(characters, posts, 'twitter');
      onChange([...posts, ...npcPosts]);
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setRefreshing(false);
    }
  };

  const post = () => {
    if (!content.trim()) return;
    if (content.length > 280) {
      alert('推文不能超过280字');
      return;
    }
    const p: SocialPost = {
      id: uid(),
      platform: 'twitter',
      authorId: me?.id ?? 'me',
      authorName: me?.nickname ?? '我',
      authorAvatar: me?.avatar,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      imageDescriptions: imageDescriptions.length > 0 ? imageDescriptions : undefined,
      likes: 0,
      reposts: 0,
      comments: [],
      ts: Date.now(),
    };
    onChange([...posts, p]);
    setContent('');
    setImages([]);
    setImageDescriptions([]);
    setComposing(false);
  };

  const aiPost = async () => {
    setGenerating(true);
    try {
      const names = characters.slice(0, 5).map((c) => c.name).join('、') || '网友';
      const sys = '你在模拟推特用户发推文。内容简短有力，15-80字，可以带话题标签#，可以带emoji。只输出正文，不要引号。';
      const text = await askAI(api, sys, `可能的人物：${names}\n请发一条推文：`, { temperature: 0.95, maxTokens: 120 });
      const c = characters[Math.floor(Math.random() * characters.length)];
      const useImage = Math.random() > 0.6;

      let postImages: string[] | undefined = undefined;
      let postImageDescriptions: string[] | undefined = undefined;

      if (useImage) {
        // 生成图片描述
        const imagePrompt = `根据这条推文内容生成一张配图：${text.substring(0, 100)}`;
        const descSys = '你是图片描述生成器。根据推文内容，用10-20字描述一张适合的配图。只输出描述，不要引号。';
        const imageDesc = await askAI(api, descSys, imagePrompt, { temperature: 0.8, maxTokens: 50 });

        // 尝试生成真实图片
        const imageResult = await generateSocialImage(api, imageDesc.trim());

        if (imageResult.url) {
          postImages = [imageResult.url];
        } else {
          postImageDescriptions = [imageResult.description];
        }
      }

      const p: SocialPost = {
        id: uid(),
        platform: 'twitter',
        authorId: c?.id ?? 'ai',
        authorName: c?.name ?? 'AI网友',
        authorAvatar: c?.avatar,
        content: text.trim().slice(0, 280),
        images: postImages,
        imageDescriptions: postImageDescriptions,
        likes: Math.floor(Math.random() * 100),
        reposts: Math.floor(Math.random() * 30),
        comments: [],
        ts: Date.now(),
      };
      onChange([...posts, p]);
      setComposing(false);
    } catch (e) {
      alert(`AI生成失败：${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const like = (id: string) => onChange(posts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  const repost = (id: string) => onChange(posts.map((p) => p.id === id ? { ...p, reposts: p.reposts + 1 } : p));
  const comment = () => {
    if (!commentText.trim() || !commenting) return;
    onChange(posts.map((p) => p.id === commenting.id ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? '我', content: commentText.trim(), ts: Date.now() }] } : p));
    setCommentText('');
    setCommenting(null);
  };

  const addImage = async () => {
    if (images.length + imageDescriptions.length >= 4) return;
    setGeneratingImage(true);
    try {
      const descSys = '你是图片描述生成器。生成一个10-20字的图片内容描述，比如"城市夜景"、"咖啡特写"等。只输出描述。';
      const imageDesc = await askAI(api, descSys, '请生成一个适合推特配图的描述：', { temperature: 0.9, maxTokens: 50 });

      const imageResult = await generateSocialImage(api, imageDesc.trim());

      if (imageResult.url) {
        setImages([...images, imageResult.url]);
      } else {
        setImageDescriptions([...imageDescriptions, imageResult.description]);
      }
    } catch (e) {
      alert(`图片生成失败：${(e as Error).message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));
  const removeImageDescription = (idx: number) => setImageDescriptions(imageDescriptions.filter((_, i) => i !== idx));

  // 详情页
  if (detail) {
    const p = posts.find((x) => x.id === detail.id) ?? detail;
    return (
      <AppScreen title="推文" onBack={() => setDetail(null)} noPad>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <div className="flex items-start gap-3 mb-3">
              {p.authorAvatar ? (
                <img src={p.authorAvatar} className="w-12 h-12 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-full icon-bg flex items-center justify-center text-[15px] txt-accent">{p.authorName[0] || '?'}</div>
              )}
              <div className="flex-1">
                <div className="text-[15px] font-bold">{p.authorName}</div>
                <div className="text-[13px] txt-faint">@{p.authorName.toLowerCase().replace(/\s/g, '_')}</div>
              </div>
            </div>
            <div className="text-[16px] leading-relaxed whitespace-pre-wrap mb-3">{p.content}</div>
            {(p.images && p.images.length > 0 || p.imageDescriptions && p.imageDescriptions.length > 0) && (
              <div className={`grid gap-2 mb-3 ${(p.images?.length || 0) + (p.imageDescriptions?.length || 0) === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {p.images?.map((img, i) => (
                  <SocialImage
                    key={`img-${i}`}
                    url={img}
                    description=""
                    hasApi={true}
                    className="aspect-video rounded-xl"
                  />
                ))}
                {p.imageDescriptions?.map((desc, i) => (
                  <SocialImage
                    key={`desc-${i}`}
                    url={undefined}
                    description={desc}
                    hasApi={false}
                    className="aspect-video rounded-xl"
                  />
                ))}
              </div>
            )}
            <div className="text-[13px] txt-faint mb-4">{new Date(p.ts).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
            <div className="flex items-center gap-6 text-[14px] txt-dim border-y border-[var(--border)] py-3">
              <div><span className="font-bold">{p.likes}</span> 喜欢</div>
              <div><span className="font-bold">{p.reposts}</span> 转推</div>
              <div><span className="font-bold">{p.comments.length}</span> 回复</div>
            </div>
            <div className="flex items-center justify-around pt-3">
              <button onClick={() => setCommenting(p)} className="tap flex items-center gap-1.5 txt-dim hover:txt-accent"><MessageCircle size={18} /></button>
              <button onClick={() => repost(p.id)} className="tap flex items-center gap-1.5 txt-dim hover:txt-accent"><Repeat2 size={18} /></button>
              <button onClick={() => like(p.id)} className="tap flex items-center gap-1.5 txt-dim hover:txt-accent"><Heart size={18} /></button>
            </div>
          </div>
          <div className="px-4 py-3">
            {p.comments.length === 0 ? (
              <div className="text-[13px] txt-faint text-center py-8">还没有回复</div>
            ) : (
              <div className="space-y-4">
                {p.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent shrink-0">{c.authorName[0] || '?'}</div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium">{c.authorName} <span className="text-[12px] txt-faint font-normal">@{c.authorName.toLowerCase().replace(/\s/g, '_')}</span></div>
                      <div className="text-[14px] txt-dim mt-0.5">{c.content}</div>
                      <div className="text-[11px] txt-faint mt-1">{new Date(c.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="𝕏"
      onBack={onBack}
      noPad
      right={
        <button onClick={() => setComposing(true)} className="tap text-[var(--accent)]">
          <Send size={22} />
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-4 pt-3 pb-2 flex justify-center sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)]">
          <button onClick={handleRefresh} disabled={refreshing} className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[13px] disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? '加载中…' : '刷新'}
          </button>
        </div>
        {twitterPosts.length === 0 ? (
          <div className="text-center txt-faint mt-16">还没有推文，发第一条吧</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {twitterPosts.map((p) => (
              <div key={p.id} className="px-4 py-3 tap" onClick={() => setDetail(p)}>
                <div className="flex items-start gap-2.5">
                  {p.authorAvatar ? (
                    <img src={p.authorAvatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent shrink-0">{p.authorName[0] || '?'}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[14px] font-bold">{p.authorName}</span>
                      <span className="text-[13px] txt-faint">@{p.authorName.toLowerCase().replace(/\s/g, '_')}</span>
                      <span className="text-[13px] txt-faint">· {new Date(p.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })}</span>
                    </div>
                    <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap mb-2">{p.content}</div>
                    {(p.images && p.images.length > 0 || p.imageDescriptions && p.imageDescriptions.length > 0) && (
                      <div className={`grid gap-2 mb-2 ${(p.images?.length || 0) + (p.imageDescriptions?.length || 0) === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {p.images?.map((img, i) => (
                          <SocialImage
                            key={`img-${i}`}
                            url={img}
                            description=""
                            hasApi={true}
                            className="aspect-video rounded-xl"
                          />
                        ))}
                        {p.imageDescriptions?.map((desc, i) => (
                          <SocialImage
                            key={`desc-${i}`}
                            url={undefined}
                            description={desc}
                            hasApi={false}
                            className="aspect-video rounded-xl"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-[13px] txt-faint">
                      <button onClick={(e) => { e.stopPropagation(); setCommenting(p); }} className="tap flex items-center gap-1.5 hover:txt-accent"><MessageCircle size={16} /> {p.comments.length > 0 && p.comments.length}</button>
                      <button onClick={(e) => { e.stopPropagation(); repost(p.id); }} className="tap flex items-center gap-1.5 hover:txt-accent"><Repeat2 size={16} /> {p.reposts > 0 && p.reposts}</button>
                      <button onClick={(e) => { e.stopPropagation(); like(p.id); }} className="tap flex items-center gap-1.5 hover:txt-accent"><Heart size={16} /> {p.likes > 0 && p.likes}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* compose modal */}
      <Modal open={composing} onClose={() => setComposing(false)} title="发推文">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="有什么新鲜事？"
          rows={4}
          className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-2"
          autoFocus
          maxLength={280}
        />
        <div className="text-[12px] txt-faint mb-3 text-right">{content.length} / 280</div>

        {(images.length > 0 || imageDescriptions.length > 0) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={`img-${i}`} className="relative aspect-video">
                <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap">
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
            {imageDescriptions.map((desc, i) => (
              <div key={`desc-${i}`} className="relative aspect-video">
                <SocialImage url={undefined} description={desc} hasApi={false} className="h-full" />
                <button onClick={() => removeImageDescription(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap">
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <button onClick={addImage} disabled={images.length + imageDescriptions.length >= 4 || generatingImage} className="tap glass rounded-lg p-2 disabled:opacity-50">
            <ImageIcon size={20} className="txt-accent" />
          </button>
          <span className="text-[12px] txt-faint">
            {generatingImage ? '生成中...' : `${images.length + imageDescriptions.length}/4`}
          </span>
        </div>

        <div className="flex gap-3">
          <button onClick={aiPost} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
            <Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI 发推'}
          </button>
          <button onClick={post} disabled={!content.trim() || content.length > 280} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>
            发推
          </button>
        </div>
      </Modal>

      {/* comment modal */}
      <Modal open={!!commenting} onClose={() => setCommenting(null)} title="回复">
        <div className="mb-3 text-[13px] txt-dim bg-[var(--bg-elev)] rounded-xl p-3 line-clamp-3">{commenting?.content}</div>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="发推你的回复"
          rows={3}
          className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
          autoFocus
        />
        <button onClick={comment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>
          回复
        </button>
      </Modal>
    </AppScreen>
  );
}
