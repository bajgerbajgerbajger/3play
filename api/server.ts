/**
 * local server entry file, for local development
 */
import 'dotenv/config'; // Load env vars immediately
import mongoose from 'mongoose';
import app from './_lib/app.js';
import { seedDatabase } from './_lib/lib/seed.js';
import dbConnect from './_lib/lib/db.js';

/**
 * start server with port
 */
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

// Connect to DB and Seed on startup
dbConnect().then(() => {
  seedDatabase().catch(err => console.error('Seed failed:', err));
}).catch(err => console.error('DB Connection failed:', err));

const server = app.listen(PORT, HOST, () => {
  console.log(`Server ready on http://${HOST}:${PORT}`);
});

// Disable timeout for large uploads (Unlimited Video Upload Architecture)
server.timeout = 0;
server.keepAliveTimeout = 0;

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * close server
 */
const shutdown = (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    // Allow DB connection to close if needed
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;