interface SocialImageProps {
  url?: string;
  description: string;
  hasApi: boolean;
  className?: string;
}

export function SocialImage({ url, description, hasApi, className = '' }: SocialImageProps) {
  if (url) {
    // 有图片URL，显示图片
    return (
      <img
        src={url}
        alt={description}
        className={`w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  // 没有图片URL，显示描述框
  return (
    <div
      className={`w-full flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 ${className}`}
    >
      <div className="text-center">
        <div className="text-[24px] mb-2">🖼️</div>
        <div className="text-[12px] txt-dim leading-relaxed">{description}</div>
        {!hasApi && (
          <div className="text-[10px] txt-faint mt-2">未配置图片API</div>
        )}
      </div>
    </div>
  );
}
