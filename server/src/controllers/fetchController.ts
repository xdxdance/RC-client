import { createArticle } from '../storage/database/shared/relations.js';

interface ArticleData {
  title: string;
  url: string;
  author?: string;
  source?: string;
  cover_image?: string;
  content?: string;
  summary?: string;
}

async function fetchFromUrl(url: string): Promise<ArticleData> {
  console.log(`[FetchController] Starting fetch for URL: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const html = await response.text();
  
  // 从 HTML 中提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '无标题';

  // 尝试提取作者
  const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']author["']/i);
  const author = authorMatch ? authorMatch[1] : null;

  // 尝试提取封面图
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  const cover_image = ogImageMatch ? ogImageMatch[1] : null;

  // 简单提取正文内容（第一个长文本段落）
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = '';
  if (bodyMatch) {
    // 移除 HTML 标签获取纯文本
    content = bodyMatch[1]
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // 截取前2000字符
    content = content.substring(0, 2000);
  }

  // 提取 source 域名
  let source = null;
  try {
    source = new URL(url).hostname;
  } catch (e) {
    source = null;
  }

  console.log(`[FetchController] Fetch success, title: ${title}`);

  return {
    title,
    url,
    author,
    source,
    cover_image,
    content,
    summary: content.substring(0, 500),
  };
}

export async function fetchAndSaveArticle(url: string) {
  console.log(`[FetchController] Attempting to fetch: ${url}`);
  
  const articleData = await fetchFromUrl(url);
  console.log(`[FetchController] Simple fetch for: ${url}`);
  
  try {
    console.log(`[FetchController] Saving to database...`);
    const article = await createArticle({
      title: articleData.title,
      url: articleData.url,
      author: articleData.author,
      source: articleData.source,
      cover_image: articleData.cover_image,
      content: articleData.content,
      summary: articleData.summary,
    });

    console.log(`[FetchController] Database insert result:`, JSON.stringify(article));
    const articleId = article?.data?.id || article?.id;
    console.log(`[FetchController] Article created with ID: ${articleId}`);

    return article?.data || article;
  } catch (error: any) {
    console.error(`[FetchController] Database error: ${error.message}`);
    throw error;
  }
}
