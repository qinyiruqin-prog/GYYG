import { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Trash2 } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import { Confirm, Modal } from '../components/Sheet';
import type { PersistShape } from '../types';
import { exportData, importData } from '../store';

export function DataScreen({
  state,
  onImport,
  onBack,
}: {
  state: PersistShape;
  onImport: (next: PersistShape) => void;
  onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmImport, setConfirmImport] = useState<PersistShape | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setErr('');
    try {
      const parsed = await importData(file);
      setConfirmImport(parsed);
    } catch (e) {
      setErr((e as Error).message || '导入失败');
    }
  };

  const handleClearAll = () => {
    try {
      // 清除所有 localStorage
      localStorage.clear();

      // 清除所有 sessionStorage
      sessionStorage.clear();

      // 强制硬刷新（绕过缓存）
      window.location.href = window.location.href.split('?')[0] + '?_t=' + Date.now();
    } catch (err) {
      alert('清除失败：' + (err as Error).message);
    }
  };

  const stats = {
    users: state.settings.users.length,
    partitions: state.settings.partitions.length,
    music: state.settings.music.length,
    images: state.settings.albumImages.length,
  };

  return (
    <AppScreen title="数据备份" onBack={onBack}>
      <div className="text-[12px] txt-faint mb-3 leading-relaxed">
        所有数据保存在本地浏览器中。导出为单个文件用于备份或换设备；导入会覆盖当前数据。
      </div>

      <div className="glass rounded-2xl p-4 mb-4">
        <div className="text-[13px] txt-dim mb-2">当前数据概览</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat n={stats.users} label="身份" />
          <Stat n={stats.partitions} label="分区" />
          <Stat n={stats.music} label="音乐" />
          <Stat n={stats.images} label="图片" />
        </div>
      </div>

      <ListGroup>
        <Row
          label={<span className="flex items-center gap-2"><Download size={17} /> 导出数据</span>}
          hint="打包所有角色/聊天/设置为一个文件"
          onClick={() => exportData(state)}
        />
        <Row
          label={<span className="flex items-center gap-2"><Upload size={17} /> 导入数据</span>}
          hint="从备份文件恢复"
          onClick={() => fileRef.current?.click()}
        />
        <Row
          label={<span className="flex items-center gap-2 text-[var(--warn)]"><Trash2 size={17} /> 清除所有数据</span>}
          hint="删除所有本地数据并重置应用"
          onClick={() => setConfirmClear(true)}
        />
      </ListGroup>

      {err && (
        <Modal open onClose={() => setErr('')} title="导入失败">
          <div className="text-sm text-center txt-dim">{err}</div>
        </Modal>
      )}

      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      <Confirm
        open={!!confirmImport}
        title="确认导入"
        message={
          <span className="flex flex-col items-center gap-2">
            <AlertTriangle size={24} className="text-[var(--warn)]" />
            <span>导入将覆盖当前所有数据，确定继续？</span>
          </span>
        }
        confirmText="覆盖导入"
        danger
        onConfirm={() => { if (confirmImport) onImport(confirmImport); setConfirmImport(null); }}
        onCancel={() => setConfirmImport(null)}
      />

      <Confirm
        open={confirmClear}
        title="清除所有数据"
        message={
          <span className="flex flex-col items-center gap-2">
            <AlertTriangle size={24} className="text-[var(--warn)]" />
            <span>这将删除所有角色、聊天、设置、论坛帖子等所有数据，且无法恢复！确定继续？</span>
          </span>
        }
        confirmText="清除所有数据"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </AppScreen>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-title text-2xl txt-accent">{n}</div>
      <div className="text-[11px] txt-faint">{label}</div>
    </div>
  );
}
