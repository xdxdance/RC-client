import { Router } from 'express';
import * as tagController from '../controllers/tagController';

const router = Router();

router.get('/', tagController.getTags);
router.post('/', tagController.createTag);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);
router.post('/article', tagController.addTagToArticle);
router.delete('/article', tagController.removeTagFromArticle);
router.post('/note', tagController.addTagToNote);
router.delete('/note', tagController.removeTagFromNote);

export default router;
