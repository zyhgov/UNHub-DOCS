import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'flag-icons/css/flag-icons.min.css';

const IPINFO_API_URL = 'https://ipinfo.io/json?token=b2a740212238f8';

const infoMap = {
  ip: 'IP地址',
  org: '运营商',
  city: '地理区域',
  loc: '坐标定位',
  country: '国家代码',
  timezone: '时区信息',
  postal: '邮政编码',
  asn: '网络编号',
  lat: '纬度',
  lon: '经度',
};

function parseLoc(loc) {
  if (!loc) return { lat: null, lon: null };
  const [lat, lon] = loc.split(',');
  return { lat, lon };
}

export default function IPFlagDisplay() {
  const [ipData, setIpData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchIpData() {
      try {
        const res = await axios.get(IPINFO_API_URL);
        const data = res.data;
        const { lat, lon } = parseLoc(data.loc);
        setIpData({ ...data, lat, lon });
      } catch (e) {
        console.error('获取 IP 信息失败：', e);
        setError('获取 IP 信息失败');
      } finally {
        setIsLoading(false);
      }
    }
    if (typeof window !== 'undefined') fetchIpData();
  }, []);

  if (isLoading) return null;
  if (error || !ipData?.country) return null;

  const countryCode = ipData.country.toLowerCase();

  return (
    <>
      {/* 点击国旗触发弹窗 */}
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
        <span className={`fi fi-${countryCode}`} style={{ fontSize: '20px' }}></span>
      </button>

      {/* 弹窗 */}
      {showModal && (
        <div
          className="ip-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="ip-modal"
            onClick={(e) => e.stopPropagation()} // 防止冒泡关闭
          >
            <button className="ip-modal-close" onClick={() => setShowModal(false)}>
              ✕
            </button>

            <div className="ip-modal-header">
              <span className={`fi fi-${countryCode}`} style={{ fontSize: '36px' }}></span>
              <h2 style={{ marginLeft: '10px' }}>
                {ipData.country}（{countryCode.toUpperCase()}）
              </h2>
            </div>

            <div className="ip-modal-body">
              {Object.entries(infoMap).map(([key, label]) => {
                const value =
                  key === 'asn' && typeof ipData.asn === 'object'
                    ? ipData.asn.asn
                    : ipData[key];
                if (!value) return null;
                return (
                  <div key={key} className="ip-info-row">
                    <strong>{label}：</strong>
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
