const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { connectDB, getFallbackStore } = require('./config/db');
const domainRoutes = require('./routes/domainRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Seed initial demo domains into memory store if empty
const store = getFallbackStore();
if (store.length === 0) {
  store.push(
    {
      _id: 'seed-1',
      userId: 'default_user',
      domain: 'github.com',
      title: 'GitHub',
      description: 'Build and ship software on a single, collaborative platform.',
      favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
      image: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=600&q=80',
      notes: 'Main source code repositories & open source projects.',
      tags: ['Dev', 'Tools'],
      visitedUrls: ['https://github.com/facebook/react'],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'seed-2',
      userId: 'default_user',
      domain: 'react.dev',
      title: 'React',
      description: 'The library for web and native user interfaces.',
      favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=128',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
      notes: 'React documentation and hooks reference.',
      tags: ['Dev', 'Learning'],
      visitedUrls: ['https://react.dev/learn'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'seed-3',
      userId: 'default_user',
      domain: 'mongodb.com',
      title: 'MongoDB',
      description: 'Build something great with MongoDB.',
      favicon: 'https://www.google.com/s2/favicons?domain=mongodb.com&sz=128',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
      notes: 'Database connection guides and aggregation pipelines.',
      tags: ['Dev', 'Tools'],
      visitedUrls: ['https://www.mongodb.com/docs'],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/domains', domainRoutes);

// Health check endpoints for Render / UptimeRobot monitoring
const healthResponse = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Auto Domain Saver Backend is online',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
};

app.get('/health', healthResponse);
app.get('/api/health', healthResponse);

// Centralized error handler
app.use(errorHandler);

// Automatic Self-Ping Keep-Alive Worker to prevent Render Free Tier Cold Starts (runs every 10 min)
function startKeepAliveWorker() {
  const pingUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL;
  if (!pingUrl) return;

  const targetHealthEndpoint = pingUrl.endsWith('/health') ? pingUrl : `${pingUrl.replace(/\/$/, '')}/health`;

  setInterval(async () => {
    try {
      await axios.get(targetHealthEndpoint, { timeout: 10000 });
      console.log(`📡 [KeepAlive] Pinged ${targetHealthEndpoint} successfully to prevent cold start.`);
    } catch (err) {
      console.warn(`📡 [KeepAlive] Ping warning: ${err.message}`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Connect Database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Auto Domain Saver Backend running on http://localhost:${PORT}`);
    startKeepAliveWorker();
  });
});
