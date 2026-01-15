import { Router } from 'express';
import {
  createDownload,
  getDownloads,
  getDownloadById,
  deleteDownload,
  getDownloadStats,
  downloadFile,
} from '../controllers/download.controller';
import { authenticate } from '../middleware/auth';
import { downloadLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/', downloadLimiter, createDownload);
router.get('/', getDownloads);
router.get('/stats', getDownloadStats);
router.get('/:id', getDownloadById);
router.delete('/:id', deleteDownload);
router.get('/:id/file', downloadFile);

export default router;
