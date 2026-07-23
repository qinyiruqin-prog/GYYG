import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, FileJson, Edit2, BookOpen, Layers, Sparkles } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onChangeContent?: (newContent: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onChangeContent,
}) => {
  const [activeTab, setActiveTab] = useState<"read" | "raw" | "outline">("read");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSectionIdx, setCopiedSectionIdx] = useState<number | null>(null);

  // Copy whole document
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // Export as Markdown file
  const handleDownloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `persona_setting_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as JSON config file
  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify({ content, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `persona_setting_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract sections by split on "## " to build interactive outline
  const sections = useMemo(() => {
    if (!content) return [];
    
    const parts = content.split(/(?=^##\s+)/m);
    const parsed: Array<{ title: string; text: string }> = [];

    // Check if there is some header text before the first "##"
    if (parts.length > 0 && !parts[0].trim().startsWith("##")) {
      const intro = parts.shift()?.trim();
      if (intro) {
        parsed.push({ title: "引言 / 概述", text: intro });
      }
    }

    parts.forEach((p) => {
      const lines = p.split("\n");
      const titleLine = lines[0].replace(/^##\s+/, "").trim();
      const bodyText = lines.slice(1).join("\n").trim();
      if (titleLine) {
        parsed.push({ title: titleLine, text: bodyText });
      }
    });

    return parsed;
  }, [content]);

  // Copy specific section
  const handleCopySection = async (sectionText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(sectionText);
      setCopiedSectionIdx(index);
      setTimeout(() => setCopiedSectionIdx(null), 2000);
    } catch (err) {
      console.error("Failed to copy section!", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Renderer Header / Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 flex-wrap gap-2">
        {/* Left Side Tab Controls */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("read")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "read"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen size={14} />
            <span>阅读模式</span>
          </button>
          <button
            onClick={() => setActiveTab("outline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "outline"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers size={14} />
            <span>章节面板</span>
          </button>
          {onChangeContent && (
            <button
              onClick={() => setActiveTab("raw")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "raw"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Edit2 size={14} />
              <span>实时编辑</span>
            </button>
          )}
        </div>

        {/* Right Side File Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyAll}
            title="一键复制全部"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            {copied ? <Check size={14} className="text-green-400 animate-scale-in" /> : <Copy size={14} />}
            <span>{copied ? "已复制" : "复制全部"}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            title="导出 Markdown"
            className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleDownloadJSON}
            title="导出 JSON 设定"
            className="p-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          >
            <FileJson size={14} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-950/25">
        {activeTab === "read" && (
          <div className="markdown-body prose prose-slate prose-invert max-w-none text-slate-300 leading-relaxed space-y-4">
            {/* Custom render styling overriding raw prose */}
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-lg md:text-xl font-semibold text-indigo-400 border-b border-indigo-950/60 pb-1.5 mt-8 mb-4 flex items-center gap-2"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-semibold text-sky-400 mt-6 mb-3" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-sm md:text-base leading-relaxed text-slate-300 mb-4" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1.5 mb-4 pl-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-1" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-sm md:text-base text-slate-300" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-indigo-500 bg-indigo-950/20 px-4 py-2 my-4 rounded-r-lg italic text-slate-300 text-sm" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-xs text-rose-400"
                    {...props}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === "outline" && (
          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Sparkles size={32} className="text-slate-600 mb-2" />
                <p className="text-xs">未检测到结构化的章节标题。</p>
              </div>
            ) : (
              sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-b border-slate-800/50">
                    <h3 className="text-xs md:text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-[10px] font-mono flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {sec.title}
                    </h3>
                    <button
                      onClick={() => handleCopySection(sec.text, idx)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
                    >
                      {copiedSectionIdx === idx ? (
                        <Check size={11} className="text-green-400" />
                      ) : (
                        <Copy size={11} />
                      )}
                      <span>{copiedSectionIdx === idx ? "已复制" : "复制该节"}</span>
                    </button>
                  </div>
                  <div className="p-4 text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {sec.text}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "raw" && onChangeContent && (
          <div className="h-full flex flex-col">
            <label className="text-xs text-slate-500 font-mono mb-2">
              您可直接修改以下 Markdown 文档以手动润色：
            </label>
            <textarea
              value={content}
              onChange={(e) => onChangeContent(e.target.value)}
              className="flex-1 w-full min-h-[400px] bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            />
          </div>
        )}
      </div>
    </div>
  );
};
