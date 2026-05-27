import { Router } from 'express';

const router = Router();

// KOS Health Check
router.get('/health', (req, res) => {
  res.json({ module: 'KOS', status: 'OK', timestamp: new Date() });
});

// Future: Add Kitchen Order System queue and status updates here

export default router;
