import { useState } from 'react';
import { Heart, MessageCircle, Share2, Search, Plus, RefreshCw } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import type { ApiConfig, SocialPost, UserIdentity, Character } from '../types';

// 全新预设数据 v2.1
const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'weibo-preset-1',
    platform: 'weibo',
    authorId: 'npc-chef',
    authorName: '深夜食堂老板娘',
    authorAvatar: '🍜',
    content: `今天店里来了一位特别的客人，一个人坐在角落里静静地吃着拉面。看着她的背影，我想起了很多年前的自己。

那时候我刚来东京，举目无亲，每天下班后都会找一家小食堂，点一碗热乎乎的面。不是因为饿，而是需要那种温暖的感觉。食物有一种神奇的力量，它能让人想起家，想起那些温暖的记忆。

后来我开了这家店，每晚十二点到早上七点营业。很多人问我为什么选择这个时间段？因为深夜是最需要温暖的时刻。那些加班到深夜的白领，那些失眠的人，那些刚分手的恋人，他们需要的不只是食物，更是一份理解和陪伴。

每个人都有自己的故事，每碗面里都藏着一段人生。这就是我的深夜食堂。🌙✨

#深夜食堂 #东京美食 #人生百味`,
    likes: 15678,
    comments: [],
    shares: 4521,
    ts: Date.now() - 5 * 60 * 60 * 1000,
    images: [],
    topics: ['深夜食堂', '东京美食']
  },
  {
    id: 'weibo-preset-2',
    platform: 'weibo',
    authorId: 'npc-photographer',
    authorName: '旅行摄影师Leo',
    authorAvatar: '📷',
    content: `西藏行第15天 - 在海拔5200米的地方看日出 🌅

凌晨4点起床，零下15度的温度让人瑟瑟发抖，但当太阳从珠峰背后缓缓升起的那一刻，所有的辛苦都值得了。金色的阳光洒在雪山上，整个世界仿佛镀上了一层金边，那种美，震撼到让人说不出话来。

这趟旅程走了15天，从拉萨到纳木错，从羊卓雍错到珠峰大本营。高原反应、恶劣的天气、艰苦的住宿条件，这些都是旅途的一部分。但也正是这些挑战，让这次旅行变得如此特别，让我对"在路上"这三个字有了更深的理解。

有人问我，为什么要这么辛苦地去旅行？我想说，当你站在世界屋脊，看着太阳从雪山升起，你会明白什么叫做"人生值得"。那种感动，那种震撼，是任何语言都无法形容的。

明天继续前行，下一站：冈仁波齐。期待更多的奇迹🏔️✨

#西藏旅行 #日出 #人生必去的50个地方`,
    likes: 3421,
    comments: [],
    shares: 1892,
    ts: Date.now() - 12 * 60 * 60 * 1000,
    images: [],
    topics: ['西藏旅行']
  }
];

export function WeiboScreen({
  onBack,
}: {
  api: ApiConfig;
  me?: UserIdentity;
  characters: Character[];
  posts: SocialPost[];
  onChange: (p: SocialPost[]) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'home' | 'trending'>('home');
  const [displayPosts, setDisplayPosts] = useState<SocialPost[]>(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 微博固定白色主题
  const bgColor = 'bg-white';
  const textColor = 'text-gray-900';
  const secondaryTextColor = 'text-gray-600';
  const borderColor = 'border-gray-200';
  const hoverBg = 'hover:bg-gray-50';

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // 刷新时重新加载预设数据
      setDisplayPosts([...INITIAL_POSTS]);
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (postId: string) => {
    setDisplayPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const filteredPosts = searchQuery
    ? displayPosts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayPosts;

  return (
    <AppScreen title="微博" onBack={onBack}>
      <div className={`flex flex-col h-full ${bgColor}`}>
        {/* 搜索栏 */}
        <div className={`p-3 ${borderColor} border-b`}>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${secondaryTextColor}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索微博、用户、话题"
                className={`w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm ${textColor} placeholder-gray-500`}
              />
            </div>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" />
              发微博
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div className={`flex ${borderColor} border-b`}>
          <button
            onClick={() => setTab('home')}
            className={`flex-1 py-3 text-sm font-medium relative ${
              tab === 'home' ? 'text-orange-500' : secondaryTextColor
            }`}
          >
            首页
            {tab === 'home' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`flex-1 py-3 text-sm font-medium relative ${
              tab === 'trending' ? 'text-orange-500' : secondaryTextColor
            }`}
          >
            热搜
            {tab === 'trending' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500" />
            )}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 刷新按钮 */}
          <div className={`p-3 ${borderColor} border-b flex justify-end`}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 ${hoverBg} rounded-full transition-colors disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 ${textColor} ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 帖子列表 */}
          {filteredPosts.length === 0 ? (
            <div className={`p-8 text-center ${secondaryTextColor}`}>
              {searchQuery ? '没有找到相关内容' : '暂无微博'}
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className={`p-4 ${borderColor} border-b ${hoverBg} transition-colors`}>
                {/* 用户信息 */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{post.authorAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${textColor}`}>{post.authorName}</span>
                      <span className={`${secondaryTextColor} text-xs`}>
                        {new Date(post.ts).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* 内容 */}
                    <div className={`${textColor} text-sm leading-relaxed whitespace-pre-wrap mb-3`}>
                      {post.content}
                    </div>

                    {/* 话题标签 */}
                    {post.topics && post.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.topics.map((topic, idx) => (
                          <span key={idx} className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
                            #{topic}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 互动按钮 */}
                    <div className={`flex items-center gap-6 ${secondaryTextColor}`}>
                      <button className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-sm hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppScreen>
  );
}
