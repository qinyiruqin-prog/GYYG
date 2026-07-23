import { useState } from 'react';
import { Modal } from './Sheet';

export function SendMoneyModal({
  open,
  type,
  onClose,
  onSend,
}: {
  open: boolean;
  type: 'transfer' | 'redpacket';
  onClose: () => void;
  onSend: (amount: number, message: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (num > 200) {
      alert('单笔最多 200 元');
      return;
    }
    onSend(num, message);
    setAmount('');
    setMessage('');
  };

  const quickAmounts = type === 'redpacket'
    ? [6.66, 8.88, 16.88, 66.66, 88.88, 166.66]
    : [50, 100, 200, 520, 1314, 5200];

  return (
    <Modal open={open} onClose={onClose} title={type === 'transfer' ? '转账' : '发红包'}>
      <div className="space-y-4">
        {/* 金额输入 */}
        <div>
          <div className="text-[13px] txt-dim mb-2">金额</div>
          <div className="flex items-center gap-2 glass rounded-xl p-3">
            <span className="text-[24px] font-bold txt-accent">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-[24px] font-bold txt-primary outline-none"
              step="0.01"
              max="200"
            />
          </div>
          <div className="text-[11px] txt-faint mt-1">单笔最多 200 元</div>
        </div>

        {/* 快捷金额 */}
        <div>
          <div className="text-[13px] txt-dim mb-2">快捷金额</div>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((num) => (
              <button
                key={num}
                onClick={() => setAmount(num.toString())}
                className="tap py-2 rounded-lg glass text-[13px] txt-dim hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                ¥{num}
              </button>
            ))}
          </div>
        </div>

        {/* 留言 */}
        <div>
          <div className="text-[13px] txt-dim mb-2">
            {type === 'transfer' ? '转账说明' : '红包祝福'}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'transfer'
                ? '添加转账说明（可选）'
                : '恭喜发财，大吉大利'
            }
            className="w-full glass rounded-xl px-3 py-2 text-[14px] txt-primary outline-none"
            maxLength={20}
          />
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-white text-[15px] font-medium tap"
        >
          {type === 'transfer' ? '转账' : '塞钱进红包'}
        </button>

        {/* 说明 */}
        <div className="text-[11px] txt-faint text-center">
          {type === 'redpacket' && '红包24小时内有效，过期自动退回'}
        </div>
      </div>
    </Modal>
  );
}
