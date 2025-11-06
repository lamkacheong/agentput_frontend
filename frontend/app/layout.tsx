import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPut - AI 对话助手",
  description: "基于 LangGraph 的 AI 对话界面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
