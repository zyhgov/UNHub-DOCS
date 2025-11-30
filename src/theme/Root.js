// src/theme/Root.js
import React, { useMemo } from 'react';
import AnnouncementModal from '../components/AnnouncementModal';
import AnnouncementBar from '../components/AnnouncementBar';
import CountdownBanner from '../components/CountdownBanner';
import LunarYearCountdown from '../components/LunarYearCountdown';

// 配置：选择显示哪种横幅
const BANNER_CONFIG = {
  showAnnouncement: false,  // 是否显示普通公告横幅
  showModal: true,          // 是否显示弹窗公告
};

export default function Root({ children }) {
  // 根据日期判断显示哪个倒计时横幅
  const bannerType = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    
    // 圣诞节日期范围：从现在到 12月25日 23:59:59
    const christmasStart = new Date(year, 0, 1, 0, 0, 0); // 全年都可能开始
    const christmasEnd = new Date(year, 11, 25, 23, 59, 59);
    
    // 农历新年日期范围：12月26日 到 2026年2月17日
    const lunarStart = new Date(year, 11, 26, 0, 0, 0);
    const lunarEnd = new Date(year + 1, 1, 17, 23, 59, 59);
    
    // 判断当前时间
    if (now <= christmasEnd) {
      return 'christmas';
    } else if (now >= lunarStart && now <= lunarEnd) {
      return 'lunar';
    }
    
    return 'none'; // 都不显示
  }, []);

  return (
    <>
      {/* 圣诞节倒计时横幅（12月25日显示） */}
      {bannerType === 'christmas' && <CountdownBanner />}
      
      {/* 农历新年倒计时横幅（12月26日 - 2月17日显示） */}
      {bannerType === 'lunar' && <LunarYearCountdown />}
      
      {/* 普通公告横幅 */}
      {BANNER_CONFIG.showAnnouncement && <AnnouncementBar />}
      
      {/* 主内容 */}
      {children}
      
      {/* 弹窗公告 */}
      {BANNER_CONFIG.showModal && <AnnouncementModal />}
    </>
  );
}