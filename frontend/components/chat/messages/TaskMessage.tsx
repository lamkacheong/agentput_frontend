'use client';

import type { ToolMessage } from '@/lib/types';
import { extractTaskResult } from '@/lib/utils/message-parser';
import MarkdownContent, { isMarkdownContent } from '../MarkdownContent';

interface TaskMessageProps {
  message: ToolMessage;
}

export default function TaskMessage({ message }: TaskMessageProps) {
  const result = extractTaskResult(message);
  const isMarkdown = result ? isMarkdownContent(result) : false;

  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
        <h4 className="font-semibold text-sm text-purple-900 mb-3 flex items-center gap-2">
          🤖 子任务完成
          {message.status === 'success' && <span className="text-green-600">✓</span>}
        </h4>

        {result && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-purple-700">执行结果:</span>
              {isMarkdown ? (
                <div className="mt-1 p-2 bg-white rounded border border-purple-100 max-h-60 overflow-y-auto">
                  <MarkdownContent content={result} />
                </div>
              ) : (
                <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto max-h-60 overflow-y-auto border border-purple-100">
                  {result}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
