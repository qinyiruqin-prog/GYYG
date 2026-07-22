import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Download, BookOpen, Layers, Edit2 } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onChangeContent?: (newContent: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onChangeContent }) => {
  const [activeTab, setActiveTab] = useState<"read" | "raw" | "outline">("read");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedSectionIdx, setCopiedSectionIdx] = useState<number | null>(null);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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

  const sections = useMemo(() => {
    if (!content) return [];
    const parts = content.split(/(?=^##\s+)/m);
    const parsed: Array<{ title: string; text: string }> = [];
    if (parts.length > 0 && !parts[0].trim().startsWith("##")) {
      const intro = parts.shift()?.trim();
      if (intro) parsed.push({ title: "引言 / 概述", text: intro });
    }
    parts.forEach((p) => {
      const lines = p.split("\n");
      const titleLine = lines[0].replace(/^##\s+/, "").trim();
      const bodyText = lines.slice(1).join("\n").trim();
      if (titleLine) parsed.push({ title: titleLine, text: bodyText });
    });
    return parsed;
  }, [content]);

  const handleCopySection = async (sectionText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(sectionText);
      setCopiedSectionIdx(index);
      setTimeout(() => setCopiedSectionIdx(null), 2000);
    } catch {}
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-neutral-900/30 px-3 py-2 flex-wrap gap-2">
        <div className="flex p-1 rounded-xl border border-[var(--border)] bg-neutral-900/50">
          <button
            onClick={() => setActiveTab("read")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              activeTab === "read" ? "bg-[var(--accent)] text-white" : "txt-faint hover:txt-dim"
            }`}
          >
            <BookOpen size={14} /> 阅读模式
          </button>
          <button
            onClick={() => setActiveTab("outline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
              activeTab === "outline" ? "bg-[var(--accent)] text-white" : "txt-faint hover:txt-dim"
            }`}
          >
            <Layers size={14} /> 章节面板
          </button>
          {onChangeContent && (
            <button
              onClick={() => setActiveTab("raw")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                activeTab === "raw" ? "bg-[var(--accent)] text-white" : "txt-faint hover:txt-dim"
              }`}
            >
              <Edit2 size={14} /> 编辑源码
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopyAll} className="tap flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass text-[11px] txt-dim hover:txt-accent transition-colors">
            <Copy size={13} /> {copied ? "已复制" : "复制全部"}
          </button>
          <button onClick={handleDownloadMarkdown} className="tap flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass text-[11px] txt-dim hover:txt-accent transition-colors">
            <Download size={13} /> 下载
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto no-scrollbar">
        {activeTab === "read" && (
          <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed text-neutral-200">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-[18px] font-bold txt-accent mb-2 mt-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[16px] font-semibold txt-dim mb-1.5 mt-3 pb-1 border-b border-[var(--border)]">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[14px] font-medium mb-1 mt-2">{children}</h3>,
                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic txt-faint">{children}</em>,
                code: ({ children }) => <code className="bg-neutral-800 px-1 py-0.5 rounded text-[11px] text-pink-300">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-[var(--accent)] pl-3 italic txt-faint">{children}</blockquote>,
                hr: () => <hr className="my-3 border-[var(--border)]" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === "outline" && (
          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div key={idx} className="glass rounded-xl p-3 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[14px] font-medium txt-accent">{sec.title}</h3>
                  <button
                    onClick={() => handleCopySection(sec.text, idx)}
                    className="tap p-1 rounded-lg txt-faint hover:txt-accent transition-colors"
                  >
                    {copiedSectionIdx === idx ? "✅" : "📋"}
                  </button>
                </div>
                <p className="text-[12px] txt-faint leading-relaxed line-clamp-3">{sec.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "raw" && onChangeContent && (
          <textarea
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="w-full h-[400px] glass rounded-xl p-3 text-[13px] font-mono outline-none bg-transparent resize-none leading-relaxed"
          />
        )}
      </div>
    </div>
  );
};
