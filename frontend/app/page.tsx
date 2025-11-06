'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfigStore } from '@/lib/store/config';
import { createClient, isClientInitialized, pingBackend } from '@/lib/api/client';
import { useAssistants } from '@/hooks/useAssistants';
import ConfigDialog from '@/components/config/ConfigDialog';

const DEFAULT_API_URL = 'http://127.0.0.1:2024';

export default function Home() {
  const router = useRouter();
  const { apiUrl, isConfigured, setApiUrl, setConfigured, setCurrentAssistant } = useConfigStore();
  const [showConfig, setShowConfig] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);

  // 自动配置和初始化
  useEffect(() => {
    const autoConfig = async () => {
      // 如果已配置，直接初始化
      if (isConfigured && apiUrl && !isClientInitialized()) {
        try {
          createClient(apiUrl);
          setIsInitialized(true);
        } catch (error) {
          console.error('初始化 Client 失败:', error);
        }
      } else if (isConfigured && isClientInitialized()) {
        setIsInitialized(true);
      }
      // 如果未配置，尝试使用默认地址自动配置
      else if (!isConfigured) {
        setIsAutoConfiguring(true);
        try {
          // 测试默认地址
          const isConnected = await pingBackend(DEFAULT_API_URL);

          if (isConnected) {
            // 自动保存配置
            setApiUrl(DEFAULT_API_URL);
            setConfigured(true);
            createClient(DEFAULT_API_URL);
            setIsInitialized(true);
            console.log('✅ 自动配置成功:', DEFAULT_API_URL);
          } else {
            // 连接失败，显示配置对话框
            setShowConfig(true);
          }
        } catch (error) {
          console.error('自动配置失败:', error);
          setShowConfig(true);
        } finally {
          setIsAutoConfiguring(false);
        }
      }
    };

    autoConfig();
  }, [isConfigured, apiUrl, setApiUrl, setConfigured]);

  // 传入 isInitialized 作为 shouldLoad 参数
  const { assistants, isLoading, error } = useAssistants(isInitialized);

  const handleSelectAssistant = async (assistantId: string) => {
    setCurrentAssistant(assistantId);

    // 查找该 Assistant 最近的 Thread
    try {
      const { getClient } = await import('@/lib/api/client');
      const client = getClient();

      const threads = await client.threads.search({
        metadata: { assistant_id: assistantId },
        limit: 1,
      });

      // 如果有最近的 Thread，跳转到该 Thread
      if (threads.length > 0) {
        router.push(`/chat/${threads[0].thread_id}`);
      } else {
        // 没有 Thread，跳转到空白聊天页（用特殊标识）
        router.push(`/chat/new`);
      }
    } catch (err) {
      console.error('查找 Thread 失败:', err);
      // 出错时跳转到新建页面
      router.push(`/chat/new`);
    }
  };

  const handleCloseConfig = () => {
    // 只有在已配置的情况下才允许关闭
    if (isConfigured) {
      setShowConfig(false);
    }
  };

  // 如果正在自动配置或未初始化，显示加载中
  if (isAutoConfiguring || (!isConfigured && !showConfig)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 mb-2">正在连接后台服务...</div>
          <div className="text-sm text-gray-500">{DEFAULT_API_URL}</div>
        </div>
      </div>
    );
  }

  // 如果需要手动配置
  if (showConfig && !isConfigured) {
    return (
      <ConfigDialog
        isOpen={true}
        onClose={handleCloseConfig}
      />
    );
  }

  // 如果已配置但未初始化，显示加载中
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">正在初始化...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">AgentPut</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{apiUrl}</span>
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ⚙️ 配置
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            选择一个 Assistant 开始对话
          </h2>
          <p className="text-gray-600">
            点击下方的 Assistant 卡片创建新对话
          </p>
        </div>

        {/* Assistants Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">正在加载 Assistants...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">❌ {error}</div>
            <button
              onClick={() => setShowConfig(true)}
              className="text-blue-600 hover:underline"
            >
              重新配置后台地址
            </button>
          </div>
        ) : assistants.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            暂无可用的 Assistant
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.map((assistant) => (
              <button
                key={assistant.assistant_id}
                onClick={() => handleSelectAssistant(assistant.assistant_id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {assistant.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  ID: {assistant.assistant_id.slice(0, 8)}...
                </p>
                <div className="text-sm text-gray-500">
                  Graph: {assistant.graph_id}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Config Dialog (只在已配置时允许重新打开) */}
      {showConfig && isConfigured && (
        <ConfigDialog
          isOpen={showConfig}
          onClose={handleCloseConfig}
        />
      )}
    </div>
  );
}
