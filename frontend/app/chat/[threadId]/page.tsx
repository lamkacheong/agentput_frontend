'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '@/lib/store/config';
import { useLangGraphStream } from '@/hooks/useLangGraphStream';
import { useThreads } from '@/hooks/useThreads';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import Sidebar from '@/components/layout/Sidebar';
import { getClient } from '@/lib/api/client';

export default function ChatPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId: paramThreadId } = use(params);
  const router = useRouter();
  const { currentAssistantId } = useConfigStore();
  const [input, setInput] = useState('');
  const [actualThreadId, setActualThreadId] = useState<string | null>(
    paramThreadId === 'new' ? null : paramThreadId
  );

  // 如果是 new，则 threadId 为 null，等发送消息时创建
  const threadId = actualThreadId || '';

  // 先调用所有 hooks
  const { messages, isLoading, error, sendMessage, stopGeneration } = useLangGraphStream({
    threadId,
    assistantId: currentAssistantId || '',
  });

  // 加载当前 Assistant 的所有 Threads
  const { threads, isLoading: threadsLoading, refresh: refreshThreads } = useThreads(currentAssistantId || '');

  // 如果没有选择 Assistant，使用 useEffect 重定向
  useEffect(() => {
    if (!currentAssistantId) {
      router.push('/');
    }
  }, [currentAssistantId, router]);

  // 检查是否有待发送的消息（从 localStorage）
  useEffect(() => {
    if (actualThreadId) {
      const pendingMessage = localStorage.getItem('pendingMessage');
      if (pendingMessage) {
        localStorage.removeItem('pendingMessage');
        console.log('📨 发送待发送的消息:', pendingMessage);
        // 延迟一点确保组件已完全加载
        setTimeout(() => {
          sendMessage(pendingMessage);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualThreadId]);

  // 如果没有 Assistant，显示加载中
  if (!currentAssistantId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">正在跳转...</div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput(''); // 立即清空输入框

    // 如果还没有 Thread，先创建
    if (!actualThreadId && currentAssistantId) {
      try {
        const client = getClient();
        const thread = await client.threads.create({
          metadata: { assistant_id: currentAssistantId },
        });

        console.log('✨ 创建新 Thread:', thread.thread_id);

        // 保存消息到 localStorage，准备在新页面发送
        localStorage.setItem('pendingMessage', messageText);

        // 直接跳转到新创建的 thread 页面
        // 这会触发页面重新加载，useEffect 会检测到 pendingMessage 并发送
        router.push(`/chat/${thread.thread_id}`);
      } catch (err) {
        console.error('创建 Thread 失败:', err);
        alert('创建对话失败，请重试');
        setInput(messageText); // 恢复输入
      }
    } else {
      // 已有 Thread，直接发送
      await sendMessage(messageText);
    }
  };

  const handleNewChat = () => {
    // 直接跳转到新对话页面，不创建 Thread
    router.push(`/chat/new`);
  };

  const handleDeleteThread = async (threadIdToDelete: string) => {
    try {
      const client = getClient();
      await client.threads.delete(threadIdToDelete);
      console.log('✅ Thread 已删除:', threadIdToDelete);

      // 刷新 threads 列表
      await refreshThreads();

      // 如果删除的是当前正在查看的 thread
      if (threadIdToDelete === actualThreadId) {
        // 尝试跳转到列表中的第一个其他 thread
        const remainingThreads = threads.filter(t => t.thread_id !== threadIdToDelete);
        if (remainingThreads.length > 0) {
          router.push(`/chat/${remainingThreads[0].thread_id}`);
        } else {
          // 如果没有其他 thread，跳转到新对话页
          router.push('/chat/new');
        }
      }
    } catch (err) {
      console.error('❌ 删除 Thread 失败:', err);
      alert('删除对话失败，请重试');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              对话
            </h1>
            <span className="text-sm text-gray-500">
              {actualThreadId ? `Thread: ${actualThreadId.slice(0, 8)}...` : '新对话'}
            </span>
          </div>

          {isLoading && (
            <button
              onClick={stopGeneration}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              ⏸ 停止生成
            </button>
          )}
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          threads={threads}
          currentThreadId={actualThreadId || undefined}
          onNewChat={handleNewChat}
          onDeleteThread={handleDeleteThread}
          isLoading={threadsLoading}
        />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
            <MessageList messages={messages} />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto w-full">
              <MessageInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
