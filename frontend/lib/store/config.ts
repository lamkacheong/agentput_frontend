// Zustand 配置存储

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigStore {
  // 后台 API 地址
  apiUrl: string;
  setApiUrl: (url: string) => void;

  // 当前选择的 Assistant
  currentAssistantId: string | null;
  setCurrentAssistant: (id: string | null) => void;

  // 是否已配置
  isConfigured: boolean;
  setConfigured: (configured: boolean) => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      apiUrl: 'http://127.0.0.1:2024',
      setApiUrl: (url) => set({ apiUrl: url }),

      currentAssistantId: null,
      setCurrentAssistant: (id) => set({ currentAssistantId: id }),

      isConfigured: false,
      setConfigured: (configured) => set({ isConfigured: configured }),
    }),
    {
      name: 'agentput-config',
      // 只持久化这些字段
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        currentAssistantId: state.currentAssistantId,
        isConfigured: state.isConfigured,
      }),
    }
  )
);
