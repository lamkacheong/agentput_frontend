'use client';

import type { Todo } from '@/lib/types';

interface TodosMessageProps {
  todos: Todo[];
}

export default function TodosMessage({ todos }: TodosMessageProps) {
  const getIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
    }
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
      <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
        📋 任务计划
      </h4>
      <ul className="space-y-2">
        {todos.map((todo, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm"
          >
            <span className="text-base mt-0.5">{getIcon(todo.status)}</span>
            <span
              className={`flex-1 ${
                todo.status === 'completed'
                  ? 'line-through text-gray-500'
                  : getStatusColor(todo.status)
              }`}
            >
              {todo.content}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
