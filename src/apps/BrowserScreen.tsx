import { useState, useEffect } from 'react';
import { Search, RefreshCw, ArrowLeft, ArrowRight, Home, Globe, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { askAIJson } from '../api';
import type { ApiConfig } from '../types';

interface SimulatedPage {
  title: string;
  header: string;
  content: Array<{
    type: 'text' | 'link';
    data: any;
  }>;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  time: string;
}

const BOOKMARKS = [
  { name: '羊羊百科', url: 'https://wiki.yangyang.com', emoji: '📖', desc: '了解羊羊机的世界设定' },
  { name: '今日吐槽', url: 'https://news.tucao.net', emoji: '📰', desc: '全网最犀利的热门吐槽' },
  { name: '猫咪论坛', url: 'https://cat.meow.com', emoji: '🐱', desc: '云吸猫与吸狗爱好者基地' },
  { name: 'AI 乌托邦', url: 'https://ai.utopia.org', emoji: '✨', desc: '探索赛博意识的交汇处' },
];

export function BrowserScreen({
  api,
  onBack,
}: {
  api: ApiConfig;
  initialUrl?: string;
  onBack: () => void;
}) {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [pageData, setPageData] = useState<SimulatedPage | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showComments, setShowComments] = useState(false);

  const navigateTo = async (targetUrl: string, addToHistory = true) => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    setUrl(cleanUrl);
    setCurrentUrl(cleanUrl);
    setLoading(true);
    setPageData(null);
    setShowComments(false);

    if (addToHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(cleanUrl);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }

    try {
      const prompt = `请模拟这个网址的内容：${cleanUrl}

生成一个真实的网页内容，包括：
1. 标题
2. 正文内容（3-5段，真实自然）
3. 相关链接（3-5个）

返回JSON格式：
{
  "title": "网页标题",
  "header": "网站名称",
  "paragraphs": ["段落1", "段落2", "段落3"],
  "links": [{"text": "链接文字", "url": "链接地址"}]
}`;

      const result = await askAIJson<any>(api, '你是网页内容生成助手', prompt, { temperature: 0.8 });

      const content: any[] = [];
      result.paragraphs?.forEach((p: string) => {
        content.push({ type: 'text', data: p });
      });
      result.links?.forEach((l: any) => {
        content.push({ type: 'link', data: l });
      });

      setPageData({
        title: result.title || '加载中',
        header: result.header || cleanUrl,
        content,
      });

      await generateComments(result.title);
    } catch (err) {
      console.error('Failed to generate page:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateComments = async (pageTitle: string) => {
    try {
      const prompt = `为这个网页标题生成3-5条真实的用户评论：${pageTitle}

返回JSON数组，每条评论包含：
{
  "author": "用户名",
  "avatar": "emoji头像",
  "content": "评论内容",
  "likes": 点赞数,
  "time": "发布时间（如：2小时前）"
}`;

      const result = await askAIJson<Comment[]>(api, '你是评论生成助手', prompt, { temperature: 0.9, maxTokens: 500 });

      const commentsWithIds = result.map((c, i) => ({
        ...c,
        id: `comment-${i}`,
      }));

      setComments(commentsWithIds);
    } catch (err) {
      console.error('Failed to generate comments:', err);
    }
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      navigateTo(prevUrl, false);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      navigateTo(nextUrl, false);
    }
  };

  const handleGoHome = () => {
    setCurrentUrl('');
    setPageData(null);
    setUrl('');
    setShowComments(false);
  };

  const handleRefresh = () => {
    if (currentUrl) {
      navigateTo(currentUrl, false);
    }
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  return (
    <AppScreen title="浏览器" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-white">
        {/* Chrome风格顶栏 */}
        <div className="px-3 pt-3 pb-2 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            {/* 导航按钮 - Chrome风格 */}
            <button
              onClick={handleGoBack}
              disabled={historyIndex <= 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <button
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowRight size={18} className="text-gray-700" />
            </button>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} className="text-gray-700" />
            </button>
            <button
              onClick={handleGoHome}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Home size={18} className="text-gray-700" />
            </button>

            {/* Chrome风格地址栏 */}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-300 rounded-full px-4 h-10 transition-all">
              <Globe size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="搜索或输入网址"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigateTo(url)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
              <p className="mt-4 text-sm text-gray-500">正在加载...</p>
            </div>
          ) : currentUrl && pageData ? (
            <div className="max-w-3xl mx-auto p-5 space-y-6">
              {/* 页面头部 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="text-xs text-gray-500 mb-1">{pageData.header}</div>
                <h1 className="text-2xl font-bold text-gray-900">{pageData.title}</h1>
              </div>

              {/* 页面内容 */}
              <div className="space-y-4">
                {pageData.content.map((item, idx) => {
                  if (item.type === 'text') {
                    return (
                      <p key={idx} className="text-base text-gray-800 leading-relaxed">
                        {item.data}
                      </p>
                    );
                  }
                  if (item.type === 'link') {
                    return (
                      <button
                        key={idx}
                        onClick={() => navigateTo(item.data.url)}
                        className="block w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <span className="text-sm text-blue-600 font-medium">
                          🔗 {item.data.text}
                        </span>
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

              {/* 互动区 */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <ThumbsUp size={18} />
                  <span>赞</span>
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={18} />
                  <span>评论 {comments.length > 0 && `(${comments.length})`}</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <Share2 size={18} />
                  <span>分享</span>
                </button>
              </div>

              {/* 评论区 */}
              {showComments && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">{comments.length} 条评论</h3>
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 space-y-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{comment.avatar}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{comment.author}</div>
                          <div className="text-xs text-gray-500">{comment.time}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp size={14} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chrome新标签页风格 */
            <div className="p-8 space-y-10">
              <div className="text-center space-y-4 pt-16">
                <div className="text-8xl">🐑</div>
                <h1 className="text-2xl font-medium text-gray-800">羊羊浏览器</h1>
                <p className="text-sm text-gray-500">输入网址或选择书签开始浏览</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-sm font-medium text-gray-700 px-3">常用书签</h2>
                <div className="grid grid-cols-2 gap-3">
                  {BOOKMARKS.map((bm) => (
                    <button
                      key={bm.url}
                      onClick={() => navigateTo(bm.url)}
                      className="bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-md rounded-2xl p-5 text-left space-y-2 transition-all"
                    >
                      <div className="text-4xl">{bm.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">{bm.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{bm.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppScreen>
  );
}
