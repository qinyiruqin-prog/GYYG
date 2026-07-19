import React from 'react';
import { cls } from '../utils';

export function ListGroup({ children }: { children: React.ReactNode }) {
  return <div className="glass rounded-2xl overflow-hidden divide-y divide-[var(--border)]">{children}</div>;
}

export function Row({
  label,
  hint,
  right,
  onClick,
  danger,
}: {
  key?: any;
  label: React.ReactNode;
  hint?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      disabled={!onClick}
      onClick={onClick}
      className={cls(
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        onClick && 'tap',
        danger && 'text-[var(--danger)]',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[15px]">{label}</div>
        {hint && <div className="text-[12px] txt-faint mt-0.5 truncate">{hint}</div>}
      </div>
      {right}
    </button>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  right,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  right?: React.ReactNode;
}) {
  return (
    <label className="block mb-3">
      <div className="text-[12px] txt-dim mb-1">{label}</div>
      <div className="flex items-center gap-2 glass rounded-xl px-3 h-11">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[var(--text-faint)]"
        />
        {right}
      </div>
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="tap w-full h-11 rounded-full font-medium text-black disabled:opacity-50"
      style={{ background: 'var(--accent)' }}
    >
      {loading ? '处理中…' : children}
    </button>
  );
}
