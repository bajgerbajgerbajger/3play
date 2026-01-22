/**
 * local server entry file, for local development
 */
import app from './_lib/app.js';

/**
 * start server with port
 */
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`Server ready on http://${HOST}:${PORT}`);
});

/**
 * close server
 */
const shutdown = (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    // Allow DB connection to close if needed
    // mongoose.connection.close(false, () => {
    //   console.log('MongoDB connection closed');
      process.exit(0);
    // });
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