// src/theme/Root.js
import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';

// 🎬 引入 GSAP 核心和 ScrollTrigger
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 注册插件
gsap.registerPlugin(ScrollTrigger);

export default function Root({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);
  const resizeTimerRef = useRef(null);

  // ==================== 提取动画函数，供首次加载和路由切换复用 ====================
  const runPageAnimations = () => {
    // 先清除可能存在的旧动画，避免重复触发动画
    gsap.killTweensOf('.main-wrapper *');

    // 🎯 示例 1：页面主标题淡入（限定在 main 内）
    const heroTitle = document.querySelector('.main-wrapper h1, .main-wrapper .hero__title, .container h1');
    if (heroTitle) {
      gsap.fromTo(
        heroTitle,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }

    // 🎯 示例 2：卡片 stagger 进场动画（只选 main 内的卡片/功能块）
    const cards = document.querySelectorAll(
      '.main-wrapper .card, .main-wrapper .feature, .container .row, .markdown :is(h2, h3, p, ul, ol, blockquote, table)'
    );
    if (cards.length > 0) {
      gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.6,
      });
    }

    // 🎯 示例 3：代码块高亮行弹性入场（限定在 markdown 内）
    const codeLines = document.querySelectorAll('.markdown .docusaurus-highlight-code-line');
    if (codeLines.length > 0) {
      gsap.from(codeLines, {
        x: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.2)',
      });
    }

    // 🎯 示例 4：段落/列表项逐个淡入（增强阅读节奏感）
    const paragraphs = document.querySelectorAll('.markdown p, .markdown li, .markdown td');
    if (paragraphs.length > 0) {
      gsap.from(paragraphs, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power1.out',
        delay: 0.8,
      });
    }
  };

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

    // ==================== 页面首次加载：运行动画 ====================
    const animTimer = setTimeout(runPageAnimations, 500);

    // ==================== 清理函数 ====================
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      if (animTimer) clearTimeout(animTimer);

      // Kill 所有 ScrollTrigger（防止内存泄漏）
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      lenis.destroy();
      window.lenis = null;
      lenisRef.current = null;
    };
  }, []); // 只在挂载时执行一次

  // ==================== 路由变化时重置滚动 + 重算高度 + 重新运行动画 ====================
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    const timer = setTimeout(() => {
      try {
        lenis.resize();
        lenis.scrollTo(0, { immediate: true });

        // 🎬 关键修复：路由切换后重新运行动画
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            runPageAnimations();
          }, { timeout: 1000 });
        } else {
          setTimeout(runPageAnimations, 300);
        }
      } catch (error) {
        console.warn('Lenis or GSAP animation failed on route change:', error);
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