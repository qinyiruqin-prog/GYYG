# 羊羊机 v2.0 - AI角色聊天手机 (改进版)

<div align="center">
  <h3>🎉 沉浸式AI角色扮演 · PWA应用 · 可添加到桌面</h3>
  <p>基于原版优化的增强版本，提升了可读性、用户体验和PWA功能</p>
</div>

---

## ✨ v2.0 新特性

### 🎨 界面优化
- ✅ **提高透明度**：所有界面元素透明度提升 2-3 倍，大幅改善可读性
- ✅ **增强对比度**：文字颜色更明亮，视觉层次更清晰
- ✅ **优化色彩**：使用更现代的配色方案

### 👤 用户身份增强
- ✅ **JSON 导入**：支持批量导入用户身份配置文件
- ✅ **卡片式布局**：分区展示（头像、基本信息、AI设置、高级选项）
- ✅ **改进的表单**：更大的点击区域，更友好的提示文字
- ✅ **滚动优化**：支持长表单流畅滚动

### 📱 PWA 完善
- ✅ **自动更新**：每小时检查更新，发现新版本自动提示
- ✅ **一键更新**：顶部横幅显示更新按钮，无需手动刷新
- ✅ **离线支持**：核心资源缓存，离线也能使用
- ✅ **网络优先**：确保始终获取最新内容

### 📲 兼容性优化
- ✅ **全面屏适配**：支持 iPhone 刘海屏、灵动岛
- ✅ **安全区域**：自动处理顶部和底部安全区域
- ✅ **响应式**：完美适配手机、平板、桌面

---

## 🚀 快速开始

### 方式一：在线使用（推荐）

**部署到 Vercel（最简单）：**

1. Fork 本项目到你的 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 点击 "New Project" 导入仓库
4. 点击 "Deploy" 开始部署
5. 等待几分钟，获得访问地址

**你将获得：**
- 永久免费的 HTTPS 地址：`https://your-app.vercel.app`
- 自动部署：每次 push 代码自动更新
- 全球 CDN 加速

### 方式二：本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-username/GYYG-improved.git
cd GYYG-improved

# 2. 安装依赖
npm install

# 3. 配置 API Key（可选）
# 复制 .env.example 为 .env.local
cp .env.example .env.local
# 编辑 .env.local，填入你的 Gemini API Key

# 4. 启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

---

## 📦 添加到桌面

部署后，用户可以将应用添加到桌面作为独立应用使用：

### iOS (iPhone/iPad)
1. 用 Safari 打开你的部署地址
2. 点击底部分享按钮 📤
3. 选择"添加到主屏幕"
4. 点击"添加"

### Android
1. 用 Chrome 打开你的部署地址
2. 点击右上角菜单 (⋮)
3. 选择"添加到主屏幕"
4. 点击"添加"

### 桌面浏览器
1. 用 Chrome/Edge 打开你的部署地址
2. 地址栏右侧会出现安装图标 ➕
3. 点击安装

**添加后，应用将：**
- 显示在主屏幕，像原生应用一样
- 全屏运行，无浏览器地址栏
- 支持离线使用
- 自动更新

---

## 🎯 核心功能

### 1. 用户身份管理
- 创建多个用户身份（含小号）
- 每个身份独立的昵称、头像、签名
- AI 绘图提示词模板
- 人脸参考图上传
- **新增：批量导入 JSON 配置**

**JSON 导入格式：**
```json
[
  {
    "nickname": "张三",
    "signature": "热爱生活",
    "imagePromptTemplate": "25岁男性，阳光帅气，运动风格",
    "isAlt": false
  }
]
```

示例文件：[user-identities-example.json](./user-identities-example.json)

### 2. AI 角色聊天
- 与 AI 角色进行沉浸式对话
- 支持文字、图片、语音
- 角色记忆和上下文理解
- 多角色互动

### 3. 手机系统模拟
- 📱 桌面管理
- 💬 聊天系统
- 📧 邮件
- 📷 相册
- 🎵 音乐
- 📅 日历
- 🛒 商城
- 📖 小说
- 还有更多...

---

## 🔄 更新机制

应用会自动检查更新：

1. **自动检测**：每小时检查一次新版本
2. **友好提示**：发现更新时顶部显示横幅
3. **一键更新**：点击"立即更新"完成升级
4. **零感知**：更新后自动加载新版本

---

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **样式**：Tailwind CSS 4
- **AI模型**：Google Gemini API
- **PWA**：Service Worker + Manifest
- **动画**：Motion (Framer Motion)
- **图标**：Lucide React

---

## 📚 文档

- [部署指南](./DEPLOY.md) - 详细的部署教程
- [更新日志](./CHANGELOG.md) - 完整的改进记录
- [原版项目](https://github.com/qinyiruqin-prog/GYYG) - 原作者仓库

---

## 🎨 界面对比

### 优化前
- 透明度：0.05-0.09（过于透明）
- 文字：#e8e8e8（不够明亮）
- 布局：平铺堆砌

### 优化后
- 透明度：0.12-0.18（清晰可读）✅
- 文字：#f0f0f0（明亮清晰）✅
- 布局：卡片分组，层次分明 ✅

---

## 🌐 部署平台对比

| 平台 | 免费额度 | 部署难度 | 速度 | 推荐 |
|------|---------|---------|------|-----|
| **Vercel** | 无限 | ⭐ 超简单 | 🚀 最快 | ⭐⭐⭐⭐⭐ |
| **Netlify** | 无限 | ⭐⭐ 简单 | 🚀 快 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | 无限 | ⭐⭐ 简单 | 🚀 快 | ⭐⭐⭐⭐ |
| **GitHub Pages** | 无限 | ⭐⭐⭐ 中等 | 🚶 一般 | ⭐⭐⭐ |

**推荐 Vercel**：零配置，自动检测，一键部署！

---

## 🐛 常见问题

### Q: 如何获取下载地址？
A: 部署到 Vercel/Netlify 后，你会得到一个永久地址（如 `https://your-app.vercel.app`），这就是下载地址。用户访问后可以添加到桌面。

### Q: 需要用户自己部署吗？
A: **不需要！** 你部署一次，所有用户都可以通过你的地址访问。就像一个网站一样。

### Q: 如何更新应用？
A: 你只需要更新 GitHub 代码，Vercel/Netlify 会自动重新部署。用户打开应用时会自动提示更新。

### Q: 离线能用吗？
A: 能！添加到桌面后，核心功能离线可用。联网后会自动同步最新数据。

### Q: 兼容哪些设备？
A: iOS 15+、Android 9+、现代桌面浏览器（Chrome/Edge/Firefox）。

### Q: Gemini API Key 在哪里配置？
A: 部署后，在应用的"设置"中配置，或者在 Vercel/Netlify 的环境变量中设置 `GEMINI_API_KEY`。

---

## 📄 开源协议

本项目基于原版 [GYYG](https://github.com/qinyiruqin-prog/GYYG) 改进。

遵循原项目的开源协议。

---

## 🙏 致谢

- 原作者 [@qinyiruqin-prog](https://github.com/qinyiruqin-prog) 
- Google Gemini API
- React & Vite 社区

---

## 📞 支持

遇到问题？

1. 查看 [DEPLOY.md](./DEPLOY.md) 部署指南
2. 查看 [CHANGELOG.md](./CHANGELOG.md) 改进日志
3. 提交 GitHub Issue

---

<div align="center">
  <p>⭐ 如果这个项目对你有帮助，请给个 Star！</p>
  <p>Made with ❤️ by Claude AI</p>
</div>
