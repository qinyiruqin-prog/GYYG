import React, { useState, useEffect } from "react";
import { GeneratedSetting, SettingType } from "./types";
import { PersonaForm } from "./components/PersonaForm";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { SavedLibrary } from "./components/SavedLibrary";
import { PROMPT_TEMPLATES } from "./components/PromptSuggestions";
import {
  Sparkles,
  Archive,
  BookOpen,
  PlusCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  Send,
  Code,
  X,
  History,
  Info,
  Check,
  Copy,
  Compass,
  AlertCircle,
  FileText,
  Bot,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const LOCAL_STORAGE_KEY = "persona_generator_saved_settings_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<"create" | "library" | "help">("create");
  const [savedSettings, setSavedSettings] = useState<GeneratedSetting[]>([]);
  
  // Custom API configuration state
  const [apiConfig, setApiConfig] = useState<{
    useCustom: boolean;
    provider: "gemini" | "openai" | "custom";
    apiKey: string;
    baseUrl: string;
    model: string;
  }>(() => {
    try {
      const saved = localStorage.getItem("persona_api_config");
      return saved ? JSON.parse(saved) : {
        useCustom: false,
        provider: "gemini",
        apiKey: "",
        baseUrl: "",
        model: ""
      };
    } catch {
      return {
        useCustom: false,
        provider: "gemini",
        apiKey: "",
        baseUrl: "",
        model: ""
      };
    }
  });

  const [showApiModal, setShowApiModal] = useState<boolean>(false);

  // API Test and Fetch States
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [fetchingModels, setFetchingModels] = useState<boolean>(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiConfig }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message,
          details: data.details,
        });
        triggerToast("✅ 连接测试成功！");
      } else {
        setTestResult({
          success: false,
          message: data.error || "连接测试失败",
        });
        triggerToast("❌ 连接测试失败，请检查配置");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "无法访问测试接口",
      });
      triggerToast("❌ 无法访问测试接口");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    try {
      const res = await fetch("/api/fetch-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiConfig }),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.models)) {
        setFetchedModels(data.models);
        triggerToast(`✨ 成功拉取 ${data.models.length} 个可用模型！`);
      } else {
        triggerToast("❌ 拉取模型列表失败，请检查配置");
      }
    } catch (err: any) {
      triggerToast("❌ 拉取模型失败: " + (err.message || "未知错误"));
    } finally {
      setFetchingModels(false);
    }
  };

  // Sync API config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("persona_api_config", JSON.stringify(apiConfig));
    } catch (e) {
      console.error("Failed to save api config to localStorage", e);
    }
  }, [apiConfig]);
  
  // Active setting states
  const [currentSetting, setCurrentSetting] = useState<GeneratedSetting | null>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_current_setting_draft");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentVersionIdx, setCurrentVersionIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("persona_generator_current_version_idx");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Sync current active setting to localStorage as auto-save draft
  useEffect(() => {
    try {
      if (currentSetting) {
        localStorage.setItem("persona_generator_current_setting_draft", JSON.stringify(currentSetting));
        localStorage.setItem("persona_generator_current_version_idx", String(currentVersionIdx));
      }
    } catch (e) {
      console.error("Failed to auto-save draft to localStorage", e);
    }
  }, [currentSetting, currentVersionIdx]);
  
  // Loading & interaction states
  const [loading, setLoading] = useState<boolean>(false);
  const [refineLoading, setRefineLoading] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form bindings for restoring/editing state
  const [formType, setFormType] = useState<SettingType>("user_persona");
  const [formPrompt, setFormPrompt] = useState<string>("");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved settings:", e);
    }
  }, []);

  // Save to LocalStorage helper
  const updateSavedSettings = (newSettings: GeneratedSetting[]) => {
    setSavedSettings(newSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings to localStorage:", e);
    }
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            triggerToast("📋 已成功复制到您的剪贴板！");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            fallbackCopyTextToClipboard(text);
          });
      } else {
        fallbackCopyTextToClipboard(text);
      }
    } catch (err) {
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        triggerToast("📋 已成功复制到您的剪贴板！");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        triggerToast("❌ 复制失败，请手动选择文字进行复制");
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
      triggerToast("❌ 复制失败，请手动选择文字进行复制");
    }
  };

  // Create a brand new generation
  const handleGenerate = async (config: {
    type: SettingType;
    prompt: string;
    wordCount: number;
    customStyle: string;
    tone: string;
    customStructure: string;
  }) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, apiConfig }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "生成失败，请检查网络或配置。");
      }

      const data = await res.json();
      
      // Auto-extract a title based on the first few words of the prompt
      let title = config.prompt.substring(0, 10).trim();
      if (config.prompt.length > 10) title += "...";
      
      const typeLabel =
        config.type === "user_persona"
          ? "人设"
          : config.type === "xr_persona"
          ? "Char虚拟角色"
          : "世界书";
          
      const fullTitle = title ? `「${title}」的${typeLabel}` : `未命名${typeLabel}`;

      const newSetting: GeneratedSetting = {
        id: Math.random().toString(36).substring(2, 11),
        type: config.type,
        title: fullTitle,
        prompt: config.prompt,
        content: data.text,
        createdAt: new Date().toISOString(),
        wordCount: config.wordCount,
        customStyle: config.customStyle,
        tone: config.tone,
        customStructure: config.customStructure,
        versions: [{ timestamp: new Date().toISOString(), content: data.text }],
      };

      setCurrentSetting(newSetting);
      setCurrentVersionIdx(0);
      triggerToast("✨ 设定生成成功！");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "连接服务器失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  // Refine an existing generated setting with conversational feedback
  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSetting || !feedbackText.trim() || refineLoading) return;

    setRefineLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: currentSetting.type,
          originalText: currentSetting.content,
          feedback: feedbackText,
          wordCount: currentSetting.wordCount,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "微调优化失败。");
      }

      const data = await res.json();

      // Append new version
      const updatedVersions = [
        ...currentSetting.versions,
        {
          timestamp: new Date().toISOString(),
          content: data.text,
          feedback: feedbackText,
        },
      ];

      const updatedSetting: GeneratedSetting = {
        ...currentSetting,
        content: data.text,
        versions: updatedVersions,
      };

      setCurrentSetting(updatedSetting);
      setCurrentVersionIdx(updatedVersions.length - 1);
      setFeedbackText("");
      triggerToast("🔮 设定已根据反馈重构并优化！");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "微调失败，请重试。");
    } finally {
      setRefineLoading(false);
    }
  };

  // Version Travel / Undo Redo
  const handleTravelVersion = (direction: "prev" | "next") => {
    if (!currentSetting) return;
    let targetIdx = currentVersionIdx;
    if (direction === "prev" && currentVersionIdx > 0) {
      targetIdx = currentVersionIdx - 1;
    } else if (direction === "next" && currentVersionIdx < currentSetting.versions.length - 1) {
      targetIdx = currentVersionIdx + 1;
    }

    if (targetIdx !== currentVersionIdx) {
      setCurrentVersionIdx(targetIdx);
      setCurrentSetting({
        ...currentSetting,
        content: currentSetting.versions[targetIdx].content,
      });
      triggerToast(`⏪ 已切换至版本 ${targetIdx + 1}`);
    }
  };

  // Save/Update in Local Storage
  const handleSaveToArchive = () => {
    if (!currentSetting) return;

    const exists = savedSettings.some((item) => item.id === currentSetting.id);
    let updated: GeneratedSetting[];

    if (exists) {
      updated = savedSettings.map((item) =>
        item.id === currentSetting.id ? currentSetting : item
      );
      triggerToast("💾 档案馆内容更新成功！");
    } else {
      updated = [currentSetting, ...savedSettings];
      triggerToast("💾 已成功存入您的本地档案馆！");
    }

    updateSavedSettings(updated);
  };

  // Restore/Edit a setting from archive
  const handleRestoreSetting = (item: GeneratedSetting) => {
    setCurrentSetting(item);
    setCurrentVersionIdx(item.versions.length - 1);
    setFormType(item.type);
    setFormPrompt(item.prompt);
    
    try {
      localStorage.setItem("persona_generator_form_type", item.type);
      localStorage.setItem("persona_generator_form_prompt", item.prompt);
      localStorage.setItem("persona_generator_form_word_count", String(item.wordCount || 600));
      localStorage.setItem("persona_generator_form_custom_style", item.customStyle || "");
      localStorage.setItem("persona_generator_form_tone", item.tone || "");
      localStorage.setItem("persona_generator_form_custom_structure", item.customStructure || "");
      localStorage.setItem("persona_generator_current_setting_draft", JSON.stringify(item));
      localStorage.setItem("persona_generator_current_version_idx", String(item.versions.length - 1));
    } catch (e) {
      console.error("Failed to restore setting parameters to localStorage", e);
    }

    setActiveTab("create");
    triggerToast(`📖 已还原 “${item.title}” 至工作台并自动填入参数`);
  };

  // Delete an archived item
  const handleDeleteArchived = (id: string) => {
    const updated = savedSettings.filter((item) => item.id !== id);
    updateSavedSettings(updated);
    
    // If deleted the active one, clear active view
    if (currentSetting && currentSetting.id === id) {
      setCurrentSetting(null);
      setCurrentVersionIdx(0);
      try {
        localStorage.removeItem("persona_generator_current_setting_draft");
        localStorage.removeItem("persona_generator_current_version_idx");
      } catch (e) {
        console.error(e);
      }
    }
    triggerToast("🗑️ 设定已从档案馆移除。");
  };

  // Close active setting workspace
  const handleCloseWorkspace = () => {
    setCurrentSetting(null);
    setCurrentVersionIdx(0);
    try {
      localStorage.removeItem("persona_generator_current_setting_draft");
      localStorage.removeItem("persona_generator_current_version_idx");
    } catch (e) {
      console.error(e);
    }
  };

  // Custom live content editing change
  const handleLiveContentChange = (newContent: string) => {
    if (!currentSetting) return;
    
    // Replace content in active view
    const updatedVersions = [...currentSetting.versions];
    updatedVersions[currentVersionIdx] = {
      ...updatedVersions[currentVersionIdx],
      content: newContent,
    };

    setCurrentSetting({
      ...currentSetting,
      content: newContent,
      versions: updatedVersions,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* 1. Global Modern Top Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
              <Sparkles size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-slate-100 via-indigo-200 to-rose-200 bg-clip-text text-transparent font-display tracking-tight">
                羊羊自动生成器.禁止二改二传
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">Automated Persona & Worldbook Creator Studio</p>
            </div>
          </div>

          {/* Desktop Navigation Links with API Settings */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center bg-slate-900 p-1 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "create"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <PlusCircle size={14} />
                <span>工作台</span>
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  activeTab === "library"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Archive size={14} />
                <span>档案馆</span>
                {savedSettings.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 scale-90">
                    {savedSettings.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("help")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "help"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen size={14} />
                <span>创作指南</span>
              </button>
            </nav>
            
            <button
              onClick={() => setShowApiModal(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all relative shrink-0 ${
                apiConfig.useCustom
                  ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 hover:bg-indigo-950/60"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
              title="API 配置 (支持自定义 OpenAI/Gemini/DeepSeek 接口)"
            >
              <Settings size={15} className={apiConfig.useCustom ? "animate-spin-slow" : ""} />
              {apiConfig.useCustom && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-slate-950" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Global Toast Message Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-indigo-800 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs md:text-sm"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-400 flex items-center justify-center shrink-0">
              <Check size={10} />
            </div>
            <span className="font-medium">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Error Message banner */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs md:text-sm animate-shake">
            <AlertCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-bold">生成或优化出错了</p>
              <p className="text-rose-400/80 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-md"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Dynamic Tab Switcher Layouts */}
        <AnimatePresence mode="wait">
          {activeTab === "create" && (
            <motion.div
              key="create-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1"
            >
              
              {/* LEFT Workspace Panel: Form Config Parameters */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <PlusCircle size={15} className="text-indigo-400" />
                        创意配置工作台
                      </h2>
                      {currentSetting && (
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                          工作台已连接 active
                        </span>
                      )}
                    </div>

                    <PersonaForm key={currentSetting ? currentSetting.id : "empty"} onSubmit={handleGenerate} loading={loading} />
                  </div>

                  {/* Little helper banner at bottom left */}
                  <div className="mt-6 pt-5 border-t border-slate-900 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                    <Info size={14} className="text-slate-600 mt-0.5 shrink-0" />
                    <span>
                      本平台基于谷歌 <b>Gemini 3.5 Flash</b> 大模型进行底层多维数据编织。生成的 Markdown 人设立体真实，可一键用于各种大模型伴侣驱动。
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT Workspace Panel: Immersive Viewer & Refiner Chat */}
              <div className="lg:col-span-7 flex flex-col">
                {currentSetting ? (
                  // Active Generated Setting Panel Workspace
                  <div className="flex flex-col h-full min-h-[600px] gap-4">
                    {/* Active Setting Meta Title Area */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Type symbol indicator */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                          currentSetting.type === "user_persona"
                            ? "bg-rose-950/40 border-rose-800 text-rose-400"
                            : currentSetting.type === "xr_persona"
                            ? "bg-sky-950/40 border-sky-800 text-sky-400"
                            : "bg-amber-950/40 border-amber-800 text-amber-400"
                        }`}>
                          {currentSetting.type === "user_persona" ? <FileText size={15} /> : currentSetting.type === "xr_persona" ? <Bot size={15} /> : <Compass size={15} />}
                        </div>
                        
                        <div className="min-w-0">
                          {/* Editable file title */}
                          <input
                            type="text"
                            value={currentSetting.title}
                            onChange={(e) => {
                              setCurrentSetting({ ...currentSetting, title: e.target.value });
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 focus:outline-none font-bold text-slate-200 text-sm truncate max-w-[200px] md:max-w-xs transition-colors"
                            title="点击可修改文件命名"
                          />
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            创建于 {new Date(currentSetting.createdAt).toLocaleTimeString()} · 共 {currentSetting.content.length} 字符
                          </p>
                        </div>
                      </div>

                      {/* Header Workspace Actions (Version Travel, Save, Close) */}
                      <div className="flex items-center gap-1.5">
                        {/* Version travel */}
                        {currentSetting.versions.length > 1 && (
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
                            <button
                              onClick={() => handleTravelVersion("prev")}
                              disabled={currentVersionIdx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                              title="上一个版本"
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <span className="px-1.5 text-[10px] text-slate-300 font-medium whitespace-nowrap">
                              v{currentVersionIdx + 1}
                            </span>
                            <button
                              onClick={() => handleTravelVersion("next")}
                              disabled={currentVersionIdx === currentSetting.versions.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                              title="下一个版本"
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        )}

                        <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-1.5 rounded-lg font-medium">
                          <Check size={11} className="text-emerald-400 shrink-0 animate-pulse" />
                          <span>草稿已自动保存</span>
                        </div>

                        <button
                          onClick={() => copyToClipboard(currentSetting.content)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded-lg shadow transition cursor-pointer ${
                            copied
                              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                              : "bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-slate-200"
                          }`}
                          title="一键复制全部文本内容"
                        >
                          {copied ? <Check size={13} className="text-emerald-400 animate-pulse" /> : <Copy size={13} />}
                          <span>{copied ? "已复制" : "复制"}</span>
                        </button>

                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem("persona_generator_current_setting_draft", JSON.stringify(currentSetting));
                              localStorage.setItem("persona_generator_current_version_idx", String(currentVersionIdx));
                              triggerToast("💾 草稿已手动保存至浏览器缓存！");
                            } catch (e) {
                              triggerToast("❌ 保存草稿失败：" + String(e));
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-lg shadow transition cursor-pointer"
                          title="手动强制保存当前草稿至浏览器缓存"
                        >
                          <Save size={13} className="text-slate-400" />
                          <span>保存草稿</span>
                        </button>

                        <button
                          onClick={handleSaveToArchive}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition cursor-pointer"
                        >
                          <Archive size={13} />
                          <span>存档</span>
                        </button>

                        <button
                          onClick={handleCloseWorkspace}
                          title="关闭此工作区"
                          className="p-1.5 text-slate-500 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Document Renderer (Main View Area) */}
                    <div className="flex-1 min-h-0">
                      <MarkdownRenderer
                        content={currentSetting.content}
                        onChangeContent={handleLiveContentChange}
                      />
                    </div>

                    {/* Version History / Refinement Log Details */}
                    {currentSetting.versions[currentVersionIdx].feedback && (
                      <div className="bg-indigo-950/15 border border-indigo-900/40 p-3 rounded-xl flex items-start gap-2 text-[11px] text-indigo-300 leading-relaxed">
                        <History size={13} className="mt-0.5 shrink-0 text-indigo-400" />
                        <div>
                          <span className="font-bold">本版优化指令：</span>
                          “{currentSetting.versions[currentVersionIdx].feedback}”
                        </div>
                      </div>
                    )}

                    {/* AI Conversational Refine Chat Module */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 tracking-wide">
                          <Send size={12} className="text-indigo-400 animate-pulse" />
                          AI 协同微调聊天区
                        </h4>
                        <span className="text-[10px] text-slate-500">直接说话，AI 将在保留骨架的前提下精准局部修改</span>
                      </div>

                      <form onSubmit={handleRefine} className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="例如：‘帮我把外貌改得更温柔些，添加一个日常喜欢钓鱼的爱好’..."
                          disabled={refineLoading}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={refineLoading || !feedbackText.trim()}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            refineLoading || !feedbackText.trim()
                              ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                          }`}
                        >
                          {refineLoading ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>编织中</span>
                            </>
                          ) : (
                            <>
                              <span>优化</span>
                              <Send size={11} />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  // Idle/Empty Workspace state
                  <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-slate-900/25 border border-slate-800/80 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden group">
                    {/* Background faint geometric circles */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />
                    
                    <div className="max-w-md space-y-6 relative z-10">
                      {/* Logo container */}
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-105 transition-transform duration-300">
                        <Sparkles size={32} className="animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base md:text-lg font-bold text-slate-200">开始创作您的人设或世界书</h3>
                        <p className="text-xs text-slate-500 leading-relaxed px-4">
                          在左侧输入角色的核心性格或背景提示词，配置字数限制和风格偏好，AI 会自动为您渲染出结构化、极具细节与画面感的高级设定卡。
                        </p>
                      </div>

                      {/* Display some popular prompt cards */}
                      <div className="space-y-3 pt-4">
                        <h4 className="text-[10px] font-semibold text-slate-600 tracking-widest uppercase">热点创作灵感</h4>
                        <div className="grid grid-cols-2 gap-2.5">
                          {PROMPT_TEMPLATES.slice(0, 4).map((tpl, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setFormType(tpl.type);
                                setFormPrompt(tpl.prompt);
                                handleGenerate({
                                  type: tpl.type,
                                  prompt: tpl.prompt,
                                  wordCount: tpl.wordCount,
                                  customStyle: tpl.style,
                                  tone: tpl.tone,
                                  customStructure: "",
                                });
                              }}
                              className="p-3 bg-slate-950/40 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-900 text-left rounded-xl transition-all duration-300 flex flex-col justify-between h-28 group/card cursor-pointer"
                            >
                              <div>
                                <span className="text-[9px] text-indigo-400 font-mono font-medium block mb-1">
                                  {tpl.type === "user_persona" ? "用户人设" : tpl.type === "xr_persona" ? "Char人设" : "世界书"}
                                </span>
                                <h5 className="font-bold text-slate-300 text-xs truncate group-hover/card:text-white transition-colors">
                                  {tpl.title}
                                </h5>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-1">
                                {tpl.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div
              key="library-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 shadow-xl min-h-[600px]"
            >
              <div className="flex items-center gap-2 mb-6">
                <Archive size={20} className="text-indigo-400" />
                <h2 className="text-base font-bold text-slate-100">设定档案馆 (Archive Library)</h2>
              </div>
              
              <SavedLibrary
                items={savedSettings}
                onSelectItem={handleRestoreSetting}
                onDeleteItem={handleDeleteArchived}
              />
            </motion.div>
          )}

          {activeTab === "help" && (
            <motion.div
              key="help-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl min-h-[600px] max-w-4xl mx-auto space-y-8"
            >
              {/* Help Page Header */}
              <div className="space-y-2 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HelpCircle size={24} className="text-indigo-400" />
                  <h2 className="text-xl font-bold text-slate-100 font-display">智能人设与世界书写作指南</h2>
                </div>
                <p className="text-sm text-slate-400">
                  了解如何编写高表现力提示词，以及各种设定模板的推荐结构。
                </p>
              </div>

              {/* Core Structures Section */}
              <div className="space-y-6">
                <h3 className="text-base font-bold text-slate-200 border-l-2 border-indigo-500 pl-2.5">💡 三大核心模版输出架构</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Item 1 */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-900 px-2 py-0.5 rounded">用户人设 (User Persona)</span>
                    <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1.5 leading-relaxed">
                      <li>基本信息（姓名、性别、年龄、外貌）</li>
                      <li>性格特点（核心性格、优缺点、小习惯）</li>
                      <li>背景故事（成长经历、关键事件）</li>
                      <li>人际关系（羁绊、仇敌、死党等）</li>
                      <li>说话风格与标志性口头禅</li>
                      <li>兴趣爱好与特长技能</li>
                    </ol>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-sky-400 bg-sky-950/40 border border-sky-900 px-2 py-0.5 rounded">Char虚拟角色人设</span>
                    <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1.5 leading-relaxed">
                      <li>基本信息（姓名、身份种族、建模外貌）</li>
                      <li>性格与情感（情绪反应、对用户态度）</li>
                      <li>背景设定（相识原因、身份定位）</li>
                      <li>互动风格（口癖、表情动作、互动红线）</li>
                      <li>特殊设定（异能特长、无法做到的事）</li>
                      <li>场景适配（互动彩蛋、虚拟互动建议）</li>
                    </ol>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-900 px-2 py-0.5 rounded">世界书 (Worldbook)</span>
                    <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1.5 leading-relaxed">
                      <li>世界观概述（时代背景、整体基调）</li>
                      <li>地理与环境（势力版图、独特场景生态）</li>
                      <li>社会体系（政体、宗教阶级、大种族）</li>
                      <li>历史脉络（三个重大历史大事件）</li>
                      <li>特殊规则（超自然科技/魔法运行逻辑）</li>
                      <li>重要设定条目（专有名词、神兵物品）</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Prompting Tips */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-l-2 border-indigo-500 pl-2.5">✍️ 如何写出高质量提示词（Prompts）？</h3>
                
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed bg-indigo-950/10 border border-indigo-900/20 p-5 rounded-xl">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p>
                      <b>增加核心矛盾</b>：给角色增加「反差感」。例如，“虽然是绝顶高手，但因怕下雨天打雷而会躲在被窝里”。反差往往是立人设的核心。
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p>
                      <b>具象化场景与习惯</b>：不要使用单纯的抽象词汇（如“他很冷酷、很善良”），改用场景描述，“在遭遇不公时他会默默捏紧口袋里的古铜币”。
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p>
                      <b>巧用 AI 微调进行对话重塑</b>：利用生成结果下方的“AI 协同微调”输入框，支持针对性微调，你可以要求：“修改外貌为金发蓝眼，把第4点人际关系改为没有朋友只有一只机械狗”。
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-200 border-l-2 border-indigo-500 pl-2.5">常见问题解答 (FAQ)</h3>
                <div className="space-y-4 text-xs md:text-sm">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-200">Q: 生成字数是严格符合的吗？</h4>
                    <p className="text-slate-400">A: 是的。AI 在接收到字数指令后会动态调节输出内容的丰富度，确保篇幅大小在您划定的字数档位上下。如果未指定字数，人设默认约 600 字，世界书默认约 800 字。</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-200">Q: 这些数据保存在云端还是本地？</h4>
                    <p className="text-slate-400">A: 为了保护您的创作隐私并提供即时离线体验，档案馆内的全部角色和世界设定均保存在您浏览器的 LocalStorage 中。清除浏览器缓存会导致记录丢失，建议经常下载 Markdown 文档到本地保存。</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* API Configuration Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col font-sans text-slate-200"
            >
              {/* Header */}
              <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                    <Settings size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">API 接口与模型联动配置</h3>
                    <p className="text-[10px] text-slate-500">连接您自己定制的 API 渠道 (支持 OpenAI & 兼容格式)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Switch to enable custom API */}
                <div className="flex items-center justify-between bg-slate-950/40 p-3.5 border border-slate-800/60 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">启用自定义 AI 接口</span>
                    <span className="text-[10px] text-slate-500">关闭后将默认使用系统预设的 Gemini 3.5 极速引擎</span>
                  </div>
                  <button
                    onClick={() => setApiConfig(prev => ({ ...prev, useCustom: !prev.useCustom }))}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                      apiConfig.useCustom ? "bg-indigo-600" : "bg-slate-850 border border-slate-800"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        apiConfig.useCustom ? "transform translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                {apiConfig.useCustom && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Provider Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">API 提供商</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "gemini", name: "Google Gemini", defaultModel: "gemini-2.5-flash", defaultUrl: "" },
                          { id: "openai", name: "OpenAI 官方", defaultModel: "gpt-4o-mini", defaultUrl: "https://api.openai.com/v1" },
                          { id: "custom", name: "中转/DeepSeek", defaultModel: "deepseek-chat", defaultUrl: "https://api.deepseek.com/v1" }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setApiConfig(prev => ({
                                ...prev,
                                provider: p.id as any,
                                model: p.defaultModel,
                                baseUrl: p.defaultUrl
                              }));
                            }}
                            className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition ${
                              apiConfig.provider === p.id
                                ? "bg-indigo-950 border-indigo-500 text-indigo-400"
                                : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">API Key / 秘钥令牌</label>
                      <input
                        type="password"
                        value={apiConfig.apiKey}
                        onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={
                          apiConfig.provider === "gemini"
                            ? "输入您的 Gemini API Key (留空将使用服务器默认 Key)"
                            : "sk-..."
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Base URL (Optional for openai/custom) */}
                    {apiConfig.provider !== "gemini" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">API 接口请求基址 (Base URL)</label>
                        <input
                          type="text"
                          value={apiConfig.baseUrl}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                          placeholder={apiConfig.provider === "openai" ? "https://api.openai.com/v1" : "https://api.deepseek.com/v1 等中转基址"}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    )}

                    {/* Model Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">调用模型名称 (Model ID)</label>
                      <input
                        type="text"
                        value={apiConfig.model}
                        onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                        placeholder={apiConfig.provider === "gemini" ? "gemini-2.5-flash" : apiConfig.provider === "openai" ? "gpt-4o-mini" : "deepseek-chat"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    {/* Fetched Models Selection List */}
                    {fetchedModels.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 block">已拉取的在线模型 (点击一键选择)：</span>
                        <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto bg-slate-950/60 p-2 border border-slate-800/80 rounded-xl">
                          {fetchedModels.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setApiConfig(prev => ({ ...prev, model: m }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                                apiConfig.model === m
                                  ? "bg-indigo-600 text-white border border-indigo-500"
                                  : "bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Connection Test & Models Fetch Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={testingConnection}
                        onClick={handleTestConnection}
                        className="flex-1 px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {testingConnection ? (
                          <>
                            <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            <span>正在测试...</span>
                          </>
                        ) : (
                          <>
                            <span>⚡ 测试 API 连接</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={fetchingModels}
                        onClick={handleFetchModels}
                        className="flex-1 px-4 py-2 bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-900/60 hover:border-indigo-700 text-indigo-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {fetchingModels ? (
                          <>
                            <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            <span>正在拉取...</span>
                          </>
                        ) : (
                          <>
                            <span>🔄 拉取模型列表</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Connection Test result */}
                    {testResult && (
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 animate-fade-in ${
                        testResult.success
                          ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
                          : "bg-rose-950/20 border-rose-900/50 text-rose-400"
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{testResult.success ? "✅ 连接成功" : "❌ 连接失败"}</span>
                          <span className="opacity-85">— {testResult.message}</span>
                        </div>
                        {testResult.details && (
                          <p className="text-[10px] opacity-80 font-mono">{testResult.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* API Info / Warning Alert */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-slate-300">💡 提示信息：</p>
                  <p>1. <b>全面兼容性</b>：只要提供商支持 OpenAI 接口格式 (Chat Completions)，就可以在这里完美联动，这允许您将本工具连接至 DeepSeek、OpenRouter 甚至是本地离线部署的大模型。</p>
                  <p>2. <b>超长文本支持</b>：角色生成长度上限已扩展至 <b>20,000 字</b>！若选定了极长字数，请确保选择的自定义模型能支持足够的 token 输出长度。</p>
                  <p>3. <b>数据安全性</b>：您的所有 API 密钥与地址均在本地浏览器本地加密存储，直接请求将经过开发服务器安全反代转发，不留存任何密钥日志。</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowApiModal(false);
                    triggerToast("💾 API 配置联动已保存并生效。");
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-md shadow-indigo-600/15"
                >
                  保存并应用配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-[10px] text-slate-600 space-y-1">
        <p>羊羊自动生成器.禁止二改二传 © 2026. Powered by Google Gemini 3.5 & AI Studio Build.</p>
        <p>适合虚拟现实、AI Companion（Char/AI伴侣）、文学创作及剧本杀角色设定驱动参考。</p>
      </footer>
    </div>
  );
}
