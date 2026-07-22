import React, { useState } from "react";
import { GeneratedSetting, SettingType } from "./types";
import { Search, Trash2, Calendar, FileText, User, Eye, Sparkles, Copy } from "lucide-react";

interface SavedLibraryProps {
  items: GeneratedSetting[];
  onSelectItem: (item: GeneratedSetting) => void;
  onDeleteItem: (id: string) => void;
}

export const SavedLibrary: React.FC<SavedLibraryProps> = ({
  items, onSelectItem, onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<SettingType | "all">("all");

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const typeLabel = (t: SettingType) =>
    t === "user_persona" ? "用户人设" : t === "xr_persona" ? "虚拟人设" : "世界书";

  const typeEmoji = (t: SettingType) =>
    t === "user_persona" ? "👤" : t === "xr_persona" ? "🤖" : "📖";

  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      <div className="flex gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索..."
          className="flex-1 glass rounded-xl px-3 h-10 text-[14px] outline-none bg-transparent placeholder:opacity-40"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as SettingType | "all")}
          className="glass rounded-xl px-3 h-10 text-[14px] outline-none bg-transparent"
        >
          <option value="all">全部</option>
          <option value="user_persona">用户人设</option>
          <option value="xr_persona">虚拟人设</option>
          <option value="worldbook">世界书</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 txt-faint text-[13px]">暂无生成记录</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass rounded-xl p-3 flex items-center gap-3 hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
              onClick={() => onSelectItem(item)}
            >
              <div className="text-2xl shrink-0">{typeEmoji(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">{item.title}</div>
                <div className="text-[11px] txt-faint mt-0.5">
                  {typeLabel(item.type)} · {item.wordCount}字 · {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                className="tap p-1.5 rounded-lg txt-faint hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
