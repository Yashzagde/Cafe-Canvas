import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Cafe Canva Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints prefixed with /api`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
  console.log(`   - Users:        http://localhost:${PORT}/api/users`);
  console.log(`======================================================\n`);
});

// Handle termination signals gracefully
const gracefulShutdown = () => {
  console.log('Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
