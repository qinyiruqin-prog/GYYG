import { useState } from 'react';
import { Flame, Clock, AlertCircle, ChefHat, Users } from 'lucide-react';
import type { Recipe, Character } from '../types';

interface CookingGameState {
  recipe: Recipe;
  timeRemaining: number;
  heatLevel: number; // 0-100
  stirCount: number;
  events: string[];
  completed: boolean;
  result: 'success' | 'normal' | 'failed' | null;
  taste: number;
}

interface CookingGameProps {
  recipe: Recipe;
  characters: Character[];
  onComplete: (result: { result: 'success' | 'normal' | 'failed'; taste: number; selectedChefs: string[] }) => void;
  onCancel: () => void;
}

const RANDOM_EVENTS = [
  { text: '食材快烧焦了！快翻一下', action: 'stir', difficulty: 'medium' },
  { text: '火太大了！需要调小火', action: 'reduceFire', difficulty: 'easy' },
  { text: '发现少加了一个调料...', action: 'addSeasoning', difficulty: 'hard' },
  { text: '刚好时间到，取锅盛盘', action: 'serve', difficulty: 'easy' },
  { text: '这时需要盖住锅盖焖一会儿', action: 'cover', difficulty: 'medium' },
];

export function CookingGame({ recipe, characters, onComplete, onCancel }: CookingGameProps) {
  const [gameState, setGameState] = useState<CookingGameState>({
    recipe,
    timeRemaining: recipe.time * 60, // 转换为秒
    heatLevel: 70,
    stirCount: 0,
    events: [],
    completed: false,
    result: null,
    taste: 50,
  });

  const [isRunning, setIsRunning] = useState(true);
  const [selectedChefs, setSelectedChefs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // 游戏主循环
  const updateGame = () => {
    if (!isRunning || gameState.completed) return;

    setGameState((prev) => {
      let newState = { ...prev };
      newState.timeRemaining = Math.max(0, prev.timeRemaining - 1);

      // 随机事件
      if (Math.random() < 0.02) {
        const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        newState.events = [...prev.events.slice(-2), event.text];
        newState.taste += Math.random() * 10 - 5; // 随机波动味道
      }

      // 火候影响
      if (newState.heatLevel > 85) {
        newState.taste -= 1; // 火太大会降低评分
      }
      if (newState.heatLevel < 30) {
        newState.taste -= 0.5; // 火太小也不好
      }

      // 计时结束
      if (newState.timeRemaining === 0) {
        newState.completed = true;
        // 根据火候和搅拌次数判断结果
        const heatPerfect = newState.heatLevel >= 50 && newState.heatLevel <= 80;
        const stirPerfect = newState.stirCount >= 3 && newState.stirCount <= 6;

        if (heatPerfect && stirPerfect) {
          newState.result = 'success';
          newState.taste = Math.min(100, newState.taste + 20);
        } else if (heatPerfect || stirPerfect) {
          newState.result = 'normal';
          newState.taste = Math.min(100, newState.taste + 10);
        } else {
          newState.result = 'failed';
          newState.taste = Math.max(0, newState.taste - 20);
        }

        newState.taste = Math.max(1, Math.min(10, Math.round(newState.taste / 10)));
      }

      return newState;
    });
  };

  // 游戏循环计时器
  useState(() => {
    const interval = setInterval(updateGame, 1000);
    return () => clearInterval(interval);
  });

  const handleStir = () => {
    setGameState((prev) => ({
      ...prev,
      stirCount: prev.stirCount + 1,
      taste: Math.min(100, prev.taste + 3),
    }));
  };

  const handleAdjustHeat = (delta: number) => {
    setGameState((prev) => ({
      ...prev,
      heatLevel: Math.max(0, Math.min(100, prev.heatLevel + delta)),
    }));
  };

  const handleServe = () => {
    setGameState((prev) => ({ ...prev, completed: true, result: 'normal' }));
  };

  const handleFinish = () => {
    onComplete({
      result: gameState.result || 'normal',
      taste: gameState.taste,
      selectedChefs,
    });
  };

  const timeDisplay = `${Math.floor(gameState.timeRemaining / 60)}:${(gameState.timeRemaining % 60).toString().padStart(2, '0')}`;

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass rounded-3xl max-w-sm w-full mx-4 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">
              {gameState.result === 'success' ? '🎉' : gameState.result === 'normal' ? '😋' : '😢'}
            </div>
            <div className="text-[18px] font-bold mb-2">
              {gameState.result === 'success' ? '大成功！' : gameState.result === 'normal' ? '还不错！' : '失败了...'}
            </div>
            <div className="text-[14px] txt-dim mb-4">
              {gameState.recipe.name} - 味道评分 {gameState.taste}/10
            </div>
          </div>

          {/* 邀请吃饭的角色选择 */}
          <div className="mb-6">
            <div className="text-[14px] font-medium mb-3">邀请谁来尝一下？</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    setSelectedChefs((prev) =>
                      prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                    )
                  }
                  className={`tap w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    selectedChefs.includes(c.id) ? 'glass txt-accent' : 'glass'
                  }`}
                >
                  {c.avatar ? (
                    <img src={c.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full icon-bg flex items-center justify-center text-[12px] txt-accent">{c.name[0]}</div>
                  )}
                  <span className="flex-1 text-left text-[14px]">{c.name}</span>
                  {selectedChefs.includes(c.id) && <span className="text-[16px]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowResults(false)} className="tap flex-1 h-11 rounded-full glass font-medium">
              返回
            </button>
            <button onClick={handleFinish} className="tap flex-1 h-11 rounded-full font-medium text-[var(--bg)]" style={{ background: 'var(--accent)' }}>
              完成
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end z-50">
      <div className="w-full glass rounded-t-3xl p-6 space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <div className="text-[18px] font-bold mb-1">{gameState.recipe.name}</div>
          <div className="text-[13px] txt-faint">{gameState.recipe.category}</div>
        </div>

        {/* 进度条 */}
        <div>
          <div className="text-[13px] txt-dim mb-2">烹饪进度</div>
          <div className="h-3 rounded-full bg-[var(--bg-elev)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((gameState.recipe.time * 60 - gameState.timeRemaining) / (gameState.recipe.time * 60)) * 100}%`,
                background: 'var(--accent)',
              }}
            />
          </div>
        </div>

        {/* 时间和火候 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 txt-dim">
              <Clock size={16} />
              <span className="text-[12px]">时间</span>
            </div>
            <div className="text-[24px] font-bold txt-accent font-mono">{timeDisplay}</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 txt-dim">
              <Flame size={16} />
              <span className="text-[12px]">火候</span>
            </div>
            <div className="text-[24px] font-bold font-mono">{gameState.heatLevel}°</div>
          </div>
        </div>

        {/* 事件提示 */}
        {gameState.events.length > 0 && (
          <div className="glass rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="txt-accent shrink-0 mt-0.5" />
            <div className="text-[14px]">
              {gameState.events[gameState.events.length - 1]}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAdjustHeat(-10)}
            disabled={gameState.completed}
            className="tap h-12 rounded-xl glass font-medium disabled:opacity-50"
          >
            🔥 降低火候
          </button>
          <button
            onClick={() => handleAdjustHeat(10)}
            disabled={gameState.completed}
            className="tap h-12 rounded-xl glass font-medium disabled:opacity-50"
          >
            🔥 增加火候
          </button>
          <button onClick={handleStir} disabled={gameState.completed} className="tap h-12 rounded-xl glass font-medium disabled:opacity-50">
            🥄 搅拌 ({gameState.stirCount})
          </button>
          <button onClick={handleServe} disabled={gameState.completed} className="tap h-12 rounded-xl glass font-medium disabled:opacity-50">
            🍲 盛盘
          </button>
        </div>

        {/* 完成按钮 */}
        {gameState.completed && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full h-12 rounded-full font-medium text-[var(--bg)]"
            style={{ background: 'var(--accent)' }}
          >
            查看结果
          </button>
        )}

        <button onClick={onCancel} className="w-full h-11 rounded-full glass font-medium txt-accent">
          取消
        </button>
      </div>
    </div>
  );
}
