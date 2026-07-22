import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Send, Sparkles, TrendingUp, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateNPCPostBatch } from '../services/npcPostService';
import type { ApiConfig, SocialPost, UserIdentity, Character } from '../types';

// 热搜话题
const TRENDING_TOPICS = [
  { rank: 1, title: '今天天气真好', heat: '2.1亿', tag: 'hot' },
  { rank: 2, title: '周末去哪玩', heat: '1.8亿', tag: 'new' },
  { rank: 3, title: '美食推荐', heat: '1.5亿', tag: '' },
  { rank: 4, title: '今日穿搭', heat: '9876万', tag: 'hot' },
  { rank: 5, title: '分享日常', heat: '8523万', tag: '' },
];

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2878030/pexels-photo-2878030.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export function WeiboScreen({
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
  const [tab, setTab] = useState<'timeline' | 'trending'>('timeline');
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [commenting, setCommenting] = useState<SocialPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [detail, setDetail] = useState<SocialPost | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const weiboPosts = posts.filter((p) => p.platform === 'weibo').sort((a, b) => b.ts - a.ts);

  // 手动刷新获取NPC新帖子
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const npcPosts = generateNPCPostBatch(characters, posts, 'weibo');
      onChange([...posts, ...npcPosts]);
      // 延迟一下以显示刷新动画
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setRefreshing(false);
    }
  };

  const post = () => {
    if (!content.trim()) return;
    const p: SocialPost = {
      id: uid(),
      platform: 'weibo',
      authorId: me?.id ?? 'me',
      authorName: me?.nickname ?? '我',
      authorAvatar: me?.avatar,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      topic: topic.trim() || undefined,
      likes: 0,
      reposts: 0,
      comments: [],
      ts: Date.now(),
    };
    onChange([...posts, p]);
    setContent('');
    setImages([]);
    setTopic('');
    setComposing(false);
  };

  const aiPost = async () => {
    setGenerating(true);
    try {
      const names = characters.slice(0, 5).map((c) => c.name).join('、') || '网友';
      const sys = '你在模拟微博用户发微博。内容口语化真实，15-120字，可以带话题标签#xxx#，可以带emoji。只输出正文。';
      const text = await askAI(api, sys, `可能的人物：${names}\n请发一条微博：`, { temperature: 0.95, maxTokens: 150 });
      const c = characters[Math.floor(Math.random() * characters.length)];
      const useImage = Math.random() > 0.6;
      const p: SocialPost = {
        id: uid(),
        platform: 'weibo',
        authorId: c?.id ?? 'ai',
        authorName: c?.name ?? 'AI网友',
        authorAvatar: c?.avatar,
        content: text.trim(),
        images: useImage ? [SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]] : undefined,
        likes: Math.floor(Math.random() * 200),
        reposts: Math.floor(Math.random() * 50),
        comments: [],
        isHot: Math.random() > 0.7,
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

  const addImage = () => {
    if (images.length >= 9) return;
    const img = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    setImages([...images, img]);
  };

  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));

  // 详情页
  if (detail) {
    const p = posts.find((x) => x.id === detail.id) ?? detail;
    return (
      <AppScreen title="微博详情" onBack={() => setDetail(null)} noPad>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5 mb-3">
              {p.authorAvatar ? (
                <img src={p.authorAvatar} className="w-11 h-11 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-11 h-11 rounded-full icon-bg flex items-center justify-center text-[14px] txt-accent">{p.authorName[0] || '?'}</div>
              )}
              <div className="flex-1">
                <div className="text-[15px] font-medium flex items-center gap-1.5">
                  {p.authorName}
                  {p.isHot && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                </div>
                <div className="text-[12px] txt-faint">{new Date(p.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
              </div>
            </div>
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap mb-3">{p.content}</div>
            {p.topic && <div className="text-[14px] txt-accent mb-3">#{p.topic}#</div>}
            {p.images && p.images.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {p.images.map((img, i) => <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg" alt="" />)}
              </div>
            )}
            <div className="flex items-center gap-6 text-[14px] txt-faint pt-2">
              <button onClick={() => like(p.id)} className="tap flex items-center gap-1.5"><Heart size={16} className="txt-accent" /> {p.likes}</button>
              <button onClick={() => setCommenting(p)} className="tap flex items-center gap-1.5"><MessageCircle size={16} /> {p.comments.length}</button>
              <button onClick={() => repost(p.id)} className="tap flex items-center gap-1.5"><Repeat2 size={16} /> {p.reposts}</button>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[14px] font-medium mb-3">评论 {p.comments.length}</div>
            {p.comments.length === 0 ? (
              <div className="text-[13px] txt-faint text-center py-8">还没有评论</div>
            ) : (
              <div className="space-y-3">
                {p.comments.map((c) => (
                  <div key={c.id} className="text-[14px]">
                    <span className="txt-accent font-medium">{c.authorName}：</span>
                    <span className="txt-dim">{c.content}</span>
                    <div className="text-[11px] txt-faint mt-0.5">{new Date(c.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
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
      title="微博"
      onBack={onBack}
      noPad
      right={
        <button onClick={() => setComposing(true)} className="tap text-[var(--accent)]">
          <Send size={22} />
        </button>
      }
    >
      {/* tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-[var(--border)] flex gap-4 shrink-0">
        <button onClick={() => setTab('timeline')} className={`tap text-[15px] font-medium pb-2 relative ${tab === 'timeline' ? 'txt-accent' : 'txt-faint'}`}>
          时间线
          {tab === 'timeline' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
        </button>
        <button onClick={() => setTab('trending')} className={`tap text-[15px] font-medium pb-2 relative ${tab === 'trending' ? 'txt-accent' : 'txt-faint'}`}>
          热搜
          {tab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
        </button>
      </div>

      {/* timeline */}
      {tab === 'timeline' && (
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 pt-3 pb-2 flex justify-center sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur">
            <button onClick={handleRefresh} disabled={refreshing} className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[13px] disabled:opacity-50">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? '加载中…' : '刷新'}
            </button>
          </div>
          {weiboPosts.length === 0 ? (
            <div className="text-center txt-faint mt-16">还没有微博，发第一条吧</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {weiboPosts.map((p) => (
                <div key={p.id} className="px-4 py-4 tap" onClick={() => setDetail(p)}>
                  <div className="flex items-start gap-2.5">
                    {p.authorAvatar ? (
                      <img src={p.authorAvatar} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full icon-bg flex items-center justify-center text-[13px] txt-accent shrink-0">{p.authorName[0] || '?'}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[14px] font-medium">{p.authorName}</span>
                        {p.isHot && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                        <span className="text-[11px] txt-faint">{new Date(p.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                      </div>
                      <div className="text-[14px] leading-relaxed txt-dim whitespace-pre-wrap mb-2">{p.content}</div>
                      {p.topic && <div className="text-[13px] txt-accent mb-2">#{p.topic}#</div>}
                      {p.images && p.images.length > 0 && (
                        <div className={`grid gap-1.5 mb-2 ${p.images.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                          {p.images.map((img, i) => <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg" alt="" />)}
                        </div>
                      )}
                      <div className="flex items-center gap-5 text-[13px] txt-faint">
                        <button onClick={(e) => { e.stopPropagation(); like(p.id); }} className="tap flex items-center gap-1"><Heart size={14} /> {p.likes}</button>
                        <button onClick={(e) => { e.stopPropagation(); setCommenting(p); }} className="tap flex items-center gap-1"><MessageCircle size={14} /> {p.comments.length}</button>
                        <button onClick={(e) => { e.stopPropagation(); repost(p.id); }} className="tap flex items-center gap-1"><Repeat2 size={14} /> {p.reposts}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* trending */}
      {tab === 'trending' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="txt-accent" />
            <div className="text-[14px] txt-dim">实时热搜榜</div>
          </div>
          <div className="space-y-2">
            {TRENDING_TOPICS.map((t) => (
              <div key={t.rank} className="glass rounded-xl p-3 flex items-center gap-3">
                <div className={`text-[18px] font-bold w-6 text-center ${t.rank <= 3 ? 'txt-accent' : 'txt-faint'}`}>{t.rank}</div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium flex items-center gap-1.5">
                    {t.title}
                    {t.tag === 'hot' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                    {t.tag === 'new' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-500">新</span>}
                  </div>
                  <div className="text-[11px] txt-faint mt-0.5">{t.heat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* compose modal */}
      <Modal open={composing} onClose={() => setComposing(false)} title="发微博">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享新鲜事..."
          rows={4}
          className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
          autoFocus
        />
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="添加话题（选填）"
          className="w-full glass rounded-xl px-3 h-10 text-[13px] outline-none bg-transparent mb-3"
        />
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square">
                <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap">
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <button onClick={addImage} disabled={images.length >= 9} className="tap glass rounded-lg p-2 disabled:opacity-50">
            <ImageIcon size={20} className="txt-accent" />
          </button>
          <span className="text-[12px] txt-faint">{images.length}/9</span>
        </div>
        <div className="flex gap-3">
          <button onClick={aiPost} disabled={generating} className="tap flex-1 h-11 rounded-full glass font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
            <Sparkles size={16} className="txt-accent" /> {generating ? '生成中…' : 'AI 发微博'}
          </button>
          <button onClick={post} disabled={!content.trim()} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>
            发布
          </button>
        </div>
      </Modal>

      {/* comment modal */}
      <Modal open={!!commenting} onClose={() => setCommenting(null)} title="评论">
        <div className="mb-3 text-[13px] txt-dim bg-[var(--bg-elev)] rounded-xl p-3 line-clamp-3">{commenting?.content}</div>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && comment()}
          placeholder="写下你的评论..."
          className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent mb-3"
          autoFocus
        />
        <button onClick={comment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full font-medium text-[var(--bg)] disabled:opacity-50" style={{ background: 'var(--accent)' }}>
          发送
        </button>
      </Modal>
    </AppScreen>
  );
}
