import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import superAdminRoutes from '../Super-admin/routes.js';
import storeAdminRoutes from '../Store-Admin/routes.js';
import staffRoutes from '../Staff/routes.js';
import kosRoutes from '../KOS/routes.js';

// Routing namespace
app.use('/api', apiRouter); // Base API routes

// Modular Connections
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/store-admin', storeAdminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/kos', kosRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
