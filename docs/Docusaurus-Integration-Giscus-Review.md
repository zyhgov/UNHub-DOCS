---
sidebar_position: 3
sidebar_label: Docusaurus v3+ 集成 Giscus 评论系统技术指南
title: Docusaurus v3+ 集成 Giscus 评论系统技术指南
description: 本文详细阐述如何在 Docusaurus v3+（JavaScript 版本） 中集成 Giscus 评论系统，实现基于 GitHub Discussions 的用户评论功能。
keywords: [Docusaurus, Giscus]
tags: [Docusaurus, Giscus]
---

# Docusaurus v3+ 集成 Giscus 评论系统技术指南

> **文档版本**：v1.2  
> **最后更新**：2025年9月24日  
> **项目来源**：UNHub 联合库技术文档组  
> **项目官网**：[https://docs.zyhorg.cn](https://docs.zyhorg.cn)  
> **适用对象**：Docusaurus v3/v4（JavaScript）开发者、技术文档维护者、开源项目维护者

---

## 摘要

本文详细阐述如何在 **Docusaurus v3+（JavaScript 版本）** 中集成 **Giscus 评论系统**，实现基于 GitHub Discussions 的用户评论功能。方案采用官方推荐的 `@giscus/react` + `swizzle` 方式，支持亮/暗色主题自动切换、按页面控制评论显示、多语言等特性，适用于文档站、博客站等场景。

---

## 1. 背景与选型

### 1.1 为什么选择 Giscus？

| 特性 | 说明 |
|------|------|
| **开源免费** | MIT 许可，无商业限制 |
| **基于 GitHub** | 用户使用 GitHub 账号登录，无需额外账号体系 |
| **数据自主** | 评论存储在你的 GitHub 仓库 Discussions 中 |
| **轻量安全** | 无第三方数据库，无隐私泄露风险 |
| **主题适配** | 自动跟随 Docusaurus 亮/暗色模式 |
| **多语言支持** | 内置简体中文等 50+ 语言 |

> 💡 替代方案：Utterances（已停止维护）、Disqus（含广告/隐私问题）、Waline（需自建后端）

### 1.2 适用版本

| Docusaurus 版本 | 支持状态 | 说明 |
|------------------|--------|------|
| v3.0 – v3.5 | ✅ 完全支持 | 本文主要验证环境 |
| v4.0 (preview) | ⚠️ 实验性支持 | 需关闭 `future.v4` 或处理上下文兼容性 |
| v2.x | ❌ 不适用 | 需使用旧版集成方式 |

---

## 2. 前置条件

### 2.1 仓库要求

- GitHub 仓库必须为 **Public（公开）**
- 已启用 **Discussions** 功能
- 已创建 **Announcement 类型** 的分类（如 `Docs Comments`）

### 2.2 获取 Giscus 配置参数

访问 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)，填写后获取以下参数：

| 参数 | 示例值（脱敏） | 用途 |
|------|----------------|------|
| `repo` | `your-org/your-docs` | GitHub 仓库名 |
| `repoId` | `R_kgDOxxxxxx` | 仓库唯一 ID |
| `category` | `Docs Comments` | Discussion 分类名 |
| `categoryId` | `DIC_kwDOxxxxxx` | 分类唯一 ID |

> 🔒 **注意**：`repoId` 和 `categoryId` 为敏感信息，**切勿提交到公开仓库**（建议通过环境变量或私有配置管理）。

---

## 3. 集成步骤

### 3.1 安装依赖

```bash showLineNumbers=true
npm install @giscus/react
```

> ❌ 无需安装 `mitt`（Docusaurus v3+ 不需要事件总线）

### 3.2 创建 Giscus 评论组件

创建文件：`src/components/GiscusComments.js`

```js showLineNumbers=true
// src/components/GiscusComments.js
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function GiscusComments() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  const giscusConfig = siteConfig.themeConfig.giscus;

  // 校验必填字段
  if (!giscusConfig?.repo || !giscusConfig?.repoId || !giscusConfig?.categoryId) {
    console.warn('Giscus is not configured. Please check themeConfig.giscus in docusaurus.config.js');
    return null;
  }

  const theme = colorMode === 'dark' ? 'dark_dimmed' : 'light';

  return (
    <BrowserOnly fallback={<div>Loading comments...</div>}>
      {() => (
        <Giscus
          repo={giscusConfig.repo}
          repoId={giscusConfig.repoId}
          category={giscusConfig.category}
          categoryId={giscusConfig.categoryId}
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={theme}
          lang="zh-CN"
        />
      )}
    </BrowserOnly>
  );
}
```

#### 代码切片分析

| 代码段 | 说明 |
|-------|------|
| `BrowserOnly` | 避免 SSR 报错，确保只在客户端渲染 |
| `useColorMode()` | 动态获取当前主题（亮/暗） |
| `mapping="pathname"` | 按 URL 路径区分评论（推荐） |
| `strict="1"` | 启用严格标题匹配，避免讨论混淆 |

### 3.3 配置 Docusaurus

在 `docusaurus.config.js` 的 `themeConfig` 中添加：

```js showLineNumbers=true
// docusaurus.config.js
const config = {
  // ...
  themeConfig: {
    // ...
    giscus: {
      repo: 'your-org/your-docs',        // ← 替换为你的仓库
      repoId: 'R_kgDOxxxxxx',            // ← 脱敏处理
      category: 'Docs Comments',
      categoryId: 'DIC_kwDOxxxxxx',      // ← 脱敏处理
    },
  },
};
```

> 💡 **安全建议**：生产环境可通过环境变量注入敏感 ID：
> ```js showLineNumbers=true
> repoId: process.env.GISCUS_REPO_ID,
> categoryId: process.env.GISCUS_CATEGORY_ID,
> ```

### 3.4 在文档页面插入评论区

#### 3.4.1 Swizzle DocItem 布局

```bash showLineNumbers=true
npm run swizzle @docusaurus/theme-classic DocItem/Layout -- --eject
# 选择 JavaScript → Eject (Unsafe) → YES
```

#### 3.4.2 修改 `src/theme/DocItem/Layout/index.js`

```js showLineNumbers=true
// src/theme/DocItem/Layout/index.js
import React from 'react';
import clsx from 'clsx';
// ... 其他导入
import GiscusComments from '@site/src/components/GiscusComments'; // ✅ 新增

export default function DocItemLayout({children}) {
  const docTOC = useDocTOC();
  const {metadata} = useDoc();
  const {frontMatter} = metadata;
  const hideComment = frontMatter.hide_comment || false; // ✅ 支持关闭

  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        {/* ... 原有内容 */}
        <div className={styles.docItemContainer}>
          <article>
            {/* ... */}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />

          {/* ✅ 插入评论区 */}
          {!hideComment && (
            <div className="margin-vert--xl">
              <GiscusComments />
            </div>
          )}
        </div>
      </div>
      {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}
```

#### 3.4.3 按页面控制评论显示

在 Markdown 文件头部添加：

```md showLineNumbers=true
---
hide_comment: true
---
```

即可隐藏该页面评论。

### 3.5 （可选）在博客页面插入评论区

#### Swizzle BlogPostPage

```bash showLineNumbers=true
npm run swizzle @docusaurus/theme-classic BlogPostPage -- --eject
```

#### 修改 `src/theme/BlogPostPage/index.js`

```js showLineNumbers=true
// 在 BlogPostPaginator 后添加
{!frontMatter.hide_comment && <GiscusComments />}
```

---

## 4. 架构与流程

### 4.1 集成架构图

```mermaid
graph LR
  A[Docusaurus v3+] --> B[Swizzle DocItem/Layout]
  B --> C[注入 GiscusComments 组件]
  C --> D[@giscus_slash_react]
  D --> E[Giscus App]
  E --> F[GitHub Discussions]
  F --> G[用户 GitHub 账号]
```

### 4.2 数据流说明

1. 用户访问 `/docs/intro`
2. Docusaurus 渲染 `DocItem/Layout`
3. `GiscusComments` 组件加载
4. `@giscus/react` 向 `giscus.app` 发起请求
5. Giscus 在 `your-org/your-docs` 的 `Docs Comments` 分类中查找标题为 `/docs/intro` 的 Discussion
6. 若不存在，自动创建；若存在，加载评论
7. 用户点击“GitHub 登录” → 跳转认证 → 返回发表评论

---

## 5. 常见问题与排查

### 5.1 评论区不显示

| 可能原因 | 解决方案 |
|--------|--------|
| 仓库为 Private | 改为 Public |
| Discussions 未启用 | Settings → General → Features → 勾选 Discussions |
| 分类类型非 Announcement | 重建分类，类型选 Announcement |
| `repoId`/`categoryId` 错误 | 重新从 giscus.app 复制 |

### 5.2 页面崩溃：`Cannot read properties of undefined (reading 'metadata')`

| 原因 | 解决方案 |
|------|--------|
| 多实例 docs + 无 default 上下文 | 添加 `id: 'default'` 的 dummy docs 插件 |
| `themeConfig.metadata` 误用 | 删除该字段，改用 `headTags` |

### 5.3 主题不匹配

确保 `Giscus` 组件中：
```js showLineNumbers=true
theme={colorMode === 'dark' ? 'dark_dimmed' : 'light'}
```

---

## 6. 安全与维护建议

- **敏感信息脱敏**：`repoId` 和 `categoryId` 不应硬编码在公开仓库
- **定期更新依赖**：`@giscus/react` 保持最新
- **监控 Discussion**：及时处理垃圾评论（GitHub 支持锁定/删除）
- **备份策略**：GitHub Discussions 可通过 API 导出

---

## 7. 参考资料

- [Giscus 官网](https://giscus.app/zh-CN)
- [Docusaurus Swizzling 文档](https://docusaurus.io/docs/swizzling)
- [TheWang.net 集成教程](https://thewang.net/en/blog/how-to-add-giscus-comment-system-to-docusaurus/)
- [Schema.org 结构化数据规范](https://schema.org)

---

> ✅ 本文档已在 Docusaurus v3.5.2 + JavaScript 环境验证通过，可直接复用。  
> 📄 本文档遵循 CC BY-SA 4.0 许可，欢迎分享与改进。