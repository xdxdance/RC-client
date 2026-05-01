import { Router } from 'express';
import * as articleController from '../controllers/articleController.js';
import * as fetchController from '../controllers/fetchController.js';

const router = Router();

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const { source } = req.query;
    const articles = await articleController.getArticles(source as string | undefined);
    
    // 为每个文章统计笔记数量
    const client = (await import('@/storage/database/supabase-client.js')).getSupabaseClient();
    const result = await Promise.all(
      articles.map(async (article: any) => {
        const { count } = await client
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('article_id', article.id);
        return { ...article, note_count: count || 0 };
      })
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Get articles error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个文章
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }
    
    const article = await articleController.getArticleWithNoteCount(id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({ success: true, data: article });
  } catch (error: any) {
    console.error('Get article error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建文章（通过 URL 抓取）
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    
    // 抓取文章内容
    const content = await fetchController.fetchArticleContent(url);
    
    // 创建文章记录
    const article = await articleController.createArticle({
      url,
      title: content.title,
      summary: content.summary,
      cover_image: content.cover_image,
      source: content.source,
      content: content.content
    });
    
    res.json({ success: true, data: article });
  } catch (error: any) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除文章
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }
    
    await articleController.deleteArticle(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete article error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
