import type { Request, Response } from 'express';
import * as relations from '../storage/database/shared/relations';

export async function getArticles(req: Request, res: Response) {
  try {
    const { data, error } = await relations.getArticles();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error getting articles:', error);
    res.status(500).json({ error: 'Failed to get articles' });
  }
}

export async function getArticle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data, error } = await relations.getArticleById(parseInt(id));
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({ error: 'Failed to get article' });
  }
}

export async function createArticle(req: Request, res: Response) {
  try {
    const { title, url, author, source, cover_image, content, summary } = req.body;
    const { data, error } = await relations.createArticle({
      title,
      url,
      author,
      source,
      cover_image,
      content,
      summary,
    });
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
}

export async function updateArticle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, url, author, source, cover_image, content, summary } = req.body;
    const { data, error } = await relations.updateArticle(parseInt(id), {
      title,
      url,
      author,
      source,
      cover_image,
      content,
      summary,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
}

export async function deleteArticle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await relations.deleteArticle(parseInt(id));
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
}
