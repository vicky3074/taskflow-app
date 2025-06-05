#!/usr/bin/env node

const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// Simple deployment endpoint
app.get('/deploy', (req, res) => {
  const token = req.query.token;
  if (token !== 'taskflow-deploy-2025') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  console.log('🚀 Deployment triggered via GET request');
  
  res.json({ 
    status: 'accepted', 
    message: 'Deployment started',
    timestamp: new Date().toISOString()
  });

  // Run deployment
  const deployScript = `
    cd /var/www/taskflow-app && \
    git pull origin main && \
    docker compose down && \
    docker compose up -d --build && \
    echo "✅ Deployment complete"
  `;

  exec(deployScript, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deployment failed:', error);
    } else {
      console.log('✅ Deployment successful');
    }
    console.log('Output:', stdout);
    if (stderr) console.error('Errors:', stderr);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'deploy-webhook' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Deploy webhook running on port ${PORT}`);
});