import { Router } from 'express';
import * as articleController from '../controllers/articleController';
import * as fetchController from '../controllers/fetchController';

const router = Router();

// CRUD routes
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticle);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

// Fetch from URL
router.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    const article = await fetchController.fetchAndSaveArticle(url);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

export default router;
