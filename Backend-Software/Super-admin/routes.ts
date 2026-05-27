import { Router } from 'express';

const router = Router();

// Super-Admin Health Check
router.get('/health', (req, res) => {
  res.json({ module: 'Super-admin', status: 'OK', timestamp: new Date() });
});

// Future: Add platform-level tenant and global metrics endpoints here

export default router;
