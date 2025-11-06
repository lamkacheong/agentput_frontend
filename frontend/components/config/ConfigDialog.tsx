'use client';

import { useState } from 'react';
import { useConfigStore } from '@/lib/store/config';
import { createClient, pingBackend } from '@/lib/api/client';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigDialog({ isOpen, onClose }: ConfigDialogProps) {
  const { apiUrl, setApiUrl, setConfigured } = useConfigStore();
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    setError('');

    try {
      const result = await pingBackend(inputUrl);
      setPingResult(result ? 'success' : 'error');
      if (!result) {
        setError('无法连接到后台服务，请检查地址是否正确');
      }
    } catch (err) {
      setPingResult('error');
      setError('连接失败：' + (err as Error).message);
    } finally {
      setIsPinging(false);
    }
  };

  const handleSave = () => {
    if (pingResult === 'success') {
      setApiUrl(inputUrl);
      setConfigured(true);
      // 创建新的 Client 实例
      createClient(inputUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">配置后台服务</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              后台 API 地址
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setPingResult(null);
                setError('');
              }}
              placeholder="http://127.0.0.1:2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {pingResult === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              ✅ 连接成功！
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePing}
              disabled={isPinging || !inputUrl.trim()}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPinging ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              disabled={pingResult !== 'success'}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              保存配置
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
