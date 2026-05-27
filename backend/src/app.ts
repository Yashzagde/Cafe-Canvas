import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing namespace
app.use('/api', apiRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
