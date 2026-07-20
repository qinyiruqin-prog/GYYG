import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import type { Character } from '../types';

interface TurtleSoupScreenProps {
  characters: Character[];
  onBack: () => void;
  onStartPuzzle: (puzzleId: string, characterId: string, mode: 'you_guess' | 'char_guess') => void;
}

export interface TurtleSoupPuzzle {
  id: string;
  title: string;
  story: string; // 谜面
  truth: string; // 真相
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'horror' | 'funny' | 'logic' | 'emotional';
  hints: string[]; // 提示
}

const defaultPuzzles: TurtleSoupPuzzle[] = [
  {
    id: 'ts1',
    title: '半价出售',
    story: '一个男人走进餐厅，点了一碗海龟汤。尝了一口后，他走出餐厅，自杀了。为什么？',
    truth: '男人曾经遇到海难，漂流到荒岛。同伴说给他煮海龟汤，他喝了活了下来。后来获救后在餐厅喝到真正的海龟汤，才发现当年喝的是同伴的肉做的汤。',
    difficulty: 'hard',
    category: 'horror',
    hints: [
      '男人以前喝过"海龟汤"',
      '那次经历和这次味道不一样',
      '那次经历中有人死了',
    ],
  },
  {
    id: 'ts2',
    title: '推开的门',
    story: '女孩回到家，推开门，大叫一声晕倒了。为什么？',
    truth: '女孩是空姐，家里挂着世界地图。出门时她在地图上钉了一颗钉子标记目的地。回家后发现钉子穿透了飞机的位置，联想到飞机失事。',
    difficulty: 'medium',
    category: 'logic',
    hints: [
      '女孩的职业很重要',
      '她出门前做了某件事',
      '她看到的东西和工作有关',
    ],
  },
  {
    id: 'ts3',
    title: '雨夜',
    story: '一个人在雨夜开车，看到路边有两个人在等车：一个是快要死的老人，一个是救过自己命的医生。但车只能坐一个人。他会怎么做？',
    truth: '把车钥匙给医生，让医生送老人去医院，自己陪喜欢的女孩等车。',
    difficulty: 'easy',
    category: 'logic',
    hints: [
      '不一定要自己开车',
      '可以让别人帮忙',
      '把车给谁是关键',
    ],
  },
  {
    id: 'ts4',
    title: '敲门声',
    story: '深夜，男人一个人在家写作。突然听到敲门声，他透过猫眼看到一个陌生女人。他没有开门，第二天报警了。为什么？',
    truth: '他住在高层公寓，猫眼里看到的女人是"站"在半空中的，说明女人已经死了，有人把尸体举起来敲门。',
    difficulty: 'hard',
    category: 'horror',
    hints: [
      '男人住的位置很重要',
      '女人的"姿势"有问题',
      '女人可能不是活着的',
    ],
  },
];

export function TurtleSoupScreen({ characters, onBack, onStartPuzzle }: TurtleSoupScreenProps) {
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string>('');
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'you_guess' | 'char_guess' | ''>('');

  const selectedPuzzle = defaultPuzzles.find(p => p.id === selectedPuzzleId);

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
    horror: '恐怖',
    funny: '搞笑',
    logic: '逻辑',
    emotional: '情感',
  };

  const handleStart = () => {
    if (!selectedPuzzleId || !selectedCharId || !selectedMode) {
      alert('请完成所有选择');
      return;
    }
    onStartPuzzle(selectedPuzzleId, selectedCharId, selectedMode);
  };

  return (
    <AppScreen title="海龟汤" onBack={onBack}>
      {!selectedPuzzleId ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">🐢 海龟汤游戏</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 选择角色一起玩海龟汤</div>
              <div>• 两种模式：你猜 或 角色猜</div>
              <div>• 通过提问推理出真相</div>
              <div>• 只能问"是/否"类型的问题</div>
            </div>
          </div>

          {/* 谜题列表 */}
          <div className="text-[13px] font-medium mb-2 txt-accent">选择谜题</div>
          <div className="space-y-2">
            {defaultPuzzles.map(puzzle => (
              <div
                key={puzzle.id}
                onClick={() => setSelectedPuzzleId(puzzle.id)}
                className="p-4 glass-strong rounded-2xl tap"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[14px] txt-accent font-medium">
                    {puzzle.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-[11px] ${difficultyColors[puzzle.difficulty]}`}>
                      {difficultyLabels[puzzle.difficulty]}
                    </div>
                    <div className="text-[11px] txt-faint">
                      {categoryLabels[puzzle.category]}
                    </div>
                  </div>
                </div>
                <div className="text-[12px] txt-dim line-clamp-2">{puzzle.story}</div>
              </div>
            ))}
          </div>
        </>
      ) : !selectedCharId ? (
        /* 选择角色 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[14px] txt-accent font-medium mb-1">
                  {selectedPuzzle?.title}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-[11px] ${difficultyColors[selectedPuzzle?.difficulty || 'easy']}`}>
                    {difficultyLabels[selectedPuzzle?.difficulty || 'easy']}
                  </div>
                  <div className="text-[11px] txt-faint">
                    {categoryLabels[selectedPuzzle?.category || 'logic']}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPuzzleId('')}
                className="text-[12px] txt-faint tap"
              >
                返回
              </button>
            </div>

            <div className="text-[13px] txt-accent p-3 bg-[var(--accent)]/10 rounded-xl">
              {selectedPuzzle?.story}
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
        </div>
      ) : !selectedMode ? (
        /* 选择模式 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl">
            <div className="text-[14px] txt-accent font-medium mb-2">
              {selectedPuzzle?.title}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[40px]">
                {characters.find(c => c.id === selectedCharId)?.avatar || '👤'}
              </div>
              <div className="flex-1">
                <div className="text-[14px] txt-accent font-medium">
                  {characters.find(c => c.id === selectedCharId)?.name}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[13px] font-medium mb-2 txt-accent">选择游戏模式</div>

          <button
            onClick={() => setSelectedMode('you_guess')}
            className="w-full p-4 glass-strong rounded-2xl tap text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[32px]">🤔</div>
              <div className="flex-1">
                <div className="text-[14px] txt-accent font-medium mb-1">
                  你来猜谜
                </div>
                <div className="text-[12px] txt-faint">
                  角色知道答案，你通过提问猜出真相
                </div>
              </div>
            </div>
            <div className="text-[11px] txt-faint">
              • 角色会回答"是"、"否"或"不相关"<br/>
              • 你可以随时要提示<br/>
              • 猜到真相即可获胜
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('char_guess')}
            className="w-full p-4 glass-strong rounded-2xl tap text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-[32px]">🧐</div>
              <div className="flex-1">
                <div className="text-[14px] txt-accent font-medium mb-1">
                  角色来猜谜
                </div>
                <div className="text-[12px] txt-faint">
                  你知道答案，角色通过提问猜出真相
                </div>
              </div>
            </div>
            <div className="text-[11px] txt-faint">
              • 你回答角色的问题"是"或"否"<br/>
              • 角色会根据答案推理<br/>
              • 看角色能否猜出真相
            </div>
          </button>

          <button
            onClick={() => setSelectedCharId('')}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            重新选择角色
          </button>
        </div>
      ) : (
        /* 确认开始 */
        <div className="space-y-4">
          <div className="p-4 glass-strong rounded-2xl">
            <div className="text-[14px] txt-accent font-medium mb-3">游戏设置</div>

            <div className="space-y-3">
              <div>
                <div className="text-[12px] txt-faint mb-1">谜题</div>
                <div className="text-[13px] txt-accent">{selectedPuzzle?.title}</div>
              </div>

              <div>
                <div className="text-[12px] txt-faint mb-1">游戏伙伴</div>
                <div className="flex items-center gap-2">
                  <div className="text-[24px]">
                    {characters.find(c => c.id === selectedCharId)?.avatar || '👤'}
                  </div>
                  <div className="text-[13px] txt-accent">
                    {characters.find(c => c.id === selectedCharId)?.name}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[12px] txt-faint mb-1">游戏模式</div>
                <div className="text-[13px] txt-accent">
                  {selectedMode === 'you_guess' ? '🤔 你来猜谜' : '🧐 角色来猜谜'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
            <div className="text-[12px] txt-accent space-y-1">
              <div>💡 <strong>游戏规则：</strong></div>
              <div>• 只能问"是/否"类型的问题</div>
              <div>• 通过提问推理出真相</div>
              <div>• 游戏过程会保存到聊天记录</div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-medium tap text-[16px]"
          >
            🐢 开始游戏
          </button>

          <button
            onClick={() => setSelectedMode('')}
            className="w-full py-3 glass-strong rounded-xl font-medium tap txt-accent"
          >
            重新选择模式
          </button>
        </div>
      )}
    </AppScreen>
  );
}
