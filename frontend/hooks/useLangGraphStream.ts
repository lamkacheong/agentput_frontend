// 使用 @langchain/langgraph-sdk 官方推荐方式的 Hook

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getClient, isClientInitialized } from '@/lib/api/client';
import type { Message } from '@/lib/types';

interface UseLangGraphStreamOptions {
  threadId: string;
  assistantId: string;
}

export function useLangGraphStream({ threadId, assistantId }: UseLangGraphStreamOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  const streamRef = useRef<AsyncGenerator<any> | null>(null);

  // 加载历史消息
  const loadHistory = useCallback(async () => {
    // 如果 Client 未初始化或 threadId 为空，不执行加载
    if (!isClientInitialized()) {
      console.log('⏸ Client 未初始化，跳过历史消息加载');
      return;
    }

    if (!threadId) {
      console.log('⏸ Thread ID 为空，跳过历史消息加载');
      return;
    }

    try {
      const client = getClient();
      const state = await client.threads.getState(threadId);

      console.log('📜 加载历史消息 - Thread:', threadId);

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
    // 如果 Client 未初始化，不执行续传检查
    if (!isClientInitialized()) {
      console.log('⏸ Client 未初始化，跳过续传检查');
      return;
    }

    // 如果 threadId 为空，不执行续传检查
    if (!threadId) {
      console.log('⏸ Thread ID 为空，跳过续传检查');
      return;
    }

    try {
      const client = getClient();
      const runs = await client.runs.list(threadId, { limit: 1 });

      if (runs.length > 0) {
        const latestRun = runs[0];

        if (latestRun.status === 'pending' || latestRun.status === 'running') {
          console.log('🔄 检测到未完成的 Run，自动续传...', latestRun.run_id);

          setIsLoading(true);
          currentRunIdRef.current = latestRun.run_id;

          // 重新连接到正在运行的 Stream，使用双流模式
          const stream = client.runs.stream(
            threadId,
            latestRun.assistant_id,
            {
              streamMode: ['messages', 'values'],
              onDisconnect: 'continue',
              streamSubgraphs: true,
            }
          );

          streamRef.current = stream;

          // 用于跟踪流式消息ID
          let streamingMessageId: string | null = null;

          for await (const chunk of stream) {
            console.log('🔄 续传事件:', chunk.event);

            // metadata 事件
            if (chunk.event === 'metadata' && chunk.data?.run_id) {
              console.log('🆔 续传 Run ID:', chunk.data.run_id);
            }

            // messages/partial 事件：流式消息更新
            if (chunk.event === 'messages/partial' && Array.isArray(chunk.data) && chunk.data.length > 0) {
              const messageChunk = chunk.data[0];

              if (messageChunk.type === 'ai' || messageChunk.type === 'AIMessageChunk') {
                if (!streamingMessageId) {
                  streamingMessageId = messageChunk.id;
                }

                // content 已经是累积的完整内容
                const streamingMessage: Message = {
                  id: messageChunk.id,
                  type: 'ai',
                  content: messageChunk.content || '',
                  tool_calls: messageChunk.tool_calls || [],
                  invalid_tool_calls: messageChunk.invalid_tool_calls || [],
                  usage_metadata: messageChunk.usage_metadata,
                  response_metadata: messageChunk.response_metadata,
                };

                setMessages((prev) => {
                  const updated = [...prev];
                  const existingIndex = updated.findIndex((m) => m.id === streamingMessageId);

                  if (existingIndex >= 0) {
                    updated[existingIndex] = streamingMessage;
                  } else {
                    updated.push(streamingMessage);
                  }

                  return updated;
                });

                console.log('🔄✍️ 续传流式更新:', messageChunk.content?.length || 0, '字符',
                            messageChunk.tool_calls?.length ? `| ${messageChunk.tool_calls.length} 个工具调用` : '');
              }
            }

            // values 事件：更新消息
            if (chunk.event === 'values' && chunk.data?.messages) {
              console.log('💬 续传更新完整消息，数量:', chunk.data.messages.length);
              setMessages(chunk.data.messages as Message[]);

              streamingMessageId = null;
            }
          }

          console.log('✅ 续传完成');
          setIsLoading(false);
          currentRunIdRef.current = null;
          streamRef.current = null;
        }
      }
    } catch (err: any) {
      console.error('❌ 续传失败:', err);
      setIsLoading(false);
      currentRunIdRef.current = null;
      streamRef.current = null;
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

      // 如果 Client 未初始化，不执行发送
      if (!isClientInitialized()) {
        setError('Client 未初始化，请先配置');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const client = getClient();

        // 乐观更新：先添加用户消息
        const userMessage: Message = {
          id: crypto.randomUUID(),
          type: 'human',
          content: input,
        };
        setMessages((prev) => [...prev, userMessage]);

        // 使用 messages 和 values 双流模式
        const stream = client.runs.stream(threadId, assistantId, {
          input: { messages: [{ role: 'user', content: input }] },
          streamMode: ['messages', 'values'],
          onDisconnect: 'continue',
          streamSubgraphs: true,
        });

        streamRef.current = stream;

        console.log('📤 开始流式对话...');

        // 用于跟踪流式消息ID
        let streamingMessageId: string | null = null;

        for await (const chunk of stream) {
          console.log('📥 收到流事件:', chunk.event);

          // metadata 事件：保存 runId
          if (chunk.event === 'metadata' && chunk.data?.run_id) {
            currentRunIdRef.current = chunk.data.run_id;
            console.log('🆔 Run ID:', chunk.data.run_id);
          }

          // messages/partial 事件：流式消息更新（content 已经是累积的完整内容）
          if (chunk.event === 'messages/partial' && Array.isArray(chunk.data) && chunk.data.length > 0) {
            const messageChunk = chunk.data[0];

            // 处理 AI 消息（包括 AIMessageChunk）
            if ((messageChunk.type === 'ai' || messageChunk.type === 'AIMessageChunk')) {
              if (!streamingMessageId) {
                streamingMessageId = messageChunk.id;
              }

              // content 已经是累积的完整内容，直接使用
              const streamingMessage: Message = {
                id: messageChunk.id,
                type: 'ai',
                content: messageChunk.content || '',
                tool_calls: messageChunk.tool_calls || [],
                invalid_tool_calls: messageChunk.invalid_tool_calls || [],
                usage_metadata: messageChunk.usage_metadata,
                response_metadata: messageChunk.response_metadata,
              };

              // 实时更新流式消息
              setMessages((prev) => {
                const updated = [...prev];
                const existingIndex = updated.findIndex((m) => m.id === streamingMessageId);

                if (existingIndex >= 0) {
                  updated[existingIndex] = streamingMessage;
                } else {
                  updated.push(streamingMessage);
                }

                return updated;
              });

              console.log('✍️ 流式更新:', messageChunk.content?.length || 0, '字符',
                          messageChunk.tool_calls?.length ? `| ${messageChunk.tool_calls.length} 个工具调用` : '');
            }
          }

          // values 事件：包含完整的 messages 数组（作为最终确认）
          if (chunk.event === 'values' && chunk.data?.messages) {
            console.log('💬 更新完整消息列表，数量:', chunk.data.messages.length);
            setMessages(chunk.data.messages as Message[]);

            // 重置流式消息ID
            streamingMessageId = null;
          }
        }

        console.log('✅ 流式对话完成');

        currentRunIdRef.current = null;
        streamRef.current = null;
      } catch (err: any) {
        const errorMsg = err.message || '发送消息失败';
        setError(errorMsg);
        console.error('❌ 发送消息错误:', err);
        console.error('错误详情:', err);

        // 如果是中断错误，不显示错误消息
        if (err.name === 'AbortError' || err.message?.includes('abort')) {
          console.log('⏸ 流已被用户中断');
          setError(null);
        }
      } finally {
        setIsLoading(false);
        currentRunIdRef.current = null;
        streamRef.current = null;
      }
    },
    [threadId, assistantId, isLoading]
  );

  // 停止生成
  const stopGeneration = useCallback(async () => {
    try {
      if (currentRunIdRef.current && isClientInitialized()) {
        const client = getClient();
        await client.runs.cancel(threadId, currentRunIdRef.current);
        console.log('⏸ Run 已取消:', currentRunIdRef.current);
        currentRunIdRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current = null;
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
