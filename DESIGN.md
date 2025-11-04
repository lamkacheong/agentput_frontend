# AgentPut Frontend - 技术设计方案

## 一、项目概述

基于 LangGraph API 构建对话式 AI 界面，支持实时流式对话、中断、续传等高级功能。


### 核心需求
1. ✅ 配置后台地址（http://127.0.0.1:2024）
2. ✅ Test Ping 连接测试
3. ✅ 选择 Assistant 进行对话
4. ✅ 支持 Stream 流式输出
5. ✅ 支持中断对话
6. ✅ 支持根据 thread_id 续上对话

前后端对接方式
前端应该本身是一个服务，他使用后台http://127.0.0.1:2024（可配置），使用的API文档在
http://127.0.0.1:2024/docs
为了避免跨域问题，前端应用使用的后台服务，接口统一为/api路由
/api的路由，会被前端服务路由到对应的后台服务


进去页面，会从Assistant列表选择Assistant进行对话
使用api是
http://127.0.0.1:2024/docs#tag/assistants/post/assistants/search

左边的导航栏会拉取Assistant对应存在的会话，使用接口
http://127.0.0.1:2024/docs#tag/threads/post/threads/search
其中用metadata为assistant_id来拉取对应的Assistant的会话（thread）
"metadata": {"assistant_id":"uuid"}

然后点击某个会话，会拉取具体的详情页，
get/threads/{thread_id}/history
你可以使用thread_id:1352696d-9f00-4646-bdb6-a245c1e847fa
来调用，具体看看会返回什么格式的数据
message有几类，user的，ai的，tool的
其中user,ai,的展示是对话的内容，对话框展示
类型是ai的message里面，tool_calls带参数的，说明要调用工具
类型是tool的，说明是工具返回的内容

你需要针对tool类型的message进行展示优化
name为write_todos，read_todos的，说明是计划相关
以一个美观的类型来展示其中的todo类型，一个计划，哪些完成了，哪些进行中，哪些没有完成

还有tool_calls的name是task的，
然后"type": "tool","name": "task",说明是子agent返回的内容
你需要针对这个设计一个展示，让用户知道这是一个让子agent来完成任务的过程

除了task和todos的toolmessage，都是工具调用
因为工具调用的内容可能很长，要可以折叠，藏起来


然后你需要整个对话的流程是这样的
如果是发起一个新对话，先调用
Create Thread
文档
http://127.0.0.1:2024/docs#tag/threads/post/threads
记下thread_id,
再调用create run来创建本会话的新的run
文档
http://localhost:2024/docs#tag/thread-runs/post/threads/{thread_id}/runs/stream

在进入一个会话后，会通过查看现在的run的接口，看看有没有正在进行的run

http://127.0.0.1:2024/threads/d7061688-0b5b-4930-b759-945b0b003612/runs?limit=1000&offset=0&status=running
如果有的话，会调用
http://localhost:2024/docs#tag/thread-runs/post/threads/{thread_id}/runs/stream
来先展示新的run

通过http://localhost:2024/docs#tag/threads/get/threads/{thread_id}/history
这个接口来展示这个会话的历史,通过
https://docs.langchain.com/langsmith/use-stream-react.md
这个文档说的方法来做前端的对接

