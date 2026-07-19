import React, { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Edit3, 
  Users, 
  Coins, 
  ArrowLeftRight, 
  Check, 
  X, 
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import type { Character, WalletTransaction } from '../types';
import { uid } from '../utils';

export function WalletScreen({
  userBalance = 5000,
  characters = [],
  walletFlows = [],
  onChangeUserBalance,
  onChangeCharacters,
  onChangeWalletFlows,
  onBack,
}: {
  userBalance: number;
  characters: Character[];
  walletFlows: WalletTransaction[];
  onChangeUserBalance: (bal: number) => void;
  onChangeCharacters: (chars: Character[]) => void;
  onChangeWalletFlows: (flows: WalletTransaction[]) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<'overview' | 'characters' | 'flows'>('overview');
  const [flowFilter, setFlowFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  
  // Customizing user balance state
  const [isEditingUserBal, setIsEditingUserBal] = useState(false);
  const [editUserBalVal, setEditUserBalVal] = useState(userBalance.toString());

  // Customizing character balance state
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [editCharBalVal, setEditCharBalVal] = useState('');

  // Transfer fund state
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferDirection, setTransferDirection] = useState<'to_char' | 'to_user'>('to_char');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  // Manual transaction record state
  const [isAddingFlow, setIsAddingFlow] = useState(false);
  const [newFlowType, setNewFlowType] = useState<'income' | 'expense'>('income');
  const [newFlowAmount, setNewFlowAmount] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState('系统发放');
  const [newFlowDesc, setNewFlowDesc] = useState('');
  const [newFlowPartner, setNewFlowPartner] = useState('系统银行');

  // Compute stats
  const charTotalBalance = characters.reduce((sum, c) => sum + (c.balance ?? 0), 0);
  const totalEconomy = userBalance + charTotalBalance;

  // Custom balance handlers
  const handleSaveUserBalance = () => {
    const num = parseFloat(editUserBalVal);
    if (isNaN(num) || num < 0) {
      alert('请输入有效的金额数值');
      return;
    }
    onChangeUserBalance(num);
    setIsEditingUserBal(false);

    // Add a flow transaction log
    const diff = num - userBalance;
    if (diff !== 0) {
      const log: WalletTransaction = {
        id: 'flow-' + uid(),
        type: diff > 0 ? 'income' : 'expense',
        amount: Math.abs(diff),
        fromName: diff > 0 ? '管理中心' : '我的钱包',
        toName: diff > 0 ? '我的钱包' : '管理中心',
        category: '手动调整',
        description: `管理员手动修改个人余额，由 ${userBalance} 调整为 ${num}`,
        ts: Date.now()
      };
      onChangeWalletFlows([log, ...walletFlows]);
    }
  };

  const handleSaveCharBalance = (charId: string) => {
    const num = parseFloat(editCharBalVal);
    if (isNaN(num) || num < 0) {
      alert('请输入有效的金额数值');
      return;
    }

    const updated = characters.map((c) => {
      if (c.id === charId) {
        const oldBal = c.balance ?? 0;
        const diff = num - oldBal;
        if (diff !== 0) {
          // Log it
          const log: WalletTransaction = {
            id: 'flow-' + uid(),
            type: diff > 0 ? 'income' : 'expense',
            amount: Math.abs(diff),
            fromName: diff > 0 ? '管理中心' : c.name,
            toName: diff > 0 ? c.name : '管理中心',
            category: '调整额度',
            description: `手动修改 ${c.name} 的金库额度由 ${oldBal} 调整为 ${num}`,
            ts: Date.now()
          };
          onChangeWalletFlows([log, ...walletFlows]);
        }
        return { ...c, balance: num };
      }
      return c;
    });

    onChangeCharacters(updated);
    setEditingCharId(null);
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的转账金额');
      return;
    }

    const targetChar = characters.find((c) => c.id === transferTargetId);
    if (!targetChar) {
      alert('请选择转账目标角色');
      return;
    }

    if (transferDirection === 'to_char') {
      if (userBalance < amount) {
        alert('个人钱包余额不足，转账失败');
        return;
      }
      // Deduct from user, add to char
      onChangeUserBalance(userBalance - amount);
      const updated = characters.map((c) => {
        if (c.id === targetChar.id) {
          return { ...c, balance: (c.balance ?? 0) + amount };
        }
        return c;
      });
      onChangeCharacters(updated);

      const log: WalletTransaction = {
        id: 'flow-' + uid(),
        type: 'transfer',
        amount,
        fromName: '我的钱包',
        toName: targetChar.name,
        category: '双向互转',
        description: transferDesc.trim() || `转账给角色 ${targetChar.name}`,
        ts: Date.now()
      };
      onChangeWalletFlows([log, ...walletFlows]);
    } else {
      const charBal = targetChar.balance ?? 0;
      if (charBal < amount) {
        alert(`${targetChar.name} 的金库余额不足，转账失败`);
        return;
      }
      // Deduct from char, add to user
      onChangeUserBalance(userBalance + amount);
      const updated = characters.map((c) => {
        if (c.id === targetChar.id) {
          return { ...c, balance: charBal - amount };
        }
        return c;
      });
      onChangeCharacters(updated);

      const log: WalletTransaction = {
        id: 'flow-' + uid(),
        type: 'transfer',
        amount,
        fromName: targetChar.name,
        toName: '我的钱包',
        category: '双向互转',
        description: transferDesc.trim() || `收取 ${targetChar.name} 转账额`,
        ts: Date.now()
      };
      onChangeWalletFlows([log, ...walletFlows]);
    }

    setIsTransferring(false);
    setTransferAmount('');
    setTransferDesc('');
  };

  const handleAddManualFlow = () => {
    const amount = parseFloat(newFlowAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效金额');
      return;
    }

    if (newFlowType === 'expense' && userBalance < amount) {
      if (!window.confirm('当前个人余额不足以支持这笔支出，是否强制记账并使余额变为负数？')) {
        return;
      }
    }

    // Update user balance accordingly
    const nextBalance = newFlowType === 'income' ? userBalance + amount : userBalance - amount;
    onChangeUserBalance(nextBalance);

    const log: WalletTransaction = {
      id: 'flow-' + uid(),
      type: newFlowType,
      amount,
      fromName: newFlowType === 'income' ? newFlowPartner : '我的钱包',
      toName: newFlowType === 'income' ? '我的钱包' : newFlowPartner,
      category: newFlowCategory,
      description: newFlowDesc.trim() || `${newFlowCategory}交易支出/收入`,
      ts: Date.now()
    };

    onChangeWalletFlows([log, ...walletFlows]);
    setIsAddingFlow(false);
    setNewFlowAmount('');
    setNewFlowDesc('');
  };

  const filteredFlows = walletFlows.filter((f) => {
    if (flowFilter === 'all') return true;
    return f.type === flowFilter;
  });

  return (
    <AppScreen title="随身钱包" onBack={onBack}>
      {/* Top Total Economy Banner */}
      <div className="mb-4 text-center">
        <p className="text-[11px] txt-faint uppercase tracking-widest">Sheep OS Unified Economy</p>
        <p className="text-xs txt-dim mt-0.5">多角色联动金融管理系统</p>
      </div>

      {/* Economy Overview Card */}
      <div className="glass rounded-[24px] p-5 border border-neutral-800/80 mb-4 text-left space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
            <TrendingUp size={14} className="text-[var(--accent)] animate-pulse" />
            <span>系统总体经济 (Total Economy)</span>
          </div>
          <span className="text-[9.5px] px-2 py-0.5 bg-neutral-900 text-[var(--accent)] border border-neutral-800 rounded-full font-mono">
            LIVE STATS
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-mono tracking-tight text-neutral-100 flex items-baseline gap-1.5">
            ￥ {totalEconomy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-[10px] text-neutral-500">
            包含个人现金与 {characters.length} 个 AI 角色的全部资产累积
          </p>
        </div>

        {/* Breakdown progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              个人现金: ￥{userBalance.toLocaleString()} ({(totalEconomy > 0 ? (userBalance / totalEconomy) * 100 : 0).toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              角色总和: ￥{charTotalBalance.toLocaleString()} ({(totalEconomy > 0 ? (charTotalBalance / totalEconomy) * 100 : 0).toFixed(0)}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-950 rounded-full overflow-hidden flex border border-neutral-900">
            <div 
              style={{ width: `${totalEconomy > 0 ? (userBalance / totalEconomy) * 100 : 50}%` }}
              className="h-full bg-[var(--accent)] transition-all duration-500"
            />
            <div 
              style={{ width: `${totalEconomy > 0 ? (charTotalBalance / totalEconomy) * 100 : 50}%` }}
              className="h-full bg-pink-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/40 mb-4 shrink-0">
        <button
          onClick={() => setTab('overview')}
          className={`py-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'overview' ? 'bg-neutral-800 text-[var(--accent)] font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          <Wallet size={12} /> 我的钱包
        </button>
        <button
          onClick={() => setTab('characters')}
          className={`py-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'characters' ? 'bg-neutral-800 text-pink-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          <Users size={12} /> 角色金库
        </button>
        <button
          onClick={() => setTab('flows')}
          className={`py-2 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${tab === 'flows' ? 'bg-neutral-800 text-indigo-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'}`}
        >
          <History size={12} /> 账户流水
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 space-y-4 pb-12">
        {tab === 'overview' && (
          <div className="space-y-4 animate-fade-in text-left">
            {/* User Wallet Balance block */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium">个人可用现金余额</span>
                <button
                  onClick={() => {
                    setIsEditingUserBal(true);
                    setEditUserBalVal(userBalance.toString());
                  }}
                  className="text-[10.5px] text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12} /> 自定义金额
                </button>
              </div>

              {isEditingUserBal ? (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                  <div className="text-[10.5px] text-neutral-400">设定个人现金余额</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editUserBalVal}
                      onChange={(e) => setEditUserBalVal(e.target.value)}
                      placeholder="自定义余额..."
                      className="flex-1 h-9 px-3 bg-neutral-900 border border-neutral-800 rounded-lg outline-none text-xs text-neutral-200 font-mono"
                    />
                    <button
                      onClick={handleSaveUserBalance}
                      className="w-9 h-9 rounded-lg bg-[var(--accent)] text-neutral-950 flex items-center justify-center"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditingUserBal(false)}
                      className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {/* Preset quick buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[100, 1000, 5000, 10000, 50000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setEditUserBalVal(v.toString())}
                        className="text-[10px] px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                      >
                        ￥{v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold font-mono text-[var(--accent)]">
                    ￥ {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    可直接用于点外卖、订阅小说、充值商城等各种应用模拟支出。
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsTransferring(true);
                  if (characters.length > 0) {
                    setTransferTargetId(characters[0].id);
                  }
                }}
                className="p-3.5 rounded-2xl bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/15 flex flex-col justify-between h-24 text-left transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <ArrowLeftRight size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-200">双向资金对调</div>
                  <div className="text-[9.5px] text-pink-300/80">给角色转账/收取额度</div>
                </div>
              </button>

              <button
                onClick={() => setIsAddingFlow(true)}
                className="p-3.5 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 flex flex-col justify-between h-24 text-left transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-200">记一笔手动账单</div>
                  <div className="text-[9.5px] text-indigo-300/80">模拟外部大额收支流水</div>
                </div>
              </button>
            </div>

            {/* Transfer overlay block */}
            {isTransferring && (
              <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <ArrowLeftRight size={13} /> 双向资金对调控制台
                  </span>
                  <button onClick={() => setIsTransferring(false)} className="text-neutral-500 hover:text-neutral-300">
                    <X size={15} />
                  </button>
                </div>

                {characters.length === 0 ? (
                  <div className="text-xs text-neutral-500 py-3 text-center">
                    请先在「我的」-「设定工坊」中创建 AI 角色再进行转账哦
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-neutral-300">
                    <div className="grid grid-cols-2 gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-900">
                      <button
                        onClick={() => setTransferDirection('to_char')}
                        className={`py-1 rounded text-[10px] ${transferDirection === 'to_char' ? 'bg-pink-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
                      >
                        我 ➔ 角色金库
                      </button>
                      <button
                        onClick={() => setTransferDirection('to_user')}
                        className={`py-1 rounded text-[10px] ${transferDirection === 'to_user' ? 'bg-pink-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
                      >
                        角色金库 ➔ 我
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">目标角色</label>
                      <select
                        value={transferTargetId}
                        onChange={(e) => setTransferTargetId(e.target.value)}
                        className="w-full h-8 px-2 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-300"
                      >
                        {characters.map((char) => (
                          <option key={char.id} value={char.id}>
                            {char.name} (金库: ￥{(char.balance ?? 0).toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">资金对调金额 (￥)</label>
                      <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="请输入划转金额..."
                        className="w-full h-8 px-3 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">备注说明（可选）</label>
                      <input
                        type="text"
                        value={transferDesc}
                        onChange={(e) => setTransferDesc(e.target.value)}
                        placeholder="例如: 亲密打赏、角色零花钱、投资分红"
                        className="w-full h-8 px-3 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-200"
                      />
                    </div>

                    <button
                      onClick={handleTransfer}
                      className="w-full h-9 rounded-xl bg-pink-500 text-neutral-950 font-bold flex items-center justify-center gap-1.5 mt-2 hover:bg-pink-600 transition-colors"
                    >
                      <Check size={14} /> 立即确认并记录账单
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual transaction billing block */}
            {isAddingFlow && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Plus size={13} /> 增加一笔手动交易流水
                  </span>
                  <button onClick={() => setIsAddingFlow(false)} className="text-neutral-500 hover:text-neutral-300">
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-300">
                  <div className="grid grid-cols-2 gap-1.5 bg-neutral-950 p-1 rounded-lg">
                    <button
                      onClick={() => { setNewFlowType('income'); setNewFlowCategory('系统发放'); setNewFlowPartner('系统银行'); }}
                      className={`py-1 rounded text-[10px] ${newFlowType === 'income' ? 'bg-indigo-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
                    >
                      收入
                    </button>
                    <button
                      onClick={() => { setNewFlowType('expense'); setNewFlowCategory('购买外卖'); setNewFlowPartner('外卖商家'); }}
                      className={`py-1 rounded text-[10px] ${newFlowType === 'expense' ? 'bg-indigo-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
                    >
                      支出
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500">交易金额 (￥)</label>
                    <input
                      type="number"
                      value={newFlowAmount}
                      onChange={(e) => setNewFlowAmount(e.target.value)}
                      placeholder="金额..."
                      className="w-full h-8 px-3 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-200 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">交易类别</label>
                      <select
                        value={newFlowCategory}
                        onChange={(e) => setNewFlowCategory(e.target.value)}
                        className="w-full h-8 px-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs outline-none text-neutral-300"
                      >
                        <option value="系统发放">系统发放</option>
                        <option value="每日签到">每日签到</option>
                        <option value="购买外卖">购买外卖</option>
                        <option value="商城购物">商城购物</option>
                        <option value="小说订阅">小说订阅</option>
                        <option value="亲密转账">亲密转账</option>
                        <option value="其他收支">其他收支</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">交易对方</label>
                      <input
                        type="text"
                        value={newFlowPartner}
                        onChange={(e) => setNewFlowPartner(e.target.value)}
                        placeholder="对方名称..."
                        className="w-full h-8 px-3 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-neutral-500">明细说明描述</label>
                    <input
                      type="text"
                      value={newFlowDesc}
                      onChange={(e) => setNewFlowDesc(e.target.value)}
                      placeholder="选填描述..."
                      className="w-full h-8 px-3 bg-neutral-950 border border-neutral-800 rounded-md outline-none text-neutral-200"
                    />
                  </div>

                  <button
                    onClick={handleAddManualFlow}
                    className="w-full h-9 rounded-xl bg-indigo-500 text-neutral-950 font-bold flex items-center justify-center gap-1.5 mt-2 hover:bg-indigo-600 transition-colors"
                  >
                    <Check size={14} /> 确认并写入流水
                  </button>
                </div>
              </div>
            )}

            {/* Quick tips */}
            <div className="p-3.5 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex gap-2.5 items-start">
              <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-neutral-400 leading-relaxed">
                温馨提醒：羊羊机使用的是纯客户端独立存储。这是一个属于你的虚拟金融钱包，你可以自由自定义和对调资金，完全不需要花一分钱，只为模拟最真实、最沉浸的角色生活感。
              </p>
            </div>
          </div>
        )}

        {tab === 'characters' && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>角色金库列表 (共 {characters.length} 个角色)</span>
              <span className="text-[10px] text-pink-400">金库总计: ￥{charTotalBalance.toLocaleString()}</span>
            </div>

            {characters.length === 0 ? (
              <div className="p-8 text-center bg-neutral-900/10 border border-dashed border-neutral-800 rounded-2xl space-y-2">
                <Users className="mx-auto text-neutral-600" size={28} />
                <p className="text-xs text-neutral-500">当前还没有创建任何 AI 角色</p>
                <p className="text-[10px] text-neutral-600">在「我的」-「设定工坊」中创建后，可在这里查看他们的钱包和分红</p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((char) => {
                  const isEditing = editingCharId === char.id;
                  return (
                    <div
                      key={char.id}
                      className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex flex-col gap-3 hover:bg-neutral-900/40 transition-all relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        {/* Character info */}
                        <div className="flex items-center gap-3">
                          {char.avatar ? (
                            <img src={char.avatar} className="w-9 h-9 rounded-full object-cover border border-neutral-800" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-pink-950/20 text-pink-400 flex items-center justify-center text-sm font-bold border border-pink-500/20">
                              🐑
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-neutral-200">{char.name}</div>
                            <div className="text-[9px] text-neutral-500">个性：{char.signature || '秘密角色'}</div>
                          </div>
                        </div>

                        {/* Balance display */}
                        <div className="text-right">
                          <div className="text-[11px] text-neutral-500">金库财富</div>
                          <div className="text-sm font-mono font-bold text-pink-400">
                            ￥ {(char.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1 })}
                          </div>
                        </div>
                      </div>

                      {/* Editing or editing button */}
                      {isEditing ? (
                        <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex gap-2">
                          <input
                            type="number"
                            value={editCharBalVal}
                            onChange={(e) => setEditCharBalVal(e.target.value)}
                            placeholder="自定义资产金额..."
                            className="flex-1 h-8 px-2 bg-neutral-900 border border-neutral-800 rounded-md text-[11.5px] text-neutral-200 font-mono outline-none"
                          />
                          <button
                            onClick={() => handleSaveCharBalance(char.id)}
                            className="w-8 h-8 rounded-md bg-pink-500 text-neutral-950 flex items-center justify-center"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingCharId(null)}
                            className="w-8 h-8 rounded-md bg-neutral-800 text-neutral-400 flex items-center justify-center"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end pt-1 border-t border-neutral-800/40">
                          <button
                            onClick={() => {
                              setEditingCharId(char.id);
                              setEditCharBalVal((char.balance ?? 0).toString());
                            }}
                            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300"
                          >
                            修改余额
                          </button>
                          <button
                            onClick={() => {
                              setIsTransferring(true);
                              setTransferTargetId(char.id);
                              setTransferDirection('to_char');
                            }}
                            className="px-3 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-[10px] text-pink-400 border border-pink-500/20"
                          >
                            双向划转
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'flows' && (
          <div className="space-y-4 animate-fade-in text-left">
            {/* Flow Filter bar */}
            <div className="flex gap-1 bg-neutral-900/40 p-0.5 rounded-lg border border-neutral-800/40">
              {[
                { id: 'all', name: '全部' },
                { id: 'income', name: '收入' },
                { id: 'expense', name: '支出' },
                { id: 'transfer', name: '转账' }
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setFlowFilter(tabItem.id as any)}
                  className={`flex-1 py-1 text-[10px] font-medium rounded ${flowFilter === tabItem.id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {tabItem.name}
                </button>
              ))}
            </div>

            {/* Flows timeline */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar">
              {filteredFlows.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500">
                  暂无对应类型的交易账单
                </div>
              ) : (
                filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/20 border border-neutral-800/40 hover:bg-neutral-900/30 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Left icon wrapper */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        flow.type === 'income' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : flow.type === 'expense'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-pink-500/15 text-pink-400'
                      }`}>
                        {flow.type === 'income' ? (
                          <ArrowDownLeft size={14} />
                        ) : flow.type === 'expense' ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowLeftRight size={14} />
                        )}
                      </div>

                      {/* Middle description */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-200 truncate">{flow.description}</span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-500 scale-90 origin-left">
                            {flow.category}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-neutral-500 mt-0.5 flex items-center gap-1">
                          <span>{flow.fromName}</span>
                          <span>➔</span>
                          <span>{flow.toName}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(flow.ts).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Amount */}
                    <div className={`text-xs font-bold font-mono shrink-0 pl-2 ${
                      flow.type === 'income' 
                        ? 'text-emerald-400' 
                        : flow.type === 'expense' 
                          ? 'text-red-400' 
                          : 'text-pink-400'
                    }`}>
                      {flow.type === 'income' ? '+' : flow.type === 'expense' ? '-' : '⇄'}
                      ￥{flow.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
