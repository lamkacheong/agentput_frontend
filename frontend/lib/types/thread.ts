// Thread 相关类型定义

import type { Message } from './message';

export interface Thread {
  thread_id: string;
  created_at: string;
  updated_at?: string;
  metadata?: {
    assistant_id?: string;
    [key: string]: any;
  };
  values?: {
    messages?: Message[];
    [key: string]: any;
  };
  status?: string;
}

export interface ThreadState {
  values: {
    messages: Message[];
    [key: string]: any;
  };
  next: string[];
  checkpoint: any;
  metadata: Record<string, any>;
  created_at: string;
  parent_checkpoint?: any;
}

export interface Run {
  run_id: string;
  thread_id: string;
  assistant_id: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'timeout' | 'interrupted';
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}
