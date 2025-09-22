// src/theme/Root.js
import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';

export default function Root({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);
  const resizeTimerRef = useRef(null);

  useEffect(() => {
    // ==================== 初始化 Lenis ====================
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    window.lenis = lenis;
    lenisRef.current = lenis;

    // RAF 循环
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // 初始化后立即重算高度 + 滚动到顶
    lenis.resize();
    lenis.scrollTo(0, { immediate: true });

    // ==================== 监听 DOM 变化，自动重算滚动高度 ====================
    const observer = new MutationObserver(() => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        lenis.resize();
      }, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // ==================== 清理函数 ====================
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);

      lenis.destroy();
      window.lenis = null;
      lenisRef.current = null;
    };
  }, []); // 只在挂载时执行一次

  // ==================== 路由变化时重置滚动 + 重算高度 ====================
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const timer = setTimeout(() => {
      try {
        lenis.resize();
        lenis.scrollTo(0, { immediate: true });
      } catch (error) {
        console.warn('Lenis failed on route change:', error);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ==================== 页面重新获得焦点时重算高度 ====================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          lenisRef.current?.resize();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return children;
}