// useThreads Hook - 获取 Threads 列表

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClient, isClientInitialized } from '@/lib/api/client';
import type { Thread } from '@/lib/types';

export function useThreads(assistantId?: string) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // 如果 client 未初始化，不执行加载
    if (!isClientInitialized()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = getClient();
      const result = await client.threads.search({
        metadata: assistantId ? { assistant_id: assistantId } : undefined,
        limit: 50,
      });

      console.log('📜 Threads API 返回:', result);
      console.log('📜 返回数量:', result?.length || 0);

      // 按创建时间倒序排列（最新的在前面）
      const sortedThreads = (result as Thread[]).sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setThreads(sortedThreads);
    } catch (err: any) {
      console.error('❌ 加载 Threads 失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [assistantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { threads, isLoading, error, refresh };
}
