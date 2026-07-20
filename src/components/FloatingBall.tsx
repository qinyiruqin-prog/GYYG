import { useState, useRef } from 'react';

interface FloatingBallProps {
  enabled: boolean;
  onClick: () => void;
}

export function FloatingBall({ enabled, onClick }: FloatingBallProps) {
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const ballRef = useRef<HTMLDivElement>(null);

  if (!enabled) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    // 限制在屏幕范围内
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);

      // 吸附到边缘
      const screenWidth = window.innerWidth;
      const centerX = position.x + 30;

      if (centerX < screenWidth / 2) {
        // 吸附到左边
        setPosition(prev => ({ ...prev, x: 10 }));
      } else {
        // 吸附到右边
        setPosition(prev => ({ ...prev, x: screenWidth - 70 }));
      }
    } else {
      // 没有拖动，触发点击
      onClick();
    }
  };

  return (
    <div
      ref={ballRef}
      className="fixed z-50 w-[60px] h-[60px] cursor-pointer"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'left 0.3s ease-out',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative w-full h-full">
        {/* 悬浮球主体 */}
        <div
          className="w-full h-full rounded-full glass-strong flex items-center justify-center text-[32px] shadow-lg"
          style={{
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s',
          }}
        >
          🐑
        </div>

        {/* 呼吸光晕效果 */}
        {!isDragging && (
          <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: '2s' }} />
        )}
      </div>
    </div>
  );
}
