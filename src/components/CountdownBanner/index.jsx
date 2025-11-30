import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function CountdownBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 圣诞节日期
  const christmasDate = new Date('2025-12-25T00:00:00');

  useEffect(() => {
    // 检查是否已关闭
    const closed = localStorage.getItem('christmasBannerClosed2025');
    if (closed === 'true') {
      setIsVisible(false);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = christmasDate - now;

      if (diff <= 0) {
        // 圣诞节当天显示特别信息
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isChristmas: true };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isChristmas: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem('christmasBannerClosed2025', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const { days, hours, minutes, seconds, isChristmas } = timeLeft;

  return (
    <div className={styles.banner}>
      {/* 雪花动画 */}
      <div className={styles.snowflakes}>
        {[...Array(40)].map((_, i) => (
          <div key={i} className={styles.snowflake}>
            {['❄', '❅', '❆', '✻', '✼'][i % 5]}
          </div>
        ))}
      </div>

      {/* 装饰灯串 */}
      <div className={styles.lights}>
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className={styles.light}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <div className={styles.content}>
        {/* 左侧装饰 */}
        <span className={styles.decorLeft}>🎄</span>

        {/* 主内容 */}
        {isChristmas ? (
          <div className={styles.christmasMessage}>
            <span className={styles.star}>⭐</span>
            <span className={styles.greeting}>🎄 Merry Christmas! 圣诞快乐 🎄</span>
            <span className={styles.star}>⭐</span>
          </div>
        ) : (
          <>
            <span className={styles.title}>
              <span className={styles.bell}>🔔</span>
              距离圣诞节还有
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
        <span className={styles.decorRight}>🎅</span>
      </div>

      {/* 关闭按钮 */}
      <button 
        className={styles.closeBtn} 
        onClick={handleClose}
        aria-label="关闭"
      >
        ✕
      </button>

      {/* 底部积雪效果 */}
      <div className={styles.snow} />
    </div>
  );
}