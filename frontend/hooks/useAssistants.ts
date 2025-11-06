// useAssistants Hook - 获取 Assistants 列表

'use client';

import { useState, useEffect } from 'react';
import { getClient, isClientInitialized } from '@/lib/api/client';
import type { Assistant } from '@/lib/types';

export function useAssistants(shouldLoad: boolean = true) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果不需要加载或 client 未初始化，静默返回
    if (!shouldLoad || !isClientInitialized()) {
      setIsLoading(false);
      return;
    }

    const loadAssistants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const client = getClient();
        const result = await client.assistants.search({ limit: 100 });

        console.log('📋 Assistants API 返回:', result);
        console.log('📋 返回数量:', result?.length || 0);

        setAssistants(result as Assistant[]);
      } catch (err: any) {
        console.error('❌ 加载 Assistants 失败:', err);
        setError(err.message || '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssistants();
  }, [shouldLoad]); // 依赖 shouldLoad，当它变化时重新加载

  return { assistants, isLoading, error };
}
