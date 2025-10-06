import React, { useEffect, useState } from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import IPFlagDisplay from '@site/src/components/IPFlagDisplay';

export default function NavbarContentWrapper(props) {
    const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    // 关闭逻辑：点击外部 + ESC
    const handleClickOutside = (event) => {
      const modal = document.querySelector('.ip-modal');
      const overlay = document.querySelector('.ip-modal-overlay');
      if (
        overlay &&
        modal &&
        overlay.contains(event.target) &&
        !modal.contains(event.target)
      ) {
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 200);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        const overlay = document.querySelector('.ip-modal-overlay');
        if (overlay) {
          overlay.classList.add('closing');
          setTimeout(() => overlay.remove(), 200);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* NavbarContent 内部自动包含 logo、搜索框、右侧图标等 */}
      <NavbarContent {...props} />

      {/* 国旗显示（桌面端） */}
     {/* 国旗显示（仅桌面端） */}
      <div
        className="ip-flag-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
          marginRight: 'var(--ifm-navbar-item-padding-horizontal)',
          position: 'relative',
          height: '100%',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <IPFlagDisplay />

        {/* 悬停提示：点击显示更多信息 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            opacity: showTooltip ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s ease',
            zIndex: 100,
            fontFamily: 'var(--ifm-font-family-base)',
          }}
        >
          点击显示详情
        </div>
      </div>


      {/* 移动端版本 */}
        {/* 移动端版本 */}
        <div
        className="ip-flag-wrapper-mobile"
        style={{
            justifyContent: 'center',
            width: '100%',
            padding: '0px 0px 0px 50px',
        }}
        >
        <IPFlagDisplay />
        </div>
    </div>
  );
}
