import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cls } from '../utils';

/* full-screen sheet that slides up inside the phone shell */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative animate-slide-up glass-strong rounded-t-[28px] max-h-[88%] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="w-6" />
          <div className="font-title text-lg">{title}</div>
          <button onClick={onClose} className="tap w-7 h-7 rounded-full glass flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-4 overflow-y-auto no-scrollbar flex-1">{children}</div>
        {footer && <div className="px-5 pb-6 pt-2 shrink-0 border-t border-[var(--border)]">{footer}</div>}
      </div>
    </div>
  );
}

/* centered modal */
export function Modal({
  open,
  onClose,
  title,
  children,
  maxW = 'max-w-sm',
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  maxW?: string;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cls('relative w-full glass-strong rounded-[28px] p-5 pb-6 animate-sheet-up flex flex-col max-h-[85%]', maxW)}>
        {title && (
          <div className="font-title text-[16px] font-bold mb-3.5 text-center shrink-0 border-b border-white/5 pb-2.5">{title}</div>
        )}
        <div className="overflow-y-auto no-scrollbar flex-1 -mx-1 px-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/* small confirm dialog */
export function Confirm({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="text-sm txt-dim leading-relaxed mb-5 text-center">{message}</div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="tap flex-1 h-11 rounded-full glass font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={cls('tap flex-1 h-11 rounded-full font-medium text-white', danger ? 'bg-[var(--danger)]' : 'bg-[var(--accent)]]')}
          style={{ background: danger ? 'var(--danger)' : 'var(--accent-2)' }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
