import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import 'flag-icons/css/flag-icons.min.css';

const IPINFO_API_URL = 'https://ipinfo.io/json?token=b2a740212238f8';
const POLLING_INTERVAL = 300000; // 5分钟
const MOBILE_BREAKPOINT = 996; 

// ... (infoMap, parseLoc, inferIsProxy 函数保持不变) ...
const infoMap = {
  ip: 'IP 地址',
  hostname: '主机名',
  org: '运营商',
  city: '城市',
  region: '地区/省份',
  country: '国家/地区',
  postal: '邮政编码',
  timezone: '时区信息',
  asn: '网络编号 (ASN)',
  asnName: 'ASN 组织名称',
  loc: '坐标 (原始)',
  lat: '纬度',
  lon: '经度',
  isProxy: '使用 VPN 推测', 
  bogon: 'Bogon 地址'
};

function parseLoc(loc) {
  if (!loc) return { lat: null, lon: null };
  const [lat, lon] = loc.split(',');
  return { lat: lat?.trim(), lon: lon?.trim() };
}

function inferIsProxy(data) {
    if (!data.asn || typeof data.asn !== 'object') return '未知';
    const org = data.org?.toLowerCase() || '';
    const asnName = data.asn.name?.toLowerCase() || '';
    const keywords = ['vpn', 'proxy', 'hosting', 'cloud', 'digitalocean', 'vultr', 'linode', 'tor', 'amazon web services', 'cloudflare'];
    for (const keyword of keywords) {
        if (org.includes(keyword) || asnName.includes(keyword)) {
            return '高可能性 ⚠️';
        }
    }
    if (data.anycast) {
        return 'Anycast 网络';
    }
    return '否 (低可能性)';
}

// 弹窗组件：用于渲染详细信息
const IPModal = ({ ipData, onClose }) => {
  const { lat, lon } = parseLoc(ipData.loc);
  const finalData = { 
    ...ipData, 
    lat, 
    lon,
    isProxy: inferIsProxy(ipData)
  };
  const countryCode = ipData.country.toLowerCase();

  return (
    <div 
        className="ip-modal-overlay" 
        // 仅在点击遮罩层时调用 onClose 并传入 true
        onClick={(e) => {
            if (e.target.classList.contains('ip-modal-overlay')) {
                onClose(e, true);
            }
        }} 
    >
      <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ip-modal-close" onClick={onClose}>
            &times;
        </button>
        
        <div className="ip-modal-header">
          <span className={`fi fi-${countryCode}`} style={{ fontSize: '36px', marginRight: '10px' }}></span>
          <h2>{ipData.country} Network</h2>
        </div>

        <div className="ip-modal-body">
          {Object.entries(infoMap).map(([key, label]) => {
            let value = finalData[key];
            
            if (key === 'asn' && finalData.asn && typeof finalData.asn === 'object') {
              value = finalData.asn.asn;
            } else if (key === 'asnName' && finalData.asn && typeof finalData.asn === 'object') {
              value = finalData.asn.name;
            } else if (key === 'bogon') {
                value = value ? '是 ⚠️' : null;
            }
            if (key === 'loc' && (finalData.lat || finalData.lon)) return null;

            if (!value) return null;
            
            return (
              <div key={key} className="ip-info-row">
                <strong>{label}：</strong>
                <span style={{color: key === 'isProxy' && value !== '否 (低可能性)' ? 'red' : 'inherit' }}>
                    {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// 主组件
export default function IPFlagDisplay() {
  const [ipData, setIpData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 
  const currentIpRef = useRef(null); 

  // 检查屏幕宽度
  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);
  
  // 封装数据获取逻辑
  const fetchIpData = useCallback(async () => {
    try {
      const res = await axios.get(IPINFO_API_URL);
      const data = res.data;
      
      if (currentIpRef.current && currentIpRef.current !== data.ip) {
          console.log(`IP 发生变化：${currentIpRef.current} -> ${data.ip}. 自动更新完成。`);
      }
      
      currentIpRef.current = data.ip;
      setIpData(data);
    } catch (e) {
      console.error('获取 IP 信息失败：', e);
      setError('获取 IP 信息失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. 挂载时获取数据 & 监听屏幕大小变化 & 浏览器焦点 & 定时轮询
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    fetchIpData();
    checkScreenSize();
    
    // 监听事件
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('focus', fetchIpData);
    const intervalId = setInterval(fetchIpData, POLLING_INTERVAL); 

    return () => {
        // 清理事件和定时器
        window.removeEventListener('resize', checkScreenSize);
        window.removeEventListener('focus', fetchIpData);
        clearInterval(intervalId);
    };
  }, [fetchIpData, checkScreenSize]);
  
  
  // 弹窗关闭逻辑：只负责动画和状态变更，不手动移除 DOM
  const handleCloseModal = useCallback((e, isOverlayClick = false) => {
    const overlay = document.querySelector('.ip-modal-overlay');

    if (overlay) {
        // 触发淡出动画
        overlay.classList.add('closing');
        
        // 动画完成后，更新状态让 React 移除 DOM
        setTimeout(() => setShowModal(false), 200); 
    } else {
        // 兜底方案，立即关闭
        setShowModal(false);
    }
  }, []); // useCallback 确保引用稳定

  // ESC 键关闭逻辑
  useEffect(() => {
      const handleEsc = (event) => {
          if (event.key === 'Escape' && showModal) {
              handleCloseModal(); 
          }
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal, handleCloseModal]);


  if (isLoading) return null;
  if (error || !ipData?.country) return null;

  const countryCode = ipData.country.toLowerCase();
  
  return (
    <>
      {/* 导航栏国旗按钮 */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 var(--ifm-navbar-item-padding-horizontal)',
          height: 'var(--ifm-navbar-height)',
        }}
        aria-label="查看IP信息"
      >
        <span 
          className={`fi fi-${countryCode}`} 
          style={{ 
            fontSize: '20px', 
            marginRight: isMobile ? '0' : '5px' 
          }}
        ></span>
        
        {/* 响应式显示 IP 地址：仅在大屏幕显示 */}
        {!isMobile && (
            <span style={{ fontSize: '14px', fontWeight: '500' }}><b>{ipData.ip}</b></span>
        )}
      </button>

      {/* 弹窗渲染 */}
      {showModal && (
        <IPModal 
            ipData={ipData} 
            onClose={handleCloseModal} 
        />
      )}
    </>
  );
}