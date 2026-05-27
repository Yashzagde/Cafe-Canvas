import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date() });
});

// Users Endpoints
router.get('/users', UserController.getUsers);
router.post('/users', UserController.createUser);

// Pre-Registrations Endpoints
router.get('/pre-registrations', UserController.getPreRegistrations);
router.post('/pre-registrations', UserController.createPreRegistration);

export default router;
