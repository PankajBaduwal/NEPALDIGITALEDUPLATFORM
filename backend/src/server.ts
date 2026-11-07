import http from 'http';
import { createApp } from './app';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { SocketService } from './common/services/socket.service';

// ── Process-level safety net ──────────────────────────────────────────────────────────────
// Without these, a stray rejected promise or a socket error can end the process (Node 22 exits on an
// unhandled rejection) and, under `tsx watch`, nothing explains why the server vanished.
process.on('unhandledRejection', (reason: any) => {
  console.error('⚠️ Unhandled promise rejection (server kept running):', reason?.stack || reason);
});
process.on('uncaughtException', (err: any) => {
  // A server that could not bind its port is not running at all: exit so the watcher/supervisor can report it
  if (err?.code === 'EADDRINUSE') {
    console.error(`❌ Port ${ENV.PORT} is already in use — another copy of the backend is running. Stop it and start again.`);
    process.exit(1);
  }
  console.error('⚠️ Uncaught exception (server kept running):', err?.stack || err);
});
process.on('exit', (code) => console.error(`[process] exiting with code ${code}`));
for (const sig of ['SIGTERM', 'SIGINT', 'SIGHUP'] as const) {
  process.on(sig, () => {
    console.error(`[process] received ${sig}, shutting down`);
    process.exit(0);
  });
}

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO
  SocketService.init(server);

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB database successfully.');
    // Seed Phase 7 Simulation and Activity initial catalog
    const { SimulationActivityService } = await import('./modules/simulation-activity/simulation-activity.service');
    await SimulationActivityService.seedInitialContent();

    // Seed Phase 8 RAG Textbook Knowledge Base
    const { RAGEngineService } = await import('./modules/ai/rag-engine.service');
    await RAGEngineService.seedKnowledgeBase();
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection note: ${err.message}`);
    console.log('ℹ️ Running backend API server with fallback/multi-tenant support.');
  }

  server.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🇳🇵 Nepal Digital Education Platform — MERN Stack API`);
    console.log(`   Running on: http://localhost:${ENV.PORT}`);
    console.log(`   React SPA Frontend: http://localhost:${ENV.PORT}`);
    console.log(`   API v1 Base: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`   Smart Board Interface: http://localhost:${ENV.PORT}/smartboard/index.html`);
    console.log(`   Environment: ${ENV.NODE_ENV}`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping error:', err);
  process.exit(1);
});

