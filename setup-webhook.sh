#!/bin/bash

echo "🚀 Setting up deployment webhook on DigitalOcean..."

# Copy webhook server to production location
sudo mkdir -p /opt/taskflow-webhook
sudo cp deploy-webhook.js /opt/taskflow-webhook/
sudo chmod +x /opt/taskflow-webhook/deploy-webhook.js

# Create systemd service file
sudo tee /etc/systemd/system/taskflow-webhook.service > /dev/null << EOF
[Unit]
Description=TaskFlow Deployment Webhook
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/taskflow-webhook
ExecStart=/usr/bin/node deploy-webhook.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=DEPLOY_TOKEN=taskflow-deploy-secret-2025

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable taskflow-webhook
sudo systemctl start taskflow-webhook

# Check status
sudo systemctl status taskflow-webhook

echo "✅ Webhook setup complete!"
echo "🌐 Webhook available at: http://YOUR_IP:3001/deploy"
echo "🔐 Deploy token: taskflow-deploy-secret-2025"