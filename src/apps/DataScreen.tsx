import { useRef, useState, useEffect } from 'react';
import { Download, Upload, AlertTriangle, Trash2, Clock } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row } from '../components/ui';
import { Confirm, Modal } from '../components/Sheet';
import type { PersistShape } from '../types';
import { exportData, importData } from '../store';

export function DataScreen({
  state,
  onImport,
  onBack,
  updateSettings,
}: {
  state: PersistShape;
  onImport: (next: PersistShape) => void;
  onBack: () => void;
  updateSettings: (partial: Partial<PersistShape['settings']>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmImport, setConfirmImport] = useState<PersistShape | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAutoBackupSettings, setShowAutoBackupSettings] = useState(false);
  const [err, setErr] = useState('');

  const autoBackupEnabled = state.settings.autoBackupEnabled ?? false;
  const autoBackupFrequency = state.settings.autoBackupFrequency ?? 7;
  const lastAutoBackupTime = state.settings.lastAutoBackupTime ?? 0;

  // 自动备份逻辑
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const checkAndBackup = () => {
      const now = Date.now();
      const daysSinceLastBackup = (now - lastAutoBackupTime) / (1000 * 60 * 60 * 24);

      if (daysSinceLastBackup >= autoBackupFrequency) {
        // 执行自动备份
        exportData(state);
        updateSettings({ lastAutoBackupTime: now });
      }
    };

    // 立即检查一次
    checkAndBackup();

    // 每小时检查一次
    const interval = setInterval(checkAndBackup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoBackupEnabled, autoBackupFrequency, lastAutoBackupTime, state, updateSettings]);

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
          label={<span className="flex items-center gap-2"><Clock size={17} /> 自动备份</span>}
          hint={autoBackupEnabled ? `已开启，每 ${autoBackupFrequency} 天自动备份` : '未开启'}
          onClick={() => setShowAutoBackupSettings(true)}
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

      {/* 自动备份设置弹窗 */}
      <Modal open={showAutoBackupSettings} onClose={() => setShowAutoBackupSettings(false)} title="自动备份设置">
        <div className="space-y-4">
          {/* 开关 */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-medium">启用自动备份</div>
              <div className="text-[11px] txt-faint mt-1">定期自动导出数据备份文件</div>
            </div>
            <button
              onClick={() => updateSettings({ autoBackupEnabled: !autoBackupEnabled })}
              className={`tap w-12 h-6 rounded-full transition-colors ${
                autoBackupEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoBackupEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 频率选择 */}
          {autoBackupEnabled && (
            <div>
              <div className="text-[13px] font-medium mb-2 txt-dim">备份频率</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 1, label: '每天' },
                  { value: 5, label: '每 5 天' },
                  { value: 15, label: '每半个月' },
                  { value: 30, label: '每月' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ autoBackupFrequency: option.value as 1 | 5 | 15 | 30 })}
                    className={`tap py-3 rounded-xl text-[13px] transition-colors ${
                      autoBackupFrequency === option.value
                        ? 'bg-[var(--accent)] text-white'
                        : 'glass txt-dim'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 上次备份时间 */}
          {autoBackupEnabled && lastAutoBackupTime > 0 && (
            <div className="text-[11px] txt-faint text-center pt-2">
              上次备份：{new Date(lastAutoBackupTime).toLocaleString('zh-CN')}
            </div>
          )}

          {/* 说明 */}
          <div className="glass rounded-xl p-3 text-[11px] txt-faint">
            <div className="mb-1">💡 自动备份说明：</div>
            <ul className="list-disc pl-4 space-y-1">
              <li>自动备份会在后台定期导出数据文件</li>
              <li>备份文件会自动下载到浏览器默认下载目录</li>
              <li>建议定期将备份文件转移到安全位置保存</li>
            </ul>
          </div>
        </div>
      </Modal>
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
