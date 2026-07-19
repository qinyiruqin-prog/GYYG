import React, { useRef } from 'react';
import { Music as MusicIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import type { MusicTrack, AlbumImage } from '../types';
import { uid, fileToDataUrl } from '../utils';

export function AssetsScreen({
  music,
  album,
  onAddMusic,
  onAddAlbum,
  onClearMusic,
  onClearAlbum,
  onBack,
}: {
  music: MusicTrack[];
  album: AlbumImage[];
  onAddMusic: (t: MusicTrack) => void;
  onAddAlbum: (i: AlbumImage) => void;
  onClearMusic: () => void;
  onClearAlbum: () => void;
  onBack: () => void;
}) {
  const musicRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);

  const pickMusic = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('audio')) continue;
      onAddMusic({ id: uid(), name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f), duration: 0 });
    }
  };
  const pickAlbum = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image')) continue;
      const url = await fileToDataUrl(f);
      onAddAlbum({ id: uid(), url });
    }
  };

  return (
    <AppScreen title="本地资源" onBack={onBack}>
      <div className="text-[12px] txt-faint mb-3 leading-relaxed">
        导入本地音乐与图片。音乐会在桌面小组件和音乐 App 中播放；图片会出现在相册与桌面相册小组件。
        后续阶段将支持表情包压缩包、主题包导入。
      </div>

      <Section
        title="本地音乐"
        icon={<MusicIcon size={16} />}
        count={music.length}
        onAdd={() => musicRef.current?.click()}
        onClear={onClearMusic}
        emptyText="还没有音乐文件"
      >
        {music.map((t) => (
          <div key={t.id} className="px-4 py-2.5 flex items-center gap-3 border-t border-[var(--border)] first:border-t-0">
            <MusicIcon size={15} className="txt-dim shrink-0" />
            <div className="flex-1 min-w-0 text-[14px] truncate">{t.name}</div>
          </div>
        ))}
      </Section>

      <div className="mt-5">
        <Section
          title="相册图片"
          icon={<ImageIcon size={16} />}
          count={album.length}
          onAdd={() => albumRef.current?.click()}
          onClear={onClearAlbum}
          emptyText="还没有图片"
        >
          {album.length > 0 && (
            <div className="p-3 grid grid-cols-4 gap-1.5 border-t border-[var(--border)]">
              {album.map((im) => (
                <img key={im.id} src={im.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
              ))}
            </div>
          )}
        </Section>
      </div>

      <input ref={musicRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => pickMusic(e.target.files)} />
      <input ref={albumRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pickAlbum(e.target.files)} />
    </AppScreen>
  );
}

function Section({
  title,
  icon,
  count,
  onAdd,
  onClear,
  emptyText,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  onAdd: () => void;
  onClear: () => void;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 font-medium">
          {icon} {title} <span className="txt-faint text-[12px]">({count})</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAdd} className="tap w-8 h-8 rounded-full glass flex items-center justify-center txt-accent">
            <Plus size={16} />
          </button>
          {count > 0 && (
            <button onClick={onClear} className="tap text-[12px] txt-faint px-2 py-1">清空</button>
          )}
        </div>
      </div>
      {count === 0 ? (
        <div className="px-4 pb-4 txt-faint text-[13px]">{emptyText}</div>
      ) : (
        children
      )}
    </div>
  );
}
