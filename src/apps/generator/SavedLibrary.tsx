import React, { useState } from "react";
import { GeneratedSetting, SettingType } from "./types";
import { Search, Trash2, Calendar, FileText, ChevronRight, User, Eye, Sparkles, Copy, Check } from "lucide-react";

interface SavedLibraryProps {
  items: GeneratedSetting[];
  onSelectItem: (item: GeneratedSetting) => void;
  onDeleteItem: (id: string) => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  items,
  onSelectItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<SettingType | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          })
          .catch(() => {
            fallbackCopy(id, text);
          });
      } else {
        fallbackCopy(id, text);
      }
    } catch (e) {
      fallbackCopy(id, text);
    }
  };

  const fallbackCopy = (id: string, text: string) => {
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
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customStyle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || item.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeName = (type: SettingType) => {
    switch (type) {
      case "user_persona":
        return "用户人设";
      case "xr_persona":
        return "Char虚拟角色";
      case "worldbook":
        return "世界书";
    }
  };

  const getTypeColor = (type: SettingType) => {
    switch (type) {
      case "user_persona":
        return "bg-rose-950/40 border-rose-800 text-rose-400";
      case "xr_persona":
        return "bg-sky-950/40 border-sky-800 text-sky-400";
      case "worldbook":
        return "bg-amber-950/40 border-amber-800 text-amber-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索已有设定、提示词或风格..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Filter Type Buttons */}
        <div className="flex bg-slate-900/50 p-1 border border-slate-800/80 rounded-xl overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterType === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType("user_persona")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterType === "user_persona"
                ? "bg-rose-600 text-white"
                : "text-slate-400 hover:text-rose-200"
            }`}
          >
            用户人设
          </button>
          <button
            onClick={() => setFilterType("xr_persona")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterType === "xr_persona"
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:text-sky-200"
            }`}
          >
            Char/AI伴侣
          </button>
          <button
            onClick={() => setFilterType("worldbook")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              filterType === "worldbook"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-amber-200"
            }`}
          >
            世界书
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl text-slate-500">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-3 text-slate-400">
            <FileText size={28} />
          </div>
          <p className="text-sm font-medium">暂无相匹配的设定记录</p>
          <p className="text-xs text-slate-600 mt-1">您生成的设定保存在此，随时可以还原并继续微调。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col h-56 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-md hover:border-slate-700/80 hover:bg-slate-900 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/20 flex items-start justify-between gap-3">
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getTypeColor(item.type)}`}>
                      {getTypeName(item.type)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.wordCount}字级
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                </div>
                
                {/* Trash delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除“${item.title}”这一设定吗？此操作无法撤销。`)) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all shrink-0"
                  title="删除此设定"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Body Brief Description */}
              <div className="flex-1 p-4 text-xs text-slate-400 overflow-hidden line-clamp-3 leading-relaxed">
                <span className="text-slate-300 font-medium">提示词：</span>
                {item.prompt}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-950/30 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    className="flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer text-slate-400 hover:text-emerald-400"
                    title="一键复制全部文本内容"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={13} className="text-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-bold">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>复制设定</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSelectItem(item)}
                    className="flex items-center gap-1 text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors group/btn"
                  >
                    <span>还原编辑</span>
                    <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
