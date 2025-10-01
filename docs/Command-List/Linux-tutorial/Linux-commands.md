---
title: Linux 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_label: Linux 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）
sidebar_position: 2
keywords: [Linux, 企业级, 命令大全]
tags: [Linux, 企业级, 命令大全]
description: Linux 作为开源、模块化、高度可定制的操作系统内核，支撑着全球 **90% 以上的公有云实例、100% 的 TOP500 超算、以及绝大多数关键业务系统**。在企业环境中，Linux 不仅是运行时环境，更是**安全边界、资源调度单元、可观测性数据源**和**自动化治理的执行载体**。
---

# Linux 命令大全：企业级全命令参考手册（覆盖 100% 核心与高阶操作）

> **版本**：3.0  
> **最后更新**：2025年6月  
> **编写**：杖雍皓  
> **适用对象**：系统工程师、DevOps 工程师、SRE、安全审计员、云平台运维人员  
> **覆盖范围**：POSIX 标准命令 + GNU Coreutils + 企业级扩展工具（systemd, auditd, nftables 等）  
> **遵循标准**：POSIX.1-2017、LSB 5.0、FHS 3.0、NIST SP 800-123、CIS Linux Benchmarks

---

## 目录

- [1. 文件与目录操作](#1-文件与目录操作)
- [2. 文件内容查看与处理](#2-文件内容查看与处理)
- [3. 权限与所有权管理](#3-权限与所有权管理)
- [4. 进程管理](#4-进程管理)
- [5. 系统信息与资源监控](#5-系统信息与资源监控)
- [6. 网络配置与诊断](#6-网络配置与诊断)
- [7. 用户与组管理](#7-用户与组管理)
- [8. 软件包管理](#8-软件包管理)
- [9. 磁盘与文件系统](#9-磁盘与文件系统)
- [10. 日志与审计](#10-日志与审计)
- [11. 安全加固](#11-安全加固)
- [12. 备份与压缩](#12-备份与压缩)
- [13. Shell 编程与自动化](#13-shell-编程与自动化)
- [14. 系统服务与启动管理](#14-系统服务与启动管理)
- [15. 内核与性能调优](#15-内核与性能调优)
- [16. 附录：企业级命令速查表](#16-附录企业级命令速查表)

---

## 1. 文件与目录操作

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `ls -l` | 详细列出文件 | 标准操作 |
| `ls -la` | 包含隐藏文件 | |
| `ls -lh` | 人类可读大小 | |
| `pwd` | 显示当前目录 | |
| `cd /path` | 切换目录 | |
| `cd ..` | 返回上级目录 | |
| `mkdir dir` | 创建目录 | |
| `mkdir -p a/b/c` | 递归创建目录 | **推荐** |
| `rmdir dir` | 删除空目录 | |
| `rm file` | 删除文件 | |
| `rm -i file` | 交互式删除 | **安全模式** |
| `rm -rf dir` | 强制递归删除 | **极度危险**，需二次确认 |
| `cp src dest` | 复制文件 | |
| `cp -r src/ dest/` | 递归复制目录 | |
| `cp -a src/ dest/` | 归档复制（保留权限/时间）| **备份推荐** |
| `mv old new` | 移动/重命名 | |
| `ln -s target link` | 创建软链接 | |
| `ln target link` | 创建硬链接 | |
| `find /path -name "*.log"` | 按名称查找 | |
| `find /var/log -mtime +7` | 查找7天前修改的文件 | 日志清理 |
| `locate "*.conf"` | 快速查找（基于数据库）| 需先 `updatedb` |

---

## 2. 文件内容查看与处理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `cat file` | 输出整个文件 | 小文件适用 |
| `less file` | 分页查看（可搜索）| **大文件首选** |
| `head -n 10 file` | 查看前10行 | |
| `tail -n 10 file` | 查看后10行 | |
| `tail -f /var/log/app.log` | 实时跟踪日志 | **运维必备** |
| `grep "error" file` | 搜索文本 | |
| `grep -r "TODO" /src` | 递归搜索 | |
| `grep -i "Error" file` | 忽略大小写 | |
| `grep -v "debug" file` | 反向匹配 | |
| `sed 's/foo/bar/g' file` | 流编辑器（替换）| 批量修改 |
| `awk '{print $1}' file` | 文本处理（按列）| 日志分析 |
| `sort file` | 排序 | |
| `uniq file` | 去重（需先排序）| |
| `wc -l file` | 统计行数 | |
| `diff file1 file2` | 比较文件差异 | 配置审计 |
| `cmp file1 file2` | 二进制比较 | |
| `md5sum file` | 计算 MD5 校验和 | 文件完整性 |
| `sha256sum file` | 计算 SHA256 校验和 | **安全推荐** |

---

## 3. 权限与所有权管理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `chmod 644 file` | 数字模式设权限 | 配置文件 |
| `chmod u+x script.sh` | 符号模式设权限 | 脚本执行 |
| `chown user:group file` | 更改所有者与组 | |
| `chgrp group file` | 仅改组 | |
| `umask 022` | 设置默认权限掩码 | 系统级配置 |
| `getfacl file` | 查看 ACL | |
| `setfacl -m u:backup:r file` | 设置 ACL | 精细授权 |
| `setfacl -x u:backup file` | 删除 ACL 条目 | |
| `setcap cap_net_bind_service+ep /usr/bin/app` | 设置能力 | 非 root 绑定特权端口 |
| `getcap /usr/bin/app` | 查看能力 | |

> **安全原则**：  
> - 配置文件权限 ≤ 644  
> - 私钥文件权限 = 600  
> - 可执行脚本权限 = 755

---

## 4. 进程管理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `ps aux` | 列出所有进程 | 故障排查 |
| `ps -ef --forest` | 树状显示进程 | 服务依赖分析 |
| `top` | 实时进程监控 | 性能瓶颈定位 |
| `htop` | 增强版 top（需安装）| **推荐** |
| `kill -9 <PID>` | 强制终止进程 | 紧急恢复 |
| `kill -TERM <PID>` | 优雅终止 | 服务重启 |
| `pkill -f "nginx"` | 按名称终止 | 批量操作 |
| `pgrep nginx` | 按名称查 PID | 脚本集成 |
| `nice -n 10 command` | 降低优先级 | 后台任务 |
| `renice -n -5 <PID>` | 动态调整优先级 | 关键进程提权 |
| `nohup command &` | 后台运行（忽略 hangup）| 长期任务 |
| `jobs` | 查看后台作业 | |
| `fg %1` | 将作业转前台 | |

---

## 5. 系统信息与资源监控

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `uname -a` | 内核与系统信息 | |
| `hostname` | 查看主机名 | |
| `df -h` | 磁盘空间（人类可读）| **每日检查** |
| `du -sh /var/log` | 目录大小 | 日志膨胀诊断 |
| `free -m` | 内存使用（MB）| |
| `lscpu` | CPU 信息 | |
| `lsblk` | 块设备列表 | |
| `lspci` | PCI 设备 | |
| `lsusb` | USB 设备 | |
| `uptime` | 系统运行时间与负载 | |
| `vmstat 1` | 虚拟内存统计 | 性能分析 |
| `iostat 1` | I/O 统计 | 磁盘瓶颈 |
| `sar -u 1 3` | 系统活动报告（需 sysstat）| 历史性能 |

---

## 6. 网络配置与诊断

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `ip addr show` | 查看 IP 地址 | **替代 ifconfig** |
| `ip route show` | 查看路由表 | |
| `ss -tuln` | 查看监听端口 | **替代 netstat** |
| `ping -c 4 google.com` | 连通性测试 | 基础诊断 |
| `traceroute google.com` | 路径追踪 | 网络问题定位 |
| `dig example.com` | DNS 查询 | **替代 nslookup** |
| `nslookup example.com` | 传统 DNS 查询 | |
| `netstat -tuln` | 网络连接（旧版）| |
| `tcpdump -i eth0 port 80` | 抓包分析 | 深度诊断 |
| `nmap -sS 192.168.1.0/24` | 端口扫描 | 安全审计 |
| `curl -I https://api.example.com` | HTTP 头检查 | API 健康检查 |
| `wget https://file.tar.gz` | 下载文件 | |

---

## 7. 用户与组管理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `useradd -m alice` | 创建用户（带家目录）| |
| `usermod -aG sudo alice` | 添加用户到组 | |
| `userdel -r bob` | 删除用户（含家目录）| |
| `passwd alice` | 修改密码 | |
| `groupadd dev` | 创建组 | |
| `groupdel dev` | 删除组 | |
| `id alice` | 查看用户 UID/GID | |
| `whoami` | 当前用户 | |
| `w` | 查看登录用户 | |
| `last` | 查看登录历史 | 安全审计 |
| `chage -l alice` | 查看密码过期策略 | 合规要求 |

> **安全策略**：  
> - 禁用 root 远程登录  
> - 使用 sudo 替代 su  
> - 密码策略：90天过期，复杂度要求

---

## 8. 软件包管理

### Debian/Ubuntu (APT)
| 命令 | 说明 |
|------|------|
| `apt update` | 更新包列表 |
| `apt upgrade` | 升级已安装包 |
| `apt install nginx` | 安装软件 |
| `apt remove nginx` | 卸载软件（保留配置）|
| `apt purge nginx` | 彻底卸载 |
| `apt list --upgradable` | 列出可升级包 |
| `dpkg -l` | 列出所有已安装包 |

### RHEL/CentOS/Fedora (DNF/YUM)
| 命令 | 说明 |
|------|------|
| `dnf update` | 更新系统 |
| `dnf install nginx` | 安装软件 |
| `dnf remove nginx` | 卸载软件 |
| `dnf list installed` | 列出已安装包 |
| `rpm -qa` | 查询 RPM 包 |

---

## 9. 磁盘与文件系统

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `fdisk -l` | 查看磁盘分区 | |
| `parted -l` | 分区表查看 | |
| `mkfs.ext4 /dev/sdb1` | 创建 ext4 文件系统 | |
| `mount /dev/sdb1 /mnt/data` | 挂载文件系统 | |
| `umount /mnt/data` | 卸载 | |
| `df -T` | 查看文件系统类型 | |
| `blkid` | 查看块设备 UUID | `/etc/fstab` 推荐用 UUID |
| `fsck /dev/sdb1` | 文件系统检查 | 卸载后执行 |
| `dd if=/dev/zero of=test bs=1M count=100` | 创建测试文件 | 性能测试 |
| `lsblk -f` | 显示文件系统与挂载点 | |

---

## 10. 日志与审计

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `journalctl -u nginx` | 查看 systemd 服务日志 | **现代系统首选** |
| `journalctl -f` | 实时跟踪日志 | |
| `journalctl --since "1 hour ago"` | 按时间过滤 | |
| `tail -f /var/log/syslog` | 传统 syslog | |
| `tail -f /var/log/messages` | RHEL 系统日志 | |
| `auditctl -w /etc/passwd -p wa -k passwd_change` | 监控文件变更 | **合规必需** |
| `ausearch -k passwd_change` | 查询审计日志 | |
| `aureport` | 生成审计报告 | |

---

## 11. 安全加固

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `sestatus` | 查看 SELinux 状态 | RHEL 系列 |
| `setenforce 0` | 临时禁用 SELinux | 仅调试 |
| `getenforce` | 获取 SELinux 模式 | |
| `semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?"` | 永久标记目录 | |
| `restorecon -R /web` | 应用 SELinux 上下文 | |
| `aa-status` | AppArmor 状态（Debian）| |
| `ufw enable` | 启用 uncomplicated firewall | Ubuntu |
| `iptables -L` | 查看 iptables 规则 | 旧版防火墙 |
| `nft list ruleset` | 查看 nftables 规则 | **现代防火墙** |
| `fail2ban-client status` | 查看 fail2ban 状态 | 防暴力破解 |

---

## 12. 备份与压缩

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `tar -czvf backup.tar.gz /data` | 创建 gzip 压缩包 | **标准备份** |
| `tar -xzvf backup.tar.gz` | 解压 | |
| `tar -tzvf backup.tar.gz` | 查看内容 | |
| `gzip file` | 压缩为 .gz | |
| `gunzip file.gz` | 解压 | |
| `bzip2 file` | bzip2 压缩（更高压缩率）| |
| `rsync -avz /src/ user@host:/dest/` | 增量同步 | **备份首选** |
| `dd if=/dev/sda of=backup.img` | 磁盘镜像 | 灾难恢复 |

---

## 13. Shell 编程与自动化

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `#!/bin/bash` | 脚本解释器声明 | |
| `set -euo pipefail` | 严格模式 | **脚本必需** |
| `readonly VAR="value"` | 只读变量 | 防篡改 |
| `trap 'cleanup' EXIT` | 退出时执行清理 | 资源释放 |
| `logger "Deployment started"` | 发送 syslog 消息 | 日志集成 |
| `cron -e` | 编辑定时任务 | 自动化 |
| `at now + 1 hour` | 一次性任务 | |

---

## 14. 系统服务与启动管理

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `systemctl start nginx` | 启动服务 | |
| `systemctl stop nginx` | 停止服务 | |
| `systemctl restart nginx` | 重启服务 | |
| `systemctl reload nginx` | 重载配置 | 零停机 |
| `systemctl enable nginx` | 开机自启 | |
| `systemctl disable nginx` | 禁用自启 | |
| `systemctl status nginx` | 查看状态 | |
| `systemctl is-active nginx` | 检查是否运行 | 脚本判断 |
| `systemctl cat nginx` | 查看单元文件 | |
| `systemd-analyze blame` | 查看启动耗时 | 优化启动 |

---

## 15. 内核与性能调优

| 命令 | 说明 | 企业规范 |
|------|------|----------|
| `sysctl -a` | 查看所有内核参数 | |
| `sysctl net.ipv4.tcp_fin_timeout=30` | 临时修改参数 | |
| `echo 'net.ipv4.tcp_fin_timeout=30' >> /etc/sysctl.conf` | 永久生效 | |
| `cat /proc/cpuinfo` | CPU 详细信息 | |
| `cat /proc/meminfo` | 内存详细信息 | |
| `cat /proc/loadavg` | 系统负载 | |
| `dmesg` | 内核环形缓冲区 | 硬件诊断 |
| `perf top` | CPU 性能分析 | 高级调优 |
| `strace -p <PID>` | 系统调用跟踪 | 故障排查 |
| `ltrace -p <PID>` | 库调用跟踪 | |

---

## 16. 附录：企业级命令速查表

### 日常运维
```bash showLineNumbers=true
df -h                  # 磁盘空间
free -m                # 内存使用
top                    # 进程监控
journalctl -u app -f   # 实时日志
ip addr                # 网络配置
ss -tuln               # 监听端口
```

### 安全审计
```bash showLineNumbers=true
auditctl -w /etc/shadow -p wa -k shadow_access
ausearch -k shadow_access
sestatus
nft list ruleset
```

### 故障排查
```bash showLineNumbers=true
dmesg | tail -20       # 内核错误
strace -p <PID>        # 进程系统调用
tcpdump -i eth0 host 192.168.1.100  # 抓包
systemctl status nginx # 服务状态
```

### 自动化脚本头
```bash showLineNumbers=true
#!/bin/bash
set -euo pipefail
readonly LOG_FILE="/var/log/$(basename "$0").log"
log() { echo "[$(date)] $*" | tee -a "$LOG_FILE"; }
```

---

**版权声明**：本文档采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可，企业内使用需保留署名。  
**合规声明**：本手册符合 POSIX.1-2017、NIST SP 800-123《服务器安全指南》、CIS Linux Benchmarks v3.1.0 及 ISO/IEC 27001 信息安全管理标准。  
**反馈与更新**：info@zyhorg.cn