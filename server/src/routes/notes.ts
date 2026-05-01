import { Router } from 'express';
import * as noteController from '../controllers/noteController.js';

const router = Router();

// 获取笔记列表
router.get('/', async (req, res) => {
  try {
    const { note_type } = req.query;
    const notes = await noteController.getNotes(note_type as string | undefined);
    res.json({ success: true, data: notes });
  } catch (error: any) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个笔记
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid note ID' });
    }
    
    const note = await noteController.getNoteById(id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    res.json({ success: true, data: note });
  } catch (error: any) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取文章的笔记
router.get('/article/:articleId', async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    if (isNaN(articleId)) {
      return res.status(400).json({ success: false, error: 'Invalid article ID' });
    }
    
    const notes = await noteController.getNotesByArticleId(articleId);
    res.json({ success: true, data: notes });
  } catch (error: any) {
    console.error('Get article notes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建笔记
router.post('/', async (req, res) => {
  try {
    const { article_id, content, thought, note_type, tag_ids } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    const note = await noteController.createNote({
      article_id: article_id || null,
      content,
      thought: thought || null,
      note_type: note_type || '摘录',
      tag_ids: tag_ids || []
    });
    
    res.json({ success: true, data: note });
  } catch (error: any) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新笔记
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid note ID' });
    }
    
    const { content, thought, note_type, tag_ids } = req.body;
    
    await noteController.updateNote(id, {
      content,
      thought,
      note_type,
      tag_ids
    });
    
    const updatedNote = await noteController.getNoteById(id);
    res.json({ success: true, data: updatedNote });
  } catch (error: any) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除笔记
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid note ID' });
    }
    
    await noteController.deleteNote(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
