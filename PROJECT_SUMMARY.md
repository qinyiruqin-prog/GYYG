# GYYG 项目开发总结文档

## 📋 项目基本信息

- **项目名称：** GYYG (共养有个人) - 角色陪伴系统
- **技术栈：** React + TypeScript + Vite
- **部署平台：** Vercel
- **Git仓库：** https://github.com/qinyiruqin-prog/cloudeYYG.git
- **远程名称：** cloud (单一远程仓库)
- **工作目录：** C:\Users\qxn\Downloads\GYYG-improved

## 🎯 项目定位

从"功能壳子"升级为**真正的角色陪伴生态系统**：
- NPC主动生活、自动发帖、给建议
- AI驱动的智能交互
- 三层记忆系统
- 游戏化体验

## ✨ 核心功能模块（12个应用）

### 基础应用（已完成）
1. **日历应用** - 日程管理、事件提醒
2. **记忆应用** - 三层分层记忆系统
3. **微博应用** - 社交发帖、热搜、NPC互动
4. **推特应用** - 类似微博，英文界面
5. **衣柜应用** - AI搭配生成、穿搭管理
6. **体重管理** - AI角色监督、健康建议

### 高级功能（已完成）
7. **厨房应用** - 烹饪游戏、角色用餐
8. **群聊系统** - 群体记忆共享
9. **约会应用** - 角色约会模拟
10. **音乐应用** - 播放器界面
11. **照片应用** - 图片浏览
12. **设置应用** - 系统配置

## 🚀 6大核心功能升级

### 1. NPC自动发帖+刷新系统 ✅
- **文件：** `src/services/npcPostService.ts`
- **功能：**
  - 根据角色性格生成个性化帖子
  - 定时发帖机制
  - 手动/自动刷新（微博&推特）
  - NPC自动回复用户帖子

### 2. 厨房烹饪小游戏+角色用餐系统 ✅
- **文件：** `src/components/CookingGame.tsx`
- **功能：**
  - 时间管理、火候控制、搅拌操作
  - 随机事件系统
  - 三种结果评分（大成功/普通/失败）
  - 邀请角色来用餐
  - AI自动生成角色反馈
  - 反馈保存到短期记忆

### 3. 记忆系统三层分层架构 ✅
- **文件：** `src/services/memoryLayerService.ts`
- **三层架构：**
  - **长期记忆：** 永久保存（重要度70+或用户标记）
  - **短期记忆：** 7天内（对话、互动）
  - **暂时记忆：** 当前会话（1天TTL）
- **功能：**
  - 自动分层规则
  - 分层筛选和显示
  - 高级搜索（权重匹配）
  - 过期清理机制
  - 记忆关联系统

### 4. 群聊系统+群体记忆共享 ✅
- **文件：** `src/services/groupMemoryService.ts`
- **功能：**
  - 群内对话同步到所有成员
  - 群体记忆共享机制
  - 记忆关联和交叉引用
  - 群聊总结功能
  - 成员视角查看

### 5. 衣柜AI关键词搭配生成 ✅
- **文件：** `src/apps/ClosetScreen.tsx`
- **功能：**
  - AI关键词批量生成搭配
  - 一次生成5-10套方案
  - 用户选择确认添加
  - 保留手动添加功能
  - 搭配历史记录

### 6. 体重管理AI角色监督系统 ✅
- **文件：** `src/apps/WeightManageScreen.tsx`
- **功能：**
  - AI角色监督反馈
  - 根据体重数据给出建议
  - 多角色同时建议
  - 温暖鼓励语气
  - 监督记录存入短期记忆

## 🔧 最近修复

### 微博热搜功能修复 ✅
- **问题：** 热搜话题无法点击，刷新不了
- **修复：**
  - 添加热搜话题点击事件
  - 点击话题生成5-8条AI相关帖子
  - 支持话题帖子刷新
  - 支持返回热搜列表
- **提交：** b286581

## 📁 项目文件结构

```
GYYG-improved/
├── src/
│   ├── apps/               # 12个应用模块
│   │   ├── CalendarScreen.tsx
│   │   ├── MemoryScreen.tsx
│   │   ├── WeiboScreen.tsx
│   │   ├── TwitterScreen.tsx
│   │   ├── ClosetScreen.tsx
│   │   ├── WeightManageScreen.tsx
│   │   ├── KitchenScreen.tsx
│   │   └── ...
│   ├── components/         # 共享组件
│   │   ├── PhoneShell.tsx  # 手机壳容器
│   │   ├── AppScreen.tsx   # 应用页面容器
│   │   ├── CookingGame.tsx # 烹饪游戏
│   │   └── ...
│   ├── services/           # 业务逻辑服务
│   │   ├── npcPostService.ts       # NPC发帖
│   │   ├── memoryLayerService.ts   # 记忆分层
│   │   ├── groupMemoryService.ts   # 群体记忆
│   │   └── ...
│   ├── types.ts            # TypeScript类型定义
│   ├── api.ts              # AI API调用
│   └── utils.ts            # 工具函数
├── dist/                   # 构建输出
└── package.json
```

## 🔑 核心技术要点

### 1. AI集成
- **API调用：** `askAI()`, `askAIJson()`
- **温度控制：** 0.7-0.95（根据场景）
- **Token限制：** 100-500（根据复杂度）

### 2. 状态管理
- 使用React `useState` 管理本地状态
- `localStorage` 持久化数据
- 父子组件通过props传递回调

### 3. 记忆系统
```typescript
interface Memory {
  id: string;
  characterId: string;
  type: 'important' | 'conversation' | 'event' | 'emotion';
  title: string;
  content: string;
  importance: number; // 0-100
  tags?: string[];
  ts: number;
}

interface LayeredMemory extends Memory {
  layer: 'long-term' | 'short-term' | 'temporary';
  expiresAt?: number;
}
```

### 4. NPC发帖系统
```typescript
// 性格特征库驱动
const PERSONALITY_TRAITS = {
  cheerful: ['今天心情超好！', '分享快乐~'],
  calm: ['静静地思考...', '保持平静。'],
  // ...
}

// 生成个性化帖子
generateNPCPostBatch(characters, existingPosts, platform)
```

## 📊 构建信息

- **构建工具：** Vite 6.4.3
- **构建命令：** `npm run build`
- **输出目录：** `dist/`
- **构建产物：**
  - HTML: 1.30 kB (gzip: 0.61 kB)
  - CSS: 94.20 kB (gzip: 14.53 kB)
  - JS: 1,602.51 kB (gzip: 367.30 kB)

## 🚀 部署流程

### 本地开发
```bash
cd C:\Users\qxn\Downloads\GYYG-improved
npm install
npm run dev
```

### 构建
```bash
npm run build
```

### 推送到远程
```bash
git add -A
git commit -m "描述"
git push cloud main
```

### 自动部署
- Vercel自动检测 `cloud` 仓库的推送
- 自动构建 `dist/` 目录
- 部署到 v 开头的链接

## 🎨 UI/UX特点

1. **毛玻璃效果：** `.glass` 类名
2. **渐变主题：** CSS变量 `--accent`, `--bg`, `--border`
3. **响应式设计：** 移动端优先
4. **动画效果：** `tap` 类名、`animate-spin`
5. **图标库：** lucide-react

## 🐛 常见问题与解决

### 1. 热搜无法点击
- **原因：** 缺少点击事件处理
- **解决：** 添加 `onClick={() => handleTrendingClick(t.title)}`

### 2. 构建失败
- **原因：** 语法错误、重复代码
- **解决：** 检查 JSX 闭合、删除多余代码

### 3. 记忆不持久化
- **原因：** 未保存到 localStorage
- **解决：** 在 `PhoneShell.tsx` 中添加 `useEffect` 监听变化

### 4. AI生成内容格式错误
- **原因：** prompt不够明确
- **解决：** 添加明确的格式要求和示例

## 📝 代码规范

### 命名规范
- **组件：** PascalCase (`MemoryScreen`)
- **函数：** camelCase (`handleRefresh`)
- **常量：** UPPER_SNAKE_CASE (`TRENDING_TOPICS`)
- **文件：** PascalCase.tsx

### TypeScript
- 所有props定义接口
- 使用类型推断减少冗余
- 必要时使用 `as` 类型断言

### React
- 功能组件 + Hooks
- 避免深层嵌套
- 合理拆分组件

## 🔄 Git工作流

### 当前配置
```bash
远程仓库: cloud
仓库地址: https://github.com/qinyiruqin-prog/cloudeYYG.git
分支: main
```

### 提交规范
```
类型: 简短描述

详细说明：
- 功能1
- 功能2
```

### 提交类型
- `feat:` 新功能
- `fix:` 修复bug
- `refactor:` 重构
- `style:` 样式调整
- `docs:` 文档更新

## 📈 未来扩展方向

1. **更多AI互动：**
   - 角色主动邀约
   - 情感分析系统
   - 个性化建议

2. **社交功能：**
   - 多人群聊
   - 私信系统
   - 朋友圈

3. **游戏化：**
   - 成就系统
   - 等级系统
   - 任务系统

4. **数据分析：**
   - 互动频率统计
   - 记忆热力图
   - 角色关系网

## 🎯 关键代码片段

### AI调用示例
```typescript
const sys = '你在生成XXX。返回JSON：{...}';
const prompt = '请生成...';
const data = await askAIJson<Type>(api, sys, prompt, {
  temperature: 0.8,
  maxTokens: 300
});
```

### 记忆分层判断
```typescript
export function determineMemoryLayer(memory: Memory): MemoryLayer {
  if (memory.importance >= 70) return 'long-term';
  if (memory.type === 'important' || memory.type === 'event') return 'long-term';
  if (memory.type === 'conversation' || memory.type === 'emotion') return 'short-term';
  return 'short-term';
}
```

### NPC发帖逻辑
```typescript
export function generateNPCPostBatch(
  characters: Character[],
  existingPosts: SocialPost[],
  platform: 'weibo' | 'twitter',
  count: number = 3
): SocialPost[] {
  // 随机选择角色
  // 根据性格生成内容
  // 返回帖子数组
}
```

## 📞 联系方式

- **开发者：** 用户
- **项目周期：** 2024年（当前）
- **维护状态：** 活跃开发中

---

**最后更新：** 2024年（当前会话）
**文档版本：** 1.0
**项目状态：** ✅ 生产就绪

