import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ module: 'KOS', status: 'OK', timestamp: new Date() });
});

export default router;
