// 提取消息的文本内容

/**
 * 从消息 content 中提取纯文本
 * content 可能是：
 * 1. 字符串: "hello"
 * 2. 对象数组: [{type: "text", text: "hello"}]
 * 3. 其他复杂结构
 */
export function extractTextContent(content: any): string {
  // 如果是字符串，直接返回
  if (typeof content === 'string') {
    return content;
  }

  // 如果是数组，提取所有 text 字段
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object') {
          // 处理 {type: "text", text: "..."} 格式
          if (item.text) {
            return item.text;
          }
          // 处理其他可能的格式
          if (item.content) {
            return extractTextContent(item.content);
          }
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }

  // 如果是对象，尝试提取 text 或 content 字段
  if (content && typeof content === 'object') {
    if (content.text) {
      return content.text;
    }
    if (content.content) {
      return extractTextContent(content.content);
    }
  }

  // 其他情况，转为字符串
  return String(content || '');
}
