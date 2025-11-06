'use client';

import { useState } from 'react';
import type { ToolMessage as ToolMessageType } from '@/lib/types';
import {
  extractTodosFromToolMessage,
  isCollapsibleToolMessage,
} from '@/lib/utils/message-parser';
import TodosMessage from './TodosMessage';
import TaskMessage from './TaskMessage';

interface ToolMessageProps {
  message: ToolMessageType;
}

export default function ToolMessageDisplay({ message }: ToolMessageProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 检查是否是 Todos 消息
  const todos = extractTodosFromToolMessage(message);
  if (todos) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[70%]">
          <TodosMessage todos={todos} />
        </div>
      </div>
    );
  }

  // 检查是否是 Task 消息
  if (message.name === 'task') {
    return <TaskMessage message={message} />;
  }

  // 普通工具调用消息（可折叠）
  if (isCollapsibleToolMessage(message)) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[70%] w-full">
          <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
            {/* 折叠头 */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-sm flex items-center gap-2 text-gray-700">
                🔧 工具调用: {message.name || '未知'}
              </span>
              <span className="text-gray-500">
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* 折叠内容 */}
            {isOpen && (
              <div className="p-3 pt-0 text-sm space-y-2 border-t border-gray-200">
                <div>
                  <div className="font-medium text-gray-700 mb-1">返回结果:</div>
                  <pre className="p-2 bg-white rounded text-xs overflow-x-auto max-h-40 overflow-y-auto border border-gray-200">
                    {message.content}
                  </pre>
                </div>

                {message.status && (
                  <div className="text-xs text-gray-500">
                    状态: {message.status}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 其他类型的 tool 消息，简单展示
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
        <div className="text-xs text-gray-500 mb-1">工具: {message.name}</div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}
