import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { AppScreen } from '../components/AppScreen';
import { ListGroup, Row, TextField, PrimaryButton } from '../components/ui';
import type { ApiConfig } from '../types';
import { testChat, testVoice, testImage, type TestResult } from '../apiTest';
import { cls } from '../utils';
import { fetchModels } from '../api';

export function ApiConfigScreen({
  api,
  onChange,
  onBack,
}: {
  api: ApiConfig;
  onChange: (next: ApiConfig) => void;
  onBack: () => void;
}) {
  return (
    <AppScreen title="API 配置中心" onBack={onBack}>
      <div className="space-y-6">
        <Section
          title="Chat 对话 API"
          desc="兼容 OpenAI 格式。填写第三方中转站地址、Key 与模型名。"
          cfg={api.chat}
          onTest={testChat}
          onChange={(patch) => onChange({ ...api, chat: { ...api.chat, ...patch } })}
        />
        <Section
          title="语音 API"
          desc="默认接入 MiniMax（TTS/STT），也可切换为自定义中转站。"
          cfg={api.voice}
          voice
          onTest={testVoice}
          onChange={(patch) => onChange({ ...api, voice: { ...api.voice, ...patch } })}
        />
        <Section
          title="绘图 API"
          desc="兼容 OpenAI 格式或 Stable Diffusion 系接口。"
          cfg={api.image}
          onTest={testImage}
          onChange={(patch) => onChange({ ...api, image: { ...api.image, ...patch } })}
        />
      </div>
    </AppScreen>
  );
}

function Section({
  title,
  desc,
  cfg,
  onChange,
  onTest,
  voice,
}: {
  title: string;
  desc: string;
  cfg: Record<string, string>;
  onChange: (patch: Record<string, string>) => void;
  onTest: (cfg: Record<string, string>) => Promise<TestResult>;
  voice?: boolean;
}) {
  const [showKey, setShowKey] = useState(false);
  const [result, setResult] = useState<TestResult>({ status: 'idle', message: '' });
  const [modelList, setModelList] = useState<string[] | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelErr, setModelErr] = useState('');

  const runTest = async () => {
    setResult({ status: 'testing', message: '' });
    const r = await onTest(cfg);
    setResult(r);
  };

  const pullModels = async () => {
    setModelLoading(true);
    setModelErr('');
    setModelList(null);
    try {
      const ids = await fetchModels(cfg.baseUrl, cfg.apiKey);
      setModelList(ids);
    } catch (e) {
      setModelErr((e as Error).message);
    } finally {
      setModelLoading(false);
    }
  };

  const pickModel = (id: string) => {
    onChange({ model: id });
    setModelList(null);
  };

  return (
    <div>
      <div className="font-title text-lg mb-1">{title}</div>
      <div className="text-[12px] txt-faint mb-3 leading-relaxed">{desc}</div>

      {voice && (
        <div className="mb-3">
          <ListGroup>
            <Row
              label="服务提供商"
              hint="MiniMax 为默认，可切换自定义"
              right={
                <select
                  value={cfg.provider}
                  onChange={(e) => onChange({ provider: e.target.value })}
                  className="glass rounded-lg px-2 h-8 text-[13px] bg-transparent outline-none"
                >
                  <option value="minimax" className="bg-[var(--bg-elev)]">MiniMax</option>
                  <option value="custom" className="bg-[var(--bg-elev)]">自定义</option>
                </select>
              }
            />
          </ListGroup>
        </div>
      )}

      <TextField label="接口地址" value={cfg.baseUrl ?? ''} onChange={(v) => onChange({ baseUrl: v })} placeholder="https://api.example.com/v1" />

      <TextField
        label="API Key"
        value={cfg.apiKey ?? ''}
        onChange={(v) => onChange({ apiKey: v })}
        placeholder="sk-..."
        type={showKey ? 'text' : 'password'}
        right={
          <button onClick={() => setShowKey((s) => !s)} className="tap txt-dim">
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />

      <div className="relative">
        <TextField label="模型名" value={cfg.model ?? ''} onChange={(v) => onChange({ model: v })} placeholder="gpt-4o / stable-diffusion-xl ..." right={
          <button onClick={pullModels} disabled={modelLoading} className="tap txt-dim flex items-center gap-1 text-[12px] shrink-0" title="拉取可用模型">
            {modelLoading ? <Loader2 size={15} className="animate-spin" /> : <><ChevronDown size={16} />拉取</>}
          </button>
        } />
        {modelList && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto no-scrollbar glass rounded-xl border border-[var(--border)] shadow-xl">
            {modelList.map((id) => (
              <button key={id} onClick={() => pickModel(id)} className="tap w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--hover)] truncate">
                {id}
              </button>
            ))}
          </div>
        )}
        {modelErr && <div className="text-[11px] text-[var(--danger)] mt-1">{modelErr}</div>}
      </div>

      {'stylePrompt' in cfg && (
        <label className="block mb-3">
          <div className="text-[12px] txt-dim mb-1">全局风格提示词</div>
          <textarea
            value={cfg.stylePrompt ?? ''}
            onChange={(e) => onChange({ stylePrompt: e.target.value })}
            placeholder="对所有生成图片统一生效的风格描述，例：日系插画、暖色调、柔和光影…"
            rows={3}
            className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none resize-none bg-transparent placeholder:text-[var(--text-faint)]"
          />
        </label>
      )}

      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1">
          <PrimaryButton onClick={runTest} loading={result.status === 'testing'}>测试连接</PrimaryButton>
        </div>
        {result.status !== 'idle' && result.status !== 'testing' && (
          <div className={cls('flex items-center gap-1.5 text-[13px]', result.status === 'ok' ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>
            {result.status === 'ok' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span className="max-w-[120px] truncate">{result.message}</span>
          </div>
        )}
        {result.status === 'testing' && <Loader2 size={18} className="animate-spin txt-dim" />}
      </div>
    </div>
  );
}
