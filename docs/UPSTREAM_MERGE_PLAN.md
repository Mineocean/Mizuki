# 上游合并计划

> 合并 `upstream/master` (matsuzaka-yuki/Mizuki) → `origin/master` (Mineocean/Mizuki)
> 差异规模：411 文件，+20698/-22168 行
> 策略：全量 merge，逐个解决冲突，保留本地自定义

---

## 阶段 0：准备工作

| 步骤 | 操作 | 说明 |
|------|------|------|
| 0.1 | `git checkout -b dev master` | 从 master 创建 dev 分支 |
| 0.2 | `git merge upstream/master` | 触发冲突，开始逐个解决 |

---

## 阶段 1：删除冲突文件（直接接受上游）

这些文件上游已删除或完全重写，我们的版本没有保留价值：

| 文件 | 操作 | 理由 |
|------|------|------|
| `eslint.config.js` | 删除 | 上游迁移到 Biome |
| `.prettierrc` | 删除 | 上游迁移到 Biome |
| `.prettierignore` | 删除 | 上游迁移到 Biome |
| `src/assets/images/avatar.jpg` | **保留** | 我们压缩的 57KB 版本，上游用 avatar.webp |
| `src/config.ts` | 删除 | 上游拆分为 `src/config/` 目录 |
| `scripts/compress-fonts.js` | 删除 | 上游拆分为 `scripts/compress-fonts/` 目录 |

---

## 阶段 2：GitHub Workflows

| 文件 | 操作 | 理由 |
|------|------|------|
| `.github/workflows/CI.yml` | 删除 | 功能已合并到上游的 lint.yml（含 build job） |
| `.github/workflows/build.yml` | 删除 | 目标分支 `main` 错误，与 CI.yml 重复 |
| `.github/workflows/lint.yml` | 接受上游 | ESLint → Biome，新增 build job |
| `.github/workflows/deploy.yml` | 保留 | 两者相同，无需改动 |

---

## 阶段 3：Config 模块化迁移（最复杂）

上游将 `src/config.ts`（657 行）拆分为 17 个模块文件。

### 3.1 `src/config/siteConfig.ts`

从我们的 `src/config.ts` 迁移以下值：

```typescript
// 我们的值
title: "Yozakura Misaka",
subtitle: "宅日記",
siteURL: "https://blog.misakaoi.top/",
siteStartDate: "2025-11-25",
lang: "zh_CN",           // SITE_LANG
timeZone: 8,             // SITE_TIMEZONE（注意：上游删除了此字段，需检查 types/config.ts 是否仍支持）
themeColor.hue: 240,
themeColor.fixed: false,
featurePages: {
  anime: true,
  diary: true,
  friends: true,
  projects: false,
  skills: false,
  timeline: false,
  albums: true,
  devices: false,
  aiTools: false,        // 新增字段，默认 false
},
navbarTitle: {
  mode: "text-icon",
  text: "Yozakura Misaka-宅日記",
  icon: "assets/home/logo.webp",
  logo: "assets/home/logo.webp",
},
pageScaling: { enable: true, targetWidth: 1000 },
bangumi: { userId: "721297", fetchOnDev: false },
bilibili: { /* 保持默认，我们未使用 */ },
anime: { mode: "bangumi" },
diaryApiUrl: "",          // 新增字段
postListLayout: {
  defaultMode: "list",
  enable: true,
  allowSwitch: true,
  categoryBar: { enable: true },
},
tagStyle: { useNewStyle: false },
wallpaperMode: { defaultMode: "banner", showModeSwitchOnMobile: "desktop" },
banner: { /* 保持我们的横幅配置 */ },
toc: {
  enable: true,
  mobileTop: true,
  desktopSidebar: true,
  floating: true,
  depth: 2,
  useJapaneseBadge: false,
},
showCoverInContent: true,
generateOgImages: false,
favicon: [],
// font: 删除（上游改用 Astro Font API）
showLastModified: true,    // 新增字段
pageProgressBar: { enable: true, height: 3, duration: 6000 },
thirdPartyAnalytics: { enable: false, clarityId: "" },
card: { border: true, followTheme: false },
imageOptimization: {
  formats: "webp",
  quality: 85,
  noReferrerDomains: ["*.hdslb.com"],
},
```

**注意事项：**
- 上游删除了 `timeZone` 字段（commit `fe3810d`）。需检查 `src/types/config.ts` 是否仍有此字段
- 上游新增了 `diaryApiUrl`、`showLastModified`、`pageProgressBar`、`thirdPartyAnalytics`、`card`、`imageOptimization` 字段
- 上游新增了 `aiTools` 特性页面开关

### 3.2 `src/config/navBarConfig.ts`

保留我们的导航结构（My/About/Others 分组 + Albums 链接），但注意：
- 上游新增了 `LinkPreset.AITools` 预设
- 上游的 Navbar 添加了 `isFeaturePageDisabled` 自动过滤，禁用的 feature page 会自动从导航栏隐藏
- 我们不需要手动删除已禁用页面的链接

### 3.3 `src/config/profileConfig.ts`

```typescript
avatar: "assets/images/avatar.jpg",  // 我们压缩的 57KB 版本
name: "Yozakura Misaka",
bio: "...",  // 我们的简介
typewriter: { enable: true, speed: 80 },
links: [/* 我们的社交链接 */],
```

### 3.4 `src/config/musicConfig.ts`

```typescript
enable: false,  // 保持禁用
```

### 3.5 `src/config/sidebarConfig.ts`

移除 `music-sidebar` 相关配置（保持我们的精简版）。

### 3.6 其他配置文件

| 文件 | 操作 |
|------|------|
| `announcementConfig.ts` | 接受上游默认（或填入我们的值） |
| `backgroundWallpaper.ts` | 接受上游默认 |
| `commentConfig.ts` | 填入我们的 Twikoo/Giscus 配置 |
| `effectsConfig.ts` | 接受上游默认（樱花效果） |
| `expressiveCodeConfig.ts` | 接受上游默认 |
| `footerConfig.ts` | 保留我们的自定义 footer |
| `licenseConfig.ts` | 接受上游默认（CC BY-NC-SA 4.0） |
| `permalinkConfig.ts` | 接受上游默认 |
| `pioConfig.ts` | `enable: false`（保持禁用） |
| `randomPostsConfig.ts` | 接受上游默认 |
| `relatedPostsConfig.ts` | 接受上游默认 |
| `shareConfig.ts` | 接受上游默认 |

---

## 阶段 4：字体系统迁移

上游从手动 `@font-face` + `config.ts` 字体配置改为 **Astro Font API**（`astro.config.mjs` 的 `fonts` 选项 + CSS 变量）。

### 4.1 `astro.config.mjs` — 添加我们的字体

```javascript
fonts: [
  {
    name: "JetBrains Mono",
    cssVariable: "--font-jetbrains-mono",
    provider: fontProviders.fontsource(),
    styles: ["normal", "italic"],
  },
  {
    name: "LXGWWenKaiLite",
    cssVariable: "--font-body",
    provider: fontProviders.local(),
    options: {
      variants: [{
        src: ["./src/assets/fonts/LXGWWenKaiLite-Regular.ttf"],
        weight: "400",
        style: "normal",
      }],
    },
    fallbacks: [],
    optimizedFallbacks: false,
  },
  {
    name: "LXGWWenKaiLite",
    cssVariable: "--font-cjk",
    provider: fontProviders.local(),
    options: {
      variants: [{
        src: ["./src/assets/fonts/LXGWWenKaiLite-Regular.ttf"],
        weight: "400",
        style: "normal",
      }],
    },
    fallbacks: [],
    optimizedFallbacks: false,
  },
],
```

**注意：** 同一字体文件注册两次（`--font-body` 和 `--font-cjk`），因为上游的 CSS 变量架构要求分别设置 ASCII 和 CJK 字体。

### 4.2 字体文件迁移

- 从 `public/assets/font/LXGWWenKaiLite-Regular.ttf` 复制到 `src/assets/fonts/LXGWWenKaiLite-Regular.ttf`
- 删除 `public/assets/font/` 目录（上游不再使用此路径）
- 删除 `src/assets/fonts/ZenMaruGothic-Medium.ttf` 和 `src/assets/fonts/loli.ttf`（上游默认字体，我们不用）

### 4.3 `src/styles/main.css`

删除我们的 `@font-face` 声明（上游已删除，Astro Font API 自动生成）。

### 4.4 字体压缩脚本

上游的 `scripts/compress-fonts/` 模块化结构中，`config-parser.js` 已改为读取 `src/config/siteConfig.ts`（新路径）。但上游的 `build` 脚本删除了 `node scripts/compress-fonts.js` 步骤。

**我们的操作：**
1. 接受上游的模块化 compress-fonts 结构
2. 在 `scripts/compress-fonts/index.js` 中添加我们的 font preload 注入
3. 在 `package.json` 的 `build` 脚本末尾重新添加 `node scripts/compress-fonts/index.js`

---

## 阶段 5：组件冲突解决

### 5.1 Navbar（`src/components/organisms/navigation/Navbar.astro`）

- 上游添加了 `isFeaturePageDisabled` 自动过滤功能 — 接受
- 上游用 `SettingsPanel.svelte` 替换了 `DisplaySettings.svelte` + `WallpaperSwitch.svelte` + `LayoutSwitch.svelte` — 接受
- 上游删除了 `BackToHome.astro` — 接受

### 5.2 DropdownMenu.astro / NavMenuPanel.astro — Albums i18n 修复

上游的 `navTitleMap` 仍然只有 `Gallery: I18nKey.albums`，没有 `Albums`。**我们的修复仍然需要：**

```typescript
// 需要添加到 navTitleMap
Albums: I18nKey.albums,
```

### 5.3 Pio 看板娘

上游从 Svelte Live2D 重写为 iframe 隔离 + Cubism 3/4/5。我们的 `pioConfig.enable = false`，**接受上游版本即可**。

### 5.4 设置面板

上游新增 `SettingsPanel.svelte`（717 行），替换了多个独立组件。**接受上游版本**。

### 5.5 其他组件

大部分组件上游有小幅修改（格式化、类型修复等），直接接受上游版本。

---

## 阶段 6：工具链迁移

### 6.1 ESLint → Biome

| 操作 | 文件 |
|------|------|
| 删除 | `eslint.config.js`、`.prettierrc`、`.prettierignore` |
| 接受 | `biome.json`（上游配置） |
| 更新 | `package.json` 中 `lint` 脚本 → `biome check --write ./src` |
| 更新 | `package.json` 中 `format` 脚本 → `biome format --write ./src` |

### 6.2 package.json 脚本更新

```json
{
  "build": "node scripts/update-anime.mjs && astro build && pagefind --site dist && node scripts/compress-fonts/index.js",
  "lint": "biome check --write ./src",
  "format": "biome format --write ./src",
  "type-check": "tsc --noEmit"
}
```

**注意：** 上游的 build 脚本删除了 compress-fonts 步骤，我们需要加回来（因为我们的 font preload 注入依赖它）。

### 6.3 vercel.json

保留我们的 `installCommand`（setuptools 用于 ttf2woff2 编译）：

```json
"installCommand": "(python3 -m pip install --break-system-packages setuptools || true) && pnpm install"
```

---

## 阶段 7：样式合并

`src/styles/main.css` 的主要变更：
- 删除我们的 `@font-face` 声明
- 接受上游的 `--font-sans` CSS 变量组合（`var(--font-body), var(--font-cjk), ...`）
- 接受上游新增的卡片边框样式（`.enable-card-border`）
- 接受上游的壁纸模式样式更新

---

## 阶段 8：文档与配置

| 文件 | 操作 |
|------|------|
| `AGENTS.md` | 保留我们的，同时接受上游的 `CLAUDE.md`（两者共存） |
| `tsconfig.json` | 接受上游（移除了 `isolatedDeclarations`） |
| `.gitignore` | 接受上游新增条目 |
| `.npmrc` | 接受上游新增 |
| `pnpm-workspace.yaml` | 接受上游 |
| `pagefind.yml` | 接受上游 |
| `postcss.config.mjs` | 接受上游 |
| `svelte.config.js` | 接受上游 |

---

## 阶段 9：保留的本地文件

这些文件是我们独有的，合并后必须确认未被删除或覆盖：

| 文件 | 说明 | 确认方式 |
|------|------|----------|
| `AGENTS.md` | AI agent 指南 | git status 检查 |
| `public/assets/home/logo.webp` | 我们的 logo | 确认文件存在 |
| `src/assets/images/avatar.jpg` | 压缩头像 57KB | 确认文件存在 |
| `src/assets/fonts/LXGWWenKaiLite-Regular.ttf` | 我们的字体 | 从 public/ 迁移过来 |
| `docs/PERFORMANCE_MONITORING.md` | 性能监控文档 | 确认文件存在 |
| `docs/rule/` | 编码规范文档 | 确认目录存在 |
| `docs/editor/` | 编辑器 demo | 确认目录存在 |

---

## 阶段 10：构建验证

```bash
# 1. 安装依赖
pnpm install

# 2. 类型检查
pnpm check

# 3. Lint 检查
pnpm lint

# 4. 生产构建
pnpm build

# 5. 验证输出
# - dist/ 中有 HTML 文件
# - dist/assets/font/ 有 .woff2 字体文件
# - HTML 文件中有 font preload <link> 标签
# - CSS 中 --font-body 和 --font-cjk 变量指向 LXGWWenKaiLite
```

---

## 阶段 11：功能验证清单

| 项目 | 验证方式 | 优先级 |
|------|----------|--------|
| 字体加载 | 检查页面是否显示 LXGWWenKaiLite 字体 | 高 |
| 导航栏 Albums | 检查是否显示"相册"而非"Albums" | 高 |
| 头像显示 | 检查头像是否为 57KB 压缩版 | 高 |
| Bangumi 数据 | 构建时检查 bangumi-data.json 生成 | 中 |
| 相册页面 | 访问 /albums/ 检查是否正常 | 高 |
| 音乐播放器 | 确认已禁用，侧边栏无音乐组件 | 中 |
| 暗色模式 | 切换主题检查 | 中 |
| Swup 页面过渡 | 点击链接检查无刷新跳转 | 中 |
| Banner 轮播 | 检查首页横幅轮播 | 中 |
| 搜索功能 | 检查 Pagefind 搜索 | 中 |
| 响应式布局 | 移动端检查导航栏 | 中 |
| OG 图片 | 检查 /og/ 端点 | 低 |

---

## 阶段 12：提交与推送

```bash
# 1. 在 dev 分支提交
git add .
git commit -m "merge: upstream v7 update - Biome migration, config modularization, Astro Font API"

# 2. 合并到 master
git checkout master
git merge dev

# 3. 推送
git -c http.sslBackend=openssl push origin master

# 4. 清理 dev 分支（可选）
git branch -d dev
```

---

## 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 字体系统迁移失败 | 中 | 高（页面无字体） | 保留旧字体文件作为备份，构建后检查 CSS 变量 |
| config 值迁移遗漏 | 中 | 中（功能异常） | 逐项对照旧 config.ts 检查新模块文件 |
| compress-fonts 路径问题 | 低 | 中（无字体压缩） | 检查 config-parser.js 是否正确读取新路径 |
| Albums i18n 回退 | 低 | 低（显示英文） | 合并后立即检查 navTitleMap |
| Vercel 部署失败 | 低 | 高（站点不可用） | 保留 vercel.json 的 setuptools installCommand |

---

## 上游新增功能（自动获得）

- AI Tools 页面
- 响应式图片画廊网格
- Memos API 碎碎念集成
- AES-256-GCM 加密
- 卡片边框阴影效果
- 相关文章多算法加权评分
- Banner 滚动标题覆盖
- 设置面板重写
- Biome 代码质量工具
- Astro V7 升级
- 图片多格式优化

---

## 上游关键变更摘要

| 变更 | 说明 |
|------|------|
| ESLint → Biome | 删除 eslint/prettier，迁移到 Biome |
| config.ts → config/ 目录 | 单文件拆分为 17 个模块 |
| compress-fonts.js → compress-fonts/ 目录 | 单文件拆分为 6 个模块 |
| Pio 看板娘重写 | Svelte Live2D → iframe + Cubism 3/4/5 |
| Astro V7 升级 | 从 6.x 升级到 7.x |
| 设置面板重写 | 全新的 SettingsPanel.svelte |
| 字体系统 | 手动 @font-face → Astro Font API + CSS 变量 |
| 加密升级 | AES → AES-256-GCM |
| 图片优化 | 新增多格式优化 + referrer policy |
| diary 模块 | 新增 Memos API 远程数据源支持 |
