#!/usr/bin/env node

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Simple token-based authentication
const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || 'taskflow-deploy-secret-2025';

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'deploy-webhook' });
});

// Deployment webhook endpoint
app.post('/deploy', (req, res) => {
  console.log('🔔 Deployment webhook received');
  
  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${DEPLOY_TOKEN}`) {
    console.log('❌ Unauthorized deployment attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ref, sha, repository } = req.body;
  console.log(`📦 Deploying ${repository}@${sha} (${ref})`);

  // Respond immediately to avoid GitHub timeout
  res.json({ 
    status: 'accepted', 
    message: 'Deployment started',
    sha: sha?.substring(0, 8)
  });

  // Run deployment in background
  const deployScript = `
    echo "🚀 Starting deployment..."
    cd /var/www/taskflow-app || exit 1
    
    echo "📥 Pulling latest code..."
    git pull origin main
    
    echo "🛑 Stopping existing containers..."
    docker compose down
    
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    
    echo "🐳 Building and starting containers..."
    docker compose up -d --build
    
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    echo "🏥 Performing health check..."
    for i in {1..5}; do
      if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "✅ Health check passed!"
        break
      else
        echo "❌ Health check failed, attempt $i/5"
        if [ $i -eq 5 ]; then
          echo "🚨 Deployment failed - health check never passed"
          docker compose logs
          exit 1
        fi
        sleep 10
      fi
    done
    
    echo "📊 Deployment complete! Container status:"
    docker compose ps
    
    echo "🌍 Application is live!"
  `;

  exec(deployScript, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Deployment failed:', error);
      console.error('stderr:', stderr);
    } else {
      console.log('✅ Deployment completed successfully');
    }
    console.log('stdout:', stdout);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Deploy webhook server running on port ${PORT}`);
  console.log(`🔐 Deploy token: ${DEPLOY_TOKEN}`);
});