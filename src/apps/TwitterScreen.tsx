import { useState, useEffect } from 'react';
import { Search, Home, Bell, Mail, Bookmark, User, Send, Image as ImageIcon, Video, Smile, MoreHorizontal, Heart, MessageCircle, Repeat2, Share2, Globe } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { ShareSheet } from '../components/ShareSheet';
import { SocialImage } from '../components/SocialImage';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateSocialImage } from '../services/imageGenService';
import type { ApiConfig, SocialPost, UserIdentity, Character } from '../types';

interface TwitterUser {
  id: string;
  handle: string;
  name: string;
  avatar?: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
  tweets: number;
}

export function TwitterScreen({
  api,
  me,
  characters,
  posts,
  onChange,
  onBack,
  autoTranslateEnabled = false,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  characters: Character[];
  posts: SocialPost[];
  onChange: (p: SocialPost[]) => void;
  onBack: () => void;
  autoTranslateEnabled?: boolean;
}) {
  const [tab, setTab] = useState<'home' | 'trending' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sharingPost, setSharingPost] = useState<SocialPost | null>(null);

  const twitterPosts = posts.filter(p => p.platform === 'twitter').sort((a, b) => b.ts - a.ts);

  // 自动翻译英文帖子
  useEffect(() => {
    if (!autoTranslateEnabled) return;

    const translatePosts = async () => {
      const postsToTranslate = twitterPosts.filter(post => {
        // 检测是否有英文（简单检测：是否包含英文字母）
        const hasEnglish = /[a-zA-Z]/.test(post.content);
        // 检测是否主要是中文（中文字符多于英文字符）
        const chineseChars = (post.content.match(/[一-龥]/g) || []).length;
        const englishChars = (post.content.match(/[a-zA-Z]/g) || []).length;
        const isMostlyEnglish = hasEnglish && englishChars > chineseChars;

        return isMostlyEnglish && !post.translatedContent;
      });

      if (postsToTranslate.length === 0) return;

      // 批量翻译
      for (const post of postsToTranslate) {
        try {
          const sys = '你是翻译助手。将英文推文翻译成中文，保持原意和语气。只输出翻译结果。';
          const translated = await askAI(api, sys, post.content, { temperature: 0.3, maxTokens: 300 });

          // 更新帖子的translatedContent
          onChange(posts.map(p =>
            p.id === post.id ? { ...p, translatedContent: translated.trim() } : p
          ));
        } catch (e) {
          console.error(`翻译失败 (post ${post.id}):`, e);
        }
      }
    };

    translatePosts();
  }, [twitterPosts.length, autoTranslateEnabled, api]);

  // 热门话题
  const trendingTopics = [
    { tag: 'AI', count: '1.2M posts', location: 'Worldwide' },
    { tag: 'WebDev', count: '856K posts', location: 'Technology' },
    { tag: 'ClimateAction', count: '643K posts', location: 'Worldwide' },
    { tag: 'CryptoNews', count: '521K posts', location: 'Finance' },
    { tag: 'GameDev', count: '398K posts', location: 'Technology' },
  ];

  // 推荐关注
  const recommendedUsers: TwitterUser[] = [
    {
      id: 'user1',
      handle: 'techlead_dev',
      name: 'Tech Lead',
      avatar: '👨‍💻',
      bio: 'Senior Software Engineer | Building scalable systems | Tweets about tech',
      verified: true,
      followers: 45600,
      following: 234,
      tweets: 3420
    },
    {
      id: 'user2',
      handle: 'ai_researcher',
      name: 'AI Research Lab',
      avatar: '🤖',
      bio: 'Advancing AI for humanity | Latest research & breakthroughs',
      verified: true,
      followers: 128000,
      following: 89,
      tweets: 1890
    },
    {
      id: 'user3',
      handle: 'design_ui',
      name: 'UI/UX Designer',
      avatar: '🎨',
      bio: 'Creating beautiful user experiences | Design tips & inspiration',
      verified: true,
      followers: 67800,
      following: 456,
      tweets: 2340
    }
  ];

  const handlePost = () => {
    if (!content.trim()) return;
    const p: SocialPost = {
      id: uid(),
      platform: 'twitter',
      authorId: me?.id ?? 'me',
      authorName: me?.nickname ?? 'Me',
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
        ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? 'Me', content: commentText.trim(), ts: Date.now() }] }
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

    const targetName = targetType === 'chat' ? '聊天' : targetType === 'weibo' ? '微博私信' : 'Twitter DM';
    alert(`已分享到${targetName}（功能开发中）`);

    setSharingPost(null);
  };

  const addImage = async () => {
    if (images.length + imageDescriptions.length >= 4) return;
    setGeneratingImage(true);
    try {
      const descSys = 'You are an image description generator. Generate a 10-20 word image description. Output only the description.';
      const imageDesc = await askAI(api, descSys, 'Generate a description for a tweet image:', { temperature: 0.9, maxTokens: 50 });
      const imageResult = await generateSocialImage(api, imageDesc.trim());

      if (imageResult.url) {
        setImages([...images, imageResult.url]);
      } else {
        setImageDescriptions([...imageDescriptions, imageResult.description]);
      }
    } catch (e) {
      alert(`Image generation failed: ${(e as Error).message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <AppScreen title="Twitter" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-[var(--bg)]">
        {/* 顶部搜索栏 */}
        <div className="px-4 py-3 border-b border-[var(--border)] shrink-0 bg-[var(--bg)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-[var(--surface)] rounded-full px-4 h-10">
              <Search size={16} className="txt-faint" />
              <input
                type="text"
                placeholder="Search Twitter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[14px] txt-accent"
              />
            </div>
            <button onClick={() => setComposing(true)} className="tap w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <Send size={18} />
            </button>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-6">
            <button
              onClick={() => setTab('home')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'home' ? 'txt-accent' : 'txt-faint'}`}
            >
              For you
              {tab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'trending' ? 'txt-accent' : 'txt-faint'}`}
            >
              Trending
              {tab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'home' && (
            <div className="divide-y divide-[var(--border)]">
              {twitterPosts.map(post => (
                <div key={post.id} className="p-4 hover:bg-[var(--surface)] transition-colors">
                  {/* 用户信息 */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px] shrink-0">
                      {post.authorAvatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-bold txt-accent">{post.authorName}</span>
                        {post.verified && <span className="text-blue-500">✓</span>}
                        <span className="text-[14px] txt-faint">@{post.authorId}</span>
                        <span className="text-[14px] txt-faint">·</span>
                        <span className="text-[14px] txt-faint">
                          {new Date(post.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button className="tap p-2">
                      <MoreHorizontal size={18} className="txt-faint" />
                    </button>
                  </div>

                  {/* 内容 */}
                  <div className="ml-15 mb-3">
                    {/* 显示翻译内容（如果有）或原文 */}
                    <div className="text-[15px] leading-relaxed txt-dim whitespace-pre-wrap mb-2">
                      {post.translatedContent || post.content}
                    </div>

                    {/* 如果有翻译，显示原文提示 */}
                    {autoTranslateEnabled && post.translatedContent && (
                      <div className="text-[12px] txt-faint mb-2">
                        原文: {post.content}
                      </div>
                    )}

                    {/* 图片 */}
                    {(post.images || post.imageDescriptions) && (
                      <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                        (post.images?.length ?? 0) + (post.imageDescriptions?.length ?? 0) === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {post.images?.map((img, i) => (
                          <SocialImage key={`img-${i}`} url={img} description="" hasApi={true} className="aspect-video" />
                        ))}
                        {post.imageDescriptions?.map((desc, i) => (
                          <SocialImage key={`desc-${i}`} url={undefined} description={desc} hasApi={false} className="aspect-video" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 互动按钮 */}
                  <div className="ml-15 flex items-center justify-between max-w-md">
                    <button onClick={() => { setSelectedPost(post); setCommenting(true); }} className="tap flex items-center gap-2 txt-faint hover:text-blue-500 group">
                      <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <MessageCircle size={18} />
                      </div>
                      <span className="text-[13px]">{post.comments.length > 0 && post.comments.length}</span>
                    </button>
                    <button onClick={() => handleRepost(post.id)} className="tap flex items-center gap-2 txt-faint hover:text-green-500 group">
                      <div className="p-2 rounded-full group-hover:bg-green-500/10">
                        <Repeat2 size={18} />
                      </div>
                      <span className="text-[13px]">{post.reposts > 0 && post.reposts}</span>
                    </button>
                    <button onClick={() => handleLike(post.id)} className="tap flex items-center gap-2 txt-faint hover:text-red-500 group">
                      <div className="p-2 rounded-full group-hover:bg-red-500/10">
                        <Heart size={18} />
                      </div>
                      <span className="text-[13px]">{post.likes > 0 && post.likes}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="tap flex items-center gap-2 txt-faint hover:text-blue-500 group">
                      <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <Share2 size={18} />
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'trending' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="text-[20px] font-bold txt-accent mb-4">Trends for you</div>
              </div>

              <div className="space-y-1">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="tap glass rounded-xl p-4 hover:bg-[var(--surface)]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-[13px] txt-faint mb-1">{topic.location}</div>
                        <div className="text-[15px] font-bold txt-accent mb-1">#{topic.tag}</div>
                        <div className="text-[13px] txt-faint">{topic.count}</div>
                      </div>
                      <button className="tap p-2">
                        <MoreHorizontal size={18} className="txt-faint" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-[20px] font-bold txt-accent mb-4">Who to follow</div>
                <div className="space-y-3">
                  {recommendedUsers.map(user => (
                    <div key={user.id} className="glass rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px]">
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-bold txt-accent truncate">{user.name}</span>
                            {user.verified && <span className="text-blue-500 shrink-0">✓</span>}
                          </div>
                          <div className="text-[14px] txt-faint mb-2">@{user.handle}</div>
                          <div className="text-[13px] txt-dim line-clamp-2 mb-2">{user.bio}</div>
                        </div>
                        <button className="tap px-4 py-1.5 rounded-full bg-blue-500 text-white text-[14px] font-bold shrink-0">
                          Follow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 发推弹窗 */}
        <Modal open={composing} onClose={() => setComposing(false)} title="Post">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[16px] shrink-0">
              {me?.avatar || '👤'}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              rows={6}
              className="flex-1 glass rounded-xl px-3 py-2.5 text-[15px] outline-none bg-transparent resize-none"
              autoFocus
            />
          </div>

          {(images.length > 0 || imageDescriptions.length > 0) && (
            <div className={`grid gap-2 rounded-2xl overflow-hidden mb-3 ${
              images.length + imageDescriptions.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {images.map((img, i) => (
                <div key={`img-${i}`} className="relative">
                  <img src={img} className="w-full aspect-video object-cover" alt="" />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center tap">
                    <span className="text-white text-[16px]">×</span>
                  </button>
                </div>
              ))}
              {imageDescriptions.map((desc, i) => (
                <div key={`desc-${i}`} className="relative">
                  <SocialImage url={undefined} description={desc} hasApi={false} className="aspect-video" />
                  <button onClick={() => setImageDescriptions(imageDescriptions.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center tap">
                    <span className="text-white text-[16px]">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-2">
              <button onClick={addImage} disabled={images.length + imageDescriptions.length >= 4 || generatingImage} className="tap glass rounded-full p-2 disabled:opacity-50">
                <ImageIcon size={20} className="text-blue-500" />
              </button>
              <button className="tap glass rounded-full p-2">
                <Video size={20} className="text-blue-500" />
              </button>
              <button className="tap glass rounded-full p-2">
                <Smile size={20} className="text-blue-500" />
              </button>
            </div>
            <button onClick={handlePost} disabled={!content.trim()} className="tap px-6 py-2 rounded-full bg-blue-500 text-white text-[15px] font-bold disabled:opacity-50">
              Post
            </button>
          </div>
        </Modal>

        {/* 评论弹窗 */}
        <Modal open={commenting} onClose={() => setCommenting(false)} title="Reply">
          <div className="mb-3 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[16px] shrink-0">
              {selectedPost?.authorAvatar || '👤'}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold txt-accent mb-1">{selectedPost?.authorName}</div>
              <div className="text-[14px] txt-dim line-clamp-3">{selectedPost?.content}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center text-[16px] shrink-0">
              {me?.avatar || '👤'}
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Post your reply"
              rows={4}
              className="flex-1 glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
              autoFocus
            />
          </div>
          <div className="flex justify-end">
            <button onClick={handleComment} disabled={!commentText.trim()} className="tap px-6 py-2 rounded-full bg-blue-500 text-white text-[15px] font-bold disabled:opacity-50">
              Reply
            </button>
          </div>
        </Modal>

        {/* 分享弹窗 */}
        <ShareSheet
          open={!!sharingPost}
          onClose={() => setSharingPost(null)}
          onShare={handleShareConfirm}
          title="分享推文"
        />
      </div>
    </AppScreen>
  );
}
