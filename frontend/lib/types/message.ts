// 消息类型定义

// 基础消息类型
export type MessageType = 'human' | 'ai' | 'tool';

// 工具调用
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  type: 'tool_call';
}

// Todos 结构
export interface Todo {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// 基础消息接口
export interface BaseMessage {
  id: string;
  type: MessageType;
  content: string;
  name?: string | null;
  additional_kwargs?: Record<string, any>;
  response_metadata?: Record<string, any>;
}

// 人类消息
export interface HumanMessage extends BaseMessage {
  type: 'human';
}

// AI 消息
export interface AIMessage extends BaseMessage {
  type: 'ai';
  tool_calls?: ToolCall[];
  invalid_tool_calls?: any[];
  usage_metadata?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    input_token_details?: Record<string, any>;
    output_token_details?: Record<string, any>;
  };
}

// 工具消息
export interface ToolMessage extends BaseMessage {
  type: 'tool';
  tool_call_id: string;
  artifact?: any;
  status?: string;
}

// 联合类型
export type Message = HumanMessage | AIMessage | ToolMessage;

// 消息工具函数
export function isHumanMessage(message: Message): message is HumanMessage {
  return message.type === 'human';
}

export function isAIMessage(message: Message): message is AIMessage {
  return message.type === 'ai';
}

export function isToolMessage(message: Message): message is ToolMessage {
  return message.type === 'tool';
}
