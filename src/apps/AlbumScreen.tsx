import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Images } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { Confirm } from '../components/Sheet';
import type { AlbumImage } from '../types';

export function AlbumScreen({
  images,
  onRemove,
  onBack,
}: {
  images: AlbumImage[];
  onRemove: (id: string) => void;
  onBack: () => void;
}) {
  const [viewer, setViewer] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const openViewer = (idx: number) => setViewer(idx);
  const closeViewer = () => setViewer(null);
  const next = () => setViewer((i) => i === null ? i : (i + 1) % images.length);
  const prev = () => setViewer((i) => i === null ? i : (i - 1 + images.length) % images.length);

  return (
    <AppScreen
      title="相册"
      onBack={onBack}
      right={images.length > 0 ? <button onClick={() => setConfirmClear(true)} className="tap txt-dim"><Trash2 size={18} /></button> : undefined}
    >
      {images.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center -mt-16">
          <div className="w-20 h-20 rounded-full icon-bg flex items-center justify-center mb-4">
            <Images size={36} className="icon-color" />
          </div>
          <div className="font-title text-lg mb-1">还没有照片</div>
          <div className="txt-faint text-sm">去「我的 → 本地资源」导入图片</div>
        </div>
      ) : (
        <>
          <div className="text-[13px] txt-dim mb-3 px-1">{images.length}张照片 · 点击查看大图</div>
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => openViewer(i)}
                className="tap aspect-square rounded-lg overflow-hidden relative group"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* full-screen viewer */}
      {viewer !== null && images[viewer] && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col" style={{ animation: 'fade-in 0.2s ease' }}>
          {/* top bar */}
          <div className="flex items-center justify-between px-4 pt-11 pb-3">
            <button onClick={closeViewer} className="tap w-9 h-9 rounded-full glass flex items-center justify-center"><X size={20} className="text-white" /></button>
            <div className="text-white text-[14px] tabular-nums">{viewer + 1} / {images.length}</div>
            <button onClick={() => { onRemove(images[viewer].id); closeViewer(); }} className="tap w-9 h-9 rounded-full glass flex items-center justify-center"><Trash2 size={18} className="text-white" /></button>
          </div>
          {/* image */}
          <div className="flex-1 flex items-center justify-center px-2 relative">
            {images.length > 1 && (
              <button onClick={prev} className="tap absolute left-2 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"><ChevronLeft size={24} className="text-white" /></button>
            )}
            <img src={images[viewer].url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
            {images.length > 1 && (
              <button onClick={next} className="tap absolute right-2 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"><ChevronRight size={24} className="text-white" /></button>
            )}
          </div>
          {/* tag */}
          <div className="text-center pb-8 text-white/60 text-[13px]">{images[viewer].tag ?? ''}</div>
        </div>
      )}

      <Confirm
        open={confirmClear}
        title="清空相册"
        message="确定删除所有照片吗？"
        danger
        onConfirm={() => { images.forEach((img) => onRemove(img.id)); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </AppScreen>
  );
}
