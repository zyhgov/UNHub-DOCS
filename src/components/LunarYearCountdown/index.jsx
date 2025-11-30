import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function LunarYearCountdown() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 农历新年日期 (2026年2月17日 - 农历正月初一)
  const lunarNewYearDate = new Date('2026-02-17T00:00:00');

  useEffect(() => {
    // 检查是否已关闭
    const closed = localStorage.getItem('lunarYearBannerClosed2026');
    if (closed === 'true') {
      setIsVisible(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = lunarNewYearDate - now;

      if (diff <= 0) {
        // 新年当天显示特别信息
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isLunarNewYear: true };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isLunarNewYear: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem('lunarYearBannerClosed2026', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const { days, hours, minutes, seconds, isLunarNewYear } = timeLeft;

  return (
    <div className={styles.banner}>
      {/* 烟火动画 */}
      <div className={styles.fireworks}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.firework}>
            {['✨', '🎇', '🎆', '⚡', '💥'][i % 5]}
          </div>
        ))}
      </div>

      {/* 灯笼装饰 */}
      <div className={styles.lanterns}>
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={styles.lantern}
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            🏮&nbsp;&nbsp;&nbsp;&nbsp;🏮&nbsp;&nbsp;&nbsp;&nbsp;🏮&nbsp;&nbsp;&nbsp;&nbsp;🏮
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {/* 左侧装饰 */}
        <span className={styles.decorLeft}>🎋</span>

        {/* 主内容 */}
        {isLunarNewYear ? (
          <div className={styles.newYearMessage}>
            <span className={styles.dragon}>🐉</span>
            <span className={styles.greeting}>恭喜发财 2026年马年 新年快乐 🐴</span>
            <span className={styles.dragon}>🐉</span>
          </div>
        ) : (
          <>
            <span className={styles.title}>
              <span className={styles.firecracker}>🧧</span>
              距离农历新年还有
            </span>

            <div className={styles.countdown}>
              <div className={styles.timeBlock}>
                <span className={styles.timeNum}>
                  {String(days).padStart(2, '0')}
                </span>
                <span className={styles.timeLabel}>天</span>
              </div>
              
              <span className={styles.separator}>:</span>
              
              <div className={styles.timeBlock}>
                <span className={styles.timeNum}>
                  {String(hours).padStart(2, '0')}
                </span>
                <span className={styles.timeLabel}>时</span>
              </div>
              
              <span className={styles.separator}>:</span>
              
              <div className={styles.timeBlock}>
                <span className={styles.timeNum}>
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className={styles.timeLabel}>分</span>
              </div>
              
              <span className={styles.separator}>:</span>
              
              <div className={styles.timeBlock}>
                <span className={styles.timeNum}>
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className={styles.timeLabel}>秒</span>
              </div>
            </div>
          </>
        )}

        {/* 右侧装饰 */}
        <span className={styles.decorRight}>🎋</span>
      </div>

      {/* 关闭按钮 */}
      <button 
        className={styles.closeBtn} 
        onClick={handleClose}
        aria-label="关闭"
      >
        ✕
      </button>

      {/* 底部装饰线 */}
      <div className={styles.decoration} />
    </div>
  );
}
