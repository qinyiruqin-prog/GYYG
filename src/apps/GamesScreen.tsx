import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { GamePlayScreen } from './GamePlayScreen';
import type { Character, ApiConfig, Message } from '../types';

interface GamesScreenProps {
  api: ApiConfig;
  characters: Character[];
  onBack: () => void;
  onSaveGameToChat: (characterId: string, messages: Message[]) => void;
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
    description: '和角色轮流猜数字，看谁先猜中',
    difficulty: 'easy',
    category: 'casual',
  },
  {
    id: 'word_chain',
    name: '成语接龙',
    emoji: '📖',
    description: '和角色进行成语接龙，看谁词汇量更大',
    difficulty: 'medium',
    category: 'word',
  },
  {
    id: 'riddle',
    name: '猜谜语',
    emoji: '❓',
    description: '角色出谜语你来猜，或你出谜语角色猜',
    difficulty: 'easy',
    category: 'puzzle',
  },
  {
    id: 'story_chain',
    name: '接故事',
    emoji: '📚',
    description: '和角色轮流接故事，创造有趣的剧情',
    difficulty: 'easy',
    category: 'casual',
  },
  {
    id: 'twenty_questions',
    name: '20个问题',
    emoji: '🎯',
    description: '角色想一个东西，你用20个问题猜出来',
    difficulty: 'medium',
    category: 'puzzle',
  },
  {
    id: 'truth_dare',
    name: '真心话大冒险',
    emoji: '🎲',
    description: '和角色一起玩真心话大冒险',
    difficulty: 'easy',
    category: 'casual',
  },
];

export function GamesScreen({ api, characters, onBack, onSaveGameToChat }: GamesScreenProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [playing, setPlaying] = useState(false);

  const selectedGame = games.find(g => g.id === selectedGameId);
  const selectedChar = characters.find(c => c.id === selectedCharId);

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

  const handleStartGame = () => {
    if (!selectedGameId || !selectedCharId) {
      alert('请选择游戏和角色');
      return;
    }
    setPlaying(true);
  };

  const handleGameFinish = (messages: Message[]) => {
    if (selectedCharId) {
      onSaveGameToChat(selectedCharId, messages);
      setPlaying(false);
      setSelectedGameId('');
      setSelectedCharId('');
      onBack();
    }
  };

  // 如果正在游戏中，显示游戏界面
  if (playing && selectedGameId && selectedChar) {
    return (
      <GamePlayScreen
        gameId={selectedGameId}
        character={selectedChar}
        api={api}
        onBack={() => setPlaying(false)}
        onFinish={handleGameFinish}
      />
    );
  }

  return (
    <AppScreen title="游戏中心" onBack={onBack}>
      {!selectedGameId ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">🎮 游戏中心</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 选择游戏和角色，一起玩游戏</div>
              <div>• 角色会真实参与，不是简单AI</div>
              <div>• 根据角色性格有不同表现</div>
              <div>• 游戏记录会保存到聊天记录</div>
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
                <div className="text-[11px] txt-faint mb-2 line-clamp-2">
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
      ) : !selectedCharId ? (
        /* 选择角色 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl text-center">
            <div className="text-[64px] mb-3">{selectedGame?.emoji}</div>
            <div className="text-[16px] txt-accent font-medium mb-2">
              {selectedGame?.name}
            </div>
            <div className="text-[13px] txt-faint mb-3">
              {selectedGame?.description}
            </div>
          </div>

          <div className="text-[13px] font-medium mb-2 txt-accent">选择一起玩的角色</div>

          {characters.length > 0 ? (
            <div className="space-y-2">
              {characters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className="w-full p-4 glass-strong rounded-2xl tap flex items-center gap-3 text-left"
                >
                  <div className="text-[40px]">{char.avatar || '👤'}</div>
                  <div className="flex-1">
                    <div className="text-[14px] txt-accent font-medium mb-1">
                      {char.name}
                    </div>
                    <div className="text-[12px] txt-faint line-clamp-1">
                      {char.signature}
                    </div>
                  </div>
                  <div className="text-[20px] txt-faint">→</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-[48px] mb-2">👤</div>
              <div className="text-[14px] txt-dim mb-1">还没有角色</div>
              <div className="text-[12px] txt-faint">请先创建角色</div>
            </div>
          )}

          <button
            onClick={() => setSelectedGameId('')}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            返回选择游戏
          </button>
        </div>
      ) : (
        /* 确认开始 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl text-center">
            <div className="text-[64px] mb-3">{selectedGame?.emoji}</div>
            <div className="text-[16px] txt-accent font-medium mb-2">
              {selectedGame?.name}
            </div>
          </div>

          <div className="p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-3 txt-accent">游戏伙伴</div>
            <div className="flex items-center gap-3">
              <div className="text-[40px]">
                {characters.find(c => c.id === selectedCharId)?.avatar || '👤'}
              </div>
              <div className="flex-1">
                <div className="text-[14px] txt-accent font-medium">
                  {characters.find(c => c.id === selectedCharId)?.name}
                </div>
                <div className="text-[12px] txt-faint">
                  {characters.find(c => c.id === selectedCharId)?.signature}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
            <div className="text-[12px] txt-accent space-y-1">
              <div>💡 <strong>游戏规则：</strong></div>
              <div>{selectedGame?.description}</div>
              <div>• 游戏过程会保存到聊天记录</div>
              <div>• 角色会根据性格真实参与</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-medium tap text-[16px]"
          >
            🎮 开始游戏
          </button>

          <button
            onClick={() => setSelectedCharId('')}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            重新选择角色
          </button>
        </div>
      )}
    </AppScreen>
  );
}
