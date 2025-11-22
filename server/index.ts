/**
 * VibeBuild Backend Server
 *
 * Standalone Express server for preview management and build orchestration.
 * Deployed separately on Railway/Render.
 */

import express from 'express';
import cors from 'cors';
import { cleanupAll, loadState } from './preview/previewManager';
import { cleanupAllProcesses } from './preview/processRunner';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET_KEY;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Secret key validation middleware
function requireApiSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const providedSecret = authHeader?.replace('Bearer ', '');

  if (!API_SECRET) {
    console.warn('[Server] API_SECRET_KEY not set - skipping validation');
    return next();
  }

  if (providedSecret !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV
  });
});

// Preview Management Routes
import { startPreview, stopPreview, getPreview, getAllActivePreviews } from './preview/previewManager';

// Start preview
app.post('/api/preview/start', requireApiSecret, async (req, res) => {
  try {
    const { buildId, projectPath, userId } = req.body;

    if (!buildId || !projectPath || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const previewInfo = await startPreview(buildId, projectPath, userId);

    res.json({
      success: true,
      preview: {
        buildId: previewInfo.buildId,
        url: previewInfo.url,
        port: previewInfo.port,
        status: previewInfo.status
      }
    });
  } catch (error: any) {
    console.error('[Preview Start] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get preview status
app.get('/api/preview/:buildId', requireApiSecret, async (req, res) => {
  try {
    const { buildId } = req.params;
    const preview = getPreview(buildId);

    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    res.json({
      buildId: preview.buildId,
      url: preview.url,
      port: preview.port,
      status: preview.status,
      startTime: preview.startTime
    });
  } catch (error: any) {
    console.error('[Preview Get] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop preview
app.post('/api/preview/:buildId/stop', requireApiSecret, async (req, res) => {
  try {
    const { buildId } = req.params;
    const success = await stopPreview(buildId);

    res.json({ success, buildId });
  } catch (error: any) {
    console.error('[Preview Stop] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all previews
app.get('/api/previews', requireApiSecret, async (req, res) => {
  try {
    const previews = getAllActivePreviews();
    res.json({
      count: previews.length,
      previews: previews.map(p => ({
        buildId: p.buildId,
        url: p.url,
        port: p.port,
        status: p.status,
        uptime: Date.now() - p.startTime
      }))
    });
  } catch (error: any) {
    console.error('[Previews List] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
async function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');

  try {
    await cleanupAll();
    await cleanupAllProcesses();
    process.exit(0);
  } catch (error) {
    console.error('[Server] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function start() {
  try {
    // Load saved preview state
    await loadState();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║   VibeBuild Backend Server            ║
║   Status: READY                       ║
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV}         ║
║   Frontend: ${FRONTEND_URL}           ║
╚═══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
