import { useState, useEffect } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ArrowRight, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { askAI } from '../api';
import type { Character, ApiConfig, Message } from '../types';

interface GamePlayScreenProps {
  gameId: string;
  character: Character;
  api: ApiConfig;
  onBack: () => void;
  onFinish: (messages: Message[]) => void;
}

export function GamePlayScreen({ gameId, character, api, onBack, onFinish }: GamePlayScreenProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; ts: number }>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<any>({});
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'user' | 'character' | 'draw' | null>(null);

  // 初始化游戏
  useEffect(() => {
    initGame();
  }, [gameId]);

  const initGame = async () => {
    setLoading(true);
    try {
      let initPrompt = '';
      let initialState: any = {};

      switch (gameId) {
        case 'guess_number':
          const targetNumber = Math.floor(Math.random() * 100) + 1;
          initialState = { target: targetNumber, attempts: 0, maxAttempts: 7, characterGuessed: false };
          initPrompt = `我们来玩猜数字游戏！我心里想了一个1-100之间的数字，你也想一个。我们轮流猜，看谁先猜中对方的数字。你先猜我的数字吧！`;
          break;

        case 'word_chain':
          initialState = { usedWords: [], lastWord: '', turn: 'character', round: 1 };
          initPrompt = `我们来玩成语接龙！我先说一个成语，你接下一个。每个成语的最后一个字要和下一个成语的第一个字相同或谐音。准备好了吗？`;
          break;

        case 'riddle':
          initialState = { mode: 'character_ask', attempts: 0, maxAttempts: 3 };
          initPrompt = `我来给你出个谜语，你来猜猜看！你有3次机会。`;
          break;

        case 'story_chain':
          initialState = { sentences: [], turn: 'character', round: 1, maxRounds: 10 };
          initPrompt = `我们一起编个故事吧！我先说一句开头，然后你接一句，我们轮流来。看看能编出什么有趣的故事～`;
          break;

        case 'twenty_questions':
          initialState = { target: null, questions: 0, maxQuestions: 20, hints: [] };
          initPrompt = `我心里想了一个东西，你可以问我最多20个是非问题来猜出它是什么。只能问"是不是..."这样能用是或否回答的问题哦！`;
          break;

        case 'truth_dare':
          initialState = { turn: 'character', round: 1 };
          initPrompt = `我们来玩真心话大冒险！我先选，然后轮到你。准备好了吗？`;
          break;

        default:
          initPrompt = `让我们开始游戏吧！`;
      }

      setGameState(initialState);

      // 让角色说开场白
      const sys = `你是${character.name}。你正在和用户玩"${getGameName(gameId)}"游戏。${getGameRules(gameId)}你的性格：${character.persona || '友好热情'}。用轻松愉快的语气，像朋友一样交流。`;
      const response = await askAI(api, sys, initPrompt, { temperature: 0.85, maxTokens: 200 });

      const assistantMsg = { role: 'assistant' as const, content: response.trim(), ts: Date.now() };
      setMessages([assistantMsg]);

      // 某些游戏需要角色先行动
      if (gameId === 'word_chain') {
        setTimeout(() => handleCharacterTurn(initialState, [assistantMsg]), 1000);
      } else if (gameId === 'riddle') {
        setTimeout(() => handleCharacterTurn(initialState, [assistantMsg]), 1000);
      } else if (gameId === 'story_chain') {
        setTimeout(() => handleCharacterTurn(initialState, [assistantMsg]), 1000);
      } else if (gameId === 'truth_dare') {
        setTimeout(() => handleCharacterTurn(initialState, [assistantMsg]), 1000);
      } else if (gameId === 'twenty_questions') {
        // 让AI想一个目标物
        generateTarget(initialState);
      }
    } catch (err) {
      console.error('Game init failed:', err);
      alert('游戏初始化失败，请重试');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const getGameName = (id: string) => {
    const names: Record<string, string> = {
      guess_number: '猜数字',
      word_chain: '成语接龙',
      riddle: '猜谜语',
      story_chain: '接故事',
      twenty_questions: '20个问题',
      truth_dare: '真心话大冒险',
    };
    return names[id] || '游戏';
  };

  const getGameRules = (id: string) => {
    const rules: Record<string, string> = {
      guess_number: '规则：双方各想一个1-100的数字，轮流猜对方的数字，提示"大了"或"小了"。',
      word_chain: '规则：成语接龙，每个成语的最后一个字要和下一个成语的第一个字相同或谐音。不能重复使用已经说过的成语。',
      riddle: '规则：你出谜语，用户来猜。谜语要有趣，不要太难也不要太简单。',
      story_chain: '规则：轮流接故事，每人一次说1-2句话，故事要连贯有趣。',
      twenty_questions: '规则：你心里想一个具体的物品、动物或人物，用户问是非问题来猜。只能回答"是"或"不是"，最多20个问题。',
      truth_dare: '规则：轮流选择真心话或大冒险。真心话要回答对方提出的问题，大冒险要完成对方指定的任务。',
    };
    return rules[id] || '';
  };

  const generateTarget = async (state: any) => {
    try {
      const sys = '你要想一个具体的物品、动物或人物作为谜底。选择大家都熟悉的、不要太生僻。只输出这个东西的名称，不要其他内容。';
      const target = await askAI(api, sys, '请想一个谜底：', { temperature: 0.9, maxTokens: 20 });
      setGameState({ ...state, target: target.trim() });
    } catch (err) {
      console.error('Generate target failed:', err);
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || loading || gameOver) return;

    const userMsg = { role: 'user' as const, content: userInput.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      // 根据游戏类型处理用户输入
      let updatedState = { ...gameState };
      let responsePrompt = '';
      let shouldRespond = true;

      switch (gameId) {
        case 'guess_number':
          const guess = parseInt(userInput.trim());
          if (isNaN(guess) || guess < 1 || guess > 100) {
            responsePrompt = '请输入1-100之间的数字！';
          } else {
            updatedState.attempts += 1;
            if (guess === updatedState.target) {
              responsePrompt = `太厉害了！你猜中了，就是${updatedState.target}！你用了${updatedState.attempts}次就猜中了。`;
              setGameOver(true);
              setWinner('user');
            } else {
              const hint = guess > updatedState.target ? '大了' : '小了';
              responsePrompt = `${hint}！再试试看。`;

              // 角色也猜一次
              if (!updatedState.characterGuessed && updatedState.attempts < updatedState.maxAttempts) {
                setTimeout(() => handleCharacterGuess(updatedState, newMessages), 2000);
              }
            }
          }
          break;

        case 'word_chain':
          updatedState.usedWords.push(userInput.trim());
          updatedState.lastWord = userInput.trim();
          updatedState.turn = 'character';
          responsePrompt = `好！轮到我了...`;
          setTimeout(() => handleCharacterTurn(updatedState, newMessages), 1500);
          break;

        case 'riddle':
          updatedState.attempts += 1;
          responsePrompt = `让我看看你的答案对不对...`;
          break;

        case 'story_chain':
          updatedState.sentences.push(userInput.trim());
          updatedState.turn = 'character';
          updatedState.round += 1;
          if (updatedState.round > updatedState.maxRounds) {
            responsePrompt = `好精彩的故事！我们一起编了一个完整的故事，太有意思了！`;
            setGameOver(true);
            setWinner('draw');
          } else {
            responsePrompt = `好！我来接下去...`;
            setTimeout(() => handleCharacterTurn(updatedState, newMessages), 1500);
          }
          break;

        case 'twenty_questions':
          updatedState.questions += 1;
          updatedState.hints.push(userInput.trim());
          if (updatedState.questions >= updatedState.maxQuestions) {
            responsePrompt = `20个问题用完了！答案是：${updatedState.target}。`;
            setGameOver(true);
            setWinner('character');
          } else {
            responsePrompt = `这是第${updatedState.questions}个问题...`;
          }
          break;

        case 'truth_dare':
          updatedState.turn = 'character';
          responsePrompt = `${userInput.trim()} 好，轮到我选了...`;
          setTimeout(() => handleCharacterTurn(updatedState, newMessages), 1500);
          break;
      }

      setGameState(updatedState);

      if (shouldRespond) {
        const sys = `你是${character.name}。你正在和用户玩"${getGameName(gameId)}"游戏。${getGameRules(gameId)}当前游戏状态：${JSON.stringify(updatedState)}。用户刚才说：${userInput}。${responsePrompt}`;
        const response = await askAI(api, sys, responsePrompt, { temperature: 0.85, maxTokens: 300 });

        const assistantMsg = { role: 'assistant' as const, content: response.trim(), ts: Date.now() };
        setMessages([...newMessages, assistantMsg]);
      }
    } catch (err) {
      console.error('Handle input failed:', err);
      alert('游戏出错了，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterGuess = async (state: any, msgs: any[]) => {
    // 角色猜数字逻辑（简化版AI）
    const charGuess = Math.floor(Math.random() * 100) + 1;
    const sys = `你是${character.name}。你在玩猜数字游戏，你猜的数字是${charGuess}。用自然的语气说出你的猜测。`;
    const response = await askAI(api, sys, `我猜是${charGuess}！`, { temperature: 0.8, maxTokens: 100 });

    const assistantMsg = { role: 'assistant' as const, content: response.trim(), ts: Date.now() };
    setMessages([...msgs, assistantMsg]);

    // 检查是否猜中（这里简化处理，假设用户心里想的数字）
  };

  const handleCharacterTurn = async (state: any, msgs: any[]) => {
    setLoading(true);
    try {
      let prompt = '';

      switch (gameId) {
        case 'word_chain':
          prompt = `现在轮到你说一个成语接龙。${state.lastWord ? `上一个成语的最后一个字是"${state.lastWord.slice(-1)}"，你要说一个以这个字开头的成语。` : '你先说第一个成语。'}已经用过的成语：${state.usedWords.join('、')}。不能重复。`;
          break;

        case 'riddle':
          prompt = `请出一个谜语，谜语要有趣、不要太难。格式：先说谜面，不要直接说答案。`;
          break;

        case 'story_chain':
          prompt = `根据之前的故事内容，接1-2句话继续这个故事。已有内容：${state.sentences.join(' ')}`;
          break;

        case 'truth_dare':
          const choice = Math.random() > 0.5 ? '真心话' : '大冒险';
          prompt = `你选择${choice}。${choice === '真心话' ? '说一个你想问用户的私密问题。' : '给用户一个有趣但不过分的挑战任务。'}`;
          break;
      }

      const sys = `你是${character.name}。${getGameRules(gameId)}当前游戏状态：${JSON.stringify(state)}。`;
      const response = await askAI(api, sys, prompt, { temperature: 0.9, maxTokens: 200 });

      const assistantMsg = { role: 'assistant' as const, content: response.trim(), ts: Date.now() };
      setMessages([...msgs, assistantMsg]);

      // 更新状态
      if (gameId === 'word_chain') {
        // 从回复中提取成语（简化处理）
        const match = response.match(/[一-龥]{4}/);
        if (match) {
          const newWord = match[0];
          setGameState({ ...state, usedWords: [...state.usedWords, newWord], lastWord: newWord, turn: 'user' });
        }
      }
    } catch (err) {
      console.error('Character turn failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setMessages([]);
    setGameState({});
    setGameOver(false);
    setWinner(null);
    initGame();
  };

  const saveToChat = () => {
    const chatMessages: Message[] = messages.map((m) => ({
      id: `game-${Date.now()}-${Math.random()}`,
      role: m.role,
      content: m.content,
      ts: m.ts,
    }));
    onFinish(chatMessages);
  };

  return (
    <AppScreen
      title={getGameName(gameId)}
      onBack={onBack}
      right={
        <button onClick={restart} className="tap txt-accent">
          <RefreshCw size={20} />
        </button>
      }
    >
      <div className="flex flex-col h-full">
        {/* 游戏状态显示 */}
        <div className="glass rounded-2xl p-3 mb-3 text-[12px] txt-faint">
          <div className="flex items-center gap-2">
            <div className="text-[24px]">{character.avatar || '👤'}</div>
            <div className="flex-1">
              <div className="txt-accent font-medium">{character.name}</div>
              <div>正在玩 {getGameName(gameId)}</div>
            </div>
            {gameOver && winner && (
              <div className="flex items-center gap-1 txt-accent">
                <Trophy size={16} />
                <span>
                  {winner === 'user' ? '你赢了！' : winner === 'character' ? `${character.name}赢了！` : '平局！'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'glass txt-accent'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl px-4 py-2.5 text-[14px] txt-faint">
                {character.name} 正在思考...
              </div>
            </div>
          )}
        </div>

        {/* 游戏结束时显示保存按钮 */}
        {gameOver && (
          <button
            onClick={saveToChat}
            className="w-full mb-3 py-3 glass-strong rounded-xl font-medium tap txt-accent flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            保存游戏记录到聊天
          </button>
        )}

        {/* 输入框 */}
        <div className="flex items-center gap-2">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserInput()}
            placeholder={gameOver ? '游戏已结束' : '输入你的回答...'}
            disabled={loading || gameOver}
            className="flex-1 glass rounded-xl px-4 h-11 text-[14px] outline-none bg-transparent disabled:opacity-50"
          />
          <button
            onClick={handleUserInput}
            disabled={!userInput.trim() || loading || gameOver}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white tap disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </AppScreen>
  );
}
