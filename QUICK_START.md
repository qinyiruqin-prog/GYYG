# GYYG 快速开发指南

## 🚀 快速启动

### 1. 进入项目目录
```bash
cd C:\Users\qxn\Downloads\GYYG-improved
```

### 2. 开发模式
```bash
npm run dev
# 访问 http://localhost:5173
```

### 3. 构建项目
```bash
npm run build
```

### 4. 推送部署
```bash
git add -A
git commit -m "描述更改"
git push cloud main
```

## 📋 常用命令速查

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `git status` | 查看文件状态 |
| `git log --oneline -10` | 查看最近10次提交 |
| `git push cloud main` | 推送到远程仓库 |

## 🎯 添加新应用的步骤

### 1. 创建应用文件
```bash
# 在 src/apps/ 创建新文件
src/apps/NewAppScreen.tsx
```

### 2. 应用模板
```typescript
import { useState } from 'react';
import { AppScreen } from '../components/AppScreen';
import type { Character, ApiConfig } from '../types';

export function NewAppScreen({
  api,
  characters,
  onBack,
}: {
  api: ApiConfig;
  characters: Character[];
  onBack: () => void;
}) {
  const [data, setData] = useState([]);

  return (
    <AppScreen title="新应用" icon="📱" onBack={onBack}>
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
        {/* 你的内容 */}
      </div>
    </AppScreen>
  );
}
```

### 3. 注册到手机壳
在 `src/components/PhoneShell.tsx` 中：

```typescript
// 1. 导入应用
import { NewAppScreen } from '../apps/NewAppScreen';

// 2. 添加到应用列表
const apps = [
  // ... 其他应用
  { id: 'new_app', name: '新应用', icon: '📱', color: '#8b5cf6' },
];

// 3. 添加路由
if (open === 'new_app')
  return (
    <NewAppScreen
      api={settings.api}
      characters={settings.characters}
      onBack={goHome}
    />
  );
```

## 🛠️ 添加新服务模块

### 1. 创建服务文件
```bash
src/services/myService.ts
```

### 2. 服务模板
```typescript
import type { Character } from '../types';

export function myServiceFunction(
  characters: Character[],
  input: string
): ResultType {
  // 业务逻辑
  return result;
}
```

### 3. 在应用中使用
```typescript
import { myServiceFunction } from '../services/myService';

// 在组件中调用
const result = myServiceFunction(characters, input);
```

## 🎨 UI组件速查

### 基础容器
```typescript
<AppScreen title="标题" icon="📱" onBack={onBack}>
  {/* 内容 */}
</AppScreen>
```

### 毛玻璃卡片
```typescript
<div className="glass rounded-2xl p-4">
  {/* 内容 */}
</div>
```

### 按钮
```typescript
<button className="tap w-full h-11 rounded-full glass font-medium">
  点击我
</button>

<button 
  className="tap w-full h-11 rounded-full font-medium text-[var(--bg)]" 
  style={{ background: 'var(--accent)' }}
>
  主要按钮
</button>
```

### 输入框
```typescript
<input
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="请输入..."
  className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent"
/>
```

### 文本域
```typescript
<textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  rows={4}
  className="w-full glass rounded-xl px-3 py-2.5 text-[14px] outline-none bg-transparent resize-none"
/>
```

### 选择框
```typescript
<select 
  value={selected} 
  onChange={(e) => setSelected(e.target.value)}
  className="w-full glass rounded-xl px-3 h-11 text-[14px] outline-none bg-transparent"
>
  <option value="">选择...</option>
  {items.map(item => (
    <option key={item.id} value={item.id}>{item.name}</option>
  ))}
</select>
```

### 标签页切换
```typescript
const [tab, setTab] = useState<'tab1' | 'tab2'>('tab1');

<div className="flex border-b border-[var(--border)]">
  <button 
    onClick={() => setTab('tab1')} 
    className={`tap text-[15px] font-medium pb-2 relative ${tab === 'tab1' ? 'txt-accent' : 'txt-faint'}`}
  >
    标签1
    {tab === 'tab1' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
  </button>
  <button 
    onClick={() => setTab('tab2')} 
    className={`tap text-[15px] font-medium pb-2 relative ${tab === 'tab2' ? 'txt-accent' : 'txt-faint'}`}
  >
    标签2
    {tab === 'tab2' && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
  </button>
</div>

{tab === 'tab1' && <div>标签1内容</div>}
{tab === 'tab2' && <div>标签2内容</div>}
```

### 模态框
```typescript
import { Modal } from '../components/Sheet';

const [open, setOpen] = useState(false);

<Modal open={open} onClose={() => setOpen(false)} title="标题">
  {/* 模态框内容 */}
</Modal>
```

## 🤖 AI调用模式

### 文本生成
```typescript
import { askAI } from '../api';

const sys = '你在扮演XXX。要求：简洁、有趣。';
const prompt = '请生成一段文字...';

const text = await askAI(api, sys, prompt, {
  temperature: 0.8,  // 创造性：0.3-1.0
  maxTokens: 150,    // 长度限制
});
```

### JSON生成
```typescript
import { askAIJson } from '../api';

interface MyType {
  name: string;
  items: string[];
}

const sys = '你在生成XXX。返回JSON：{"name":"...", "items":["..."]}';
const prompt = '请生成...';

const data = await askAIJson<MyType>(api, sys, prompt, {
  temperature: 0.7,
  maxTokens: 300,
});

// data 已经是 MyType 类型，可以直接使用
console.log(data.name, data.items);
```

### 批量生成
```typescript
const results: MyType[] = [];

for (let i = 0; i < 5; i++) {
  const data = await askAIJson<MyType>(api, sys, prompt, options);
  results.push(data);
  
  // 可选：添加延迟避免API限流
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

## 📦 类型定义速查

### 角色类型
```typescript
interface Character {
  id: string;
  name: string;
  avatar?: string;
  personality?: string;
  description?: string;
}
```

### 记忆类型
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
```

### 社交帖子
```typescript
interface SocialPost {
  id: string;
  platform: 'weibo' | 'twitter';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  topic?: string;
  likes: number;
  reposts: number;
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    ts: number;
  }>;
  ts: number;
}
```

## 🐛 调试技巧

### 1. 查看状态
```typescript
console.log('当前状态:', { data, loading, error });
```

### 2. 捕获错误
```typescript
try {
  const result = await someAsyncFunction();
} catch (e) {
  console.error('错误:', e);
  alert(`操作失败：${(e as Error).message}`);
}
```

### 3. 检查API调用
```typescript
console.log('API请求:', { sys, prompt, options });
const result = await askAI(api, sys, prompt, options);
console.log('API响应:', result);
```

### 4. React DevTools
- 浏览器安装 React Developer Tools 扩展
- 查看组件树和props/state

## 🔄 常见修改场景

### 修改应用样式
1. 找到应用文件 `src/apps/XXXScreen.tsx`
2. 修改 className 或内联样式
3. 保存后自动热更新（dev模式）

### 添加新的AI功能
1. 在应用中添加按钮触发
2. 调用 `askAI` 或 `askAIJson`
3. 处理返回结果并更新状态

### 修改记忆逻辑
1. 打开 `src/services/memoryLayerService.ts`
2. 修改分层规则或搜索逻辑
3. 在应用中使用新功能

### 添加新的数据类型
1. 在 `src/types.ts` 添加接口定义
2. 在应用中使用新类型
3. 更新相关的服务函数

## 📝 提交规范

### 好的提交信息
```
添加音乐播放器暂停功能

- 添加暂停按钮UI
- 实现播放/暂停切换逻辑
- 保存播放状态到localStorage
```

### 避免的提交信息
```
update
修复bug
改了一些东西
```

## 🎯 性能优化建议

1. **避免频繁AI调用**
   - 使用防抖/节流
   - 缓存结果

2. **图片优化**
   - 使用压缩后的图片
   - 懒加载图片

3. **状态管理**
   - 避免不必要的重渲染
   - 使用 `useMemo` 和 `useCallback`

4. **代码分割**
   - 大组件使用动态导入
   - 路由级别的代码分割

## 📚 参考资源

- **React文档：** https://react.dev
- **TypeScript文档：** https://www.typescriptlang.org/docs
- **Vite文档：** https://vitejs.dev
- **Lucide图标：** https://lucide.dev

---

**快速问题？**
- 构建失败？检查语法错误和类型定义
- 样式不生效？检查 className 拼写
- AI不返回？检查 API配置和网络
- 推送失败？检查 git 配置和权限

