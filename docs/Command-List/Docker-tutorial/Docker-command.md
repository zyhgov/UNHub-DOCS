---
title: Docker 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_label: Docker 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_position: 2
keywords: [Docker, 企业级, 命令大全]
tags: [Docker, 企业级, 命令大全]
description: Docker 作为容器化技术的事实标准，通过**操作系统级虚拟化**实现了应用的**环境一致性、资源隔离与快速交付**。在企业环境中，Docker 不仅是开发测试工具，更是**微服务架构的运行时载体、CI/CD 流水线的标准化单元、安全合规的执行边界**。
---


# Docker 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）


> **版本**：3.0  
> **最后更新**：2025年4月  
> **编写**：杖雍皓  
> **适用对象**：DevOps 工程师、SRE、平台架构师、安全审计员  
> **覆盖范围**：Docker CLI 25.0+ 所有命令（按功能分类），含企业级安全规范、最佳实践与典型场景  
> **遵循标准**：OCI Runtime & Image Specification 1.1、CIS Docker Benchmark v2.0、NIST SP 800-190

---

## 目录

- [1. 系统管理](#1-系统管理)
- [2. 镜像管理](#2-镜像管理)
- [3. 容器管理](#3-容器管理)
- [4. 网络管理](#4-网络管理)
- [5. 存储管理](#5-存储管理)
- [6. 安全与合规](#6-安全与合规)
- [7. 构建与开发](#7-构建与开发)
- [8. 监控与日志](#8-监控与日志)
- [9. 高级特性](#9-高级特性)
- [10. 附录：企业级命令速查表](#10-附录企业级命令速查表)

---

## 1. 系统管理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker version` | 查看客户端/服务端版本 | 审计必用 |
| `docker info` | 显示系统信息（存储驱动、内核版本等）| 故障排查 |
| `docker system df` | 查看磁盘使用情况 | 定期清理 |
| `docker system prune -a` | 清理未使用资源（镜像、容器、网络）| **谨慎使用** |
| `docker system prune --volumes` | 同时清理卷 | 需二次确认 |
| `docker events` | 实时监控 Docker 事件 | 安全审计 |
| `docker stats` | 实时容器资源监控 | 性能分析 |
| `docker top <container>` | 查看容器内进程 | 故障排查 |

> **安全提示**：  
> - `docker system prune` 可能删除重要数据，生产环境禁用  
> - 使用 `--filter` 精确清理：`docker system prune --filter "until=24h"`

---

## 2. 镜像管理

### 2.1 镜像操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker images` | 列出本地镜像 | |
| `docker images --digests` | 显示镜像摘要（SHA256）| **签名验证必需** |
| `docker pull <image>` | 拉取镜像 | 优先使用摘要 |
| `docker pull <image>@<digest>` | 按摘要拉取 | **防篡改** |
| `docker push <image>` | 推送镜像 | 需先登录 |
| `docker rmi <image>` | 删除镜像 | |
| `docker rmi $(docker images -q --filter "dangling=true")` | 删除悬空镜像 | 清理脚本 |
| `docker save -o app.tar <image>` | 导出镜像 | 离线传输 |
| `docker load -i app.tar` | 导入镜像 | |
| `docker history <image>` | 查看镜像构建历史 | 安全审计 |
| `docker inspect <image>` | 查看镜像元数据 | |

### 2.2 镜像安全

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker trust inspect <image>` | 查看镜像签名状态 | **合规必需** |
| `docker trust sign <image>` | 签名镜像 | 需配置 Notary |
| `cosign verify --key pub.pem <image>` | 验证 Cosign 签名 | 现代标准 |
| `trivy image <image>` | 扫描 CVE 漏洞 | **CI/CD 必需** |
| `syft <image> -o spdx-json` | 生成 SBOM | 供应链安全 |

> **企业策略**：  
> - 禁止使用 `latest` 标签  
> - 所有生产镜像必须通过 CVE 扫描且无高危漏洞  
> - 镜像必须签名验证

---

## 3. 容器管理

### 3.1 容器生命周期

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker run <image>` | 创建并启动容器 | |
| `docker run -d <image>` | 后台运行 | 生产标准 |
| `docker run --name myapp <image>` | 指定容器名 | **必须命名** |
| `docker run --rm <image>` | 退出后自动删除 | 临时任务 |
| `docker start <container>` | 启动已停止容器 | |
| `docker stop <container>` | 优雅停止容器 | 发送 SIGTERM |
| `docker stop -t 30 <container>` | 自定义停止超时 | |
| `docker kill <container>` | 强制终止容器 | 发送 SIGKILL |
| `docker restart <container>` | 重启容器 | |
| `docker pause <container>` | 暂停容器进程 | 调试用 |
| `docker unpause <container>` | 恢复容器 | |
| `docker rm <container>` | 删除容器 | |
| `docker rm -f <container>` | 强制删除运行中容器 | **谨慎** |

### 3.2 容器安全运行

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker run --user 1000:1000 <image>` | 以非 root 用户运行 | **必须** |
| `docker run --read-only <image>` | 只读根文件系统 | **必须** |
| `docker run --tmpfs /tmp:rw,noexec,nosuid <image>` | 临时文件系统 | |
| `docker run --cap-drop ALL --cap-add NET_BIND_SERVICE <image>` | 能力限制 | **最小权限** |
| `docker run --security-opt seccomp=profile.json <image>` | 自定义 Seccomp | |
| `docker run --security-opt apparmor=my-profile <image>` | AppArmor 配置 | Ubuntu 环境 |
| `docker run --security-opt label=type:container_t <image>` | SELinux 配置 | RHEL 环境 |
| `docker run --pids-limit 100 <image>` | 限制进程数 | 防 fork 炸弹 |

### 3.3 容器交互

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker exec -it <container> sh` | 进入容器 | 调试用 |
| `docker exec <container> command` | 在容器内执行命令 | 自动化 |
| `docker logs <container>` | 查看容器日志 | |
| `docker logs -f <container>` | 实时跟踪日志 | |
| `docker logs --since 1h <container>` | 按时间过滤日志 | |
| `docker cp host-file <container>:/path` | 复制文件到容器 | 谨慎使用 |
| `docker cp <container>:/path host-file` | 从容器复制文件 | |

> **安全禁令**：  
> - 禁止在生产容器中运行 `docker exec`（破坏不可变性）  
> - 禁止挂载敏感目录（如 `-v /:/host`）

---

## 4. 网络管理

### 4.1 网络操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker network ls` | 列出网络 | |
| `docker network create mynet` | 创建自定义网络 | **替代 link** |
| `docker network create --driver bridge --subnet 192.168.100.0/24 mynet` | 指定子网 | |
| `docker network connect mynet <container>` | 将容器加入网络 | |
| `docker network disconnect mynet <container>` | 从网络移除容器 | |
| `docker network rm mynet` | 删除网络 | |
| `docker network inspect mynet` | 查看网络详情 | |

### 4.2 网络安全

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker run --network none <image>` | 无网络容器 | 安全沙箱 |
| `docker run --network host <image>` | 主机网络（**高危**）| 仅性能敏感场景 |
| `docker run -p 8080:80 <image>` | 发布端口 | **显式指定** |
| `docker run -p 127.0.0.1:8080:80 <image>` | 仅绑定本地 | 安全加固 |

> **企业策略**：  
> - 禁止使用 `--link`（已废弃）  
> - 生产环境优先使用 **CNI 插件**（Calico, Cilium）替代原生网络

---

## 5. 存储管理

### 5.1 卷操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker volume ls` | 列出卷 | |
| `docker volume create myvol` | 创建命名卷 | **持久化标准** |
| `docker volume create --driver local --opt type=tmpfs --opt device=tmpfs myvol` | tmpfs 卷 | 临时数据 |
| `docker volume inspect myvol` | 查看卷详情 | |
| `docker volume rm myvol` | 删除卷 | |
| `docker volume prune` | 清理未使用卷 | **谨慎** |

### 5.2 挂载安全

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker run -v myvol:/data <image>` | 挂载命名卷 | **推荐** |
| `docker run -v /host/path:/container/path:ro <image>` | 只读绑定挂载 | 配置文件 |
| `docker run -v /host/path:/container/path:Z <image>` | SELinux 重标记 | RHEL 环境 |
| `docker run --tmpfs /tmp:rw,noexec,nosuid <image>` | 内存文件系统 | 临时目录 |

> **安全原则**：  
> - 避免挂载主机根目录  
> - 敏感数据使用 **Docker Secrets** 或 **外部 Vault**

---

## 6. 安全与合规

### 6.1 运行时安全

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker run --security-opt no-new-privileges <image>` | 禁止提权 | **必须** |
| `docker run --ulimit nofile=65536:65536 <image>` | 设置 ulimit | |
| `docker run --oom-kill-disable <image>` | 禁用 OOM killer | **极度危险** |
| `docker run --ipc host <image>` | 共享 IPC 命名空间 | **高危** |

### 6.2 合规审计

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker events --filter event=start` | 监控容器启动 | 安全审计 |
| `docker inspect --format='{{.State.Pid}}' <container>` | 获取容器 PID | |
| `cat /proc/<PID>/status` | 查看进程安全上下文 | 深度审计 |

> **CIS 基准要求**：  
> - 容器必须以非 root 用户运行  
> - 必须启用 Seccomp/AppArmor  
> - 禁止特权容器（`--privileged`）

---

## 7. 构建与开发

### 7.1 Dockerfile 构建

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker build -t myapp:1.0 .` | 构建镜像 | |
| `DOCKER_BUILDKIT=1 docker build --secret id=token,src=.token .` | 安全注入 secret | **推荐** |
| `docker build --target builder -t myapp:builder .` | 多阶段构建 | |
| `docker buildx build --platform linux/amd64,linux/arm64 --push .` | 多架构构建 | 云原生标准 |
| `docker build --no-cache .` | 忽略缓存 | 调试用 |

### 7.2 开发工具

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker scan myapp:1.0` | Snyk 漏洞扫描 | |
| `hadolint Dockerfile` | Dockerfile Lint | **CI 必需** |
| `docker-compose up` | 多容器应用 | 开发环境 |
| `docker context use mycluster` | 切换上下文 | 多环境管理 |

---

## 8. 监控与日志

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker stats` | 实时资源监控 | |
| `docker stats --no-stream` | 单次采样 | 脚本集成 |
| `docker logs --tail 100 <container>` | 查看最后 100 行日志 | |
| `docker logs --timestamps <container>` | 带时间戳日志 | **必须** |
| `docker run --log-driver syslog --log-opt syslog-address=tcp://log:514 <image>` | 远程日志 | 生产标准 |
| `docker run --log-opt max-size=10m --log-opt max-file=3 <image>` | 本地日志轮转 | |

> **企业实践**：  
> - 日志必须结构化（JSON 格式）  
> - 禁止将日志写入容器文件系统（应使用日志驱动）

---

## 9. 高级特性

### 9.1 插件管理

| 命令 | 说明 |
|------|------|
| `docker plugin ls` | 列出插件 |
| `docker plugin install <plugin>` | 安装插件 |
| `docker plugin enable <plugin>` | 启用插件 |

### 9.2 Swarm 模式（编排）

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `docker swarm init` | 初始化 Swarm | |
| `docker service create --replicas 3 nginx` | 创建服务 | |
| `docker stack deploy -c docker-compose.yml myapp` | 部署堆栈 | |
| `docker node ls` | 查看节点 | |

> **注意**：  
> 企业生产环境优先使用 **Kubernetes**，Swarm 仅用于简单场景

### 9.3 实验性功能

| 命令 | 说明 |
|------|------|
| `docker buildx imagetools create -t myapp:latest myapp:amd64 myapp:arm64` | 创建多架构清单 |
| `docker manifest inspect <image>` | 查看清单 | 需启用实验特性 |

---

## 10. 附录：企业级命令速查表

### 安全构建
```bash showLineNumbers=true
# BuildKit 安全构建
DOCKER_BUILDKIT=1 docker build \
  --secret id=token,src=.token \
  --tag myapp:1.0 \
  --no-cache \
  .
```

### 安全运行
```bash showLineNumbers=true
docker run -d \
  --name myapp \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid \
  --user 1000:1000 \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --memory=512m \
  --cpus=1.0 \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp:1.0
```

### 合规检查
```bash showLineNumbers=true
# 漏洞扫描
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:1.0

# 签名验证
cosign verify --key cosign.pub registry/myapp:1.0

# SBOM 生成
syft registry/myapp:1.0 -o spdx-json > sbom.json
```

### 清理维护
```bash showLineNumbers=true
# 清理 24 小时前未使用的资源
docker system prune -f --filter "until=24h"

# 删除悬空镜像
docker image prune -f

# 删除未使用卷
docker volume prune -f
```

---

**版权声明**：本文档采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可，企业内使用需保留署名。  
**合规声明**：本手册符合 OCI Image/Runtime Specification 1.1、CIS Docker Benchmark v2.0、NIST SP 800-190《应用容器安全指南》及 ISO/IEC 27001 信息安全管理标准。  
**反馈与更新**：info@zyhorg.cn