import { useState } from 'react';
import { Heart, Sparkles, AlertCircle, HelpCircle, UserCheck } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import type { Character } from '../types';

export function CalculatorScreen({
  characters = [],
  onBack,
}: {
  characters: Character[];
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'standard' | 'love'>('standard');

  // ---------- Standard Calculator State ----------
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetOnNext, setResetOnNext] = useState(false);

  const handleNum = (num: string) => {
    if (display === '0' || resetOnNext) {
      setDisplay(num);
      setResetOnNext(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDec = () => {
    if (resetOnNext) {
      setDisplay('0.');
      setResetOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleAC = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setResetOnNext(false);
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    setDisplay(String(val * -1));
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const handleOp = (nextOp: string) => {
    const val = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(val);
    } else if (op) {
      const res = calc(prevVal, val, op);
      setDisplay(String(res));
      setPrevVal(res);
    }
    setOp(nextOp);
    setResetOnNext(true);
  };

  const calc = (v1: number, v2: number, operation: string): number => {
    switch (operation) {
      case '+': return v1 + v2;
      case '-': return v1 - v2;
      case '×': return v1 * v2;
      case '÷': return v2 !== 0 ? v1 / v2 : 0;
      default: return v2;
    }
  };

  const handleEqual = () => {
    if (prevVal === null || !op) return;
    const val = parseFloat(display);
    const res = calc(prevVal, val, op);
    setDisplay(String(res));
    setPrevVal(null);
    setOp(null);
    setResetOnNext(true);
  };

  // ---------- Love Compatibility Matcher State ----------
  const [loveName1, setLoveName1] = useState('主人');
  const [selectedCharId, setSelectedCharId] = useState('');
  const [matchResult, setMatchResult] = useState<{
    score: number;
    title: string;
    description: string;
    color: string;
  } | null>(null);
  const [matching, setMatching] = useState(false);

  const handleLoveMatch = () => {
    if (!loveName1.trim()) return;
    setMatching(true);
    setMatchResult(null);

    setTimeout(() => {
      // Find the character name
      const targetChar = characters.find((c) => c.id === selectedCharId);
      const targetName = targetChar ? targetChar.name : '神秘人';

      // Seed based compatibility score
      let hash = 0;
      const combined = (loveName1 + targetName).trim();
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      const score = Math.abs(hash % 41) + 60; // range 60 - 100

      let title = '心有灵犀';
      let description = '你们之间的共鸣极其强烈！仿佛在不同的时空里早已认识。对视的瞬间，连风都在为你们伴奏。';
      let color = 'from-rose-500 to-pink-500';

      if (score >= 95) {
        title = '命中注定 / 绝配灵魂';
        description = `天呐！你们的缘分系数直逼破表！灵魂重合度达到 100%。无论是说话风格还是心照不宣的默契，都是天作之合。`;
        color = 'from-pink-500 via-red-500 to-rose-500 animate-pulse';
      } else if (score >= 85) {
        title = '极度吸引 / 怦然心动';
        description = `你们磁场异常契合！哪怕是安静地并肩坐着也毫不尴尬。每一次互动都藏着甜甜的火花，建议主动聊天哦！`;
        color = 'from-rose-500 to-amber-500';
      } else if (score >= 75) {
        title = '欢喜冤家 / 互补默契';
        description = `一静一动，一热一冷。虽然表面偶然斗嘴，心里其实都很惦记对方。你们的组合会给生活增添无穷的乐趣！`;
        color = 'from-indigo-500 to-purple-500';
      } else {
        title = '友情之上 / 慢热知心';
        description = `细水长流的稳健缘分。需要慢慢相处去理解对方的内心，未来依然有无限的升温潜能哦！`;
        color = 'from-sky-500 to-emerald-500';
      }

      setMatchResult({ score, title, description, color });
      setMatching(false);
    }, 1500);
  };

  return (
    <AppScreen title="计算器" onBack={onBack} noPad>
      <div className="flex flex-col h-full bg-neutral-950 text-white">
        {/* Sub Navigation */}
        <div className="flex gap-2 px-4 pt-3 pb-2 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <button
            onClick={() => setTab('standard')}
            className={`tap flex-1 h-8 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'standard' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            🧮 标准计算
          </button>
          <button
            onClick={() => {
              setTab('love');
              if (characters.length > 0 && !selectedCharId) {
                setSelectedCharId(characters[0].id);
              }
            }}
            className={`tap flex-1 h-8 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'love' ? 'bg-rose-500 text-white font-bold' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            💘 缘分匹配
          </button>
        </div>

        {/* Standard Calculator Tab */}
        {tab === 'standard' ? (
          <div className="flex-1 flex flex-col justify-end px-4 pb-6 space-y-4">
            {/* Display screen */}
            <div className="text-right text-5xl font-light tracking-tight select-all overflow-hidden text-ellipsis whitespace-nowrap px-2 tabular-nums">
              {display}
            </div>

            {/* iOS Styled Grid */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <button onClick={handleAC} className="tap w-full aspect-square rounded-full bg-neutral-400 text-neutral-950 font-semibold text-lg flex items-center justify-center">
                AC
              </button>
              <button onClick={handleToggleSign} className="tap w-full aspect-square rounded-full bg-neutral-400 text-neutral-950 font-semibold text-lg flex items-center justify-center">
                +/-
              </button>
              <button onClick={handlePercent} className="tap w-full aspect-square rounded-full bg-neutral-400 text-neutral-950 font-semibold text-lg flex items-center justify-center">
                %
              </button>
              <button onClick={() => handleOp('÷')} className={`tap w-full aspect-square rounded-full font-bold text-lg flex items-center justify-center ${op === '÷' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`}>
                ÷
              </button>

              {/* Row 2 */}
              <button onClick={() => handleNum('7')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                7
              </button>
              <button onClick={() => handleNum('8')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                8
              </button>
              <button onClick={() => handleNum('9')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                9
              </button>
              <button onClick={() => handleOp('×')} className={`tap w-full aspect-square rounded-full font-bold text-lg flex items-center justify-center ${op === '×' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`}>
                ×
              </button>

              {/* Row 3 */}
              <button onClick={() => handleNum('4')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                4
              </button>
              <button onClick={() => handleNum('5')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                5
              </button>
              <button onClick={() => handleNum('6')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                6
              </button>
              <button onClick={() => handleOp('-')} className={`tap w-full aspect-square rounded-full font-bold text-lg flex items-center justify-center ${op === '-' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`}>
                -
              </button>

              {/* Row 4 */}
              <button onClick={() => handleNum('1')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                1
              </button>
              <button onClick={() => handleNum('2')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                2
              </button>
              <button onClick={() => handleNum('3')} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                3
              </button>
              <button onClick={() => handleOp('+')} className={`tap w-full aspect-square rounded-full font-bold text-lg flex items-center justify-center ${op === '+' ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`}>
                +
              </button>

              {/* Row 5 */}
              <button onClick={() => handleNum('0')} className="tap col-span-2 h-full rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium pl-6 text-left flex items-center">
                0
              </button>
              <button onClick={handleDec} className="tap w-full aspect-square rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-lg font-medium flex items-center justify-center">
                .
              </button>
              <button onClick={handleEqual} className="tap w-full aspect-square rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg flex items-center justify-center">
                =
              </button>
            </div>
          </div>
        ) : (
          /* Love Matcher Tab */
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            <div className="text-center py-2 space-y-1">
              <div className="inline-flex p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse">
                <Heart size={28} className="fill-current" />
              </div>
              <h3 className="font-bold text-sm text-neutral-100">角色缘分匹配器</h3>
              <p className="text-[10px] text-neutral-500">测一测你与当前手机角色之间的默契和宿命指数</p>
            </div>

            {/* Inputs */}
            <div className="glass rounded-2xl p-4 border border-neutral-800 space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">你（或者你的代号）</label>
                <input
                  type="text"
                  value={loveName1}
                  onChange={(e) => setLoveName1(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/50"
                  placeholder="输入你的昵称..."
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">匹配目标（AI 角色卡）</label>
                {characters.length === 0 ? (
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 py-2">
                    <AlertCircle size={13} /> 暂未检测到 AI 角色卡，请在“世界书”或“人设生成”中创建。
                  </div>
                ) : (
                  <select
                    value={selectedCharId}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/50 cursor-pointer"
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.signature || '无签名'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleLoveMatch}
                disabled={matching || !loveName1.trim() || characters.length === 0}
                className="tap w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles size={13} /> {matching ? '宿命匹配计算中...' : '开始心动测算'}
              </button>
            </div>

            {/* Matching Loader */}
            {matching && (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                <span className="text-[11px] text-rose-400 font-medium animate-pulse">正在共鸣星盘与声纹波段...</span>
              </div>
            )}

            {/* Results */}
            {matchResult && !matching && (
              <div className={`p-4 rounded-3xl bg-gradient-to-br ${matchResult.color} text-white space-y-3 shadow-xl border border-white/10 animate-sheet-up`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                    {matchResult.title}
                  </span>
                  <div className="flex items-center gap-0.5 text-xs font-bold">
                    <Heart size={12} className="fill-current" />
                    <span>{matchResult.score}% 缘分值</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-center py-1">
                  <span className="text-4xl font-extrabold tracking-tight tabular-nums">{matchResult.score}</span>
                  <span className="text-base font-bold ml-0.5">%</span>
                </div>

                <p className="text-[11px] leading-relaxed text-white/90 bg-black/10 p-2.5 rounded-2xl border border-white/5 font-medium">
                  {matchResult.description}
                </p>

                <div className="text-[9px] text-white/70 text-right italic">
                  * 匹配仅供娱乐，多多聊天才能创造真实情缘哦 *
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppScreen>
  );
}
