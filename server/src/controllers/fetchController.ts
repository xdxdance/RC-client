import { createArticle } from '../storage/database/shared/relations';

interface FetchResult {
  title: string;
  author?: string;
  source?: string;
  cover_image?: string;
  content: string;
  summary?: string;
}

// 简单HTML解析器
function extractContent(html: string): { title: string; content: string; author?: string; cover_image?: string } {
  // 提取标题
  let titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '无标题';

  // 提取 meta description
  let descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (!descMatch) {
    descMatch = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  }
  const description = descMatch ? descMatch[1].trim() : '';

  // 提取 OG 图片
  let imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (!imgMatch) {
    imgMatch = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  }
  const cover_image = imgMatch ? imgMatch[1] : undefined;

  // 提取作者
  let authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
  const author = authorMatch ? authorMatch[1].trim() : undefined;

  // 提取正文内容（移除script和style标签）
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title,
    content: content.substring(0, 5000), // 限制长度
    author,
    cover_image
  };
}

// 简单 fetch 实现（无需 SDK 配置）
async function simpleFetch(url: string): Promise<FetchResult> {
  console.log(`[FetchController] Simple fetch for: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'Referer': 'https://www.google.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const html = await response.text();
  const extracted = extractContent(html);

  return {
    title: extracted.title,
    author: extracted.author,
    source: new URL(url).hostname,
    cover_image: extracted.cover_image,
    content: extracted.content,
    summary: extracted.content.substring(0, 200),
  };
}

export async function fetchFromUrl(url: string): Promise<FetchResult> {
  console.log(`[FetchController] Attempting to fetch: ${url}`);
  
  // 优先尝试简单实现
  try {
    return await simpleFetch(url);
  } catch (error) {
    console.error(`[FetchController] Simple fetch failed: ${error}`);
    throw new Error('无法获取文章内容，请检查网址是否可访问');
  }
}

export async function fetchAndSaveArticle(url: string) {
  console.log(`[FetchController] Starting fetch for URL: ${url}`);
  
  // 超时处理：10秒超时
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Fetch timeout (10s)')), 10000);
  });
  
  const fetchPromise = fetchFromUrl(url);
  
  let articleData;
  try {
    articleData = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error: any) {
    console.error(`[FetchController] Fetch failed: ${error.message}`);
    throw new Error(`获取文章失败: ${error.message}`);
  }
  
  console.log(`[FetchController] Fetch success, title: ${articleData.title}`);
  
  const article = await createArticle({
    title: articleData.title,
    url,
    author: articleData.author,
    source: articleData.source,
    cover_image: articleData.cover_image,
    content: articleData.content,
    summary: articleData.summary,
  });
  
  console.log(`[FetchController] Article created with ID: ${article.id}`);
  return article;
}
