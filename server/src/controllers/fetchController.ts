import { Router } from 'express';
import { createArticle, getArticles } from '../storage/database/shared/relations.js';

const router = Router();

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

  // 简单的 HTTP fetch 来获取页面内容
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
  console.log(`[FetchController] Simple fetch for: ${url}`);

  // 提取 title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  let title = titleMatch ? titleMatch[1].trim() : '无标题';

  // 尝试提取 meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const summary = descMatch ? descMatch[1].trim() : '';

  // 提取正文内容 (简化版)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const content = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

  // 提取图片
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const cover_image = ogImageMatch ? ogImageMatch[1] : null;

  console.log(`[FetchController] Fetch success, title: ${title}`);

  return {
    title,
    url,
    author: null,
    source: new URL(url).hostname.replace('www.', ''),
    cover_image,
    content,
    summary: summary || content.substring(0, 200),
  };
}

router.post('/fetch', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`[FetchController] Attempting to fetch: ${url}`);

  try {
    const articleData = await fetchFromUrl(url);

    console.log(`[FetchController] Saving to database...`);
    const article = await createArticle({
      title: articleData.title,
      url,
      author: articleData.author,
      source: articleData.source,
      cover_image: articleData.cover_image,
      content: articleData.content,
      summary: articleData.summary,
    });

    console.log(`[FetchController] Database insert result:`, JSON.stringify(article));
    const articleId = article?.data?.id || article?.id;
    console.log(`[FetchController] Article created with ID: ${articleId}`);

    // 返回创建的文章
    res.json(article?.data || article);
  } catch (error: any) {
    console.error(`[FetchController] Fetch failed: ${error.message}`);
    res.status(500).json({ error: `获取文章失败: ${error.message}` });
  }
});

export default router;
