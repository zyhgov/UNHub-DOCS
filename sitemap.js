// sitemap.js

/**
 * @param {import('@docusaurus/plugin-sitemap').CreateSitemapItemsParams} params
 * @returns {Promise<import('@docusaurus/plugin-sitemap').SitemapItem[]>}
 */
export default async function createSitemapItems({ defaultCreateSitemapItems, ...params }) {
  // 1. 获取 Docusaurus 默认生成的所有 sitemap item
  const items = await defaultCreateSitemapItems(params);

  const siteUrl = params.config.url; // 从配置中获取站点 URL: https://docs.zyhorg.cn [cite: 3]

  return items.map((item) => {
    const loc = item.loc; // loc 就是完整的 URL

    // --- 动态优先级计算逻辑 (使用您的逻辑) ---

    // 首页
    if (loc === siteUrl + '/') {
      return { ...item, priority: 1.0 };
    }

    // 核心文档首页（如 intro）
    if (loc === siteUrl + '/docs/intro') {
      return { ...item, priority: 1.0 };
    }

    // 核心教程
    if (
      loc.includes('/docs/tutorial-system/') ||
      loc.includes('/docs/tutorial-extras/') ||
      loc.includes('/docs/Command-List/') ||
      loc.includes('/docs/script/') ||
      loc.includes('/docs/cloudflare/')
    ) {
      return { ...item, priority: 0.9 };
    }

    // 主文档区（/docs/ 下的其他页面）
    if (loc.startsWith(siteUrl + '/docs/') && !loc.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 前线资讯（news）
    if (loc.startsWith(siteUrl + '/news/') && !loc.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 开源项目（os）
    if (loc.startsWith(siteUrl + '/os/') && !loc.includes('/tags/')) {
      return { ...item, priority: 0.9 };
    }

    // 博客文章（非列表页）
    if (
      loc.startsWith(siteUrl + '/blog/') &&
      !loc.endsWith('/blog/') &&
      !loc.includes('/archive') &&
      !loc.includes('/authors') &&
      !loc.includes('/tags/')
    ) {
      return { ...item, priority: 0.9 };
    }

    // 博客列表、标签页、归档等次要页面
    if (
      loc.includes('/blog/archive') ||
      loc.includes('/blog/authors') ||
      loc.includes('/blog/tags') ||
      loc.includes('/docs/tags') ||
      loc.includes('/news/tags') ||
      loc.includes('/os/tags')
    ) {
      return { ...item, priority: 0.8 };
    }

    // 搜索页、markdown 示例页等
    if (loc === siteUrl + '/search' || loc === siteUrl + '/markdown-page') {
      return { ...item, priority: 0.8 };
    }

    // 默认 fallback (所有未匹配到的页面，如 /blog/、/docs/ 根目录等)
    return { ...item, priority: 0.6 };
  });
}