// src/components/AnnouncementModal.js
import React, { useState, useEffect } from 'react';
import styles from './AnnouncementModal.module.css';

export default function AnnouncementModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('announcement_seen_v1'); // 使用版本号便于更新
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcement_seen_v1', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        {/* 顶部小图（居中） */}
        <div className={styles.topImageWrapper}>
          {/* <img
            src="/img/cloudflare.png"
            alt="Cloudflare"
            className={styles.topImage}
          /> */}
          <img
            src="/img/modal/jetbrains/jetbrains/jetbrains.svg"
            alt="jetbrains"
            className={styles.topImage}
          />
        </div>

        {/* 内容 */}
        <div className={styles.content}>
          {/* <h2>网站已全面接入 Cloudflare®</h2>
          <p>
            本站由 <strong>Cloudflare, Inc.</strong> 提供安全防护、性能加速与高可用性保障。
          </p>
          <p>
            通过 Cloudflare® 服务 <br /> 我们确保您的访问更快速、更安全、更可靠。
          </p> */}
          <h2><strong>2025 年开发者生态系统报告</strong></h2>
          <p>
            这份报告揭示了开发者社区的趋势与洞察， <br /> 数据基于全球 24,534 名受访者的回复。
          </p>


          {/* 你的炫酷按钮 */}
          <div className={styles.buttonWrapper}>
            <a
              // href="https://www.cloudflare-cn.com/"
              href="https://devecosystem-2025.jetbrains.com/cn"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.customButton}
            >
              <span className={styles.buttonInner}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.buttonIcon}
                >
                  <path
                    d="M11.5268 2.29489C11.5706 2.20635 11.6383 2.13183 11.7223 2.07972C11.8062 2.02761 11.903 2 12.0018 2C12.1006 2 12.1974 2.02761 12.2813 2.07972C12.3653 2.13183 12.433 2.20635 12.4768 2.29489L14.7868 6.97389C14.939 7.28186 15.1636 7.5483 15.4414 7.75035C15.7192 7.95239 16.0419 8.08401 16.3818 8.13389L21.5478 8.88989C21.6457 8.90408 21.7376 8.94537 21.8133 9.00909C21.8889 9.07282 21.9452 9.15644 21.9758 9.2505C22.0064 9.34456 22.0101 9.4453 21.9864 9.54133C21.9627 9.63736 21.9126 9.72485 21.8418 9.79389L18.1058 13.4319C17.8594 13.672 17.6751 13.9684 17.5686 14.2955C17.4622 14.6227 17.4369 14.9708 17.4948 15.3099L18.3768 20.4499C18.3941 20.5477 18.3835 20.6485 18.3463 20.7406C18.3091 20.8327 18.2467 20.9125 18.1663 20.9709C18.086 21.0293 17.9908 21.0639 17.8917 21.0708C17.7926 21.0777 17.6935 21.0566 17.6058 21.0099L12.9878 18.5819C12.6835 18.4221 12.345 18.3386 12.0013 18.3386C11.6576 18.3386 11.3191 18.4221 11.0148 18.5819L6.3978 21.0099C6.31013 21.0563 6.2112 21.0772 6.11225 21.0701C6.0133 21.0631 5.91832 21.0285 5.83809 20.9701C5.75787 20.9118 5.69563 20.8321 5.65846 20.7401C5.62128 20.6482 5.61066 20.5476 5.6278 20.4499L6.5088 15.3109C6.567 14.9716 6.54178 14.6233 6.43534 14.2959C6.32889 13.9686 6.14441 13.672 5.8978 13.4319L2.1618 9.79489C2.09039 9.72593 2.03979 9.63829 2.01576 9.54197C1.99173 9.44565 1.99524 9.34451 2.02588 9.25008C2.05652 9.15566 2.11307 9.07174 2.18908 9.00788C2.26509 8.94402 2.3575 8.90279 2.4558 8.88889L7.6208 8.13389C7.96106 8.08439 8.28419 7.95295 8.56238 7.75088C8.84058 7.54881 9.0655 7.28216 9.2178 6.97389L11.5268 2.29489Z"
                    fill="url(#paint0_linear_171_8212)"
                    stroke="url(#paint1_linear_171_8212)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <defs>
                    <linearGradient
                      id="paint0_linear_171_8212"
                      x1="-0.5"
                      y1="9"
                      x2="15.5"
                      y2="-1.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#7A69F9"></stop>
                      <stop offset="0.575" stopColor="#F26378"></stop>
                      <stop offset="1" stopColor="#F5833F"></stop>
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_171_8212"
                      x1="-0.5"
                      y1="9"
                      x2="15.5"
                      y2="-1.5"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#7A69F9"></stop>
                      <stop offset="0.575" stopColor="#F26378"></stop>
                      <stop offset="1" stopColor="#F5833F"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <span className={styles.buttonText}>阅读现状报告</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}