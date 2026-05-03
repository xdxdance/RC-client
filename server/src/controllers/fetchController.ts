import { getReportBuffer } from 'coze-coding-dev-sdk';
import { createArticle, updateArticle, getArticleById } from '../storage/database/shared/relations';

interface FetchResult {
  title: string;
  author?: string;
  source?: string;
  cover_image?: string;
  content: string;
  summary?: string;
}

export async function fetchFromUrl(url: string): Promise<FetchResult> {
  try {
    const buffer = await getReportBuffer(url);
    return buffer as unknown as FetchResult;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error('Failed to fetch article from URL');
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
