import React, { useState } from "react";
import { SettingType, PromptTemplate } from "./types";
import { PROMPT_TEMPLATES } from "./PromptSuggestions";
import { Sparkles, FileText, Bot, Compass, Sliders, Link2 } from "lucide-react";

interface PersonaFormProps {
  onSubmit: (config: {
    type: SettingType;
    prompt: string;
    wordCount: number;
    customStyle: string;
    tone: string;
    customStructure: string;
  }) => void;
  loading: boolean;
}

const POPULAR_STYLES = [
  "赛博朋克", "古风仙侠", "日系二次元", "蒸汽朋克",
  "现代悬疑", "硬核科幻", "西方高魔奇幻", "暗黑克苏鲁",
];

const POPULAR_TONES = [
  "冷峻理性", "活泼俏皮", "沧桑忧郁", "史诗宏大",
  "温柔细腻", "幽默滑稽", "严肃严谨",
];

export const PersonaForm: React.FC<PersonaFormProps> = ({ onSubmit, loading }) => {
  const [type, setType] = useState<SettingType>("user_persona");
  const [prompt, setPrompt] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(600);
  const [customStyle, setCustomStyle] = useState<string>("");
  const [tone, setTone] = useState<string>("");
  const [customStructure, setCustomStructure] = useState<string>("");

  const handleApplyTemplate = (tpl: PromptTemplate) => {
    setType(tpl.type);
    setPrompt(tpl.prompt);
    setWordCount(tpl.wordCount);
    setCustomStyle(tpl.style);
    setTone(tpl.tone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ type, prompt, wordCount, customStyle, tone, customStructure });
  };

  const cardCls = (t: SettingType) =>
    type === t
      ? "glass-strong border-[var(--accent)] shadow-lg"
      : "glass border-[var(--border)] hover:border-[var(--accent)]/50";

  const iconBoxCls = (t: SettingType, color: string) =>
    type === t
      ? `bg-${color}-500/20 border-${color}-500/30 text-${color}-400`
      : "bg-[var(--icon-bg)] border-[var(--border)] txt-dim";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. 选择生成主题 */}
      <div className="space-y-2">
        <label className="text-[13px] font-semibold txt-dim flex items-center gap-1.5">
          选择生成主题
          <span className="text-[10px] txt-accent bg-[var(--icon-bg-active)] px-1.5 py-0.5 rounded">必选</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {/* 关联生成（新增） */}
          <button
            type="button"
            onClick={() => { setType("linked_story"); setWordCount(1500); }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${cardCls("linked_story")}`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${iconBoxCls("linked_story", "violet")}`}>
              <Link2 size={18} />
            </div>
            <span className="font-semibold text-[14px] flex items-center gap-1.5">
              🔗 关联剧情生成 (三位一体)
              <span className="text-[10px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full">NEW</span>
            </span>
            <span className="txt-faint text-[12px] mt-1 leading-relaxed">
              一次生成：用户人设 + 角色人设 + 世界书，三者高度关联、剧情一致。适合CP剧情、互动故事。
            </span>
          </button>

          {/* 用户人设 */}
          <button
            type="button"
            onClick={() => { setType("user_persona"); setWordCount(600); }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${cardCls("user_persona")}`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${iconBoxCls("user_persona", "rose")}`}>
              <FileText size={18} />
            </div>
            <span className="font-semibold text-[14px]">用户人设 (User Persona)</span>
            <span className="txt-faint text-[12px] mt-1 leading-relaxed">
              侧重姓名外貌、性格缺点习惯、背景经历与说话风格。适合RPG扮演、设卡制作。
            </span>
          </button>

          {/* Char/AI伴侣 */}
          <button
            type="button"
            onClick={() => { setType("xr_persona"); setWordCount(600); }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${cardCls("xr_persona")}`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${iconBoxCls("xr_persona", "sky")}`}>
              <Bot size={18} />
            </div>
            <span className="font-semibold text-[14px]">Char/AI伴侣虚拟人设</span>
            <span className="txt-faint text-[12px] mt-1 leading-relaxed">
              侧重角色外貌、情感反应模式、互动尺度红线、AI运行边界及对话场景彩蛋建议。
            </span>
          </button>

          {/* 世界书 */}
          <button
            type="button"
            onClick={() => { setType("worldbook"); setWordCount(800); }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${cardCls("worldbook")}`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${iconBoxCls("worldbook", "amber")}`}>
              <Compass size={18} />
            </div>
            <span className="font-semibold text-[14px]">世界书 (Worldbook)</span>
            <span className="txt-faint text-[12px] mt-1 leading-relaxed">
              侧重地理版图势力、社会政体、历史脉络纪元、超自然力量规则及核心专属术语。
            </span>
          </button>
        </div>
      </div>

      {/* 2. 热门灵感模板 */}
      <div className="space-y-1.5">
        <span className="text-[12px] txt-faint">点击一键套用热门灵感模板：</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PROMPT_TEMPLATES.filter(tpl => tpl.type === type).map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="px-2.5 py-1 text-[12px] glass rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              🚀 {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 核心提示词 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[13px] font-semibold txt-dim flex items-center gap-1.5">
            核心提示词 / 角色描述
            <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">必填</span>
          </label>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            type === "user_persona"
              ? "例如：一个冷酷的古代刺客，平时喜欢雕刻木偶，害怕下雨天..."
              : type === "xr_persona"
              ? "例如：一只来自遥远猫眼星系、傲娇俏皮的小猫耳女仆，负责照顾主人的生活起居..."
              : "例如：一个重力混乱、人们生活在浮空飞艇与浮岛间的蒸汽朋克史诗大陆..."
          }
          className="w-full h-28 glass rounded-xl p-3 text-[14px] outline-none bg-transparent resize-y leading-relaxed placeholder:opacity-40"
          required
        />
      </div>

      {/* 4. 高级参数 */}
      <div className="glass rounded-xl p-4 space-y-4">
        <h4 className="text-[12px] font-semibold txt-faint flex items-center gap-1.5 uppercase tracking-wider">
          <Sliders size={13} className="txt-dim" />
          高级参数与自定义配置
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 字数 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[12px] font-medium">
              <span>期望生成字数</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={200} max={20000}
                  value={wordCount}
                  onChange={(e) => setWordCount(Math.max(200, Math.min(20000, Number(e.target.value) || 200)))}
                  className="w-16 glass rounded px-2 py-0.5 text-center txt-accent font-bold text-[12px] outline-none"
                />
                <span className="txt-faint text-[12px]">字</span>
              </div>
            </div>
            <input
              type="range" min={200} max={20000} step={100}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-1 accent-[var(--accent)] cursor-pointer"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {[600, 1500, 3000, 5000, 10000, 20000].map((wc) => (
                <button
                  key={wc} type="button"
                  onClick={() => setWordCount(wc)}
                  className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                    wordCount === wc
                      ? "bg-[var(--icon-bg-active)] border-[var(--accent)] txt-accent"
                      : "glass border-[var(--border)] txt-faint hover:txt-dim"
                  }`}
                >
                  {wc >= 1000 ? `${wc / 1000}k` : `${wc}`}字
                </button>
              ))}
            </div>
          </div>

          {/* 风格 */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium">风格/基调定位 (选填)</label>
            <input
              type="text" value={customStyle} onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="如：赛博朋克、古风武侠"
              className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none bg-transparent placeholder:opacity-40"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {POPULAR_STYLES.slice(0, 4).map((sty) => (
                <button
                  key={sty} type="button" onClick={() => setCustomStyle(sty)}
                  className="px-1.5 py-0.5 rounded text-[10px] glass border-[var(--border)] txt-faint hover:txt-dim"
                >
                  {sty}
                </button>
              ))}
            </div>
          </div>

          {/* 语调 */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium">写作笔触与语调 (选填)</label>
            <input
              type="text" value={tone} onChange={(e) => setTone(e.target.value)}
              placeholder="如：冷酷理性、活泼俏皮"
              className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none bg-transparent placeholder:opacity-40"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {POPULAR_TONES.slice(0, 4).map((t) => (
                <button
                  key={t} type="button" onClick={() => setTone(t)}
                  className="px-1.5 py-0.5 rounded text-[10px] glass border-[var(--border)] txt-faint hover:txt-dim"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 自定义字段 */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium">定制特殊字段 / 要求 (选填)</label>
            <input
              type="text" value={customStructure} onChange={(e) => setCustomStructure(e.target.value)}
              placeholder="如：本命武器、日常红线"
              className="w-full glass rounded-xl px-3 py-2 text-[13px] outline-none bg-transparent placeholder:opacity-40"
            />
            <span className="text-[10px] txt-faint block">
              允许在核心大纲结构之外，自定义您关心的细节字段。
            </span>
          </div>
        </div>
      </div>

      {/* 5. 提交按钮 */}
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="tap w-full py-3 px-4 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-40"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>AI 深度编织中，请稍候...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>立即唤醒 AI 自动生成人设/世界书</span>
          </>
        )}
      </button>
    </form>
  );
};
