---
title: 视频播放测试
sidebar_position: 2
keywords:
  - 视频播放
  - 测试
---

# 🎬 视频播放测试

## 以下是两个嵌入式视频演示。
### 1、阿里云通义千文的品牌动画（短内容）
<video
  src="/video/tongyi_branding.mp4"
  controls
  width="100%"
  height="auto"
  style={{
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  }}
>
  您的浏览器不支持视频播放，请下载观看：<a href="/video/tongyi_branding.mp4">点击下载</a>
</video>

### 2、JetBrainsAI品牌展示（长内容）
<video
  src="/video/JetBrainsAI.mp4"
  controls
  width="100%"
  height="auto"
  style={{
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  }}
>
  您的浏览器不支持视频播放，请下载观看：<a href="/video/JetBrainsAI.mp4">点击下载</a>
</video>

:::warning
如果视频无法加载，请确保：
- 视频已上传至 static/video/ 目录
- 文件名无空格或特殊字符
- 视频格式为 .mp4（H.264 编码）
- 服务器支持视频流媒体（一般本地开发没问题）
:::