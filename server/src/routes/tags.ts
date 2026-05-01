import { Router } from 'express';
import * as noteController from '../controllers/noteController.js';

const router = Router();

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const tags = await noteController.getTags();
    res.json({ success: true, data: tags });
  } catch (error: any) {
    console.error('Get tags error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建标签
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }
    
    const tag = await noteController.createTag(name.trim());
    res.json({ success: true, data: tag });
  } catch (error: any) {
    console.error('Create tag error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
