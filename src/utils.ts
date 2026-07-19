// central id generator + small helpers
export const uid = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36));

export const cls = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export const fmtTime = (d: Date) =>
  d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

export const fmtDate = (d: Date) =>
  `${d.getMonth() + 1}月${d.getDate()}日`;

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
