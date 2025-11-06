'use client';

import type { Message, ToolMessage } from '@/lib/types';
import UserMessage from './messages/UserMessage';
import AIMessage from './messages/AIMessage';
import ToolMessageDisplay from './messages/ToolMessage';

interface MessageListProps {
  messages: Message[];
}

// 辅助函数：查找工具调用的结果
function findToolResults(messages: Message[], fromIndex: number): Map<string, ToolMessage> {
  const results = new Map<string, ToolMessage>();

  // 从当前消息之后查找对应的工具结果
  for (let i = fromIndex + 1; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.type === 'tool' && msg.tool_call_id) {
      results.set(msg.tool_call_id, msg);
    }
    // 遇到下一个 AI 消息就停止查找
    if (msg.type === 'ai') {
      break;
    }
  }

  return results;
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>开始新对话...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        // 使用 index 和 id 组合确保 key 唯一性
        const key = `${index}-${message.id}`;

        if (message.type === 'human') {
          return <UserMessage key={key} message={message} />;
        } else if (message.type === 'ai') {
          // 为 AI 消息查找对应的工具结果
          const toolResults = findToolResults(messages, index);
          return <AIMessage key={key} message={message} toolResults={toolResults} />;
        } else if (message.type === 'tool') {
          return <ToolMessageDisplay key={key} message={message} />;
        }
        return null;
      })}
    </div>
  );
}
