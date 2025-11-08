import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import 'flag-icons/css/flag-icons.min.css';

const IPINFO_API_URL = 'https://ipinfo.io/json?token=b2a740212238f8';
const POLLING_INTERVAL = 300000; // 5分钟
const MOBILE_BREAKPOINT = 996;

// ✅ 新增：多个检测 API（按优先级）
const DETECTION_APIS = {
  // ipinfo.io 的隐私检测（需要付费计划）
  ipinfoPrivacy: (ip) => `https://ipinfo.io/${ip}/privacy?token=b2a740212238f8`,
  
  // ProxyCheck.io（免费：每日 1000 次）
  proxycheck: (ip) => `https://proxycheck.io/v2/${ip}?vpn=1&asn=1`,
  
  // IPHub（免费：每日 1000 次，需注册）
  // iphub: (ip) => `https://v2.api.iphub.info/ip/${ip}`,
  
  // IP-API（完全免费但无 VPN 专项检测）
  ipapi: (ip) => `http://ip-api.com/json/${ip}?fields=status,hosting,proxy,mobile`,
};

// 信息字段映射
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
  vpnStatus: 'VPN/代理检测', // ✅ 改名
  proxyType: '代理类型',     // ✅ 新增
  riskScore: '风险评分',     // ✅ 新增
  bogon: 'Bogon 地址'
};

// 解析坐标
function parseLoc(loc) {
  if (!loc) return { lat: null, lon: null };
  const [lat, lon] = loc.split(',');
  return { lat: lat?.trim(), lon: lon?.trim() };
}

// ✅ 优化后的 VPN 检测核心函数
async function detectVPNStatus(ipData) {
  const results = {
    isVPN: false,
    confidence: 0, // 0-100
    proxyType: [],
    riskScore: 0,
    detectionMethods: [],
  };

  try {
    // === 方法 1: ipinfo.io 的 Privacy 检测（最准确但需付费） ===
    try {
      const privacyRes = await axios.get(DETECTION_APIS.ipinfoPrivacy(ipData.ip), {
        timeout: 3000,
      });
      
      if (privacyRes.data) {
        const privacy = privacyRes.data;
        
        if (privacy.vpn) {
          results.isVPN = true;
          results.proxyType.push('VPN');
          results.confidence += 40;
        }
        if (privacy.proxy) {
          results.isVPN = true;
          results.proxyType.push('HTTP/SOCKS Proxy');
          results.confidence += 40;
        }
        if (privacy.tor) {
          results.isVPN = true;
          results.proxyType.push('Tor 出口节点');
          results.confidence += 50;
        }
        if (privacy.relay) {
          results.isVPN = true;
          results.proxyType.push('中继服务器');
          results.confidence += 30;
        }
        if (privacy.hosting) {
          results.proxyType.push('数据中心托管');
          results.confidence += 20;
        }
        
        results.detectionMethods.push('IPInfo Privacy API');
      }
    } catch (err) {
      // Privacy API 不可用（免费账户或网络错误）
      if (err.response?.status !== 402) {
        console.warn('IPInfo Privacy API 失败:', err.message);
      }
    }

    // === 方法 2: ProxyCheck.io 检测（免费额度） ===
    try {
      const proxyRes = await axios.get(DETECTION_APIS.proxycheck(ipData.ip), {
        timeout: 3000,
      });
      
      const proxyData = proxyRes.data[ipData.ip];
      if (proxyData && proxyData.proxy === 'yes') {
        results.isVPN = true;
        results.confidence += 35;
        
        if (proxyData.type) {
          results.proxyType.push(proxyData.type.toUpperCase());
        }
        
        results.detectionMethods.push('ProxyCheck.io');
      }
    } catch (err) {
      console.warn('ProxyCheck API 失败:', err.message);
    }

    // === 方法 3: IP-API 托管检测 ===
    try {
      const ipapiRes = await axios.get(DETECTION_APIS.ipapi(ipData.ip), {
        timeout: 3000,
      });
      
      if (ipapiRes.data.hosting) {
        results.proxyType.push('托管服务器');
        results.confidence += 15;
        results.detectionMethods.push('IP-API Hosting');
      }
      if (ipapiRes.data.proxy) {
        results.isVPN = true;
        results.confidence += 30;
        results.detectionMethods.push('IP-API Proxy');
      }
    } catch (err) {
      console.warn('IP-API 失败:', err.message);
    }

    // === 方法 4: 基于 ASN 和关键词的启发式检测（保底） ===
    if (results.detectionMethods.length === 0 || results.confidence < 30) {
      const heuristicResult = inferIsProxyHeuristic(ipData);
      
      if (heuristicResult.isProxy) {
        results.isVPN = true;
        results.confidence += heuristicResult.score;
        results.proxyType.push(...heuristicResult.types);
        results.detectionMethods.push('启发式分析');
      }
    }

    // === 方法 5: Bogon 地址检测 ===
    if (ipData.bogon) {
      results.isVPN = true;
      results.proxyType.push('Bogon/私有地址');
      results.confidence += 25;
      results.detectionMethods.push('Bogon 检测');
    }

    // === 方法 6: Anycast 网络检测 ===
    if (ipData.anycast) {
      results.proxyType.push('Anycast 网络');
      results.confidence += 10;
      results.detectionMethods.push('Anycast 检测');
    }

  } catch (error) {
    console.error('VPN 检测过程出错:', error);
  }

  // 计算最终风险评分
  results.confidence = Math.min(100, results.confidence);
  results.riskScore = calculateRiskScore(results);

  return results;
}

// ✅ 改进的启发式检测（仅作为备用）
function inferIsProxyHeuristic(data) {
  const result = {
    isProxy: false,
    score: 0,
    types: [],
  };

  if (!data.asn && !data.org) return result;

  const org = data.org?.toLowerCase() || '';
  const asnName = data.asn?.name?.toLowerCase() || '';
  const hostname = data.hostname?.toLowerCase() || '';

  // VPN 提供商关键词（扩展列表）
  const vpnKeywords = [
    'vpn', 'proxy', 'mullvad', 'nordvpn', 'expressvpn', 'surfshark',
    'protonvpn', 'windscribe', 'private internet access', 'pia',
    'cyberghost', 'tunnelbear', 'hotspot shield'
  ];

  // 云服务商/数据中心关键词
  const hostingKeywords = [
    'hosting', 'cloud', 'digitalocean', 'vultr', 'linode', 'ovh',
    'hetzner', 'amazon', 'aws', 'azure', 'google cloud', 'gcp',
    'cloudflare', 'fastly', 'akamai', 'contabo', 'colocrossing'
  ];

  // Tor 相关
  const torKeywords = ['tor', 'torservers', 'privacynet'];

  // 检查 VPN
  for (const keyword of vpnKeywords) {
    if (org.includes(keyword) || asnName.includes(keyword) || hostname.includes(keyword)) {
      result.isProxy = true;
      result.score += 35;
      result.types.push('疑似 VPN');
      break;
    }
  }

  // 检查托管服务
  for (const keyword of hostingKeywords) {
    if (org.includes(keyword) || asnName.includes(keyword)) {
      result.isProxy = true;
      result.score += 20;
      result.types.push('数据中心/云服务');
      break;
    }
  }

  // 检查 Tor
  for (const keyword of torKeywords) {
    if (org.includes(keyword) || asnName.includes(keyword) || hostname.includes(keyword)) {
      result.isProxy = true;
      result.score += 45;
      result.types.push('Tor 网络');
      break;
    }
  }

  // 检查反向 DNS
  if (hostname && hostname.match(/\b(vpn|proxy|tor|relay|exit|node)\b/)) {
    result.score += 15;
    if (!result.types.length) result.types.push('DNS 特征匹配');
  }

  return result;
}

// ✅ 风险评分计算
function calculateRiskScore(results) {
  let score = 0;

  if (results.isVPN) score += 50;
  if (results.proxyType.includes('Tor 出口节点')) score += 30;
  if (results.proxyType.includes('VPN')) score += 20;
  if (results.confidence > 80) score += 20;
  if (results.detectionMethods.includes('IPInfo Privacy API')) score += 10;

  return Math.min(100, score);
}

// ✅ 获取显示文本和样式
function getVPNStatusDisplay(vpnStatus) {
  if (!vpnStatus) {
    return { text: '检测中...', color: '#888', icon: '⏳' };
  }

  const { isVPN, confidence, riskScore } = vpnStatus;

  if (!isVPN && confidence === 0) {
    return { text: '未检测到 VPN/代理', color: '#28a745', icon: '✅' };
  }

  if (isVPN && confidence >= 70) {
    return { text: `高可能性使用 VPN/代理 (${confidence}%)`, color: '#dc3545', icon: '⚠️' };
  }

  if (isVPN && confidence >= 40) {
    return { text: `疑似使用 VPN/代理 (${confidence}%)`, color: '#ff9800', icon: '⚡' };
  }

  if (confidence > 0) {
    return { text: `低可能性 (${confidence}%)`, color: '#ffc107', icon: 'ℹ️' };
  }

  return { text: '未检测到', color: '#28a745', icon: '✅' };
}

// ===== 弹窗组件 =====
const IPModal = ({ ipData, vpnStatus, onClose }) => {
  const { lat, lon } = parseLoc(ipData.loc);
  const vpnDisplay = getVPNStatusDisplay(vpnStatus);
  
  const finalData = {
    ...ipData,
    lat,
    lon,
    vpnStatus: vpnDisplay.text,
    proxyType: vpnStatus?.proxyType?.length > 0 
      ? vpnStatus.proxyType.join(', ') 
      : null,
    riskScore: vpnStatus?.riskScore > 0 
      ? `${vpnStatus.riskScore}/100` 
      : null,
  };

  const countryCode = ipData.country.toLowerCase();

  return (
    <div
      className="ip-modal-overlay"
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

      <div 
        className="ip-modal-header" 
        style={{ 
          display: 'flex', 
          alignItems: 'center',  // ✅ 垂直居中对齐
          gap: '10px'            // ✅ 使用 gap 替代 marginRight（可选）
        }}
      >
        <span 
          className={`fi fi-${countryCode}`} 
          style={{ fontSize: '36px' }}  // ✅ 移除 marginRight
        ></span>
        <h2 style={{ margin: 0 }}>{ipData.country} Network</h2>  {/* ✅ 移除默认边距 */}
      </div>

        {/* ✅ VPN 状态横幅 */}
        {vpnStatus && vpnStatus.isVPN && (
          <div
            style={{
              background: vpnDisplay.color === '#dc3545' ? '#fff3cd' : '#d1ecf1',
              border: `1px solid ${vpnDisplay.color}`,
              borderRadius: '6px',
              padding: '12px',
              margin: '15px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
            }}
          >
            {vpnDisplay.icon} {vpnDisplay.text}
            <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
              检测方法: {vpnStatus.detectionMethods.join(', ')}
            </div>
          </div>
        )}

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

            // ✅ 特殊样式处理
            let textColor = 'inherit';
            if (key === 'vpnStatus') {
              textColor = vpnDisplay.color;
            } else if (key === 'riskScore' && finalData.riskScore) {
              const score = parseInt(finalData.riskScore);
              textColor = score >= 70 ? '#dc3545' : score >= 40 ? '#ff9800' : '#28a745';
            }

            return (
              <div key={key} className="ip-info-row">
                <strong>{label}：</strong>
                <span style={{ color: textColor, fontWeight: key === 'vpnStatus' ? '600' : 'normal' }}>
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

// ===== 主组件 =====
export default function IPFlagDisplay() {
  const [ipData, setIpData] = useState(null);
  const [vpnStatus, setVpnStatus] = useState(null); // ✅ 新增状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const currentIpRef = useRef(null);

  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  // ✅ 数据获取 + VPN 检测
  const fetchIpData = useCallback(async () => {
    try {
      const res = await axios.get(IPINFO_API_URL);
      const data = res.data;

      if (currentIpRef.current && currentIpRef.current !== data.ip) {
        console.log(`IP 发生变化：${currentIpRef.current} -> ${data.ip}`);
      }

      currentIpRef.current = data.ip;
      setIpData(data);

      // ✅ 异步执行 VPN 检测（不阻塞 UI）
      detectVPNStatus(data).then((status) => {
        setVpnStatus(status);
        console.log('VPN 检测结果:', status);
      });

    } catch (e) {
      console.error('获取 IP 信息失败：', e);
      setError('获取 IP 信息失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    fetchIpData();
    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('focus', fetchIpData);
    const intervalId = setInterval(fetchIpData, POLLING_INTERVAL);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('focus', fetchIpData);
      clearInterval(intervalId);
    };
  }, [fetchIpData, checkScreenSize]);

  const handleCloseModal = useCallback((e, isOverlayClick = false) => {
    const overlay = document.querySelector('.ip-modal-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => setShowModal(false), 200);
    } else {
      setShowModal(false);
    }
  }, []);

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
  const vpnDisplay = getVPNStatusDisplay(vpnStatus);

  return (
    <>
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
          position: 'relative',
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

        {!isMobile && (
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            <b>{ipData.ip}</b>
          </span>
        )}

        {/* ✅ VPN 警告小图标 */}
        {vpnStatus?.isVPN && vpnStatus.confidence >= 40 && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '12px',
              backgroundColor: vpnDisplay.color,
              color: 'white',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
            title={vpnDisplay.text}
          >
            !
          </span>
        )}
      </button>

      {showModal && (
        <IPModal
          ipData={ipData}
          vpnStatus={vpnStatus}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}