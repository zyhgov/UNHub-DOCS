---
sidebar_position: 3
sidebar_label: Git上传到GitHub操作手册
title: Git上传到GitHub操作手册
description: 以下是一份完整、详细、图文结合风格的 Git 上传到 GitHub 操作手册，适用于将本地项目（如 Docusaurus 项目）推送到GitHub仓库的全过程。
keywords: [代码, Git, GitHub]
---


当然可以！以下是一份 **完整、详细、图文结合风格的 Git 上传到 GitHub 操作手册**，适用于你将本地项目（如 Docusaurus 项目）推送到 `https://github.com/XXXXX/XXXXX` 的全过程。

---

# 📚 Git 上传到 GitHub 完整操作手册  
> **目标仓库：** [https://github.com/XXXXX/XXXXX](https://github.com/XXXXX/XXXXX)  
> **适用系统：** Windows / macOS / Linux  
> **工具要求：** Git 已安装、GitHub 账号

---

## 🧭 目录

1. [准备工作](#1-准备工作)
2. [初始化本地仓库](#2-初始化本地仓库)
3. [添加文件到暂存区](#3-添加文件到暂存区)
4. [提交更改到本地仓库](#4-提交更改到本地仓库)
5. [连接远程 GitHub 仓库](#5-连接远程-github-仓库)
6. [推送代码到 GitHub](#6-推送代码到-github)
7. [常见命令汇总](#7-常见命令汇总)
8. [常见问题与解决](#8-常见问题与解决)

---

## 1. 准备工作

### ✅ 1.1 安装 Git
确保你已安装 Git：
- 下载地址：[https://git-scm.com/downloads](https://git-scm.com/downloads)
- 安装时建议勾选 “Add Git to PATH”

### ✅ 1.2 配置 Git 用户信息（首次使用必做）

```bash
git config --global user.name "zyhgov"
git config --global user.email "your-email@example.com"
```

> 替换 `"zyhgov"` 为你的 GitHub 用户名，`your-email@example.com` 为注册 GitHub 的邮箱。

### ✅ 1.3 生成 Personal Access Token (PAT)（替代密码登录）

GitHub 不再支持账号密码推送，必须使用 **Token**。

#### 步骤：
1. 登录 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 **Generate new token (classic)**
3. 勾选 `repo` 权限
4. 生成后复制 Token（只显示一次！）

> 🔐 保存好这个 Token，后续推送时用它代替密码。

---

## 2. 初始化本地仓库

进入你的项目目录，比如：

```powershell
PS D:\faq\faq-website\faq-website>
```

运行：

```bash
git init
```

> 初始化一个空的 Git 仓库。如果已有 `.git` 文件夹，可跳过。

---

## 3. 添加文件到暂存区

将所有文件加入 Git 管理：

```bash
git add .
```

> - `.` 表示当前目录下所有文件（除 `.gitignore` 忽略的）
> - 也可以单独添加：`git add README.md`

### 🔍 查看状态

```bash
git status
```

会显示：
- 绿色：已暂存
- 红色：未暂存

---

## 4. 提交更改到本地仓库

```bash
git commit -m "feat: 初始化项目，首次提交"
```

> ✅ 提交信息要清晰，如：
> - `fix: 修复 editUrl 多余路径`
> - `docs: 更新平台介绍文档`

---

## 5. 连接远程 GitHub 仓库

### 方法一：HTTPS（推荐新手）

```bash
git remote add origin https://github.com/XXXXX/XXXXX.git
```

### 方法二：SSH（需配置密钥）

```bash
git remote add origin git@github.com:zyhgov/rsjk.git
```

> ✅ 检查是否关联成功：

```bash
git remote -v
```

输出应为：

```
origin  https://github.com/XXXXX/XXXXX.git (fetch)
origin  https://github.com/XXXXX/XXXXX.git (push)
```

---

## 6. 推送代码到 GitHub

### 第一次推送（设置主分支）

```bash
git branch -M main
git push -u origin main
```

> - `-M`：重命名分支为 `main`
> - `-u origin main`：建立跟踪关系，以后可用 `git push` 直接推送

### 后续推送（日常更新）

```bash
# 查看修改
git status

# 添加修改
git add .

# 提交
git commit -m "更新：添加安全弹窗功能"

# 推送
git push
```

---

## 7. 常见命令汇总（速查表）

| 功能 | 命令 |
|------|------|
| 初始化仓库 | `git init` |
| 查看状态 | `git status` |
| 添加所有文件 | `git add .` |
| 提交更改 | `git commit -m "描述"` |
| 设置远程仓库 | `git remote add origin <URL>` |
| 推送并设置跟踪 | `git push -u origin main` |
| 普通推送 | `git push` |
| 拉取最新代码 | `git pull` |
| 查看提交历史 | `git log --oneline` |
| 删除文件并提交 | `git rm <文件名>` |
| 忽略文件 | 编辑 `.gitignore` |
| 强制推送（慎用） | `git push --force` |

---

## 8. 常见问题与解决

### ❌ 问题 1：`fatal: remote origin already exists`

说明已存在远程地址，先删除再添加：

```bash
git remote remove origin
git remote add origin https://github.com/XXXXX/XXXXX.git
```

---

### ❌ 问题 2：`Authentication failed`

#### 原因：
GitHub 不支持密码登录，需使用 **Personal Access Token**

#### 解决：
推送时输入 Token 而非密码：

```bash
git push
# Username: zyhgov
# Password: paste-your-token-here (不是账号密码！)
```

> ✅ 建议使用 Git Credential Manager 保存 Token：

```bash
git config --global credential.helper manager
```

下次就不用重复输入了。

---

### ❌ 问题 3：`Updates were rejected because the remote contains work you do not have`

说明远程有你本地没有的提交（比如别人 push 了），需先拉取：

```bash
git pull origin main --allow-unrelated-histories
```

再重新 `add`、`commit`、`push`

---

### ❌ 问题 4：如何修改远程仓库地址？

```bash
git remote set-url origin https://github.com/XXXXX/XXXXX.git
```

---

### ❌ 问题 5：如何删除已提交的文件？

```bash
git rm --cached <文件名>     # 从 Git 删除但保留本地
git commit -m "remove file"
git push
```

然后在 `.gitignore` 中添加该文件路径防止再次提交。

---

## ✅ 附录：最佳实践建议

| 建议 | 说明 |
|------|------|
| ✅ 使用 `main` 分支 | GitHub 默认主分支 |
| ✅ 写清晰的 commit 信息 | 如 `fix: 修复链接跳转问题` |
| ✅ 使用 `.gitignore` | 忽略 `node_modules/`, `.DS_Store` 等 |
| ✅ 定期 `git pull` | 避免冲突 |
| ✅ 推送前测试 | 本地运行 `npm run build` 确保能构建成功 |

---

## 🎉 恭喜！你已完成上传

现在访问：
👉 [https://github.com/XXXXX/XXXXX](https://github.com/XXXXX/XXXXX)

就能看到你的项目代码了！

后续每次修改，只需执行：

```bash
git add .
git commit -m "描述你的修改"
git push
```

即可同步到 GitHub。

---

## 📌 温馨提示

- Docusaurus 项目已通过 Cloudflare Pages 部署，**每次 `git push` 都会自动重新构建上线**。
- 私有文档 `/private/*` 已受 Cloudflare Access 保护，安全可靠。

---
