import React, { useState } from "react";
import { SettingType, PromptTemplate } from "../types";
import { PROMPT_TEMPLATES } from "./PromptSuggestions";
import { Sparkles, FileText, Bot, Compass, ShieldAlert, Sliders } from "lucide-react";

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
  "赛博朋克",
  "古风仙侠",
  "日系二次元",
  "蒸汽朋克",
  "现代悬疑",
  "硬核科幻",
  "西方高魔奇幻",
  "暗黑克苏鲁",
];

const POPULAR_TONES = [
  "冷峻理性",
  "活泼俏皮",
  "沧桑忧郁",
  "史诗宏大",
  "温柔细腻",
  "幽默滑稽",
  "严肃严谨",
];

export const PersonaForm: React.FC<PersonaFormProps> = ({ onSubmit, loading }) => {
  const [type, setType] = useState<SettingType>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_type");
      return (saved as SettingType) || "user_persona";
    } catch {
      return "user_persona";
    }
  });
  const [prompt, setPrompt] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_prompt");
      return saved || "";
    } catch {
      return "";
    }
  });
  const [wordCount, setWordCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_word_count");
      return saved ? parseInt(saved, 10) : 600;
    } catch {
      return 600;
    }
  });
  const [customStyle, setCustomStyle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_custom_style");
      return saved || "";
    } catch {
      return "";
    }
  });
  const [tone, setTone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_tone");
      return saved || "";
    } catch {
      return "";
    }
  });
  const [customStructure, setCustomStructure] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_form_custom_structure");
      return saved || "";
    } catch {
      return "";
    }
  });

  // Automatically save form state to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("persona_generator_form_type", type);
      localStorage.setItem("persona_generator_form_prompt", prompt);
      localStorage.setItem("persona_generator_form_word_count", String(wordCount));
      localStorage.setItem("persona_generator_form_custom_style", customStyle);
      localStorage.setItem("persona_generator_form_tone", tone);
      localStorage.setItem("persona_generator_form_custom_structure", customStructure);
    } catch (e) {
      console.error("Failed to save form to localStorage", e);
    }
  }, [type, prompt, wordCount, customStyle, tone, customStructure]);

  // Auto-fill template values
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

    onSubmit({
      type,
      prompt,
      wordCount,
      customStyle,
      tone,
      customStructure,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Selector Cards for TYPE */}
      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
          <span>选择生成主题</span>
          <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900">必选</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card: User Persona */}
          <button
            type="button"
            onClick={() => {
              setType("user_persona");
              setWordCount(600); // Reset to default typical word count
            }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 ${
              type === "user_persona"
                ? "bg-rose-950/20 border-rose-600 shadow-lg shadow-rose-950/10"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${
              type === "user_persona" ? "bg-rose-900/40 border-rose-700 text-rose-400" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              <FileText size={18} />
            </div>
            <span className="font-semibold text-slate-200 text-sm">用户人设 (User Persona)</span>
            <span className="text-slate-400 text-xs mt-1 leading-relaxed">
              侧重姓名外貌、性格缺点习惯、背景经历与说话风格。适合RPG扮演、设卡制作。
            </span>
          </button>

          {/* Card: XR Persona */}
          <button
            type="button"
            onClick={() => {
              setType("xr_persona");
              setWordCount(600);
            }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 ${
              type === "xr_persona"
                ? "bg-sky-950/20 border-sky-600 shadow-lg shadow-sky-950/10"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${
              type === "xr_persona" ? "bg-sky-900/40 border-sky-700 text-sky-400" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              <Bot size={18} />
            </div>
            <span className="font-semibold text-slate-200 text-sm">Char/AI伴侣虚拟人设</span>
            <span className="text-slate-400 text-xs mt-1 leading-relaxed">
              侧重角色外貌、情感反应模式、互动尺度红线、AI运行边界及对话场景彩蛋建议。
            </span>
          </button>

          {/* Card: Worldbook */}
          <button
            type="button"
            onClick={() => {
              setType("worldbook");
              setWordCount(800);
            }}
            className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 ${
              type === "worldbook"
                ? "bg-amber-950/20 border-amber-600 shadow-lg shadow-amber-950/10"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div className={`p-2 rounded-lg border mb-3 ${
              type === "worldbook" ? "bg-amber-900/40 border-amber-700 text-amber-400" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}>
              <Compass size={18} />
            </div>
            <span className="font-semibold text-slate-200 text-sm">世界书 (Worldbook)</span>
            <span className="text-slate-400 text-xs mt-1 leading-relaxed">
              侧重地理版图势力、社会政体、历史脉络纪元、超自然力量规则及核心专属术语。
            </span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Template Quick-Fill */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500">点击一键套用热门灵感模板：</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PROMPT_TEMPLATES.filter(tpl => tpl.type === type).map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              🚀 {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Core Prompts Keyword Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <span>核心提示词 / 角色描述</span>
            <span className="text-[10px] text-rose-400 font-mono bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">必填</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">支持中文、英文、符号</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            type === "user_persona"
              ? "例如：一个冷酷的古代刺客，平时喜欢雕刻木偶，害怕下雨天..."
              : type === "xr_persona"
              ? "例如：一只来自遥远猫眼星系、傲娇俏皮的小猫耳女仆，负责照顾主人的生活起居..."
              : "例如：一个重力混乱、人们生活在浮空飞艇与浮岛间的蒸汽朋克史诗大陆，科技与古典魔法并存..."
          }
          className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
          required
        />
      </div>

      {/* 4. Fine-Tuning Parameters Accordion / Layout */}
      <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl space-y-5">
        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 tracking-wider uppercase">
          <Sliders size={13} className="text-slate-500" />
          高级参数与自定义配置
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Slider Word Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
              <span>期望生成字数</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={200}
                  max={20000}
                  value={wordCount}
                  onChange={(e) => {
                    const val = Math.max(200, Math.min(20000, Number(e.target.value) || 200));
                    setWordCount(val);
                  }}
                  className="w-18 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-indigo-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500">字</span>
              </div>
            </div>
            
            <input
              type="range"
              min={200}
              max={20000}
              step={100}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            
            {/* Quick Word Counts */}
            <div className="flex items-center gap-1 flex-wrap">
              {[600, 1500, 3000, 5000, 10000, 20000].map((wc) => (
                <button
                  key={wc}
                  type="button"
                  onClick={() => setWordCount(wc)}
                  className={`px-1.5 py-0.5 rounded text-[9px] border transition ${
                    wordCount === wc
                      ? "bg-indigo-950 border-indigo-700 text-indigo-400"
                      : "bg-slate-900 border-slate-800/80 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {wc >= 1000 ? `${wc / 1000}k` : `${wc}`}字
                </button>
              ))}
            </div>
          </div>

          {/* Style & Vibe */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">风格/基调定位 (选填)</label>
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="如：赛博朋克、古风武侠、史诗硬派"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {/* Quick tag list */}
            <div className="flex items-center gap-1 flex-wrap">
              {POPULAR_STYLES.slice(0, 4).map((sty) => (
                <button
                  key={sty}
                  type="button"
                  onClick={() => setCustomStyle(sty)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800/80 text-slate-500 hover:text-slate-300"
                >
                  {sty}
                </button>
              ))}
            </div>
          </div>

          {/* Tone selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">写作笔触与语调 (选填)</label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="如：冷酷理性、活泼俏皮、沧桑忧郁"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {/* Quick tag list */}
            <div className="flex items-center gap-1 flex-wrap">
              {POPULAR_TONES.slice(0, 4).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800/80 text-slate-500 hover:text-slate-300"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Section additions */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">定制特殊字段 / 要求 (选填)</label>
            <input
              type="text"
              value={customStructure}
              onChange={(e) => setCustomStructure(e.target.value)}
              placeholder="如：我想增加「本命武器」、「日常红线」"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              允许在核心大纲结构之外，自定义您关心的细节字段。
            </span>
          </div>
        </div>
      </div>

      {/* 5. Submit Action Button */}
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
          loading || !prompt.trim()
            ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
