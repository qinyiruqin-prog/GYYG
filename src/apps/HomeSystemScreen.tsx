import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import type { Character } from '../types';

interface HomeSystemScreenProps {
  characters: Character[];
  homes: Home[];
  onBack: () => void;
  onCreate: (charId: string, homeType: HomeType) => void;
  onCook: (homeId: string, recipe: Recipe) => Promise<{ success: boolean; result: string }>;
  onChangeClothes: (homeId: string, outfit: Outfit) => void;
}

export interface Home {
  id: string;
  characterId: string;
  userId: string;
  type: HomeType;
  address: string;
  roommates: string[]; // 同居的角色ID列表
  furniture: Furniture[];
  kitchen: {
    ingredients: string[]; // 食材
    recipes: Recipe[]; // 菜谱
    cookHistory: CookRecord[];
  };
  closet: {
    outfits: Outfit[]; // 服装
    accessories: string[]; // 配饰
  };
  deliveries: Delivery[]; // 快递
  createdAt: number;
}

export type HomeType = 'apartment' | 'house' | 'villa' | 'dorm';

export interface Furniture {
  id: string;
  type: 'sofa' | 'table' | 'bed' | 'desk' | 'plant' | 'decoration';
  name: string;
  emoji: string;
  position?: { x: number; y: number };
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cookTime: number; // 分钟
}

export interface CookRecord {
  id: string;
  recipeId: string;
  recipeName: string;
  result: 'perfect' | 'good' | 'ok' | 'failed';
  comment: string; // AI生成的评价
  ts: number;
}

export interface Outfit {
  id: string;
  name: string;
  type: 'casual' | 'formal' | 'sport' | 'cute' | 'cool';
  emoji: string;
  description: string;
}

export interface Delivery {
  id: string;
  from: string; // 发件人
  item: string;
  status: 'pending' | 'received';
  ts: number;
}

export function HomeSystemScreen({
  characters,
  homes,
  onBack,
  onCreate,
  onCook,
  onChangeClothes,
}: HomeSystemScreenProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [view, setView] = useState<'main' | 'kitchen' | 'closet' | 'delivery'>('main');
  const [cooking, setCooking] = useState(false);

  const selectedChar = characters.find(c => c.id === selectedCharId);
  const home = homes.find(h => h.characterId === selectedCharId);

  const homeTypeLabels: Record<HomeType, string> = {
    apartment: '公寓',
    house: '房子',
    villa: '别墅',
    dorm: '宿舍',
  };

  // 默认食材
  const defaultIngredients = [
    '鸡蛋', '番茄', '牛肉', '猪肉', '鱼', '虾',
    '米饭', '面条', '蔬菜', '豆腐', '土豆', '胡萝卜',
  ];

  // 默认菜谱
  const defaultRecipes: Recipe[] = [
    {
      id: 'r1',
      name: '番茄炒蛋',
      emoji: '🍳',
      ingredients: ['鸡蛋', '番茄'],
      difficulty: 'easy',
      cookTime: 15,
    },
    {
      id: 'r2',
      name: '红烧肉',
      emoji: '🍖',
      ingredients: ['猪肉', '酱油', '糖'],
      difficulty: 'medium',
      cookTime: 60,
    },
    {
      id: 'r3',
      name: '清蒸鱼',
      emoji: '🐟',
      ingredients: ['鱼', '姜', '葱'],
      difficulty: 'medium',
      cookTime: 30,
    },
    {
      id: 'r4',
      name: '牛排',
      emoji: '🥩',
      ingredients: ['牛肉', '黑胡椒', '黄油'],
      difficulty: 'hard',
      cookTime: 25,
    },
  ];

  // 默认服装
  const defaultOutfits: Outfit[] = [
    {
      id: 'o1',
      name: '休闲装',
      type: 'casual',
      emoji: '👕',
      description: 'T恤+牛仔裤',
    },
    {
      id: 'o2',
      name: '正装',
      type: 'formal',
      emoji: '👔',
      description: '衬衫+西裤',
    },
    {
      id: 'o3',
      name: '运动装',
      type: 'sport',
      emoji: '👟',
      description: '运动服+运动鞋',
    },
    {
      id: 'o4',
      name: '可爱风',
      type: 'cute',
      emoji: '👗',
      description: '连衣裙',
    },
    {
      id: 'o5',
      name: '酷炫风',
      type: 'cool',
      emoji: '🧥',
      description: '皮夹克+黑裤',
    },
  ];

  const handleCreateHome = () => {
    if (!selectedCharId) {
      alert('请选择角色');
      return;
    }

    onCreate(selectedCharId, 'apartment');
    alert('家园创建成功！');
  };

  const handleCook = async (recipe: Recipe) => {
    if (!home) return;

    setCooking(true);
    try {
      const result = await onCook(home.id, recipe);
      alert(result.result);
    } catch (err) {
      alert('做饭失败了...');
    } finally {
      setCooking(false);
    }
  };

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  };

  return (
    <AppScreen title="家园系统" onBack={onBack}>
      {/* 说明 */}
      <div className="mb-4 p-4 glass-strong rounded-2xl">
        <div className="text-[13px] font-medium mb-2 txt-accent">🏠 家园系统</div>
        <div className="text-[12px] txt-faint space-y-1">
          <div>• 与角色建立共同的家</div>
          <div>• 厨房：一起做饭，分享美食</div>
          <div>• 衣橱：换装搭配，展示给TA看</div>
          <div>• 快递：代收快递功能</div>
          <div>• 同居：真实的居家生活体验</div>
        </div>
      </div>

      {/* 主视图 */}
      {view === 'main' && !home && (
        <>
          <div className="text-[13px] font-medium mb-2 txt-accent">选择同居对象</div>
          <ListGroup>
            {characters.map(char => {
              const hasHome = homes.some(h => h.characterId === char.id);
              return (
                <Row
                  key={char.id}
                  icon={char.avatar || '👤'}
                  label={char.name}
                  hint={hasHome ? '已建立家园' : char.signature}
                  onClick={() => !hasHome && setSelectedCharId(char.id)}
                  right={
                    hasHome ? (
                      <span className="text-[var(--accent)]">🏠</span>
                    ) : selectedCharId === char.id ? (
                      <span className="text-[var(--accent)]">✓</span>
                    ) : null
                  }
                />
              );
            })}
          </ListGroup>

          {selectedCharId && (
            <button
              onClick={handleCreateHome}
              className="mt-4 w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium tap"
            >
              建立家园
            </button>
          )}
        </>
      )}

      {/* 家园主界面 */}
      {view === 'main' && home && selectedChar && (
        <div className="space-y-4">
          {/* 家园信息卡片 */}
          <div className="p-4 glass-strong rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[32px]">🏠</div>
              <div className="flex-1">
                <div className="text-[14px] font-medium txt-accent">
                  与 {selectedChar.name} 的家
                </div>
                <div className="text-[11px] txt-faint">
                  {homeTypeLabels[home.type]} · {home.address || '温馨小窝'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] txt-faint">
              <span>👥 同居中</span>
              <span>·</span>
              <span>
                {new Date(home.createdAt).toLocaleDateString()} 入住
              </span>
            </div>
          </div>

          {/* 功能区 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setView('kitchen')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">👨‍🍳</div>
              <div className="text-[13px] txt-accent font-medium">厨房</div>
              <div className="text-[10px] txt-faint">
                一起做饭 · {home.kitchen.cookHistory.length}次
              </div>
            </button>

            <button
              onClick={() => setView('closet')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">👔</div>
              <div className="text-[13px] txt-accent font-medium">衣橱</div>
              <div className="text-[10px] txt-faint">
                换装搭配 · {home.closet.outfits.length}套
              </div>
            </button>

            <button
              onClick={() => setView('delivery')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">📦</div>
              <div className="text-[13px] txt-accent font-medium">快递</div>
              <div className="text-[10px] txt-faint">
                代收快递 · {home.deliveries.filter(d => d.status === 'pending').length}件待取
              </div>
            </button>

            <button
              onClick={() => alert('装修功能开发中...')}
              className="p-4 glass-strong rounded-xl tap"
            >
              <div className="text-[32px] mb-1">🛋️</div>
              <div className="text-[13px] txt-accent font-medium">装修</div>
              <div className="text-[10px] txt-faint">
                家具摆放 · {home.furniture.length}件
              </div>
            </button>
          </div>

          {/* 做饭历史 */}
          {home.kitchen.cookHistory.length > 0 && (
            <div>
              <div className="text-[13px] font-medium mb-2 txt-accent">最近做的菜</div>
              <div className="space-y-2">
                {home.kitchen.cookHistory.slice(0, 3).map(record => (
                  <div key={record.id} className="p-3 glass-strong rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[20px]">🍳</span>
                      <div className="flex-1">
                        <div className="text-[13px] txt-accent font-medium">
                          {record.recipeName}
                        </div>
                        <div className="text-[11px] txt-faint">
                          {new Date(record.ts).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[11px] px-2 py-1 rounded bg-[var(--accent)]/20 txt-accent">
                        {record.result === 'perfect' ? '完美' :
                         record.result === 'good' ? '不错' :
                         record.result === 'ok' ? '一般' : '失败'}
                      </div>
                    </div>
                    <div className="text-[12px] txt-dim pl-7">{record.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 厨房视图 */}
      {view === 'kitchen' && home && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-medium txt-accent">👨‍🍳 厨房</div>
            <button
              onClick={() => setView('main')}
              className="text-[12px] txt-faint tap"
            >
              返回
            </button>
          </div>

          <div className="text-[13px] font-medium mb-2 txt-accent">选择菜谱</div>
          <div className="space-y-2">
            {defaultRecipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => handleCook(recipe)}
                disabled={cooking}
                className="w-full p-3 glass-strong rounded-xl tap disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[32px]">{recipe.emoji}</div>
                  <div className="flex-1">
                    <div className="text-[14px] txt-accent font-medium mb-1">
                      {recipe.name}
                    </div>
                    <div className="text-[11px] txt-faint flex items-center gap-2">
                      <span className={difficultyColors[recipe.difficulty]}>
                        {recipe.difficulty === 'easy' ? '简单' :
                         recipe.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      <span>·</span>
                      <span>⏱️ {recipe.cookTime}分钟</span>
                    </div>
                    <div className="text-[10px] txt-dim mt-1">
                      食材：{recipe.ingredients.join(', ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {cooking && (
            <div className="p-4 glass-strong rounded-2xl animate-pulse text-center">
              <div className="text-[32px] mb-2">👨‍🍳</div>
              <div className="text-[13px] txt-accent">正在做饭中...</div>
            </div>
          )}
        </div>
      )}

      {/* 衣橱视图 */}
      {view === 'closet' && home && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-medium txt-accent">👔 衣橱</div>
            <button
              onClick={() => setView('main')}
              className="text-[12px] txt-faint tap"
            >
              返回
            </button>
          </div>

          <div className="text-[13px] font-medium mb-2 txt-accent">选择服装</div>
          <div className="grid grid-cols-2 gap-2">
            {defaultOutfits.map(outfit => (
              <button
                key={outfit.id}
                onClick={() => {
                  onChangeClothes(home.id, outfit);
                  alert(`换上了${outfit.name}！`);
                }}
                className="p-4 glass-strong rounded-xl tap text-center"
              >
                <div className="text-[40px] mb-2">{outfit.emoji}</div>
                <div className="text-[13px] txt-accent font-medium mb-1">
                  {outfit.name}
                </div>
                <div className="text-[10px] txt-faint">{outfit.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 快递视图 */}
      {view === 'delivery' && home && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-medium txt-accent">📦 快递</div>
            <button
              onClick={() => setView('main')}
              className="text-[12px] txt-faint tap"
            >
              返回
            </button>
          </div>

          {home.deliveries.length > 0 ? (
            home.deliveries.map(delivery => (
              <div key={delivery.id} className="p-3 glass-strong rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="text-[32px]">📦</div>
                  <div className="flex-1">
                    <div className="text-[13px] txt-accent font-medium mb-1">
                      {delivery.item}
                    </div>
                    <div className="text-[11px] txt-faint mb-2">
                      来自：{delivery.from}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-[10px] px-2 py-1 rounded ${
                          delivery.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {delivery.status === 'pending' ? '待取' : '已取'}
                      </div>
                      <div className="text-[10px] txt-faint">
                        {new Date(delivery.ts).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="text-[48px] mb-2">📭</div>
              <div className="text-[13px] txt-dim">暂无快递</div>
            </div>
          )}
        </div>
      )}
    </AppScreen>
  );
}
