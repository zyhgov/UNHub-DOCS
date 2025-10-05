// sitemap.js

/**
 * @param {import('@docusaurus/plugin-sitemap').CreateSitemapItemsParams} params
 * @returns {Promise<import('@docusaurus/plugin-sitemap').SitemapItem[]>}
 */
export default async function createSitemapItems({ defaultCreateSitemapItems, ...params }) {
  // 1. 获取 Docusaurus 默认生成的所有 sitemap item
  const items = await defaultCreateSitemapItems(params);

  // 🚨 修正：直接从 items 中获取 loc（完整的 URL），不再需要手动构建 siteUrl
  const siteUrlBase = params.config.url; // 'https://docs.zyhorg.cn'

  return items.map((item) => {
    // loc 已经是完整的 URL，如 'https://docs.zyhorg.cn/docs/intro'
    const loc = item.loc; 
    
    // 我们只需检查路径部分，即去除 https://docs.zyhorg.cn
    const path = loc.replace(siteUrlBase, ''); 

    // --- 动态优先级计算逻辑 (使用您的逻辑，但基于 path) ---

    // 首页 (/) 
    if (path === '/') {
      return { ...item, priority: 1.0 };
    }

    // 核心文档首页（如 /docs/intro）。注意：Docusaurus 可能会生成 /docs/intro/
    if (path === '/docs/intro' || path === '/docs/intro/') {
      return { ...item, priority: 1.0 };
    }

    // 核心教程
    if (
      path.includes('/docs/tutorial-system/') ||
      path.includes('/docs/tutorial-extras/') ||
      path.includes('/docs/Command-List/') ||
      path.includes('/docs/script/') ||
      path.includes('/docs/cloudflare/')
    ) {
      return { ...item, priority: 0.9 };
    }

    // 主文档区（/docs/ 下的其他页面）
    if (path.startsWith('/docs/') && !path.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 前线资讯（news）
    if (path.startsWith('/news/') && !path.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 开源项目（os）
    if (path.startsWith('/os/') && !path.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 博客文章（非列表页）
    if (
      path.startsWith('/blog/') &&
      path !== '/blog/' &&
      !path.includes('/archive') &&
      !path.includes('/authors') &&
      !path.includes('/tags/')
    ) {
      return { ...item, priority: 0.9 };
    }

    // 博客列表、标签页、归档等次要页面
    if (
      path.includes('/blog/archive') ||
      path.includes('/blog/authors') ||
      path.includes('/blog/tags') ||
      path.includes('/docs/tags') ||
      path.includes('/news/tags') ||
      path.includes('/os/tags')
    ) {
      return { ...item, priority: 0.8 };
    }

    // 搜索页、markdown 示例页等
    if (path === '/search' || path === '/markdown-page') {
      return { ...item, priority: 0.8 };
    }

    // 默认 fallback 
    return { ...item, priority: 0.6 };
  });
}