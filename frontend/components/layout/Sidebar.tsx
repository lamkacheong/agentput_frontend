'use client';

import { useRouter } from 'next/navigation';
import { Trash2, MessageSquare } from 'lucide-react';
import type { Thread } from '@/lib/types';
import { getThreadTitle, getThreadMessageCount } from '@/lib/utils/threadUtils';

interface SidebarProps {
  threads: Thread[];
  currentThreadId?: string;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
  isLoading?: boolean;
}

export default function Sidebar({
  threads,
  currentThreadId,
  onNewChat,
  onDeleteThread,
  isLoading,
}: SidebarProps) {
  const router = useRouter();

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${threadId}`);
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation(); // 防止触发 thread 点击
    if (confirm('确定要删除这个对话吗？')) {
      onDeleteThread(threadId);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
        >
          ✚ 新建对话
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            加载中...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            暂无对话历史
          </div>
        ) : (
          <div className="py-2">
            {threads.map((thread) => (
              <div
                key={thread.thread_id}
                className={`relative group border-l-4 transition-colors ${
                  currentThreadId === thread.thread_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-transparent'
                }`}
              >
                <button
                  onClick={() => handleThreadClick(thread.thread_id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm font-medium text-gray-900 truncate pr-8 flex-1">
                      {getThreadTitle(thread)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>
                      {new Date(thread.created_at).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-gray-400">
                      {getThreadMessageCount(thread)} 条消息
                    </span>
                  </div>
                </button>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => handleDelete(e, thread.thread_id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity"
                  title="删除对话"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
