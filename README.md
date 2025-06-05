# 🚀 TaskFlow - Modern Task Management Application

A comprehensive, production-ready task management application built with Node.js, Docker, and deployed with CI/CD automation.

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Production%20Ready-green?style=for-the-badge)

## ✨ Features

- 🔥 **Modern REST API** - Comprehensive task management endpoints
- 🐳 **Docker Architecture** - Multi-container setup with PostgreSQL & Redis
- 🔒 **Security First** - Rate limiting, security headers, input validation
- 🚀 **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- 📊 **Health Monitoring** - Built-in health checks and monitoring endpoints
- 🎨 **Beautiful Dashboard** - Responsive web interface with real-time stats
- 📈 **Performance Optimized** - Nginx reverse proxy, compression, caching
- 🔧 **Developer Friendly** - Hot reload, comprehensive logging, easy setup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│     Nginx       │    │   TaskFlow      │    │   PostgreSQL    │
│  Reverse Proxy  │◄──►│      API        │◄──►│    Database     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │                 │              │
         └──────────────►│     Redis       │◄─────────────┘
                        │     Cache       │
                        │                 │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 20+ (for local development)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/taskflow-app.git
cd taskflow-app
cp .env.example .env
```

### 2. Start with Docker

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 3. Access Application

- **Web Dashboard**: http://localhost
- **API Documentation**: http://localhost/api
- **Health Check**: http://localhost/health

## 📖 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Web dashboard |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/health` | Health check |
| GET | `/api` | API documentation |

### Example Usage

```bash
# Get all tasks
curl http://localhost/api/tasks

# Create a new task
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","priority":"high"}' \
  http://localhost/api/tasks

# Update task status
curl -X PUT -H "Content-Type: application/json" \
  -d '{"status":"completed"}' \
  http://localhost/api/tasks/1

# Filter tasks
curl "http://localhost/api/tasks?status=completed&priority=high"
```

## 🐳 Docker Services

### Application Stack

- **taskflow-app**: Main Node.js application
- **taskflow-db**: PostgreSQL 15 database
- **taskflow-nginx**: Nginx reverse proxy
- **taskflow-redis**: Redis cache (optional)

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart app

# View service logs
docker compose logs app

# Scale application
docker compose up -d --scale app=3
```

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Variables

Key environment variables (see `.env.example`):

```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_USER=taskflow_user
DB_PASSWORD=secure_password_123
REDIS_HOST=redis
JWT_SECRET=your_jwt_secret
```

## 🚀 Deployment

### DigitalOcean Deployment

1. **Setup Server**:
   ```bash
   # Install Docker on DigitalOcean droplet
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Clone & Deploy**:
   ```bash
   git clone https://github.com/yourusername/taskflow-app.git
   cd taskflow-app
   ./scripts/deploy.sh
   ```

3. **Monitor**:
   ```bash
   ./scripts/monitor.sh
   ```

### CI/CD Pipeline

The application includes a comprehensive GitHub Actions pipeline:

- ✅ **Code Quality**: Linting and testing
- 🔒 **Security**: Vulnerability scanning
- 🐳 **Docker**: Build and test containers
- 🚀 **Deploy**: Automatic deployment to DigitalOcean
- 📊 **Monitor**: Health checks and notifications

#### Setup CI/CD

1. **Add GitHub Secrets**:
   - `DROPLET_IP`: Your DigitalOcean server IP
   - `DROPLET_USER`: SSH username (usually `root`)
   - `SSH_PRIVATE_KEY`: Your SSH private key

2. **Push to main branch** - Deployment happens automatically!

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost/health

# Container status
docker compose ps

# Resource usage
docker stats

# Full system monitor
./scripts/monitor.sh
```

### Logs

```bash
# Application logs
docker compose logs app

# Nginx access logs
docker compose logs nginx

# Database logs
docker compose logs postgres

# All logs with follow
docker compose logs -f
```

### Backup & Recovery

```bash
# Create backup
./scripts/backup.sh

# Database backup
docker compose exec postgres pg_dump -U taskflow_user taskflow > backup.sql

# Restore database
docker compose exec -T postgres psql -U taskflow_user taskflow < backup.sql
```

## 🛠️ Scripts

| Script | Purpose |
|--------|---------|
| `scripts/deploy.sh` | Full deployment automation |
| `scripts/monitor.sh` | System monitoring and health checks |
| `scripts/backup.sh` | Backup application and data |
| `scripts/rollback.sh` | Rollback to previous version |

## 🔒 Security Features

- **Rate Limiting**: API endpoint protection
- **Security Headers**: CORS, XSS protection, content security
- **Input Validation**: Request sanitization
- **Container Security**: Non-root user, minimal attack surface
- **Network Isolation**: Docker network segmentation

## 🎯 Performance Features

- **Nginx Reverse Proxy**: Load balancing and static file serving
- **Redis Caching**: Application-level caching
- **Database Indexing**: Optimized database queries
- **Compression**: Gzip compression for responses
- **Health Checks**: Automatic container restart on failure

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale application containers
docker compose up -d --scale app=3

# Use load balancer
# Update nginx.conf with multiple upstream servers
```

### Vertical Scaling

```bash
# Increase container resources
docker compose up -d --scale app=1 --memory=2g --cpus=2
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "API tests"

# Test Docker build
docker build -t taskflow-test .
docker run --rm taskflow-test npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Container won't start**:
```bash
docker compose logs app
docker compose down && docker compose up -d --build
```

**Database connection failed**:
```bash
docker compose logs postgres
docker compose exec postgres pg_isready -U taskflow_user
```

**Port already in use**:
```bash
# Check what's using the port
lsof -i :80
# Kill the process or change port in docker-compose.yml
```

**Health check failing**:
```bash
curl -v http://localhost/health
docker compose exec app curl localhost:3000/health
```

## 📋 TODO / Roadmap

- [ ] User authentication system
- [ ] WebSocket support for real-time updates
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Mobile app
- [ ] Kubernetes deployment
- [ ] Monitoring dashboard (Grafana)
- [ ] API rate limiting per user

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Node.js and Docker
- Deployed on DigitalOcean
- CI/CD powered by GitHub Actions
- Monitoring with custom scripts

---

**🌟 Star this repo if you found it helpful!**

🚀 **CI/CD Pipeline Test** - Last tested: 2025-06-05 ✅ (RSA Key Implementation)

For questions or support, please open an issue or contact the maintainers.