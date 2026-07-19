export function HomeIndicator({ onHome, dark = false }: { onHome: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onHome}
      aria-label="返回桌面"
      className="absolute bottom-0 inset-x-0 z-40 h-8 flex items-center justify-center pb-safe"
    >
      <span
        className={`block w-32 h-1.5 rounded-full ${dark ? 'bg-black/40' : 'bg-white/60'} tap`}
      />
    </button>
  );
}
