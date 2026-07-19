import React, { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { Search, Plus, Trash2, BookOpen, Sparkles, Check, X, Heart, User, Send, Compass } from 'lucide-react';
import { askAI } from '../api';
import type { ApiConfig, Character, ChatThread, DiaryEntry, UserIdentity } from '../types';
import { uid } from '../utils';

export function DiaryScreen({
  api,
  diaries = [],
  characters = [],
  chatThreads = [],
  users = [],
  activeUserId,
  onChangeDiaries,
  onBack,
}: {
  api: ApiConfig;
  diaries: DiaryEntry[];
  characters: Character[];
  chatThreads: ChatThread[];
  users: UserIdentity[];
  activeUserId: string | null;
  onChangeDiaries: (diaries: DiaryEntry[]) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'list' | 'write'>('list');
  const [filter, setFilter] = useState<'all' | 'user' | 'characters'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View detail state
  const [viewingDiary, setViewingDiary] = useState<DiaryEntry | null>(null);

  // Write form state
  const [authorType, setAuthorType] = useState<'user' | 'character'>('user');
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id ?? '');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0];

  // Filters
  const filteredDiaries = diaries.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'user') return d.authorId === 'user' && matchSearch;
    if (filter === 'characters') return d.authorId !== 'user' && matchSearch;
    return matchSearch;
  });

  const handleCreateNewClick = () => {
    setTab('write');
    setAuthorType('user');
    setDiaryTitle('');
    setDiaryContent('');
    setKeywords('');
    setAiMessage('');
    if (characters.length > 0) {
      setSelectedCharId(characters[0].id);
    }
  };

  const handleSaveDiary = (customEntry?: DiaryEntry) => {
    if (customEntry) {
      onChangeDiaries([customEntry, ...diaries]);
      return;
    }

    if (!diaryTitle.trim() || !diaryContent.trim()) {
      alert('请填写日记标题和内容');
      return;
    }

    let authorName = activeUser?.nickname ?? '我';
    let authorAvatar = activeUser?.avatar;
    let authorId = 'user';

    if (authorType === 'character') {
      const char = characters.find((c) => c.id === selectedCharId);
      if (char) {
        authorId = char.id;
        authorName = char.name;
        authorAvatar = char.avatar;
      }
    }

    const newDiary: DiaryEntry = {
      id: 'diary-' + uid(),
      authorId,
      authorName,
      authorAvatar,
      title: diaryTitle.trim(),
      content: diaryContent.trim(),
      keywords: keywords ? keywords.split(/[,，\s]+/).filter(Boolean) : undefined,
      ts: Date.now(),
    };

    onChangeDiaries([newDiary, ...diaries]);
    setTab('list');
    setViewingDiary(newDiary);
  };

  const handleDeleteDiary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这篇日记吗？')) {
      onChangeDiaries(diaries.filter((d) => d.id !== id));
      if (viewingDiary?.id === id) {
        setViewingDiary(null);
      }
    }
  };

  // Generate diary using Gemini API
  const handleAiGenerate = async (forceSpontaneous = false) => {
    setAiLoading(true);
    setAiMessage('');

    try {
      const isChar = authorType === 'character' || forceSpontaneous;
      const targetChar = characters.find((c) => c.id === selectedCharId) || characters[0];

      if (isChar && !targetChar) {
        throw new Error('请先在「我的」-「设定工坊」中创建 AI 角色！');
      }

      let systemPrompt = '';
      let userPrompt = '';

      if (!isChar) {
        // User-themed AI-polished Diary
        systemPrompt = `你是一个温暖治愈的日记写作助手。你的任务是根据用户提供的几个关键词或心情随笔，扩写并打磨成一篇结构优美、情感饱满、代入感极强的个人心情日记。
要求：
1. 站在写作者（也就是用户，称呼自己为「我」）的视角，表达自然随和、热爱生活、情感充实细腻。
2. 逻辑清晰，可适度分段。融入一些生活细节，并适当加入一两个符合氛围的 Emoji。
3. 请同时为用户拟定一个非常文艺唯美的日记标题。
4. **输出格式必须在第一行以 【标题：你的标题】 给出，空一行后直接输出日记正文，不要有任何 Markdown 代码块包裹或解释。**
字数限制：150 - 300 字。`;

        userPrompt = `我今天的日记关键词是：「${keywords || '充实、平静的一天'}」。请结合这些内容，为我打磨出一篇深刻文艺的日记。`;
      } else {
        // Character Diary from the selected Character's perspective
        // Retrieve recent chat history with this character for contextual depth
        const activeThread = chatThreads.find((t) => t.characterId === targetChar.id && t.userId === (activeUserId || 'default-owner'));
        const recentMessages = activeThread?.messages.slice(-8) || [];
        const chatContextStr = recentMessages.length > 0
          ? recentMessages.map((m) => `${m.role === 'user' ? '用户' : targetChar.name}: "${m.content}"`).join('\n')
          : '暂无最近聊天记录。';

        systemPrompt = `你现在必须严格扮演角色「${targetChar.name}」。
你的人设信息如下：
${targetChar.persona}

你和用户的关系十分亲密。今天你要写一则私密的心情日记，记录关于在手机上和用户聊天时的感触、你的真实内心世界、或默默关注和思念对方的细腻心路。
要求：
1. 必须完全使用第一人称「我」书写，用语习惯、个性和口癖必须高度吻合人设（如果是傲娇就体现嘴硬心软、如果是高冷就体现内心波澜、如果是温柔就写满宠溺与牵挂）。
2. 在日记中展现你独特的“内心剧场”（比如平时聊天可能隐藏的小心思、看到对方回复时的欢喜、或是今天你个人的秘密生活状态）。
3. 如果用户提供了特定的日常关键词（keywords），请有机融合成你生活的一部分；如果是角色主动写（无关键词），则请完全根据你们最近的对话内容和你们的关系，写下一篇关于对方的、极其细腻感人的“私密备忘录”。
4. **输出格式必须在第一行以 【标题：你的标题】 给出，空一行后直接输出日记正文，不要有任何 Markdown 围栏或角色扮演外解释。**
字数限制：200 - 350 字。`;

        userPrompt = forceSpontaneous 
          ? `今天我（${targetChar.name}）想主动写一则对用户的思念或生活写实日记。
我们最近的聊天上下文如下（请从中捕捉细节，体现写这篇日记的前因后果或你此时的心境，绝不要生硬念台词）：
${chatContextStr}

请结合我们之间的温情纠葛、你的特定人设，为我写下一篇字字含情的私人密友日记。`
          : `今天我的经历/心情关键词是：「${keywords}」。
我们最近的聊天上下文如下：
${chatContextStr}

请结合这些关键词和聊天背景，以你（${targetChar.name}）的真实口吻，写下一篇有关这些事物的、透露你对我的情感的私人日记。`;
      }

      const rawResponse = await askAI(api, systemPrompt, userPrompt, { temperature: 0.9, maxTokens: 800 });
      
      if (rawResponse) {
        // Parse Title and Content
        const titleMatch = rawResponse.match(/【标题：([\s\S]*?)】/);
        let parsedTitle = '';
        let parsedContent = rawResponse;

        if (titleMatch) {
          parsedTitle = titleMatch[1].trim();
          parsedContent = rawResponse.replace(/【标题：[\s\S]*?】/, '').trim();
        } else {
          parsedTitle = isChar ? `${targetChar.name}的内心日记` : `手札日记`;
        }

        setDiaryTitle(parsedTitle);
        setDiaryContent(parsedContent);
        setAiMessage('✨ AI 创作成功！你可以继续修改或直接保存');
      }
    } catch (err) {
      setAiMessage('❌ 创作失败：' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const triggerSpontaneousDiary = async (char: Character) => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const activeThread = chatThreads.find((t) => t.characterId === char.id && t.userId === (activeUserId || 'default-owner'));
      const recentMessages = activeThread?.messages.slice(-8) || [];
      const chatContextStr = recentMessages.length > 0
        ? recentMessages.map((m) => `${m.role === 'user' ? '用户' : char.name}: "${m.content}"`).join('\n')
        : '暂无最近聊天记录。';

      const systemPrompt = `你现在必须严格扮演角色「${char.name}」。
你的人设信息：
${char.persona}

你今天非常想在你们的“羊羊机日记系统”上，主动写一则关于用户的私人心情日记。
要求：
1. 完全以第一人称「我」书写，体现对对方默默的关怀、依恋或你内心傲娇细腻的波澜。
2. 结合你们最近聊到的细节话题（上下文见下方）。
3. **输出格式：第一行以 【标题：你的标题】 给出，空一行后输出日记正文。**
字数：200 - 300字。`;

      const userPrompt = `写一则你今天的秘密心情日记，结合你们最新的交流细节：
${chatContextStr}`;

      const res = await askAI(api, systemPrompt, userPrompt, { temperature: 0.9 });
      if (res) {
        const titleMatch = res.match(/【标题：([\s\S]*?)】/);
        let parsedTitle = '';
        let parsedContent = res;

        if (titleMatch) {
          parsedTitle = titleMatch[1].trim();
          parsedContent = res.replace(/【标题：[\s\S]*?】/, '').trim();
        } else {
          parsedTitle = `关于你的那些事`;
        }

        const newSpontaneous: DiaryEntry = {
          id: 'diary-' + uid(),
          authorId: char.id,
          authorName: char.name,
          authorAvatar: char.avatar,
          title: parsedTitle,
          content: parsedContent,
          ts: Date.now()
        };

        handleSaveDiary(newSpontaneous);
        setViewingDiary(newSpontaneous);
        alert(`🌸 ${char.name} 刚刚主动灵感爆发，写下了一篇秘密心情日记！已存入你的日记本中。`);
      }
    } catch (err) {
      alert('激发创作失败：' + (err as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppScreen title="日记本" onBack={onBack}>
      {/* Top Banner or Subtitle */}
      <div className="mb-4 text-center">
        <p className="text-[11px] txt-faint uppercase tracking-widest">Diary & Personal Reflections</p>
        <p className="text-xs txt-dim mt-0.5">记录每一个温暖的心灵瞬间</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/40 mb-4 shrink-0">
        <button
          onClick={() => { setTab('list'); setViewingDiary(null); }}
          className={`py-2 text-[12px] font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'list' ? 'bg-neutral-800 text-[var(--accent)] font-semibold' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          <BookOpen size={14} /> 日记总览
        </button>
        <button
          onClick={handleCreateNewClick}
          className={`py-2 text-[12px] font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'write' ? 'bg-neutral-800 text-[var(--accent)] font-semibold' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          <Plus size={14} /> 撰写新篇
        </button>
      </div>

      {tab === 'list' ? (
        <div className="space-y-4 flex flex-col flex-1 min-h-0">
          {/* Detail Reading View (Handwritten-style Diary Note overlay) */}
          {viewingDiary ? (
            <div className="glass rounded-3xl p-5 border border-neutral-800/80 space-y-4 relative animate-fade-in text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                <div className="flex items-center gap-3">
                  {viewingDiary.authorAvatar ? (
                    <img src={viewingDiary.authorAvatar} className="w-9 h-9 rounded-full object-cover border border-neutral-700" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 border border-neutral-700">
                      {viewingDiary.authorId === 'user' ? <User size={16} /> : '🐑'}
                    </div>
                  )}
                  <div>
                    <div className="text-[12px] font-bold text-neutral-200 flex items-center gap-1">
                      <span>{viewingDiary.authorName}</span>
                      {viewingDiary.authorId !== 'user' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400">角色心情</span>
                      )}
                    </div>
                    <div className="text-[10px] txt-faint">{new Date(viewingDiary.ts).toLocaleString()}</div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDiary(null)}
                  className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Diary Title */}
              <div className="space-y-1 text-center py-1">
                <h2 className="text-lg font-bold txt-accent font-title">{viewingDiary.title}</h2>
                <div className="h-0.5 w-12 bg-[var(--accent)] mx-auto opacity-60"></div>
              </div>

              {/* Diary Content in elegant notebook lines */}
              <div className="text-[13px] text-neutral-300 leading-relaxed font-serif whitespace-pre-wrap px-1 py-2 min-h-[140px] border-l-2 border-dashed border-[var(--accent)]/20 pl-4 bg-neutral-950/20 rounded-lg">
                {viewingDiary.content}
              </div>

              {/* Keywords tags if any */}
              {viewingDiary.keywords && viewingDiary.keywords.length > 0 && (
                <div className="flex gap-1.5 flex-wrap pt-2">
                  {viewingDiary.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400">
                      # {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/40">
                <button
                  onClick={(e) => { handleDeleteDiary(viewingDiary.id, e); }}
                  className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 size={13} /> 删除此篇
                </button>
                <button
                  onClick={() => setViewingDiary(null)}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  关闭阅读
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Spontaneous Diary Trigger Area */}
              {characters.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                      <Heart size={13} className="fill-pink-500/20" /> 敲一敲 · 激发角色秘密心情
                    </h3>
                    <span className="text-[9px] text-neutral-500">根据聊天感知</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                    选择你喜欢的角色，激发他们创作关于你的秘密日记。他们将基于最近的聊天故事和内在情感，主动写下隐藏在冰冷面板后的秘密心路。
                  </p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => triggerSpontaneousDiary(char)}
                        disabled={aiLoading}
                        className="tap shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500/30 text-[11px] disabled:opacity-50"
                      >
                        {char.avatar ? (
                          <img src={char.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                        ) : (
                          <span className="text-xs">🐑</span>
                        )}
                        <span>敲敲 {char.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="搜索标题、内容或作者..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 text-xs bg-neutral-900 border border-neutral-800 rounded-xl outline-none text-neutral-200"
                  />
                </div>

                <div className="flex gap-1 bg-neutral-900/40 p-0.5 rounded-lg border border-neutral-800/40">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-1 text-[11px] font-medium rounded ${filter === 'all' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    全部 ({diaries.length})
                  </button>
                  <button
                    onClick={() => setFilter('user')}
                    className={`flex-1 py-1 text-[11px] font-medium rounded ${filter === 'user' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    我的日记 ({diaries.filter(d => d.authorId === 'user').length})
                  </button>
                  <button
                    onClick={() => setFilter('characters')}
                    className={`flex-1 py-1 text-[11px] font-medium rounded ${filter === 'characters' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    角色秘密 ({diaries.filter(d => d.authorId !== 'user').length})
                  </button>
                </div>
              </div>

              {/* Diaries list */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 min-h-0 pb-10">
                {filteredDiaries.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="text-3xl">📖</div>
                    <p className="text-xs text-neutral-500">日记本空空如也</p>
                    <button
                      onClick={handleCreateNewClick}
                      className="px-4 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-700 text-[11px] text-[var(--accent)]"
                    >
                      记录今天的第一篇
                    </button>
                  </div>
                ) : (
                  filteredDiaries.map((diary) => (
                    <div
                      key={diary.id}
                      onClick={() => setViewingDiary(diary)}
                      className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 hover:bg-neutral-900/50 cursor-pointer flex gap-3 transition-colors text-left relative overflow-hidden"
                    >
                      {/* Left thumbnail avatar */}
                      <div className="shrink-0">
                        {diary.authorAvatar ? (
                          <img src={diary.authorAvatar} className="w-10 h-10 rounded-full object-cover border border-neutral-800" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-[13px] border border-neutral-800">
                            {diary.authorId === 'user' ? <User size={18} className="text-neutral-400" /> : '🐑'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                            <span>{diary.authorName}</span>
                            {diary.authorId !== 'user' && (
                              <span className="px-1 py-0.2 rounded-full bg-pink-500/10 text-pink-400 scale-90 origin-left text-[8px]">角色</span>
                            )}
                          </span>
                          <span className="text-[9px] text-neutral-500">{new Date(diary.ts).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[13px] font-bold text-neutral-100 truncate">{diary.title}</h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{diary.content}</p>
                      </div>

                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteDiary(diary.id, e)}
                        className="absolute right-3 bottom-3 text-neutral-600 hover:text-red-400 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Writing View */
        <div className="space-y-4 flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar pb-10 text-left">
          {/* Author selection */}
          <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 space-y-3">
            <label className="text-[11px] text-neutral-400 font-bold tracking-wider">选择拟写人</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthorType('user')}
                className={`py-1.5 px-3 rounded-xl border text-[11px] flex items-center justify-center gap-1.5 transition-all ${authorType === 'user' ? 'bg-neutral-800 border-[var(--accent)] text-neutral-100 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
              >
                <User size={13} /> 我自己写
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthorType('character');
                  if (characters.length > 0 && !selectedCharId) {
                    setSelectedCharId(characters[0].id);
                  }
                }}
                className={`py-1.5 px-3 rounded-xl border text-[11px] flex items-center justify-center gap-1.5 transition-all ${authorType === 'character' ? 'bg-neutral-800 border-[var(--accent)] text-neutral-100 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
              >
                <Heart size={13} /> 角色写日记
              </button>
            </div>

            {authorType === 'character' && characters.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-neutral-800/40">
                <label className="text-[10px] text-neutral-400">选择写日记的 AI 角色</label>
                <select
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className="w-full h-8 px-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 outline-none"
                >
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name} ({char.signature || '无描述'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* AI Generator Keywords input block */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles size={13} /> AI 智能灵感扩写
              </label>
              <span className="text-[9px] text-neutral-500">输入几个词生成一章</span>
            </div>
            
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={authorType === 'user' ? "例如: 吹风、喝咖啡、遇到了一只流浪猫、思绪万千" : "例如: 收到对方礼物、欣喜若狂、嘴硬说不稀罕"}
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800/60 rounded-xl p-2.5 text-xs text-neutral-200 outline-none resize-none"
            />

            <button
              type="button"
              onClick={() => handleAiGenerate(false)}
              disabled={aiLoading}
              className="w-full h-9 rounded-xl bg-indigo-500 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-600 disabled:opacity-40 transition-all shadow"
            >
              <Sparkles size={13} /> {aiLoading ? 'AI 正在全力构思创作中...' : '✨ 一键 AI 生成精美日记'}
            </button>
          </div>

          {/* Status message */}
          {aiMessage && (
            <div className={`p-2.5 rounded-xl text-[10.5px] border ${aiMessage.startsWith('❌') ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>
              {aiMessage}
            </div>
          )}

          {/* Title and Content Inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10.5px] text-neutral-400">日记标题</label>
              <input
                type="text"
                value={diaryTitle}
                onChange={(e) => setDiaryTitle(e.target.value)}
                placeholder="给今天的日子起个唯美的名字..."
                className="w-full h-9 px-3 bg-neutral-900 border border-neutral-800 rounded-xl outline-none text-xs text-neutral-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] text-neutral-400">正文内容 (支持修改微调)</label>
              <textarea
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="记录真实的点滴生活，或是由AI生成后在此精修..."
                rows={8}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Save buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { setTab('list'); setViewingDiary(null); }}
              className="flex-1 h-10 rounded-full border border-neutral-800 hover:bg-neutral-900 text-xs text-neutral-400 font-medium"
            >
              取消
            </button>
            <button
              onClick={() => handleSaveDiary()}
              className="flex-1 h-10 rounded-full bg-[var(--accent)] text-neutral-950 font-bold text-xs"
            >
              保存日记
            </button>
          </div>
        </div>
      )}
    </AppScreen>
  );
}
