'use client';

import type { HumanMessage } from '@/lib/types';
import { extractTextContent } from '@/lib/utils/contentExtractor';

interface UserMessageProps {
  message: HumanMessage;
}

export default function UserMessage({ message }: UserMessageProps) {
  const textContent = extractTextContent(message.content);

  return (
    <div className="flex justify-end">
      <div className="max-w-[70%] bg-blue-500 text-white rounded-lg px-4 py-3">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-lg">👤</span>
          <span className="font-semibold text-sm">用户</span>
        </div>
        <div className="whitespace-pre-wrap break-words">
          {textContent}
        </div>
      </div>
    </div>
  );
}
