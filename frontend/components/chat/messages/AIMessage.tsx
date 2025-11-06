'use client';

import { useState } from 'react';
import type { AIMessage as AIMessageType, ToolMessage } from '@/lib/types';
import { extractTodosFromAIMessage, extractTaskFromAIMessage } from '@/lib/utils/message-parser';
import { extractTextContent } from '@/lib/utils/contentExtractor';
import TodosMessage from './TodosMessage';
import MarkdownContent, { isMarkdownContent } from '../MarkdownContent';

interface AIMessageProps {
  message: AIMessageType;
  toolResults?: Map<string, ToolMessage>;
}

export default function AIMessage({ message, toolResults }: AIMessageProps) {
  // 检查是否有 tool_calls
  const todos = extractTodosFromAIMessage(message);
  const taskInfo = extractTaskFromAIMessage(message);
  const textContent = extractTextContent(message.content);

  // 获取其他工具调用（非 write_todos 和 task）
  const otherToolCalls = message.tool_calls?.filter(
    tc => tc.name !== 'write_todos' && tc.name !== 'task'
  ) || [];

  // 判断是否需要显示 AI 消息框
  const hasToolCalls = (message.tool_calls && message.tool_calls.length > 0) || false;
  const showAIBox = textContent || (hasToolCalls && !textContent);

  // 检测是否是 Markdown 内容
  const isMarkdown = textContent ? isMarkdownContent(textContent) : false;

  return (
    <div className="flex justify-start">
      <div className="max-w-[70%]">
        {/* AI 文本消息 */}
        {showAIBox && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-2">
            <div className="flex items-start gap-2 mb-1">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-sm text-gray-700">AI</span>
            </div>
            {textContent ? (
              isMarkdown ? (
                <div className="text-gray-800">
                  <MarkdownContent content={textContent} />
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words text-gray-800">
                  {textContent}
                </div>
              )
            ) : (
              hasToolCalls && (
                <div className="text-gray-500 italic text-sm">正在执行操作...</div>
              )
            )}
          </div>
        )}

        {/* Todos 预览 */}
        {todos && (
          <div className="mt-2">
            <TodosMessage todos={todos} />
          </div>
        )}

        {/* Task 预览 */}
        {taskInfo && (
          <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-sm text-purple-700">调用子任务</span>
            </div>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium text-gray-700">代理类型:</span>{' '}
                <span className="text-purple-600">{taskInfo.subagentType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">任务描述:</span>
                <p className="mt-1 text-gray-600 text-xs max-h-20 overflow-y-auto">
                  {taskInfo.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 其他工具调用 */}
        {otherToolCalls.length > 0 && (
          <div className="mt-2 space-y-2">
            {otherToolCalls.map((toolCall) => {
              const result = toolResults?.get(toolCall.id);

              return (
                <ToolCallCard
                  key={toolCall.id}
                  toolCall={toolCall}
                  result={result}
                />
              );
            })}
          </div>
        )}

        {/* Token 使用信息 */}
        {message.usage_metadata && (
          <div className="mt-2 text-xs text-gray-500">
            Tokens: {message.usage_metadata.input_tokens} in / {message.usage_metadata.output_tokens} out
          </div>
        )}
      </div>
    </div>
  );
}

// 工具调用卡片组件
interface ToolCallCardProps {
  toolCall: {
    id: string;
    name: string;
    args: Record<string, any>;
  };
  result?: ToolMessage;
}

function ToolCallCard({ toolCall, result }: ToolCallCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      {/* 头部 - 可点击折叠/展开 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <span className="font-semibold text-sm text-blue-700">
            调用工具: {toolCall.name}
          </span>
          {result && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              result.status === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {result.status === 'success' ? '✓ 完成' : result.status || '完成'}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* 内容 - 可折叠 */}
      {isOpen && (
        <div className="px-4 pb-3 space-y-3 border-t border-blue-200">
          {/* 参数 */}
          <div>
            <div className="font-medium text-gray-700 text-xs mb-1 mt-2">参数:</div>
            <pre className="bg-white p-2 rounded border border-blue-100 overflow-x-auto text-xs">
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>

          {/* 结果 */}
          {result && (
            <div>
              <div className="font-medium text-gray-700 text-xs mb-1">结果:</div>
              <pre className="bg-white p-2 rounded border border-blue-100 overflow-x-auto max-h-60 overflow-y-auto text-xs">
                {result.content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
