'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义代码块样式
          code({ node, inline, className, children, ...props }) {
            return inline ? (
              <code
                className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className="block bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          // 自定义表格样式
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-100">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-300 px-3 py-2 text-xs">
                {children}
              </td>
            );
          },
          // 自定义标题样式
          h1({ children }) {
            return <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>;
          },
          // 自定义列表样式
          ul({ children }) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm">{children}</li>;
          },
          // 自定义链接样式
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {children}
              </a>
            );
          },
          // 自定义段落样式
          p({ children }) {
            return <p className="my-2 text-sm leading-relaxed">{children}</p>;
          },
          // 自定义引用样式
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-700">
                {children}
              </blockquote>
            );
          },
          // 自定义分割线样式
          hr() {
            return <hr className="my-4 border-gray-300" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// 辅助函数：检测内容是否包含 Markdown 特征
export function isMarkdownContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;

  const markdownPatterns = [
    /^#+\s/m,                    // 标题 (# ## ###)
    /\*\*.*?\*\*/,               // 加粗 (**text**)
    /\*.*?\*/,                   // 斜体 (*text*)
    /\[.*?\]\(.*?\)/,            // 链接 [text](url)
    /```[\s\S]*?```/,            // 代码块
    /`[^`]+`/,                   // 行内代码
    /^\s*[-*+]\s/m,              // 无序列表
    /^\s*\d+\.\s/m,              // 有序列表
    /^\s*>\s/m,                  // 引用
    /\|.*\|.*\|/,                // 表格
    /^---+$/m,                   // 分割线
  ];

  // 如果匹配多个 Markdown 特征，则认为是 Markdown
  const matchCount = markdownPatterns.filter(pattern => pattern.test(content)).length;
  return matchCount >= 2;
}
