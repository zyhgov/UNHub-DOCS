// src/theme/Root.js
import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';

export default function Root({ children }) {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // 初始化后立即 resize（重要！）
    lenis.resize();

    // 路由变化时滚动到顶部 + 重新计算高度
    lenis.scrollTo(0, { immediate: true });

    // 👇 挂载到 window，方便全局调用
    window.lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // ⭐⭐⭐ 关键修复：路由变化时，重新计算页面高度
  useEffect(() => {
    // 延迟一小段时间，确保新页面内容已渲染
    const timer = setTimeout(() => {
      window.lenis?.resize(); // 重新测量 scrollHeight
      window.lenis?.scrollTo(0, { immediate: true }); // 滚动到顶部
    }, 100); // 100ms 通常足够，可根据项目调整

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return children;
}