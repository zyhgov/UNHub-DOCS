// docusaurus.config.js
import {themes as prismThemes} from 'prism-react-renderer';
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'UNHub DOCS',
  tagline: 'UNHub联合库一般性笔记文档网站。',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // ✅ 修复：去掉 URL 和 baseUrl 末尾的多余空格
  url: 'https://docs.zyhorg.cn', // 去掉前后空格
  baseUrl: '/',

  organizationName: '联合库UNHub',
  projectName: 'zhangyonghao',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

i18n: {
  defaultLocale: 'zh-Hans',
  locales: ['zh-Hans'],
},

  // ✅ 1. 启用 Mermaid 解析支持
  markdown: {
    mermaid: true, // ✅ 关键：允许 mermaid 语法解析
  },

  // ✅ 2. 在根级别添加 themes（不是放在 preset 里面）
  themes: [
    '@docusaurus/theme-mermaid',       // ✅ 必须在这里注册
    '@docusaurus/theme-live-codeblock' // ✅ 只有你安装了才保留
  ],
  scripts: [
    {
      src: 'https://giscus.app/client.js',
      'data-repo': 'zyhgov/UNHub-DOCS',
      'data-repo-id': 'R_kgDOP0b-VQ',
      'data-category': 'Docs Comments',
      'data-category-id': 'DIC_kwDOP0b-Vc4Cv1Ns',
      'data-mapping': 'pathname',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '1',
      'data-input-position': 'bottom',
      'data-theme': 'preferred_color_scheme',
      'data-lang': 'zh-CN',
      crossorigin: 'anonymous',
      async: true,
    },
  ],
presets: [
  [
    'classic',
    /** @type {import('@docusaurus/preset-classic').Options} */
    ({
      docs: false,
      blog: {
        showReadingTime: true,
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        editUrl: 'https://github.com/zyhgov/UNHub-DOCS/edit/main/', // ✅ 已修正
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
      },
      theme: {
        customCss: './src/css/custom.css',
      },
    }),
  ],
],

plugins: [
    // ✅ 1. 添加全站 Turnstile 验证插件
// ✅ 优化版：带 Logo、白底、多错误提示的 Turnstile 全站验证插件
// () => ({
//   name: 'docusaurus-plugin-sitewide-turnstile',
//   injectHtmlTags() {
//     return {
//       headTags: [
//         // 引入 Cloudflare Turnstile SDK
//         {
//           tagName: 'script',
//           attributes: {
//             src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad',
//             async: true,
//           },
//         },

//         // 注入核心验证逻辑（优化版）
//         {
//           tagName: 'script',
//           innerHTML: `
//             // 设置已验证 Cookie（24 小时有效）
//             function setVerifiedCookie() {
//               const d = new Date();
//               d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
//               document.cookie = "turnstile_verified=true; expires=" + d.toUTCString() + "; path=/";
//             }

//             // 检查是否已验证
//             function isVerified() {
//               const name = "turnstile_verified=";
//               const decodedCookie = decodeURIComponent(document.cookie);
//               const ca = decodedCookie.split(';');
//               for (let i = 0; i < ca.length; i++) {
//                 let c = ca[i].trim();
//                 if (c.indexOf(name) === 0) {
//                   return true;
//                 }
//               }
//               return false;
//             }

//             // 当 Turnstile SDK 加载完成后执行
//             function onTurnstileLoad() {
//               // 开发环境跳过验证
//               if (window.location.hostname === 'localhost') {
//                 console.log('✅ Running in development mode. Turnstile verification is disabled.');
//                 return;
//               }

//               // 如果已验证，直接退出
//               if (isVerified()) {
//                 return;
//               }

//               // 创建全屏遮罩层（白色背景，无模糊）
//               const overlay = document.createElement('div');
//               overlay.id = 'turnstile-overlay';
//               overlay.style.position = 'fixed';
//               overlay.style.top = '0';
//               overlay.style.left = '0';
//               overlay.style.width = '100%';
//               overlay.style.height = '100%';
//               overlay.style.backgroundColor = 'white'; // ✅ 改为纯白背景
//               overlay.style.zIndex = '99999';
//               overlay.style.display = 'flex';
//               overlay.style.justifyContent = 'center';
//               overlay.style.alignItems = 'center';
//               overlay.style.flexDirection = 'column'; // 垂直排列 Logo 和 Turnstile
//               overlay.style.gap = '24px'; // Logo 和 Turnstile 间距
//               overlay.style.padding = '20px';

//               // 禁用页面滚动
//               document.body.style.overflow = 'hidden';
//               document.body.style.touchAction = 'none';

//               // 创建 Logo 容器（居中显示）
//               const logoContainer = document.createElement('div');
//               logoContainer.style.display = 'flex';
//               logoContainer.style.justifyContent = 'center';
//               logoContainer.style.alignItems = 'center';
//               logoContainer.style.marginBottom = '16px';

//               const logoImg = document.createElement('img');
//               logoImg.src = 'https://docs.zyhorg.cn/img/logo.svg'; // ✅ 使用你的 Logo
//               logoImg.alt = 'UNHub Logo';
//               logoImg.style.height = '80px'; // 可调整大小
//               logoImg.style.objectFit = 'contain';

//               logoContainer.appendChild(logoImg);
//               overlay.appendChild(logoContainer);

//               // 创建 Turnstile 容器（居中）
//               const turnstileContainer = document.createElement('div');
//               turnstileContainer.id = 'turnstile-container';
//               turnstileContainer.style.transform = 'scale(1.2)'; // 放大 1.2 倍
//               turnstileContainer.style.transformOrigin = 'center';
//               overlay.appendChild(turnstileContainer);

//               // 添加加载提示文本
//               const loadingText = document.createElement('div');
//               loadingText.style.color = '#333';
//               loadingText.style.fontSize = '16px';
//               loadingText.style.fontWeight = '500';
//               loadingText.style.textAlign = 'center';
//               loadingText.textContent = '正在验证您是否是真人。这可能需要几秒钟时间。';
//               overlay.appendChild(loadingText);

//               document.body.appendChild(overlay);

//               // 🔥 关键：请确保替换为你自己的 Site Key！
//               const siteKey = '0x4AAAAAAB2kTE457GPaMQgx';

//               // 渲染 Turnstile
//               window.turnstile.render('#turnstile-container', {
//                 sitekey: siteKey,
//                 callback: function(token) {
//                   // 成功验证
//                   setVerifiedCookie();
//                   overlay.remove();
//                   document.body.style.overflow = '';
//                   document.body.style.touchAction = '';
//                   console.log('✅ Turnstile verification successful!');
//                 },

//                 'error-callback': function(error) {
//                   console.error('❌ Turnstile Error:', error);

//                   // 移除加载文本
//                   const loadingTextEl = overlay.querySelector('div[style*="color"]'); 
//                   if (loadingTextEl) loadingTextEl.remove();

//                   // 根据不同错误类型显示不同提示
//                   let errorMessage = '';
//                   switch (error) {
//                     case 'timeout':
//                       errorMessage = '⏰ 验证超时，请刷新页面重试。';
//                       break;
//                     case 'bad-response':
//                       errorMessage = '🌐 网络异常或服务器响应错误，请检查网络后重试。';
//                       break;
//                     case 'invalid-site-key':
//                       errorMessage = '🔐 站点密钥无效，请联系管理员。';
//                       break;
//                     case 'failed':
//                     default:
//                       errorMessage = '🚫 验证失败，请尝试重新操作。如多次失败，请联系技术支持。';
//                   }

//                   // 显示错误信息
//                   const errorDiv = document.createElement('div');
//                   errorDiv.style.color = '#e74c3c';
//                   errorDiv.style.fontSize = '18px';
//                   errorDiv.style.fontWeight = '600';
//                   errorDiv.style.textAlign = 'center';
//                   errorDiv.style.marginTop = '16px';
//                   errorDiv.style.padding = '12px';
//                   errorDiv.style.border = '1px solid #e74c3c';
//                   errorDiv.style.borderRadius = '8px';
//                   errorDiv.style.backgroundColor = '#fdf2f2';
//                   errorDiv.textContent = errorMessage;

//                   overlay.appendChild(errorDiv);

//                   // 提供“重试”按钮
//                   const retryButton = document.createElement('button');
//                   retryButton.style.backgroundColor = '#3498db';
//                   retryButton.style.color = 'white';
//                   retryButton.style.border = 'none';
//                   retryButton.style.padding = '12px 24px';
//                   retryButton.style.borderRadius = '6px';
//                   retryButton.style.fontSize = '16px';
//                   retryButton.style.cursor = 'pointer';
//                   retryButton.style.marginTop = '20px';
//                   retryButton.textContent = '🔄 重试验证';

//                   retryButton.addEventListener('click', () => {
//                     overlay.removeChild(errorDiv);
//                     overlay.removeChild(retryButton);
//                     loadingText.textContent = '正在重新加载验证...';
//                     window.turnstile.reset(); // 重置组件
//                   });

//                   overlay.appendChild(retryButton);

//                   // ✅ 错误时也恢复滚动
//                   document.body.style.overflow = '';
//                   document.body.style.touchAction = '';
//                 }
//               });
//             }
//           `,
//         },
//       ],
//     };
//   },
// }),

    // ✅ 新增：全局注入脚本，强制弹窗警告
    () => ({
  name: 'docusaurus-plugin-alert-private-access',
  injectHtmlTags() {
    return {
      headTags: [
        {
          tagName: 'script',
          innerHTML: `
            (function() {
              // 监听所有点击事件
              document.addEventListener('click', function(e) {
                let target = e.target;
                // 向上查找 <a> 标签
                while (target && target !== document) {
                  if (target.tagName === 'A' && target.getAttribute('href')) {
                    const href = target.getAttribute('href');
                    
                    // 判断是否是站内链接且以 /private/ 开头
                    if (href.startsWith('/private/') && !href.startsWith('http')) {
                      // 阻止默认跳转
                      e.preventDefault();
                      
                      // 弹出确认框
                      const confirmed = confirm(
                        '⚠️ 请注意，您正在访问受保护的内参文档。\\n\\n' +
                        '您的所有访问行为将被记录并审计。\\n\\n' +
                        '点击继续完成身份验证，已验证身份当天即可忽略警告。\\n' +
                        '在内参板块点击每个文档均会弹出此警告以提示数据安全。\\n\\n' +
                        '是否继续？\\n' +
                        '点击继续则表明您将接受我们的安全条款。'
                      );
                      
                      if (confirmed) {
                        // 直接跳转到目标页面（强制走服务端）
                        window.location.href = href;
                      }
                      return false;
                    }
                    break;
                  }
                  target = target.parentNode;
                }
              }, true);

              // SPA 路由变化时也检查（可选）
              const originalPushState = history.pushState;
              history.pushState = function(...args) {
                originalPushState.apply(this, args);
                // 可在此处添加日志或监控
              };
            })();
          `,
        },
      ],
    };
  },
}),
  // ✅ 3. 新增：Microsoft Clarity 跟踪插件 👇
  () => ({
    name: 'docusaurus-plugin-clarity',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
            },
            innerHTML: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "tenruiomq3");
            `,
          },
        ],
      };
    },
  }),
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'docs',
      path: 'docs',
      routeBasePath: 'docs',
      sidebarPath: './sidebars.js',
      editUrl: 'https://github.com/zyhgov/UNHub-DOCS/edit/main/', // ✅ 已修正
            // 👇 关键：在这里启用
      showLastUpdateTime: true,

    },
  ],
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'private',
      path: 'docs-private',
      routeBasePath: 'private',
      sidebarPath: './sidebars-private.js',
      editUrl: 'https://github.com/zyhgov/UNHub-DOCS/edit/main/', // ✅ 已修正
            // 👇 关键：在这里启用
      showLastUpdateTime: true,

    },
  ],
  [
    '@docusaurus/plugin-content-docs',
    {
      id: 'os',
      path: 'docs-os',
      routeBasePath: 'os',
      sidebarPath: './sidebars-os.js',
      editUrl: 'https://github.com/zyhgov/UNHub-DOCS/edit/main/',
            // 👇 关键：在这里启用
      showLastUpdateTime: true,
    },
  ],
    [
    '@docusaurus/plugin-content-docs',
    {
      id: 'news',
      path: 'docs-news',
      routeBasePath: 'news',
      sidebarPath: './sidebars-news.js',
      editUrl: 'https://github.com/zyhgov/UNHub-DOCS/edit/main/',
            // 👇 关键：在这里启用
      showLastUpdateTime: true,

    },
  ],
],
  themeConfig: {
  image: 'img/bg.jpg',
      giscus: {
      repo: 'zyhgov/UNHub-DOCS',
      repoId: 'R_kgDOP0b-VQ',
      category: 'Docs Comments',
      categoryId: 'DIC_kwDOP0b-Vc4Cv1Ns',
    },
  metadata: [
    // 🔍 页面关键词（SEO）
    { name: 'keywords', content: 'UNHub, UNHub文档, 云系统, 运维手册, 操作教程, 企业内参, 技术文档' },
    // 🐦 Twitter 卡片
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'UNHub DOCS' },
    { name: 'twitter:description', content: 'UNHub DOCS提供全面的系统使用指南、操作教程和最佳实践。' },
    { name: 'twitter:image', content: 'https://docs.zyhorg.cn/img/bg.jpg' },
    // 🌐 Open Graph（用于微信、Facebook 等社交分享）
    { name: 'og:title', content: 'UNHub DOCS' },
    { name: 'og:description', content: 'UNHub DOCS提供全面的系统使用指南、操作教程和最佳实践。' },
    { name: 'og:image', content: 'https://docs.zyhorg.cn/img/bg.jpg'},
    { name: 'og:url', content: 'https://docs.zyhorg.cn'},
    { name: 'og:type', content: 'website' },
  ],
  headTags: [
    // ✅ 新增：SEO meta 标签
    { tagName: 'meta', attributes: { name: 'keywords', content: 'UNHub, UNHub文档, 云系统, 运维手册, 操作教程, 企业内参, 技术文档' } },
    { tagName: 'meta', attributes: { name: 'description', content: 'UNHub DOCS提供全面的系统使用指南、操作教程和最佳实践。' } },
    { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary_large_image' } },
    { tagName: 'meta', attributes: { name: 'twitter:title', content: 'UNHub DOCS' } },
    { tagName: 'meta', attributes: { name: 'twitter:description', content: 'UNHub DOCS提供全面的系统使用指南、操作教程和最佳实践。' } },
    { tagName: 'meta', attributes: { name: 'twitter:image', content: 'https://docs.zyhorg.cn/img/bg.jpg' } },
    { tagName: 'meta', attributes: { property: 'og:title', content: 'UNHub DOCS' } },
    { tagName: 'meta', attributes: { property: 'og:description', content: 'UNHub DOCS提供全面的系统使用指南、操作教程和最佳实践。' } },
    { tagName: 'meta', attributes: { property: 'og:image', content: 'https://docs.zyhorg.cn/img/bg.jpg' } },
    { tagName: 'meta', attributes: { property: 'og:url', content: 'https://docs.zyhorg.cn' } },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },

    // 🔗 预连接到关键域名（提升加载速度）
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://docs.zyhorg.cn',
        crossorigin: 'anonymous',
      },
    },
    // 🧩 结构化数据：Organization（帮助搜索引擎理解你的网站）
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'UNHub DOCS',
        url: 'https://docs.zyhorg.cn',
        logo: 'https://docs.zyhorg.cn/img/logo.svg',
        description: 'UNHub DOCS 一般性笔记文档网站。',
        sameAs: [
          'https://github.com/zyhgov',
          'https://zyhorg.cn'
        ]
      }),
    },
    // 📚 可选：为首页添加 WebSite 结构化数据
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'UNHub文档',
        url: 'https://docs.zyhorg.cn',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://docs.zyhorg.cn/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }),
    },
  ],
    navbar: {
      // title: 'UNHub DOCS',
      logo: {
        alt: 'UNHub Logo',
        src: 'img/light-logo.png',
        srcDark: 'img/dark-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          docsPluginId: 'docs',
          position: 'left',
          label: '文档教程',
        },
        {
          type: 'docSidebar',
          sidebarId: 'os',
          docsPluginId: 'os',
          position: 'left',
          label: '开源项目',
        },
        {
          type: 'docSidebar',
          sidebarId: 'news',
          docsPluginId: 'news',
          position: 'left',
          label: '前线资讯',
        },
        {
          type: 'docSidebar',
          sidebarId: 'private',
          docsPluginId: 'private',
          position: 'left',
          label: '内部参考',
        },
        { to: '/blog', label: '日志更新', position: 'left' },
        
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/zyhgov', // ✅ 去掉空格
          label: 'GitHub',
          position: 'right',
        },
        
      ],
    },
    footer: {
      style: 'dark',
        logo: {
          alt: 'UNHub健康 Footer Logo',
          src: 'img/logo-footer.png', // 支持 SVG、PNG 等格式
          width: 333,  // 可选：设置宽度（像素）
          // height: 40,  // 可选：设置高度
          // url: 'https://docs.zyhorg.cn' // 可选：点击 logo 跳转链接
        },
      links: [
        {
          title: '快速导航',
          items: [
            {
              label: '文档教程',
              to: '/docs/intro',
            },
            {
              label: '开源项目',
              to: '/os',
            },
            {
              label: '前线资讯',
              to: '/news',
            },
            {
              label: '内部参考',
              to: '/private',
            },
            {
              label: '日志更新',
              to: '/blog',
            },
          ],
        },
        {
          title: 'UNHub矩阵',
          items: [
            {
              label: '杖雍皓',
              href: 'https://zyhorg.cn/', // ✅ 去掉空格
            },
          ],
        },
        {
          title: '关注与联系',
          items: [

            {
              label: 'info@zyhorg.cn',
              href: 'mailto:info@zyhorg.cn',
            },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://github.com/zyhgov" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/github.svg" alt="Docusaurus Logo" height="23" style="vertical-align: middle;" />
            <span>GitHub</span>
          </a>
        </div>
      `
    },
          ],
        },
{
  title: '技术驱动支持',
  items: [
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://docusaurus.io/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/docusaurus.svg" alt="Docusaurus Logo" height="23" style="vertical-align: middle;" />
            <span>Docusaurus</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://www.cloudflare.com/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/cloudflare.svg" alt="Cloudflare Logo" height="15" style="vertical-align: middle;" />
            <span>Cloudflare</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://www.cloudflare-cn.com/application-services/products/turnstile/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/cloudflare-zero-trust.svg" alt="Cloudflare Logo" height="25" style="vertical-align: middle;" />
            <span>Turnstile</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://www.algolia.com/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/algolia.svg" alt="Algolia Logo" height="20" style="vertical-align: middle;" />
            <span>Algolia</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://react.dev/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/react.svg" alt="React Logo" height="23" style="vertical-align: middle;" />
            <span>React</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://echarts.apache.org/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/ECharts.svg" alt="ECharts Logo" height="20" style="vertical-align: middle;" />
            <span>ECharts</span>
          </a>
        </div>
      `
    },
    {
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 120px; gap: 8px; white-space: nowrap;">
          <a href="https://gsap.com/" style="display: flex; align-items: center; gap: 8px; color: inherit; text-decoration: none;">
            <img src="/img/logos/GSAP.svg" alt="ECharts Logo" height="20" style="vertical-align: middle;" />
            <span>GSAP</span>
          </a>
        </div>
      `
    }
  ]
}
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()} UNHub 联合库. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'rust', 'go', 'java', 'bash', 'docker'],
    },

    // ✅ 3. 可选：设置 Mermaid 主题（推荐加上）
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
    },
    algolia: {
      // Algolia 提供的应用 ID
      appId: 'LNK66CH6FL',

      //  公开 API 密钥：提交它没有危险
      apiKey: '8bd0bf7d484c04950368797c46a1ce3a',
      indexName: 'unhub-docs-index',
      // indexName: 'rsjk_zyhgov_cn_spm1vvuqfu_pages',

      // 可选：见下文
      contextualSearch: true,

      // 可选：声明哪些域名需要用 window.location 型的导航而不是 history.push。 适用于 Algolia 配置会爬取多个文档站点，而我们想要用 window.location.href 在它们之间跳转时。
      // externalUrlRegex: 'external\\.com|domain\\.com',

      // 可选：替换 Algolia 的部分网址。 在使用相同搜索索引支持多个不同 baseUrl 的部署时非常有用。 你可以在 “from” 中使用正则表达式或字符串。 比方说，localhost:3000 和 myCompany.com/docs
      replaceSearchResultPathname: {
        // 匹配所有不在 /docs/ 下但应该是的路径
        from: '^/(?!(docs|os|news|private|blog|search)/)([^/]+)$',
        to: '/docs/$2',
      },

      // 可选：Algolia 搜索参数
      searchParameters: {},
      placeholder: '搜索 UNHub DOCS',

      // 可选：默认启用的搜索页路径（传递 `false` 以禁用它）
      searchPagePath: 'search',

      // 可选：Docsearch 的 insights 功能是否启用（默认为 `false`）
      insights: false,

      //... 其他 Algolia 参数
    },
  },
};

export default config;
