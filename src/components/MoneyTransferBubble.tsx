import { useState } from 'react';
import type { MoneyTransfer } from '../types';

export function MoneyTransferBubble({
  transfer,
  isFromMe,
  onReceive,
}: {
  transfer: MoneyTransfer;
  isFromMe: boolean;
  onReceive?: (transferId: string) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  const isReceived = transfer.status === 'received';
  const isExpired = transfer.status === 'expired';
  const canReceive = !isFromMe && transfer.status === 'pending' && onReceive;

  // 转账样式
  if (transfer.type === 'transfer') {
    return (
      <div
        className={`rounded-2xl p-4 min-w-[240px] max-w-[280px] ${
          isFromMe
            ? 'bg-[#95ec69]' // 微信发送方绿色
            : 'bg-white' // 微信接收方白色
        }`}
        style={{
          border: isFromMe ? 'none' : '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[32px]">💰</div>
          <div className="flex-1">
            <div className={`text-[16px] font-medium ${isFromMe ? 'text-[#333]' : 'text-[#333]'}`}>
              {isFromMe ? '转账' : '收到转账'}
            </div>
            <div className={`text-[13px] ${isFromMe ? 'text-[#666]' : 'text-[#999]'}`}>
              {transfer.message || '转账给你'}
            </div>
          </div>
        </div>
        <div className={`text-[24px] font-bold ${isFromMe ? 'text-[#333]' : 'text-[#ff9500]'}`}>
          ¥{transfer.amount.toFixed(2)}
        </div>
        {!isFromMe && transfer.status === 'pending' && (
          <button
            onClick={() => onReceive?.(transfer.id)}
            className="w-full mt-3 py-2 rounded-lg bg-[#ff9500] text-white text-[14px] font-medium"
          >
            确认收款
          </button>
        )}
        {isReceived && (
          <div className={`text-[12px] mt-2 ${isFromMe ? 'text-[#666]' : 'text-[#999]'}`}>
            已收款
          </div>
        )}
      </div>
    );
  }

  // 红包样式
  return (
    <div
      onClick={() => {
        if (canReceive) {
          setShowDetail(true);
        }
      }}
      className={`rounded-2xl p-4 min-w-[240px] max-w-[280px] cursor-pointer relative overflow-hidden ${
        isExpired ? 'opacity-50' : ''
      }`}
      style={{
        background: isFromMe
          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)' // 发送方红色渐变
          : 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)', // 接收方金红渐变
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 text-[80px] opacity-10">🧧</div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[32px]">🧧</div>
          <div className="flex-1">
            <div className="text-[16px] font-medium text-white">
              {transfer.message || '恭喜发财，大吉大利'}
            </div>
          </div>
        </div>

        {isReceived && (
          <div className="text-[14px] text-white/80 mt-2">
            已领取 ¥{transfer.amount.toFixed(2)}
          </div>
        )}

        {isExpired && (
          <div className="text-[14px] text-white/80 mt-2">
            红包已过期
          </div>
        )}

        {!isFromMe && !isReceived && !isExpired && (
          <div className="text-[14px] text-white/90 mt-2 flex items-center gap-2">
            <span>点击领取</span>
            <span className="text-[12px]">💰</span>
          </div>
        )}
      </div>

      {/* 领取红包弹窗 */}
      {showDetail && canReceive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(false);
          }}
        >
          <div
            className="bg-gradient-to-b from-[#ff6b6b] to-[#ee5a6f] rounded-3xl p-8 w-[300px] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[64px] mb-4">🧧</div>
            <div className="text-white text-[18px] font-medium mb-6">
              {transfer.message || '恭喜发财，大吉大利'}
            </div>
            <button
              onClick={() => {
                onReceive?.(transfer.id);
                setShowDetail(false);
              }}
              className="w-full py-3 rounded-full bg-[#ffd93d] text-[#ff6b6b] text-[16px] font-bold"
            >
              开
            </button>
            <button
              onClick={() => setShowDetail(false)}
              className="mt-4 text-white/70 text-[14px]"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
