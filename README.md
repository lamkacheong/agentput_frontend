# AgentPut Frontend

基于 LangGraph 的 Deep Agent 前端展示界面，提供可视化的 Agent 执行流程和交互体验。

## 技术栈

- **React 18** - 现代化的 UI 框架
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具
- **TailwindCSS** - 实用优先的 CSS 框架
- **Ant Design / shadcn/ui** - 高质量的 UI 组件库
- **React Flow / D3.js** - 流程图可视化
- **Zustand / Redux Toolkit** - 状态管理
- **React Query** - 数据获取和缓存
- **WebSocket / SSE** - 实时通信

## 功能特性

### 核心功能

- 🤖 **对话交互** - 与 LangGraph Agent 进行实时对话
- 📊 **流程可视化** - 展示 Agent 的执行流程图和节点状态
- 📝 **执行历史** - 查看和管理 Agent 的历史执行记录
- ⚙️ **配置管理** - 配置 Agent 参数和行为
- 🔍 **实时监控** - 监控 Agent 执行状态和性能指标

### 界面布局

```
┌─────────────────────────────────────────────────┐
│              顶部导航栏                          │
├──────────┬──────────────────────┬───────────────┤
│          │                      │               │
│  侧边栏  │    主工作区          │   右侧面板    │
│  - 历史  │    - 对话界面        │   - 流程图    │
│  - 配置  │    - 可视化展示      │   - 节点详情  │
│          │                      │   - 日志      │
└──────────┴──────────────────────┴───────────────┘
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm/yarn

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 生产环境构建
pnpm build

# 预览构建产物
pnpm preview
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm type-check

# 格式化代码
pnpm format
```

## 项目结构

```
agentput_frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件（图片、字体等）
│   ├── components/        # 可复用组件
│   │   ├── chat/         # 对话相关组件
│   │   ├── flow/         # 流程图组件
│   │   ├── common/       # 通用组件
│   │   └── layout/       # 布局组件
│   ├── features/         # 功能模块
│   │   ├── agent/        # Agent 相关
│   │   ├── history/      # 历史记录
│   │   └── settings/     # 设置配置
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # API 服务
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 根组件
│   └── main.tsx          # 入口文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 环境变量

在项目根目录创建 `.env` 文件：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws

# 其他配置
VITE_APP_TITLE=AgentPut
VITE_APP_VERSION=1.0.0
```

## API 接口

### WebSocket 连接

```typescript
// 连接到 Agent 执行流
ws://localhost:8000/ws/agent/{session_id}

// 消息格式
{
  "type": "chat" | "flow_update" | "status",
  "data": {...}
}
```

### REST API

```typescript
// 获取会话列表
GET /api/sessions

// 创建新会话
POST /api/sessions

// 获取会话详情
GET /api/sessions/{id}

// 发送消息
POST /api/sessions/{id}/messages

// 获取流程图
GET /api/sessions/{id}/flow
```

## 开发指南

### 组件开发规范

- 使用函数组件和 Hooks
- 遵循单一职责原则
- 使用 TypeScript 进行类型约束
- 组件命名使用 PascalCase
- 文件名与组件名保持一致

### 状态管理

使用 Zustand 进行轻量级状态管理：

```typescript
// src/store/agentStore.ts
import { create } from 'zustand';

interface AgentState {
  sessionId: string | null;
  messages: Message[];
  flowData: FlowData | null;
  setSessionId: (id: string) => void;
  addMessage: (message: Message) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  sessionId: null,
  messages: [],
  flowData: null,
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
}));
```

### 样式规范

使用 TailwindCSS 进行样式开发：

```tsx
// 优先使用 Tailwind 工具类
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <Button className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600">
    发送
  </Button>
</div>
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t agentput-frontend .

# 运行容器
docker run -p 80:80 agentput-frontend
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

## 性能优化

- ✅ 代码分割和懒加载
- ✅ 图片和资源优化
- ✅ 使用 CDN 加速静态资源
- ✅ 启用 Gzip/Brotli 压缩
- ✅ 使用虚拟滚动处理大列表
- ✅ React.memo 优化重渲染
- ✅ 使用 useMemo/useCallback 缓存计算结果

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository](https://github.com/your-username/agentput_frontend)
- 问题反馈: [Issues](https://github.com/your-username/agentput_frontend/issues)

---

⭐ 如果这个项目对你有帮助，欢迎给个 Star！
