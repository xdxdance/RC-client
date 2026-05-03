import type { Request, Response } from 'express';
import * as relations from '../storage/database/shared/relations';

export async function getTags(req: Request, res: Response) {
  try {
    const { data, error } = await relations.getTags();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
}

export async function createTag(req: Request, res: Response) {
  try {
    const { name, color } = req.body;
    const { data, error } = await relations.createTag({ name, color });
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
}

export async function updateTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const { data, error } = await relations.updateTag(parseInt(id), { name, color });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
}

export async function deleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await relations.deleteTag(parseInt(id));
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
}

export async function addTagToArticle(req: Request, res: Response) {
  try {
    const { article_id, tag_id } = req.body;
    const { error } = await relations.addTagToArticle(article_id, tag_id);
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding tag to article:', error);
    res.status(500).json({ error: 'Failed to add tag to article' });
  }
}

export async function removeTagFromArticle(req: Request, res: Response) {
  try {
    const { article_id, tag_id } = req.body;
    const { error } = await relations.removeTagFromArticle(article_id, tag_id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error removing tag from article:', error);
    res.status(500).json({ error: 'Failed to remove tag from article' });
  }
}

export async function addTagToNote(req: Request, res: Response) {
  try {
    const { note_id, tag_id } = req.body;
    const { error } = await relations.addTagToNote(note_id, tag_id);
    if (error) throw error;
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding tag to note:', error);
    res.status(500).json({ error: 'Failed to add tag to note' });
  }
}

export async function removeTagFromNote(req: Request, res: Response) {
  try {
    const { note_id, tag_id } = req.body;
    const { error } = await relations.removeTagFromNote(note_id, tag_id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error removing tag from note:', error);
    res.status(500).json({ error: 'Failed to remove tag from note' });
  }
}
