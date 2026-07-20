import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';

interface GamesScreenProps {
  onBack: () => void;
}

export interface MiniGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'puzzle' | 'casual' | 'strategy' | 'word';
}

const games: MiniGame[] = [
  {
    id: 'guess_number',
    name: '猜数字',
    emoji: '🔢',
    description: '经典猜数字游戏，AI会给提示大了还是小了',
    difficulty: 'easy',
    category: 'casual',
  },
  {
    id: 'word_chain',
    name: '成语接龙',
    emoji: '📖',
    description: '和AI进行成语接龙，看谁词汇量更大',
    difficulty: 'medium',
    category: 'word',
  },
  {
    id: 'riddle',
    name: '猜谜语',
    emoji: '❓',
    description: 'AI出谜语你来猜，锻炼脑力',
    difficulty: 'easy',
    category: 'puzzle',
  },
  {
    id: 'story_chain',
    name: '接故事',
    emoji: '📚',
    description: '和AI轮流接故事，创造有趣的剧情',
    difficulty: 'easy',
    category: 'casual',
  },
  {
    id: 'twenty_questions',
    name: '20个问题',
    emoji: '🎯',
    description: 'AI想一个东西，你用20个问题猜出来',
    difficulty: 'medium',
    category: 'puzzle',
  },
  {
    id: 'truth_dare',
    name: '真心话大冒险',
    emoji: '🎲',
    description: '经典聚会游戏，和AI一起玩',
    difficulty: 'easy',
    category: 'casual',
  },
];

export function GamesScreen({ onBack }: GamesScreenProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  const selectedGame = games.find(g => g.id === selectedGameId);

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  };

  const categoryLabels = {
    puzzle: '益智',
    casual: '休闲',
    strategy: '策略',
    word: '文字',
  };

  return (
    <AppScreen title="游戏中心" onBack={onBack}>
      {!selectedGameId ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">🎮 游戏中心</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 和AI角色一起玩各种小游戏</div>
              <div>• 益智游戏锻炼脑力</div>
              <div>• 休闲游戏放松心情</div>
              <div>• 更多游戏持续添加中...</div>
            </div>
          </div>

          {/* 游戏列表 */}
          <div className="text-[13px] font-medium mb-2 txt-accent">选择游戏</div>
          <div className="grid grid-cols-2 gap-2">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className="p-4 glass-strong rounded-2xl tap text-left"
              >
                <div className="text-[40px] mb-2">{game.emoji}</div>
                <div className="text-[13px] txt-accent font-medium mb-1">
                  {game.name}
                </div>
                <div className="text-[11px] txt-faint mb-2">
                  {game.description}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-[10px] ${difficultyColors[game.difficulty]}`}>
                    {difficultyLabels[game.difficulty]}
                  </div>
                  <div className="text-[10px] txt-faint">
                    {categoryLabels[game.category]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* 游戏详情 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl text-center">
            <div className="text-[64px] mb-3">{selectedGame?.emoji}</div>
            <div className="text-[16px] txt-accent font-medium mb-2">
              {selectedGame?.name}
            </div>
            <div className="text-[13px] txt-faint mb-3">
              {selectedGame?.description}
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className={`text-[12px] ${difficultyColors[selectedGame?.difficulty || 'easy']}`}>
                {difficultyLabels[selectedGame?.difficulty || 'easy']}
              </div>
              <div className="text-[12px] txt-faint">
                {categoryLabels[selectedGame?.category || 'casual']}
              </div>
            </div>
          </div>

          <div className="p-6 glass-strong rounded-2xl text-center">
            <div className="text-[32px] mb-3">🚧</div>
            <div className="text-[14px] txt-accent mb-2">游戏开发中</div>
            <div className="text-[12px] txt-faint">
              这个游戏正在开发中，敬请期待！
            </div>
          </div>

          <button
            onClick={() => setSelectedGameId('')}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            返回游戏列表
          </button>
        </div>
      )}
    </AppScreen>
  );
}
