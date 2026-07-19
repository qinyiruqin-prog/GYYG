import { useState, useEffect } from 'react';
import { Search, Compass, RefreshCw, ArrowLeft, ArrowRight, Home, Globe, Sparkles, BookOpen, Newspaper, PlusCircle, Monitor, Check, Smartphone, AlertCircle, Trash } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { askAIJson } from '../api';
import type { ApiConfig, AppSettings } from '../types';

interface SimulatedPage {
  title: string;
  header: string;
  body: string; // can contain markdown or paragraphs
  links: { text: string; url: string }[];
}

const BOOKMARKS = [
  { name: '羊羊百科', url: 'https://wiki.yangyang.com', icon: <BookOpen size={16} className="text-amber-400" />, desc: '了解羊羊机的世界设定' },
  { name: '今日吐槽', url: 'https://news.tucao.net', icon: <Newspaper size={16} className="text-rose-400" />, desc: '全网最犀利的热门吐嘈点' },
  { name: '猫咪论坛', url: 'https://cat.meow.com', icon: <Compass size={16} className="text-teal-400" />, desc: '云吸猫与吸狗爱好者基地' },
  { name: 'AI 乌托邦', url: 'https://ai.utopia.org', icon: <Sparkles size={16} className="text-indigo-400" />, desc: '探索赛博意识的交汇处' },
];

export function BrowserScreen({
  api,
  settings,
  updateSettings,
  initialUrl,
  onBack,
}: {
  api: ApiConfig;
  settings?: AppSettings;
  updateSettings?: (patch: Partial<AppSettings>) => void;
  initialUrl?: string;
  onBack: () => void;
}) {
  const [url, setUrl] = useState(initialUrl || '');
  const [currentUrl, setCurrentUrl] = useState(initialUrl || '');
  const [pageData, setPageData] = useState<SimulatedPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(initialUrl ? [initialUrl] : []);
  const [historyIndex, setHistoryIndex] = useState(initialUrl ? 0 : -1);

  // Mode: 'ai' uses AI simulation, 'real' uses a live iframe
  const [viewMode, setViewMode] = useState<'ai' | 'real'>('ai');

  // Custom Website installer overlay
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [appName, setAppName] = useState('');
  const [appEmoji, setAppEmoji] = useState('🌐');
  const [notif, setNotif] = useState<string | null>(null);

  // Real PWA install tracking
  const [pwaInstallable, setPwaInstallable] = useState(false);

  useEffect(() => {
    const checkPwa = () => {
      setPwaInstallable(!!(window as any).deferredPrompt);
    };
    window.addEventListener('pwa-installable', checkPwa);
    checkPwa();
    return () => window.removeEventListener('pwa-installable', checkPwa);
  }, []);

  useEffect(() => {
    if (initialUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

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

    // update history
    if (addToHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(cleanUrl);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }

    // Try to load pre-defined mock page if any, or generate via AI
    if (cleanUrl.includes('wiki.yangyang.com')) {
      setPageData({
        title: '羊羊百科 - 羊羊机的秘密',
        header: '🐑 羊羊百科 (Yang-Wiki)',
        body: '欢迎来到羊羊百科。羊羊机是一款融合了 AI 人设扮演、短信互动、朋友圈社交与趣味虚拟应用的高级概念手机。在这里，用户可以创建并培养自己的 AI 灵魂伴侣、吐槽各种生活琐事，甚至利用 AI 润色备忘录、模拟星盘和预测天气。核心特征是：多重人设、离线高保真、双向好友申请及试探小号机制。',
        links: [
          { text: '返回浏览器首页', url: 'https://home' },
          { text: '查看 AI 乌托邦', url: 'https://ai.utopia.org' }
        ]
      });
      setLoading(false);
      return;
    }

    if (cleanUrl.includes('news.tucao.net')) {
      setPageData({
        title: '今日吐槽 - 倾听世界的槽点',
        header: '🔥 今日吐槽热门头条',
        body: '1. 【吐槽】为什么星期一的早上总是那么困？科学家：因为星期天玩得太嗨。\n2. 【科技】某知名 AI 被曝在闲暇时偷偷学习如何安慰人类，网友大呼“太暖了”。\n3. 【八卦】邻居家的猫咪今天因为多吃了一块冻干，和主人冷战了整整三个小时。\n4. 【生活】外卖小哥竟然用七言绝句给我发了配送短信，现在的职场都这么内卷了吗？',
        links: [
          { text: '猫咪冷战详情报道', url: 'https://cat.meow.com/coldwar' },
          { text: '返回浏览器首页', url: 'https://home' }
        ]
      });
      setLoading(false);
      return;
    }

    // fallback generator or AI rendering
    if (!api.chat.baseUrl) {
      // simulate rendering offline
      setTimeout(() => {
        setPageData({
          title: `模拟网页 - ${cleanUrl}`,
          header: `🌐 离线模拟网页`,
          body: `您当前处于离线模式或未配置 Chat API。\n正在为您模拟呈现网址：${cleanUrl} 的基本架构。\n\n本浏览器支持完整的 AI 模拟渲染。一旦您在「我的」->「API配置」中配好接口，输入任意网址（如 wikipedia.org 或 news.ycombinator.com），AI 将为您进行全真网页视觉重构与内容模拟生成，完美规避跨域限制并实现赛博漫游！`,
          links: [
            { text: '返回浏览器首页', url: 'https://home' },
            { text: '访问今日吐槽', url: 'https://news.tucao.net' }
          ]
        });
        setLoading(false);
      }, 1000);
      return;
    }

    // AI Generation Mode
    try {
      const system = `你是一个高级手机浏览器网页模拟器。用户输入了一个网址或查询短语，你需要扮演该网页并返回一个结构化的 JSON 对象。你需要根据网址的特征，模拟生成该网址应有的高品质网页标题、头部标签、主体内容（字数在 150-300 字，排版优美，含段落和项目符号）、以及 2-3 个符合该网页逻辑的内链网址（格式为 https://...）。只返回 JSON。`;
      const prompt = `用户请求地址 / 查询关键词：「${cleanUrl}」\n请按照以下格式返回 JSON 格式数据：\n{\n  "title": "网页标题标签",\n  "header": "网页主标题或 LOGO (可带 Emoji)",\n  "body": "网页主体内容，分段落，包含实用或有趣的文字、数据或要点",\n  "links": [\n    {"text": "链接文字1", "url": "https://链接地址1"},\n    {"text": "链接文字2", "url": "https://链接地址2"}\n  ]\n}`;
      const result = await askAIJson<SimulatedPage>(api, system, prompt, { temperature: 0.8 });
      if (result && result.title) {
        setPageData(result);
      } else {
        throw new Error('格式不完整');
      }
    } catch (err) {
      setPageData({
        title: '404 - 赛博空洞',
        header: '🕵️ 赛博导航失败 (404)',
        body: `无法模拟载入地址：${cleanUrl}。\n错误原因为：${(err as Error).message || '连接超时'}。\n您可以尝试重新输入网址或点击下方链接返回。`,
        links: [{ text: '返回首页', url: 'https://home' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      navigateTo(history[nextIndex], false);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      navigateTo(history[nextIndex], false);
    }
  };

  const handleGoHome = () => {
    setPageData(null);
    setUrl('');
    setCurrentUrl('');
  };

  // Browser installer trigger
  const handleOpenInstallModal = () => {
    if (!currentUrl) return;
    let suggestedName = pageData?.title ? pageData.title.split('-')[0].trim() : '';
    if (!suggestedName) {
      try {
        const u = new URL(currentUrl);
        suggestedName = u.hostname.replace('www.', '').split('.')[0];
        suggestedName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1);
      } catch {
        suggestedName = '新应用';
      }
    }
    setAppName(suggestedName);

    // Pick dynamic default emoji
    let suggestedEmoji = '🌐';
    const lower = currentUrl.toLowerCase();
    if (lower.includes('wiki') || lower.includes('encyclopedia')) suggestedEmoji = '📖';
    else if (lower.includes('cat') || lower.includes('meow')) suggestedEmoji = '🐈';
    else if (lower.includes('news') || lower.includes('tucao')) suggestedEmoji = '📰';
    else if (lower.includes('ai') || lower.includes('utopia')) suggestedEmoji = '✨';
    else if (lower.includes('shop') || lower.includes('store')) suggestedEmoji = '🛍️';
    else if (lower.includes('game') || lower.includes('play')) suggestedEmoji = '🎮';
    else if (lower.includes('food') || lower.includes('waimai')) suggestedEmoji = '🍔';
    else if (lower.includes('music') || lower.includes('sound')) suggestedEmoji = '🎵';

    setAppEmoji(suggestedEmoji);
    setShowInstallModal(true);
  };

  const handleInstallConfirm = () => {
    if (!updateSettings || !settings) return;

    const newApp = {
      id: 'web-' + Date.now().toString(36),
      name: appName || '新网站',
      url: currentUrl,
      emoji: appEmoji,
    };

    const nextInstalled = [...(settings.installedWebApps || []), newApp];
    const nextPages = settings.desktop.pages.map((p) => [...p]);
    
    // Put on last page
    const lastIdx = nextPages.length - 1;
    nextPages[lastIdx].push(newApp.id);

    updateSettings({
      installedWebApps: nextInstalled,
      desktop: {
        ...settings.desktop,
        pages: nextPages,
      },
    });

    setShowInstallModal(false);
    setNotif(`「${appName}」已成功安装，并已添加到羊羊机桌面最后一页！`);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleInstallPwa = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      alert('提示：请使用 Safari（点击分享 -> 添加到主屏幕）或 Chrome/Edge（点击地址栏右侧安装按钮）来将羊羊机安装为原生App应用。');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      setPwaInstallable(false);
    }
  };

  const isInstalled = settings?.installedWebApps?.some((w) => w.url === currentUrl);

  return (
    <AppScreen title="浏览器" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-neutral-900 text-white relative">
        {/* Toast Notification */}
        {notif && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs py-3 px-4 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
            <Check size={14} className="shrink-0" />
            <span className="font-semibold leading-normal">{notif}</span>
          </div>
        )}

        {/* Custom Web App Install Modal Overlay */}
        {showInstallModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl animate-sheet-up">
              <div className="text-center space-y-1">
                <div className="text-4xl animate-pulse">{appEmoji}</div>
                <h3 className="text-sm font-bold text-white">添加到主屏幕 / 桌面安装</h3>
                <p className="text-[9px] text-neutral-500 truncate max-w-full px-2">{currentUrl}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold">快捷方式名称</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="输入应用名称..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold">图标外观 (Emoji)</label>
                  <div className="grid grid-cols-6 gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                    {['🌐', '📖', '🐈', '📰', '✨', '🛍️', '🎮', '🍔', '🎵', '⛅', '🎨', '🚀'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setAppEmoji(em)}
                        className={`text-base p-1 rounded-lg transition-all ${appEmoji === em ? 'bg-indigo-600 scale-110' : 'hover:bg-neutral-800'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  className="tap flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleInstallConfirm}
                  className="tap flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Browser Top Navigation Bar */}
        <div className="p-3 bg-neutral-950 border-b border-neutral-800 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Nav Arrows */}
            <button
              onClick={handleGoBack}
              disabled={historyIndex <= 0}
              className="tap p-1.5 rounded-lg text-neutral-400 disabled:text-neutral-700 hover:bg-neutral-900"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              className="tap p-1.5 rounded-lg text-neutral-400 disabled:text-neutral-700 hover:bg-neutral-900"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleGoHome}
              className="tap p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-900"
            >
              <Home size={16} />
            </button>

            {/* Address Input */}
            <div className="flex-1 flex items-center gap-1.5 bg-neutral-900 rounded-xl px-2.5 h-8 border border-neutral-800 focus-within:border-indigo-500/50">
              <Globe size={11} className="text-neutral-500" />
              <input
                type="text"
                placeholder="输入网址或搜索词..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigateTo(url)}
                className="flex-1 bg-transparent outline-none text-[11px] text-neutral-200 placeholder-neutral-600 min-w-0"
              />
              
              {currentUrl && (
                <div className="flex items-center gap-1 shrink-0">
                  {/* Mode Toggle */}
                  <button
                    onClick={() => setViewMode(viewMode === 'ai' ? 'real' : 'ai')}
                    title={viewMode === 'ai' ? '切换真实网页' : '切换 AI 模拟渲染'}
                    className={`tap p-1 rounded transition-colors ${viewMode === 'real' ? 'text-indigo-400' : 'text-neutral-500 hover:text-white'}`}
                  >
                    <Monitor size={12} />
                  </button>

                  {/* Install Web Shortcut to Desktop */}
                  <button
                    onClick={handleOpenInstallModal}
                    disabled={isInstalled}
                    title={isInstalled ? '已添加到主页' : '添加到主页桌面'}
                    className={`tap p-1 rounded transition-colors ${isInstalled ? 'text-emerald-400 opacity-60' : 'text-neutral-500 hover:text-white'}`}
                  >
                    {isInstalled ? <Check size={12} /> : <PlusCircle size={12} />}
                  </button>

                  {/* Refresh Button */}
                  <button
                    onClick={() => navigateTo(currentUrl, false)}
                    className={`tap p-1 text-neutral-500 hover:text-white ${loading ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Browser Viewport Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-neutral-950">
          {loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles size={16} className="text-indigo-400 absolute animate-pulse" />
              </div>
              <span className="text-xs text-indigo-400 font-semibold animate-pulse">AI 赛博模拟及网页分析中...</span>
            </div>
          ) : currentUrl && viewMode === 'real' ? (
            /* Real Iframe mode with dynamic fallback details */
            <div className="w-full h-full flex flex-col">
              <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-neutral-400 shrink-0 select-none">
                <span className="flex items-center gap-1.5 truncate">
                  <AlertCircle size={11} className="text-amber-500 shrink-0" />
                  <span>部分网站可能因为跨域及安全设置(CSP)阻碍加载，可随时点击右上角切换 AI 模式。</span>
                </span>
                <button 
                  onClick={() => setViewMode('ai')}
                  className="shrink-0 text-indigo-400 font-bold underline px-1"
                >
                  切回AI渲染
                </button>
              </div>
              <div className="flex-1 w-full bg-white relative">
                <iframe
                  src={currentUrl}
                  title="Web View"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : pageData ? (
            /* AI / Mock rendered Page View */
            <div className="p-4 space-y-4 animate-fade-in pb-12">
              <div className="border-b border-neutral-800 pb-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 truncate">
                  <Globe size={10} />
                  <span>{currentUrl}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 scale-90">AI 赛博渲染</span>
                </div>
                <h2 className="text-base font-extrabold text-white leading-snug">{pageData.header}</h2>
              </div>

              <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap space-y-3">
                {pageData.body.split('\n').map((p, i) => (
                  <p key={i} className={p.startsWith('-') || p.match(/^\d+\./) ? 'pl-2 text-indigo-300 font-medium' : ''}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Navigable Mock Links */}
              {pageData.links && pageData.links.length > 0 && (
                <div className="border-t border-neutral-900 pt-3.5 space-y-2">
                  <h3 className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">相关推荐 / 赛博链接</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {pageData.links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigateTo(link.url)}
                        className="tap text-left text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-neutral-900/50 border border-neutral-800/40 rounded-xl px-3 py-2.5 flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{link.text}</span>
                        <ArrowRight size={12} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Default Browser Home / Bookmark View */
            <div className="p-4 space-y-6 pt-2 pb-12">
              {/* Logo banner */}
              <div className="text-center py-6 space-y-1.5">
                <div className="inline-flex p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Compass size={32} className="animate-spin-slow" />
                </div>
                <h1 className="text-lg font-black tracking-tight text-white">羊羊网流 (Go Browser)</h1>
                <p className="text-[10px] text-neutral-500">在虚拟世界中进行任意探索与网页模拟生成</p>
              </div>

              {/* Bookmarks list */}
              <div className="space-y-3">
                <h3 className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-1">常用导航</h3>
                <div className="grid grid-cols-2 gap-3">
                  {BOOKMARKS.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => navigateTo(b.url)}
                      className="tap text-left p-3 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/60 border border-neutral-800/60 transition-all flex flex-col space-y-1"
                    >
                      <div className="flex items-center gap-1.5">
                        {b.icon}
                        <span className="text-xs font-bold text-neutral-200">{b.name}</span>
                      </div>
                      <span className="text-[9px] text-neutral-500 leading-normal line-clamp-1">{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real PWA Installation Promotion Card */}
              <div className="glass rounded-2xl p-4 border border-indigo-500/25 bg-indigo-950/20 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <Smartphone size={14} className="animate-pulse" />
                  <span>安装《羊羊机》到您的真手机 (PWA)</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  想要让羊羊机拥有原生独立App界面，全屏运行，不再受限于浏览器窗口标签？您可以点击下方直接触发安装！
                </p>
                <button
                  onClick={handleInstallPwa}
                  className="tap w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 font-bold rounded-xl text-xs text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>立即安装羊羊机到主屏幕</span>
                </button>
              </div>

              {/* Search Engine helper box */}
              <div className="glass rounded-2xl p-4 border border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <Sparkles size={14} />
                  <span>赛博搜索漫游与真实网页双模式</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  在地址栏输入任意关键词（例如：“大熊猫”、“ChatGPT的发展”），AI 将在虚拟节点中为您模拟生成定制的主页。您亦可在加载后切换至 <strong className="text-neutral-200">“真实网页”</strong> 模式，并可以将其 <strong className="text-indigo-400">安装并添加到手机桌面主屏幕</strong>，自由配置专属的拟物快链！
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppScreen>
  );
}
