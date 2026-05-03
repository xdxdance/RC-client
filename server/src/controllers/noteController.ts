import type { Request, Response } from 'express';
import * as relations from '../storage/database/shared/relations';

export async function getNotes(req: Request, res: Response) {
  try {
    const { article_id } = req.query;
    const { data, error } = await relations.getNotes(
      article_id ? parseInt(article_id as string) : undefined
    );
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
}

export async function getNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data, error } = await relations.getNoteById(parseInt(id));
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const { article_id, type, content, page_number, chapter } = req.body;
    const { data, error } = await relations.createNote({
      article_id: article_id || null,
      type,
      content,
      page_number,
      chapter,
    });
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
}

export async function updateNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { article_id, type, content, page_number, chapter } = req.body;
    const { data, error } = await relations.updateNote(parseInt(id), {
      article_id,
      type,
      content,
      page_number,
      chapter,
    });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await relations.deleteNote(parseInt(id));
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
}
