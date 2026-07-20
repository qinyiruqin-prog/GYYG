import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';

interface TurtleSoupScreenProps {
  onBack: () => void;
  onAskQuestion: (puzzleId: string, question: string) => Promise<string>;
}

export interface TurtleSoupPuzzle {
  id: string;
  title: string;
  story: string; // 谜面
  truth: string; // 真相（不显示给用户）
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'horror' | 'funny' | 'logic' | 'emotional';
  hints: string[]; // 提示
  questions: number; // 已经问了多少个问题
  solved: boolean; // 是否已解开
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
    questions: 0,
    solved: false,
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
    questions: 0,
    solved: false,
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
    questions: 0,
    solved: false,
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
    questions: 0,
    solved: false,
  },
];

export function TurtleSoupScreen({ onBack, onAskQuestion }: TurtleSoupScreenProps) {
  const [puzzles] = useState<TurtleSoupPuzzle[]>(defaultPuzzles);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showTruth, setShowTruth] = useState(false);

  const selectedPuzzle = puzzles.find(p => p.id === selectedPuzzleId);

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

  const handleAsk = async () => {
    if (!question.trim() || !selectedPuzzleId) return;

    setLoading(true);
    try {
      const answer = await onAskQuestion(selectedPuzzleId, question);
      setConversation([...conversation, { q: question, a: answer }]);
      setQuestion('');
    } catch (err) {
      alert('提问失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGiveUp = () => {
    if (confirm('确定要放弃并查看答案吗？')) {
      setShowTruth(true);
    }
  };

  return (
    <AppScreen title="海龟汤" onBack={onBack}>
      {!selectedPuzzleId ? (
        <>
          {/* 说明 */}
          <div className="mb-4 p-4 glass-strong rounded-2xl">
            <div className="text-[13px] font-medium mb-2 txt-accent">🐢 海龟汤游戏</div>
            <div className="text-[12px] txt-faint space-y-1">
              <div>• 经典推理游戏，通过提问猜出真相</div>
              <div>• AI只会回答"是"、"否"、"不相关"</div>
              <div>• 提示系统帮你找到方向</div>
              <div>• 开动脑筋，享受推理的乐趣！</div>
            </div>
          </div>

          {/* 谜题列表 */}
          <div className="text-[13px] font-medium mb-2 txt-accent">选择谜题</div>
          <div className="space-y-2">
            {puzzles.map(puzzle => (
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
                <div className="text-[12px] txt-dim">{puzzle.story}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 游戏界面 */
        <div className="space-y-4">
          {/* 谜题卡片 */}
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
                onClick={() => {
                  setSelectedPuzzleId('');
                  setConversation([]);
                  setShowHints(false);
                  setShowTruth(false);
                }}
                className="text-[12px] txt-faint tap"
              >
                返回
              </button>
            </div>

            <div className="text-[13px] txt-accent p-3 bg-[var(--accent)]/10 rounded-xl">
              {selectedPuzzle?.story}
            </div>
          </div>

          {/* 对话记录 */}
          {conversation.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {conversation.map((c, i) => (
                <div key={i} className="space-y-1">
                  {/* 问题 */}
                  <div className="flex justify-end">
                    <div className="p-3 bg-[var(--accent)] text-white rounded-xl max-w-[80%]">
                      <div className="text-[13px]">{c.q}</div>
                    </div>
                  </div>
                  {/* 回答 */}
                  <div className="flex justify-start">
                    <div className="p-3 glass-strong rounded-xl max-w-[80%]">
                      <div className="text-[13px] txt-accent">{c.a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 提问输入 */}
          {!showTruth && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAsk()}
                  placeholder="输入你的问题..."
                  disabled={loading}
                  className="flex-1 p-3 glass-strong rounded-xl text-[14px] txt-accent border-none outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  className="px-4 py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap disabled:opacity-50"
                >
                  {loading ? '...' : '提问'}
                </button>
              </div>

              <div className="text-[11px] txt-faint text-center">
                提示：只能问"是/否"类型的问题
              </div>
            </div>
          )}

          {/* 功能按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              {showHints ? '隐藏提示' : '💡 查看提示'}
            </button>
            <button
              onClick={handleGiveUp}
              className="flex-1 py-3 glass-strong rounded-xl font-medium tap txt-accent"
            >
              🏳️ 放弃并查看答案
            </button>
          </div>

          {/* 提示 */}
          {showHints && selectedPuzzle && (
            <div className="p-4 glass-strong rounded-2xl">
              <div className="text-[13px] font-medium mb-2 txt-accent">💡 提示</div>
              <div className="space-y-1">
                {selectedPuzzle.hints.map((hint, i) => (
                  <div key={i} className="text-[12px] txt-faint flex gap-2">
                    <span>{i + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 真相 */}
          {showTruth && selectedPuzzle && (
            <div className="p-4 bg-[var(--accent)]/10 border-2 border-[var(--accent)]/30 rounded-2xl">
              <div className="text-[13px] font-medium mb-2 txt-accent">✨ 真相</div>
              <div className="text-[13px] txt-accent">{selectedPuzzle.truth}</div>
            </div>
          )}
        </div>
      )}
    </AppScreen>
  );
}
