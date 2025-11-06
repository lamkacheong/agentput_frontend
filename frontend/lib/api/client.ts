// LangGraph Client 管理

import { Client } from '@langchain/langgraph-sdk';

let clientInstance: Client | null = null;

/**
 * 创建新的 LangGraph Client 实例
 */
export function createClient(apiUrl: string): Client {
  clientInstance = new Client({ apiUrl });
  return clientInstance;
}

/**
 * 获取当前的 Client 实例
 * 如果不存在则抛出错误
 */
export function getClient(): Client {
  if (!clientInstance) {
    throw new Error('LangGraph Client 未初始化，请先调用 createClient()');
  }
  return clientInstance;
}

/**
 * 检查 Client 是否已初始化
 */
export function isClientInitialized(): boolean {
  return clientInstance !== null;
}

/**
 * Ping 测试后台连接
 */
export async function pingBackend(apiUrl: string): Promise<boolean> {
  try {
    const testClient = new Client({ apiUrl });
    // 尝试获取 assistants 列表作为连接测试
    await testClient.assistants.search({ limit: 1 });
    return true;
  } catch (error) {
    console.error('Ping 测试失败:', error);
    return false;
  }
}
