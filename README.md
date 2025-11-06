# AgentPut Frontend

基于 LangGraph 的 AI Agent 前端展示界面，提供流式对话、工具调用可视化和实时交互体验。

## 简介

这是一个用于展示和交互 LangGraph Agent 的现代化前端应用。用户可以通过对话界面与 Agent 交互，实时查看流式响应、工具调用过程、子任务执行和任务进度，并管理历史会话记录。

## 技术栈

- **Next.js 15 + React 19** - 现代化的全栈 React 框架
- **TypeScript** - 类型安全的开发体验
- **TailwindCSS** - 实用优先的 CSS 框架
- **LangGraph SDK** - LangGraph 官方 JavaScript SDK
- **Zustand** - 轻量级状态管理

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn 或 pnpm
- 后端 LangGraph 服务运行在 `http://127.0.0.1:2024`

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:3000

### 其他命令

```bash
# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 功能特性

- ✅ **流式对话** - 实时显示 AI 响应，支持打字机效果
- ✅ **工具调用可视化** - 展示工具调用参数和执行结果
- ✅ **子任务追踪** - 显示 subagent 执行过程
- ✅ **任务进度** - Todo 列表实时更新（pending/in_progress/completed）
- ✅ **多 Assistant 支持** - 选择不同的 Agent 进行对话
- ✅ **会话管理** - 创建、切换和删除对话
- ✅ **延迟创建** - Thread 在首次发送消息时创建
- ✅ **断线续传** - 自动恢复未完成的对话

## 项目结构

```
frontend/
├── app/                    # Next.js 应用路由
│   ├── page.tsx           # 首页 - Assistant 选择
│   └── chat/[threadId]/   # 对话页面
├── components/            # React 组件
│   ├── chat/             # 对话相关组件
│   │   ├── messages/     # 消息类型组件
│   │   ├── ChatInput.tsx # 输入框
│   │   └── MessageList.tsx # 消息列表
│   └── layout/           # 布局组件
├── hooks/                # 自定义 Hooks
│   ├── useAssistants.ts  # Assistant 管理
│   ├── useThreads.ts     # Thread 管理
│   └── useLangGraphStream.ts # 流式对话
├── lib/                  # 工具库
│   ├── api/             # API 客户端
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   └── store/           # Zustand 状态管理
└── public/              # 静态资源
```

## 环境配置

默认后端地址: `http://127.0.0.1:2024`

如需修改，请编辑 `lib/api/client.ts` 中的 API_URL 配置。
