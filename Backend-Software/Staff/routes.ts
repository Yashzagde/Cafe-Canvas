import { Router } from 'express';

const router = Router();

// Staff Health Check
router.get('/health', (req, res) => {
  res.json({ module: 'Staff', status: 'OK', timestamp: new Date() });
});

// Future: Add staff tablet operations like taking orders and POS here

export default router;
