import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

// 公告配置
const ANNOUNCEMENTS = [
  {
    id: 'v2-release',
    type: 'info', // info, success, warning, error
    content: '🎉 健康计算器 v2.0 发布！新增10+专业计算工具',
    link: '/docs/changelog',
    linkText: '查看更新',
  },
  // 可以添加多条公告轮播
];

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 检查是否已关闭
  useEffect(() => {
    const closedAnnouncements = JSON.parse(
      localStorage.getItem('closedAnnouncements') || '[]'
    );
    const currentAnnouncement = ANNOUNCEMENTS[currentIndex];
    if (closedAnnouncements.includes(currentAnnouncement?.id)) {
      setIsVisible(false);
    }
  }, [currentIndex]);

  // 多条公告轮播
  useEffect(() => {
    if (ANNOUNCEMENTS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    const currentAnnouncement = ANNOUNCEMENTS[currentIndex];
    const closedAnnouncements = JSON.parse(
      localStorage.getItem('closedAnnouncements') || '[]'
    );
    if (!closedAnnouncements.includes(currentAnnouncement.id)) {
      closedAnnouncements.push(currentAnnouncement.id);
      localStorage.setItem('closedAnnouncements', JSON.stringify(closedAnnouncements));
    }
    setIsVisible(false);
  };

  if (!isVisible || ANNOUNCEMENTS.length === 0) return null;

  const announcement = ANNOUNCEMENTS[currentIndex];

  return (
    <div className={`${styles.announcementBar} ${styles[announcement.type]}`}>
      <div className={styles.content}>
        <span className={styles.message}>
          {announcement.content}
        </span>
        {announcement.link && (
          <a href={announcement.link} className={styles.link}>
            {announcement.linkText || '了解更多'} →
          </a>
        )}
      </div>
      
      {/* 多条公告指示器 */}
      {ANNOUNCEMENTS.length > 1 && (
        <div className={styles.indicators}>
          {ANNOUNCEMENTS.map((_, index) => (
            <span
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="关闭公告"
      >
        ✕
      </button>
    </div>
  );
}