---
title: Git 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_label: Git 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_position: 2
keywords: [Git, 企业级, 教程]
tags: [Git, 企业级, 教程]
description: Git 作为分布式版本控制系统（DVCS），由 Linus Torvalds 于 2005 年为 Linux 内核开发而创建，已成为全球软件开发的事实标准。在企业环境中，Git 不仅是代码版本管理工具，更是持续集成/持续交付（CI/CD）流水线的基石、协作治理的载体、安全合规的审计源。
---


# Git 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）

> **版本**：3.0  
> **最后更新**：2025年2月  
> **编写**：杖雍皓  
> **适用对象**：开发者、DevOps 工程师、技术主管、安全审计员  
> **覆盖范围**：Git 2.40+ 所有官方命令（按功能分类），含企业级使用规范、安全提示与典型场景  
> **遵循标准**：Git 官方文档、CNCF Git 安全实践、ISO/IEC 27001 合规要求

---

## 目录

- [1. 配置管理（Config）](#1-配置管理config)
- [2. 仓库初始化与克隆（Setup）](#2-仓库初始化与克隆setup)
- [3. 工作流基础（Basic Workflow）](#3-工作流基础basic-workflow)
- [4. 分支与标签（Branching & Tagging）](#4-分支与标签branching--tagging)
- [5. 合并与集成（Merging & Rebasing）](#5-合并与集成merging--rebasing)
- [6. 查看与比较（Inspection & Comparison）](#6-查看与比较inspection--comparison)
- [7. 历史重写与修复（History Rewriting & Recovery）](#7-历史重写与修复history-rewriting--recovery)
- [8. 远程操作（Remote Operations）](#8-远程操作remote-operations)
- [9. 子模块（Submodules）](#9-子模块submodules)
- [10. 调试与诊断（Debugging & Diagnostics）](#10-调试与诊断debugging--diagnostics)
- [11. 安全与签名（Security & Signing）](#11-安全与签名security--signing)
- [12. 钩子与扩展（Hooks & Extensions）](#12-钩子与扩展hooks--extensions)
- [13. 性能与维护（Maintenance & Performance）](#13-性能与维护maintenance--performance)
- [14. 附录：企业级命令速查表](#14-附录企业级命令速查表)

---

## 1. 配置管理（Config）

管理 Git 的行为与用户信息。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git config --list` | 列出所有配置 | 审计必用 |
| `git config --global user.name "Zhang Yonghao"` | 设置全局用户名 | **强制** |
| `git config --global user.email "info@zyhorg.cn"` | 设置全局邮箱 | **强制** |
| `git config --global core.editor "code --wait"` | 设置默认编辑器 | 推荐 VS Code |
| `git config --global init.defaultBranch main` | 设置默认分支名 | 符合行业标准 |
| `git config --global pull.rebase true` | 拉取时自动变基 | 避免无意义 merge |
| `git config --global credential.helper store` | 凭证存储（**慎用**） | 生产环境禁用 |
| `git config --global commit.gpgsign true` | 默认提交签名 | 安全合规要求 |
| `git config --system http.proxy http://proxy.company.com:8080` | 系统级代理 | 企业网络必需 |

> **安全提示**：  
> - 禁止在配置中硬编码密码  
> - 使用 `git config --show-origin` 定位配置来源

---

## 2. 仓库初始化与克隆（Setup）

创建或获取 Git 仓库。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git init` | 初始化新仓库 | 本地开发 |
| `git init --bare` | 创建裸仓库（无工作区） | 服务器端仓库 |
| `git clone <url>` | 克隆远程仓库 | 标准操作 |
| `git clone --depth 1 <url>` | 浅克隆（仅最新提交） | CI/CD 优化 |
| `git clone --branch <branch> <url>` | 克隆指定分支 | 减少带宽 |
| `git clone --single-branch <url>` | 仅克隆默认分支 | 轻量级克隆 |
| `git clone --recurse-submodules <url>` | 递归克隆子模块 | 微服务项目必需 |

---

## 3. 工作流基础（Basic Workflow）

日常开发核心操作。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git status` | 查看工作区状态 | 每次提交前必查 |
| `git status --short` | 简洁状态输出 | 自动化脚本友好 |
| `git add <file>` | 暂存文件 | 精确添加 |
| `git add -A` | 暂存所有变更（含删除） | 谨慎使用 |
| `git add -p` | 交互式暂存（逐块） | **推荐**，提升提交质量 |
| `git commit -m "msg"` | 提交暂存区 | 必须符合 Conventional Commits |
| `git commit --amend` | 修改最后一次提交 | 仅限未推送提交 |
| `git commit -S -m "msg"` | GPG 签名提交 | 安全合规 |
| `git rm <file>` | 删除文件并暂存 | 物理+版本删除 |
| `git rm --cached <file>` | 从版本控制移除但保留本地文件 | `.gitignore` 修正后使用 |
| `git mv <old> <new>` | 重命名文件 | 等价于 `mv + git add + git rm` |

---

## 4. 分支与标签（Branching & Tagging）

管理开发线与版本锚点。

### 分支操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git branch` | 列出本地分支 | |
| `git branch -a` | 列出所有分支（含远程） | |
| `git branch <name>` | 创建新分支 | |
| `git checkout <branch>` | 切换分支 | |
| `git checkout -b <name>` | 创建并切换分支 | 标准操作 |
| `git switch <branch>` | （Git 2.23+）切换分支 | 新命令，更清晰 |
| `git switch -c <name>` | 创建并切换 | |
| `git branch -d <name>` | 删除已合并分支 | 安全删除 |
| `git branch -D <name>` | 强制删除分支 | 谨慎使用 |
| `git branch --merged` | 列出已合并分支 | 清理前检查 |
| `git branch --no-merged` | 列出未合并分支 | 发布前核查 |

### 标签操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git tag` | 列出标签 | |
| `git tag -l "v1.*"` | 列出匹配标签 | |
| `git tag <name>` | 创建轻量标签 | 不推荐 |
| `git tag -a <name> -m "msg"` | 创建附注标签 | **推荐**，含元数据 |
| `git tag -s <name> -m "msg"` | 创建 GPG 签名标签 | 发布版本必需 |
| `git push origin <tag>` | 推送特定标签 | |
| `git push origin --tags` | 推送所有标签 | 谨慎（可能推送临时标签） |
| `git tag -d <name>` | 删除本地标签 | |
| `git push origin :refs/tags/<name>` | 删除远程标签 | |

---

## 5. 合并与集成（Merging & Rebasing）

整合代码变更。

### 合并（Merge）

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git merge <branch>` | 合并分支到当前 HEAD | 默认 fast-forward |
| `git merge --no-ff <branch>` | 禁用 fast-forward，创建 merge commit | GitFlow 推荐 |
| `git merge --squash <branch>` | 压缩合并（不保留历史） | PR 合并常用 |
| `git merge --abort` | 中止冲突合并 | 安全退出 |

### 变基（Rebase）

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git rebase <base>` | 将当前分支变基到 `<base>` | 清理本地历史 |
| `git rebase -i <commit>` | 交互式变基（压缩/重排/编辑） | 提交前整理 |
| `git rebase --continue` | 继续变基（冲突解决后） | |
| `git rebase --abort` | 中止变基 | 安全退出 |
| `git rebase --onto <newbase> <oldbase> <branch>` | 高级变基（剪切历史） | 复杂场景 |

> **黄金法则**：  
> **Never rebase public history** — 仅对未推送的本地提交使用 rebase

---

## 6. 查看与比较（Inspection & Comparison）

审查代码与历史。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git log` | 查看提交历史 | |
| `git log --oneline` | 简洁历史 | 常用 |
| `git log --graph --all` | 图形化历史（含所有分支） | 理解分支结构 |
| `git log -p` | 显示每次提交的差异 | 详细审查 |
| `git log --author="name"` | 按作者过滤 | 审计 |
| `git log --since="2 weeks ago"` | 按时间过滤 | |
| `git diff` | 工作区 vs 暂存区 | |
| `git diff --staged` | 暂存区 vs HEAD | 提交前检查 |
| `git diff main..feature` | 分支对比 | PR 审查前 |
| `git diff <commit1>..<commit2>` | 提交对比 | |
| `git show <commit>` | 显示某次提交详情 | |
| `git blame <file>` | 显示每行最后修改者 | 责任追溯 |
| `git shortlog` | 按作者汇总提交 | 贡献统计 |

---

## 7. 历史重写与修复（History Rewriting & Recovery）

修正错误或清理历史。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git reset --soft <commit>` | 移动 HEAD，保留暂存区 | 修改提交内容 |
| `git reset --mixed <commit>` | 移动 HEAD，重置暂存区（默认） | |
| `git reset --hard <commit>` | 丢弃所有变更（**危险**） | 仅限本地分支 |
| `git revert <commit>` | 创建反向提交（安全撤销） | **已推送变更唯一安全方式** |
| `git cherry-pick <commit>` | 拣选提交到当前分支 | 热修复 |
| `git cherry-pick <start>..<end>` | 拣选范围提交 | |
| `git reflog` | 查看 HEAD 移动历史 | 灾难恢复 |
| `git reset --hard HEAD@{2}` | 恢复到 reflog 中的状态 | |
| `git fsck` | 检查仓库完整性 | 数据损坏诊断 |
| `git filter-repo` | （第三方）重写历史（如删除大文件） | **最后手段**，需全员同步 |

> **企业禁令**：  
> - 生产分支禁止 `reset --hard`  
> - 历史重写需团队通知并同步

---

## 8. 远程操作（Remote Operations）

与远程仓库交互。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git remote -v` | 列出远程仓库 | |
| `git remote add origin <url>` | 添加远程仓库 | 初始化后 |
| `git remote rename <old> <new>` | 重命名远程 | |
| `git remote remove <name>` | 删除远程 | |
| `git fetch` | 获取远程变更（不合并） | **安全**，推荐 |
| `git fetch --all` | 获取所有远程 | |
| `git fetch --prune` | 清理已删除的远程分支 | 保持本地干净 |
| `git pull` | `fetch + merge` | 默认行为可能产生 merge commit |
| `git pull --rebase` | `fetch + rebase` | **推荐**，保持线性历史 |
| `git push` | 推送当前分支 | 需设置上游 |
| `git push -u origin <branch>` | 推送并设置上游 | 首次推送 |
| `git push --force-with-lease` | 安全强制推送（检查远程未变） | **替代 `--force`** |
| `git push --delete origin <branch>` | 删除远程分支 | |
| `git push --follow-tags` | 推送提交及其附注标签 | 发布流程 |

> **安全策略**：  
> - 禁止 `git push --force`  
> - 使用 `--force-with-lease` 避免覆盖他人提交

---

## 9. 子模块（Submodules）

管理嵌套仓库。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git submodule add <url> <path>` | 添加子模块 | 微服务依赖 |
| `git submodule init` | 初始化子模块配置 | 克隆后 |
| `git submodule update` | 检出子模块提交 | |
| `git submodule update --init --recursive` | 递归初始化并更新 | |
| `git submodule foreach 'git checkout main'` | 对所有子模块执行命令 | 批量操作 |
| `git submodule status` | 查看子模块状态 | |
| `git rm --cached <submodule>` | 移除子模块（保留文件） | |

> **替代方案**：  
> 企业级项目推荐使用 **Git Subtree** 或 **包管理器**（如 npm, Maven）替代子模块

---

## 10. 调试与诊断（Debugging & Diagnostics）

排查问题与分析仓库。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git bisect start` | 启动二分查找 | 定位 bug 引入点 |
| `git bisect bad` | 标记当前为坏版本 | |
| `git bisect good <commit>` | 标记已知好版本 | |
| `git bisect reset` | 退出 bisect | |
| `git grep "pattern"` | 在工作区搜索 | 比系统 grep 快 |
| `git clean -n` | 预览未跟踪文件清理 | 安全检查 |
| `git clean -f` | 删除未跟踪文件 | 谨慎 |
| `git clean -fd` | 删除未跟踪文件和目录 | |
| `git ls-files` | 列出索引中文件 | 调试暂存区 |
| `git cat-file -p <sha>` | 查看 Git 对象内容 | 底层调试 |
| `git hash-object <file>` | 计算文件 SHA-1 | 验证对象 |

---

## 11. 安全与签名（Security & Signing）

保障提交真实性与完整性。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git verify-commit <commit>` | 验证提交签名 | |
| `git verify-tag <tag>` | 验证标签签名 | |
| `git log --show-signature` | 显示提交签名状态 | 审计 |
| `git config gpg.program gpg` | 指定 GPG 程序 | |
| `git config user.signingkey <key-id>` | 设置签名密钥 | |
| `git tag -s v1.0.0 -m "Signed release"` | 创建签名标签 | 发布必需 |
| `git commit -S -m "Secure commit"` | 签名提交 | 安全合规 |

> **密钥管理**：  
> - 使用硬件安全模块（HSM）或 YubiKey 存储私钥  
> - 定期轮换密钥

---

## 12. 钩子与扩展（Hooks & Extensions）

自动化与定制行为。

### 客户端钩子（位于 `.git/hooks/`）

| 钩子 | 触发时机 | 企业用途 |
|------|----------|----------|
| `pre-commit` | 提交前 | 代码 lint、单元测试 |
| `prepare-commit-msg` | 编辑提交信息前 | 自动生成模板 |
| `commit-msg` | 提交信息完成后 | 验证格式（如 Conventional Commits） |
| `post-commit` | 提交完成后 | 通知、备份 |
| `pre-push` | 推送前 | 敏感信息扫描、构建检查 |

### 服务端钩子（服务器仓库）

| 钩子 | 触发时机 | 企业用途 |
|------|----------|----------|
| `pre-receive` | 接收推送前 | 强制签名、分支保护、CI 状态检查 |
| `update` | 每个引用更新前 | 细粒度权限控制 |
| `post-receive` | 推送完成后 | 触发 CI/CD、通知 |

> **企业实践**：  
> - 使用 [Husky](https://typicode.github.io/husky/) 管理客户端钩子  
> - 服务端钩子由 DevOps 团队统一维护

---

## 13. 性能与维护（Maintenance & Performance）

优化仓库健康度。

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `git gc` | 垃圾回收（压缩对象） | 自动运行，可手动触发 |
| `git gc --aggressive` | 深度垃圾回收 | 大型仓库优化 |
| `git prune` | 删除悬空对象 | `gc` 已包含 |
| `git repack` | 重新打包对象 | 底层优化 |
| `git count-objects -vH` | 统计对象大小 | 诊断膨胀 |
| `git verify-pack -v .git/objects/pack/*.idx` | 分析包内容 | |
| `git lfs install` | 安装 Git LFS | 大文件管理 |
| `git lfs track "*.psd"` | 跟踪大文件类型 | |
| `git lfs migrate import --include="*.zip"` | 迁移历史大文件 | |

> **仓库健康指标**：  
> - `.git` 目录大小 < 项目总大小的 20%  
> - 单个 pack 文件 < 2GB（避免 HTTP 限制）

---

## 14. 附录：企业级命令速查表

### 日常开发
```bash showLineNumbers=true
git status
git add -p
git commit -m "feat(module): description"
git fetch
git rebase origin/main
git push -u origin feature/x
```

### 代码审查
```bash showLineNumbers=true
git log --oneline main..feature
git diff main..feature
git show <commit-sha>
```

### 紧急修复
```bash showLineNumbers=true
git checkout -b hotfix/db main
# 修复...
git commit -m "fix(db): connection leak"
git push origin hotfix/db
# MR 合并后
git checkout main
git pull
git tag -s v1.2.1 -m "Hotfix release"
git push origin v1.2.1
```

### 灾难恢复
```bash showLineNumbers=true
git reflog
git reset --hard HEAD@{2}
```

### 安全合规
```bash showLineNumbers=true
git log --show-signature
git verify-tag v1.2.0
```

---

**版权声明**：本文档采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可，企业内使用需保留署名。  
**合规声明**：本手册符合 Git 官方文档（git-scm.com）、CNCF 安全最佳实践及 ISO/IEC 27001 信息安全管理标准。  
**反馈与更新**：info@zyhorg.cn