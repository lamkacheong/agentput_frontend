// useChat Hook - 对话管理

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getClient } from '@/lib/api/client';
import type { Message } from '@/lib/types';

interface UseChatOptions {
  threadId: string;
  assistantId: string;
  onError?: (error: string) => void;
}

export function useChat({ threadId, assistantId, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentRunIdRef = useRef<string | null>(null);

  // 加载历史消息
  const loadHistory = useCallback(async () => {
    try {
      const client = getClient();

      // 获取 Thread 的最新状态（包含所有历史消息）
      const state = await client.threads.getState(threadId);

      console.log('📜 加载历史消息 - Thread:', threadId);
      console.log('📜 State:', state);

      if (state?.values?.messages) {
        console.log('📜 消息数量:', state.values.messages.length);
        setMessages(state.values.messages as Message[]);
      } else {
        console.log('📜 没有历史消息');
        setMessages([]);
      }
    } catch (err: any) {
      console.error('❌ 加载历史消息失败:', err);
      setMessages([]);
    }
  }, [threadId]);

  // 检查并续传未完成的 Run
  const reconnectIfNeeded = useCallback(async () => {
    try {
      const client = getClient();

      // 获取该 Thread 的 Runs 列表
      const runs = await client.runs.list(threadId, { limit: 1 });

      if (runs.length > 0) {
        const latestRun = runs[0];

        // 如果最新的 Run 还在运行中，自动续传
        if (latestRun.status === 'pending' || latestRun.status === 'running') {
          console.log('🔄 检测到未完成的 Run，自动续传...', latestRun.run_id);

          setIsLoading(true);
          abortControllerRef.current = new AbortController();
          currentRunIdRef.current = latestRun.run_id;

          // 重新连接到正在运行的 Stream
          const stream = client.runs.join(threadId, latestRun.run_id);

          for await (const event of stream) {
            if (event.data?.messages) {
              setMessages(event.data.messages as Message[]);
            }
          }

          console.log('✅ 续传完成');
          setIsLoading(false);
          currentRunIdRef.current = null;
        }
      }
    } catch (err: any) {
      console.error('❌ 续传失败:', err);
      setIsLoading(false);
    }
  }, [threadId]);

  // 初始化时加载历史并检查续传
  useEffect(() => {
    loadHistory();
    reconnectIfNeeded();
  }, [loadHistory, reconnectIfNeeded]);

  // 发送消息
  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        const client = getClient();

        // 添加用户消息到界面（乐观更新）
        const userMessage: Message = {
          id: crypto.randomUUID(),
          type: 'human',
          content: input,
        };
        setMessages((prev) => [...prev, userMessage]);

        // 创建流式运行
        const stream = client.runs.stream(threadId, assistantId, {
          input: { messages: [{ role: 'user', content: input }] },
          streamMode: 'values',
        });

        // 处理流式事件
        for await (const event of stream) {
          // 保存当前 runId 用于中断
          if (event.data?.run_id) {
            currentRunIdRef.current = event.data.run_id;
          }

          if (event.data?.messages) {
            // 实时更新消息列表
            setMessages(event.data.messages as Message[]);
          }
        }

        currentRunIdRef.current = null;
      } catch (err: any) {
        const errorMsg = err.message || '发送消息失败';
        setError(errorMsg);
        onError?.(errorMsg);
        console.error('发送消息错误:', err);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [threadId, assistantId, isLoading, onError]
  );

  // 停止生成
  const stopGeneration = useCallback(async () => {
    try {
      // 如果有正在运行的 Run，调用取消 API
      if (currentRunIdRef.current) {
        const client = getClient();
        await client.runs.cancel(threadId, currentRunIdRef.current);
        console.log('⏸ Run 已取消:', currentRunIdRef.current);
        currentRunIdRef.current = null;
      }

      // 同时使用 AbortController
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      setIsLoading(false);
    } catch (err) {
      console.error('取消 Run 失败:', err);
      setIsLoading(false);
    }
  }, [threadId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    refresh: loadHistory,
  };
}
