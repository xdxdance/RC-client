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
  const articleData = await fetchFromUrl(url);
  
  const article = await createArticle({
    title: articleData.title,
    url,
    author: articleData.author,
    source: articleData.source,
    cover_image: articleData.cover_image,
    content: articleData.content,
    summary: articleData.summary,
  });
  
  return article;
}
