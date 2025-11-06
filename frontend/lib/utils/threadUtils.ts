// Thread 相关工具函数

import type { Thread } from '@/lib/types';
import { extractTextContent } from './contentExtractor';

/**
 * 从 Thread 中提取对话标题
 * 优先使用第一条用户消息，截取前30个字符
 */
export function getThreadTitle(thread: Thread): string {
  // 如果有 values.messages，提取第一条用户消息
  if (thread.values?.messages && thread.values.messages.length > 0) {
    const firstUserMessage = thread.values.messages.find(
      (msg) => msg.type === 'human'
    );

    if (firstUserMessage) {
      const text = extractTextContent(firstUserMessage.content);
      // 截取前30个字符，如果太长加省略号
      if (text.length > 30) {
        return text.slice(0, 30) + '...';
      }
      return text || '新对话';
    }
  }

  // 没有消息，返回默认标题
  return '新对话';
}

/**
 * 获取 Thread 的消息数量
 */
export function getThreadMessageCount(thread: Thread): number {
  return thread.values?.messages?.length || 0;
}
