// 消息解析工具

import type { AIMessage, ToolMessage, ToolCall, Todo } from '@/lib/types';

/**
 * 从 AI 消息中提取 Todos
 */
export function extractTodosFromAIMessage(message: AIMessage): Todo[] | null {
  const todosCall = message.tool_calls?.find(
    (call) => call.name === 'write_todos' || call.name === 'read_todos'
  );

  return todosCall?.args.todos || null;
}

/**
 * 从 AI 消息中提取 Task 信息
 */
export function extractTaskFromAIMessage(message: AIMessage): {
  subagentType: string;
  description: string;
} | null {
  const taskCall = message.tool_calls?.find((call) => call.name === 'task');

  if (!taskCall) return null;

  return {
    subagentType: taskCall.args.subagent_type || 'unknown',
    description: taskCall.args.description || '',
  };
}

/**
 * 从 Tool 消息中提取 Task 结果
 */
export function extractTaskResult(message: ToolMessage): string | null {
  if (message.name !== 'task') return null;
  return message.content;
}

/**
 * 从 Tool 消息中提取 Todos
 */
export function extractTodosFromToolMessage(message: ToolMessage): Todo[] | null {
  if (message.name !== 'write_todos' && message.name !== 'read_todos') {
    return null;
  }

  // 尝试从 content 中解析 todos
  try {
    const match = message.content.match(/Updated todo list to (\[.*\])/);
    if (match) {
      const todos = JSON.parse(match[1].replace(/'/g, '"'));
      return todos;
    }
  } catch (error) {
    console.error('解析 todos 失败:', error);
  }

  return null;
}

/**
 * 检查是否是特殊工具调用（todos 或 task）
 */
export function isSpecialToolCall(toolCall: ToolCall): boolean {
  return (
    toolCall.name === 'write_todos' ||
    toolCall.name === 'read_todos' ||
    toolCall.name === 'task'
  );
}

/**
 * 检查是否是普通工具消息（可折叠）
 */
export function isCollapsibleToolMessage(message: ToolMessage): boolean {
  return (
    message.name !== 'write_todos' &&
    message.name !== 'read_todos' &&
    message.name !== 'task'
  );
}
