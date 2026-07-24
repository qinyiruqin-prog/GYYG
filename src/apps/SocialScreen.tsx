import { useState } from 'react';
import { Search, TrendingUp, Hash, Users, Send, Image as ImageIcon, Video, Smile, MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, RefreshCw } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Modal } from '../components/Sheet';
import { ShareSheet } from '../components/ShareSheet';
import { SocialImage } from '../components/SocialImage';
import { uid } from '../utils';
import { askAI } from '../api';
import { generateSocialImage } from '../services/imageGenService';
import type { ApiConfig, SquarePost, UserIdentity, Character } from '../types';

interface SquareUser {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  followers: number;
  posts: number;
}

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
  const [tab, setTab] = useState<'latest' | 'trending' | 'following'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SquarePost | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sharingPost, setSharingPost] = useState<SquarePost | null>(null);

  const sortedPosts = [...posts].sort((a, b) => b.ts - a.ts);

  // 热门话题
  const trendingTopics = [
    { tag: '今日话题', count: 1234, hot: true },
    { tag: '生活分享', count: 987, hot: true },
    { tag: '随手拍', count: 756, hot: false },
    { tag: '晚安', count: 654, hot: false },
    { tag: '周末计划', count: 543, hot: false },
  ];

  // 活跃用户
  const activeUsers: SquareUser[] = [
    { id: 'user1', name: '爱拍照的小王', avatar: '📸', bio: '记录生活的美好瞬间', followers: 2345, posts: 189 },
    { id: 'user2', name: '美食探店家', avatar: '🍜', bio: '分享好吃的店铺', followers: 5678, posts: 456 },
    { id: 'user3', name: '旅行日记', avatar: '✈️', bio: '走遍世界的每个角落', followers: 8901, posts: 678 },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 生成1-3条新的AI帖子
      const newPostCount = Math.floor(Math.random() * 3) + 1;
      const newPosts: SquarePost[] = [];

      for (let i = 0; i < newPostCount; i++) {
        const names = characters.slice(0, 5).map(c => c.name).join('、') || '路人';
        const sys = '你在模拟一个公共广场。以虚拟网友身份发一条200-300字的长文动态，内容真实自然，可以是生活感悟、日常分享、心情记录等。只输出正文。';
        const postContent = await askAI(api, sys, `可能的人物：${names}\n请发一条广场动态：`, { temperature: 0.95, maxTokens: 400 });

        const c = characters[Math.floor(Math.random() * characters.length)];
        const useImage = Math.random() > 0.5;

        let postImages: string[] = [];
        let postImageDescs: string[] = [];

        if (useImage) {
          const imageCount = Math.floor(Math.random() * 3) + 1; // 1-3张图片
          for (let j = 0; j < imageCount; j++) {
            const imagePrompt = `根据这条动态生成第${j + 1}张配图：${postContent.substring(0, 100)}`;
            const descSys = '你是图片描述生成器。根据动态内容，用10-20字描述一张适合的配图。只输出描述。';
            const imageDesc = await askAI(api, descSys, imagePrompt, { temperature: 0.8, maxTokens: 50 });
            const imageResult = await generateSocialImage(api, imageDesc.trim());

            if (imageResult.url) {
              postImages.push(imageResult.url);
            } else {
              postImageDescs.push(imageResult.description);
            }
          }
        }

        const p: SquarePost = {
          id: uid(),
          authorName: c?.name ?? 'AI网友',
          authorAvatar: c?.avatar,
          text: postContent.trim(),
          images: postImages.length > 0 ? postImages : undefined,
          imageDescriptions: postImageDescs.length > 0 ? postImageDescs : undefined,
          likes: Math.floor(Math.random() * 200),
          comments: [],
          ts: Date.now() + i * 1000,
          aiGenerated: true
        };
        newPosts.push(p);
      }

      onChange([...newPosts, ...posts]);
    } catch (e) {
      alert(`刷新失败：${(e as Error).message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePost = () => {
    if (!content.trim()) return;
    const p: SquarePost = {
      id: uid(),
      authorName: me?.nickname ?? '匿名',
      authorAvatar: me?.avatar,
      text: content.trim(),
      images: images.length > 0 ? images : undefined,
      imageDescriptions: imageDescriptions.length > 0 ? imageDescriptions : undefined,
      likes: 0,
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

  const handleComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    onChange(posts.map(p =>
      p.id === selectedPost.id
        ? { ...p, comments: [...p.comments, { id: uid(), authorName: me?.nickname ?? '我', text: commentText.trim(), ts: Date.now() }] }
        : p
    ));
    setCommentText('');
    setCommenting(false);
  };

  const handleShare = (post: SquarePost) => {
    setSharingPost(post);
  };

  const handleShareConfirm = (targetId: string, targetType: 'chat' | 'weibo' | 'twitter') => {
    if (!sharingPost) return;

    const targetName = targetType === 'chat' ? '聊天' : targetType === 'weibo' ? '微博私信' : 'Twitter DM';
    alert(`已分享到${targetName}（功能开发中）`);

    setSharingPost(null);
  };

  const addImage = async () => {
    if (images.length + imageDescriptions.length >= 9) return;
    setGeneratingImage(true);
    try {
      const descSys = '你是图片描述生成器。生成一个10-20字的图片内容描述。只输出描述。';
      const imageDesc = await askAI(api, descSys, '请生成一个适合广场动态的配图描述：', { temperature: 0.9, maxTokens: 50 });
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
    <AppScreen title="广场" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-[var(--bg)]">
        {/* 顶部搜索栏 */}
        <div className="px-4 py-3 border-b border-[var(--border)] shrink-0 bg-[var(--bg)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-[var(--surface)] rounded-full px-4 h-10">
              <Search size={16} className="txt-faint" />
              <input
                type="text"
                placeholder="搜索广场、用户、话题"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[14px] txt-accent"
              />
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="tap w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center disabled:opacity-50">
              <RefreshCw size={18} className={`txt-accent ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setComposing(true)} className="tap px-4 h-10 rounded-full bg-[var(--accent)] text-white font-medium">
              发布
            </button>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-6">
            <button
              onClick={() => setTab('latest')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'latest' ? 'txt-accent' : 'txt-faint'}`}
            >
              最新
              {tab === 'latest' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />}
            </button>
            <button
              onClick={() => setTab('trending')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'trending' ? 'txt-accent' : 'txt-faint'}`}
            >
              热门
              {tab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />}
            </button>
            <button
              onClick={() => setTab('following')}
              className={`text-[15px] font-medium pb-2 relative ${tab === 'following' ? 'txt-accent' : 'txt-faint'}`}
            >
              关注
              {tab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />}
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-y-auto">
          {(tab === 'latest' || tab === 'following') && (
            <div className="divide-y divide-[var(--border)]">
              {sortedPosts.map(post => (
                <div key={post.id} className="p-4 hover:bg-[var(--surface)] transition-colors">
                  {/* 用户信息 */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px] shrink-0">
                      {post.authorAvatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium txt-accent">{post.authorName}</span>
                        {post.aiGenerated && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-500">AI</span>}
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
                    {post.text}
                  </div>

                  {/* 图片 */}
                  {(post.images || post.imageDescriptions) && (
                    <div className={`grid gap-2 mb-3 ${
                      ((post.images?.length ?? 0) + (post.imageDescriptions?.length ?? 0)) === 1 ? 'grid-cols-1' :
                      ((post.images?.length ?? 0) + (post.imageDescriptions?.length ?? 0)) === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
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
                    <button onClick={() => handleLike(post.id)} className="tap flex items-center gap-2 txt-faint hover:text-red-500">
                      <Heart size={18} />
                      <span className="text-[13px]">{post.likes > 0 && post.likes}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="tap flex items-center gap-2 txt-faint hover:text-blue-500">
                      <Share2 size={18} />
                    </button>
                    <button className="tap flex items-center gap-2 txt-faint hover:text-yellow-500">
                      <Bookmark size={18} />
                    </button>
                  </div>

                  {/* 评论显示 */}
                  {post.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                      {post.comments.slice(0, 3).map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[10px] shrink-0">
                            👤
                          </div>
                          <div className="flex-1 text-[13px]">
                            <span className="txt-accent font-medium">{comment.authorName}：</span>
                            <span className="txt-dim">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 3 && (
                        <button className="text-[13px] text-blue-500 tap">
                          查看全部 {post.comments.length} 条评论
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'trending' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={20} className="txt-accent" />
                  <span className="text-[16px] font-bold txt-accent">热门话题</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="tap glass rounded-xl p-4 flex items-center gap-4">
                    <div className={`text-[20px] font-bold w-8 text-center ${idx < 3 ? 'text-red-500' : 'txt-faint'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash size={16} className="txt-accent" />
                        <span className="text-[15px] font-medium txt-accent">{topic.tag}</span>
                        {topic.hot && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500">热</span>}
                      </div>
                      <div className="text-[12px] txt-faint">{topic.count} 条动态</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={20} className="txt-accent" />
                  <span className="text-[16px] font-bold txt-accent">活跃用户</span>
                </div>
                <div className="space-y-3">
                  {activeUsers.map(user => (
                    <div key={user.id} className="glass rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[20px]">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-[15px] font-medium txt-accent mb-1">{user.name}</div>
                          <div className="text-[12px] txt-faint mb-2">{user.bio}</div>
                          <div className="flex items-center gap-4 text-[11px] txt-faint">
                            <span>{user.followers} 关注者</span>
                            <span>{user.posts} 动态</span>
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

        {/* 发布弹窗 */}
        <Modal open={composing} onClose={() => setComposing(false)} title="发布动态">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            rows={6}
            className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none mb-3"
            autoFocus
          />

          {(images.length > 0 || imageDescriptions.length > 0) && (
            <div className={`grid gap-2 mb-3 ${
              images.length + imageDescriptions.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
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
            {selectedPost?.text}
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
          title="分享到"
        />
      </div>
    </AppScreen>
  );
}
