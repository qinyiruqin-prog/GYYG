import { useState } from 'react';
import { Search, TrendingUp, Home, Bell, Mail, User, Send, Image as ImageIcon, Video, Smile, MoreHorizontal, Heart, MessageCircle, Repeat2, Share, Bookmark, ChevronDown } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { ShareSheet } from '../components/ShareSheet';
import { SocialImage } from '../components/SocialImage';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateSocialImage } from '../services/imageGenService';
import type { ApiConfig, SocialPost, UserIdentity, Character } from '../types';

interface WeiboUser {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
}

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
  const [tab, setTab] = useState<'home' | 'trending' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sharingPost, setSharingPost] = useState<SocialPost | null>(null);

  // 热门话题
  const trendingTopics = [
    { tag: '深夜食堂', count: '821万讨论', hot: true },
    { tag: '周末去哪玩', count: '567万讨论', hot: true },
    { tag: '今日穿搭', count: '432万讨论', hot: false },
    { tag: '美食分享', count: '398万讨论', hot: false },
    { tag: '读书笔记', count: '276万讨论', hot: false },
  ];

  // 推荐关注用户
  const recommendedUsers: WeiboUser[] = [
    {
      id: 'user1',
      name: '美食博主小张',
      avatar: '🍜',
      bio: '探店达人｜美食摄影｜合作请私信',
      verified: true,
      followers: 128000,
      following: 456,
      posts: 2340
    },
    {
      id: 'user2',
      name: '旅行摄影师Leo',
      avatar: '📷',
      bio: '用镜头记录世界｜已走过47个国家',
      verified: true,
      followers: 567000,
      following: 234,
      posts: 1890
    },
    {
      id: 'user3',
      name: '科技数码评测',
      avatar: '💻',
      bio: '专业数码测评｜真实体验｜不吹不黑',
      verified: true,
      followers: 234000,
      following: 189,
      posts: 1234
    }
  ];

  const weiboPosts = posts.filter(p => p.platform === 'weibo').sort((a, b) => b.ts - a.ts);

  const handlePost = () => {
    if (!content.trim()) return;
    const p: SocialPost = {
      id: uid(),
      platform: 'weibo',
      authorId: me?.id ?? 'me',
      authorName: me?.nickname ?? '我',
      authorAvatar: me?.avatar,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      imageDescriptions: imageDescriptions.length > 0 ? imageDescriptions : undefined,
      likes: 0,
      reposts: 0,
      comments: [],
      ts: Date.now()
    };
    onChange([p, ...posts]);
    setContent('');
    setImages([]);
    setImageDescriptions([]);
    setComposing(false);
  };

  const handleLike = (postId: string) => {
    onChange(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleRepost = (postId: string) => {
    onChange(posts.map(p => p.id === postId ? { ...p, reposts: p.reposts + 1 } : p));
  };

  const handleComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    onChange(posts.map(p =>
      p.id === selectedPost.id
        ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? '我', content: commentText.trim(), ts: Date.now() }] }
        : p
    ));
    setCommentText('');
    setCommenting(false);
  };

  const handleShare = (post: SocialPost) => {
    setSharingPost(post);
  };

  const handleShareConfirm = (targetId: string, targetType: 'chat' | 'weibo' | 'twitter') => {
    if (!sharingPost) return;

    // 这里应该发送消息到聊天或社交媒体
    // 暂时使用alert提示
    const targetName = targetType === 'chat' ? '聊天' : targetType === 'weibo' ? '微博私信' : 'Twitter私信';
    alert(`已分享到${targetName}（功能开发中）`);

    // TODO: 实际实现分享逻辑
    // 1. 如果是chat，需要创建或更新chatThread
    // 2. 如果是weibo/twitter，需要发送私信

    setSharingPost(null);
  };

  const addImage = async () => {
    if (images.length + imageDescriptions.length >= 9) return;
    setGeneratingImage(true);
    try {
      const descSys = '你是图片描述生成器。生成一个10-20字的图片内容描述。只输出描述。';
      const imageDesc = await askAI(api, descSys, '请生成一个适合微博配图的描述：', { temperature: 0.9, maxTokens: 50 });
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

  return (
    <AppScreen title="微博" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-[var(--bg)]">
        {/* 顶部搜索栏 */}
        <div className="px-4 py-3 border-b border-[var(--border)] shrink-0 bg-[var(--bg)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-[var(--surface)] rounded-full px-4 h-10">
              <Search size={16} className="txt-faint" />
              <input
                type="text"
                placeholder="搜索微博、用户、话题"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[14px] txt-accent"
              />
            </div>
            <button onClick={() => setComposing(true)} className="tap px-4 h-10 rounded-full bg-[var(--accent)] text-white font-medium">
              发微博
            </button>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-6">
            <button
              onClick={() => setTab('home')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'home' ? 'txt-accent' : 'txt-faint'}`}
            >
              首页
              {tab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />}
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'trending' ? 'txt-accent' : 'txt-faint'}`}
            >
              热搜
              {tab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />}
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'home' && (
            <div className="divide-y divide-[var(--border)]">
              {weiboPosts.map(post => (
                <div key={post.id} className="p-4 hover:bg-[var(--surface)] transition-colors">
                  {/* 用户信息 */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px] shrink-0">
                      {post.authorAvatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium txt-accent">{post.authorName}</span>
                        {post.isHot && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                      </div>
                      <div className="text-[12px] txt-faint">
                        {new Date(post.ts).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                      </div>
                    </div>
                    <button className="tap p-2">
                      <MoreHorizontal size={18} className="txt-faint" />
                    </button>
                  </div>

                  {/* 内容 */}
                  <div className="text-[15px] leading-relaxed txt-dim whitespace-pre-wrap mb-3">
                    {post.content}
                  </div>

                  {/* 话题标签 */}
                  {post.topic && (
                    <div className="mb-3">
                      <span className="text-[14px] text-blue-500">#{post.topic}#</span>
                    </div>
                  )}

                  {/* 图片 */}
                  {(post.images || post.imageDescriptions) && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {post.images?.map((img, i) => (
                        <SocialImage key={`img-${i}`} url={img} description="" hasApi={true} className="aspect-square rounded-lg" />
                      ))}
                      {post.imageDescriptions?.map((desc, i) => (
                        <SocialImage key={`desc-${i}`} url={undefined} description={desc} hasApi={false} className="aspect-square rounded-lg" />
                      ))}
                    </div>
                  )}

                  {/* 互动按钮 */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <button onClick={() => { setSelectedPost(post); setCommenting(true); }} className="tap flex items-center gap-2 txt-faint hover:text-blue-500">
                      <MessageCircle size={18} />
                      <span className="text-[13px]">{post.comments.length > 0 && post.comments.length}</span>
                    </button>
                    <button onClick={() => handleRepost(post.id)} className="tap flex items-center gap-2 txt-faint hover:text-green-500">
                      <Repeat2 size={18} />
                      <span className="text-[13px]">{post.reposts > 0 && post.reposts}</span>
                    </button>
                    <button onClick={() => handleLike(post.id)} className="tap flex items-center gap-2 txt-faint hover:text-red-500">
                      <Heart size={18} />
                      <span className="text-[13px]">{post.likes > 0 && post.likes}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="tap flex items-center gap-2 txt-faint hover:text-blue-500">
                      <Share size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'trending' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={20} className="txt-accent" />
                  <span className="text-[16px] font-bold txt-accent">热搜榜</span>
                </div>
              </div>

              <div className="space-y-2">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="tap glass rounded-xl p-4 flex items-center gap-4">
                    <div className={`text-[20px] font-bold w-8 text-center ${idx < 3 ? 'text-red-500' : 'txt-faint'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-medium txt-accent">#{topic.tag}</span>
                        {topic.hot && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                      </div>
                      <div className="text-[12px] txt-faint">{topic.count}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-[16px] font-bold txt-accent mb-3">推荐关注</div>
                <div className="space-y-3">
                  {recommendedUsers.map(user => (
                    <div key={user.id} className="glass rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px]">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-medium txt-accent">{user.name}</span>
                            {user.verified && <span className="text-blue-500">✓</span>}
                          </div>
                          <div className="text-[12px] txt-faint mb-2">{user.bio}</div>
                          <div className="flex items-center gap-4 text-[11px] txt-faint">
                            <span>{(user.followers / 10000).toFixed(1)}万 粉丝</span>
                            <span>{user.posts} 微博</span>
                          </div>
                        </div>
                        <button className="tap px-4 py-1.5 rounded-full bg-[var(--accent)] text-white text-[13px] font-medium">
                          关注
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 发微博弹窗 */}
        <Modal open={composing} onClose={() => setComposing(false)} title="发微博">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享新鲜事..."
            rows={6}
            className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
            autoFocus
          />

          {(images.length > 0 || imageDescriptions.length > 0) && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img, i) => (
                <div key={`img-${i}`} className="relative aspect-square">
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt="" />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap">
                    <span className="text-white text-[12px]">×</span>
                  </button>
                </div>
              ))}
              {imageDescriptions.map((desc, i) => (
                <div key={`desc-${i}`} className="relative aspect-square">
                  <SocialImage url={undefined} description={desc} hasApi={false} className="h-full" />
                  <button onClick={() => setImageDescriptions(imageDescriptions.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center tap">
                    <span className="text-white text-[12px]">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <button onClick={addImage} disabled={images.length + imageDescriptions.length >= 9 || generatingImage} className="tap glass rounded-lg p-2 disabled:opacity-50">
              <ImageIcon size={20} className="txt-accent" />
            </button>
            <button className="tap glass rounded-lg p-2">
              <Video size={20} className="txt-accent" />
            </button>
            <button className="tap glass rounded-lg p-2">
              <Smile size={20} className="txt-accent" />
            </button>
            <div className="flex-1 text-[12px] txt-faint text-right">
              {generatingImage ? '生成中...' : `${images.length + imageDescriptions.length}/9`}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setComposing(false)} className="tap flex-1 h-11 rounded-full glass font-medium">
              取消
            </button>
            <button onClick={handlePost} disabled={!content.trim()} className="tap flex-1 h-11 rounded-full bg-[var(--accent)] text-white font-medium disabled:opacity-50">
              发布
            </button>
          </div>
        </Modal>

        {/* 评论弹窗 */}
        <Modal open={commenting} onClose={() => setCommenting(false)} title="评论">
          <div className="mb-3 text-[13px] txt-dim bg-[var(--surface)] rounded-xl p-3 line-clamp-3">
            {selectedPost?.content}
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={4}
            className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
            autoFocus
          />
          <button onClick={handleComment} disabled={!commentText.trim()} className="tap w-full h-11 rounded-full bg-[var(--accent)] text-white font-medium disabled:opacity-50">
            发送
          </button>
        </Modal>

        {/* 分享弹窗 */}
        <ShareSheet
          open={!!sharingPost}
          onClose={() => setSharingPost(null)}
          onShare={handleShareConfirm}
          title="分享微博"
        />
      </div>
    </AppScreen>
  );
}
