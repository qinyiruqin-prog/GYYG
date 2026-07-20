# 羊羊机 - 部署说明

## 项目改进内容

### 1. ✅ 优化透明度和可读性
- 提高了所有界面元素的透明度，从原来的 0.05-0.09 提升到 0.12-0.18
- 增强了文字对比度，提高可读性
- 优化了颜色方案，使用更明亮的色彩

### 2. ✅ 用户身份管理增强
- **新增 JSON 导入功能**：支持批量导入用户身份配置
- **优化表单布局**：分区展示（头像设置、基本信息、AI绘图设置、高级选项）
- **增强视觉效果**：使用卡片式布局，更清晰的视觉层次
- **改进交互体验**：更大的点击区域，更明确的提示文字

### 3. ✅ PWA 增强
- **改进的 Service Worker**：网络优先策略，确保实时更新
- **自动更新检测**：每小时自动检查更新
- **更新提示UI**：当有新版本时显示友好的更新提示
- **离线支持**：缓存关键资源，离线也能使用

### 4. ✅ 响应式优化
- 完善的移动端适配（支持各种刘海屏、全面屏）
- 使用 `env(safe-area-inset-*)` 处理安全区域
- 大屏幕显示手机框架，小屏幕全屏显示
- 支持横竖屏切换

## 部署方式

### 方案一：Vercel 部署（推荐）

1. 前往 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Vite 项目配置
5. 点击 "Deploy" 部署

**部署后会获得：**
- 免费的 HTTPS 域名：`https://your-app.vercel.app`
- 自动部署：每次 git push 都会自动更新
- 全球 CDN 加速

### 方案二：Netlify 部署

1. 前往 [Netlify](https://netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 连接你的 GitHub 仓库
4. 构建命令：`npm run build`
5. 发布目录：`dist`
6. 点击 "Deploy site"

**部署后会获得：**
- 免费域名：`https://your-app.netlify.app`
- 自动部署
- 表单处理、函数等额外功能

### 方案三：GitHub Pages 部署

1. 在项目根目录添加 `.github/workflows/deploy.yml`：

\`\`\`yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
\`\`\`

2. 在 GitHub 仓库设置中启用 GitHub Pages
3. 选择 `gh-pages` 分支作为源

**访问地址：**
- `https://your-username.github.io/GYYG/`

### 方案四：Cloudflare Pages

1. 前往 [Cloudflare Pages](https://pages.cloudflare.com)
2. 连接 GitHub 仓库
3. 构建配置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
4. 点击 "Save and Deploy"

## 本地开发

1. 安装依赖：
\`\`\`bash
npm install
\`\`\`

2. 创建 `.env.local` 文件：
\`\`\`
GEMINI_API_KEY=your_api_key_here
\`\`\`

3. 启动开发服务器：
\`\`\`bash
npm run dev
\`\`\`

4. 访问 `http://localhost:3000`

## 构建生产版本

\`\`\`bash
npm run build
\`\`\`

构建后的文件在 `dist` 目录。

## 添加到桌面（PWA）

### iOS (Safari)
1. 打开部署后的网址
2. 点击底部分享按钮
3. 选择"添加到主屏幕"
4. 点击"添加"

### Android (Chrome)
1. 打开部署后的网址
2. 点击右上角菜单 (⋮)
3. 选择"添加到主屏幕"
4. 点击"添加"

### 桌面浏览器
- Chrome/Edge：地址栏右侧会出现安装图标，点击即可安装

## 用户身份 JSON 导入格式

创建 `user-identities.json` 文件：

\`\`\`json
[
  {
    "nickname": "张三",
    "signature": "热爱生活，享受当下",
    "imagePromptTemplate": "25岁男性，短发，阳光帅气，运动风格",
    "isAlt": false
  },
  {
    "nickname": "李四",
    "signature": "文艺青年，咖啡爱好者",
    "imagePromptTemplate": "28岁女性，长发，温柔气质，文艺范",
    "isAlt": false
  }
]
\`\`\`

在用户身份页面点击"导入"按钮，选择此 JSON 文件即可批量导入。

## 特性说明

### 实时更新机制
- Service Worker 每小时自动检查更新
- 发现新版本时顶部显示更新提示
- 点击"立即更新"按钮完成更新
- 采用网络优先策略，确保获取最新内容

### 离线功能
- 核心资源被缓存，离线可用
- 网络恢复后自动同步最新内容

### 兼容性
- ✅ iOS Safari 15+
- ✅ Android Chrome 90+
- ✅ 桌面 Chrome/Edge/Firefox
- ✅ 支持刘海屏、全面屏
- ✅ 支持各种屏幕尺寸

## 推荐部署方案对比

| 平台 | 免费额度 | 自动部署 | 自定义域名 | CDN | 推荐指数 |
|------|---------|---------|-----------|-----|---------|
| Vercel | 无限 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Netlify | 无限 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | 无限 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| GitHub Pages | 无限 | ✅ | ✅ | ✅ | ⭐⭐⭐ |

**个人推荐：Vercel** - 配置最简单，速度最快，自动检测配置，零配置部署。

## 获取下载地址

部署完成后，你会获得一个永久访问地址，例如：
- Vercel: `https://gyyg-your-name.vercel.app`
- Netlify: `https://gyyg-your-name.netlify.app`

这个地址就是你的下载网址，用户访问后可以：
1. 直接在浏览器使用
2. 添加到主屏幕作为独立应用

**无需用户自己部署，直接访问你的部署地址即可！**

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Google Gemini API
- PWA (Service Worker)

## 需要帮助？

如有问题，请查看 [GitHub Issues](https://github.com/qinyiruqin-prog/GYYG/issues)
