// Assistant 相关类型定义

export interface Assistant {
  assistant_id: string;
  name: string;
  graph_id: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssistantSearchRequest {
  limit?: number;
  offset?: number;
  metadata?: Record<string, any>;
}
