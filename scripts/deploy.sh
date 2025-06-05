#!/bin/bash

# TaskFlow Deployment Script
set -e

echo "🚀 TaskFlow Deployment Starting..."
echo "=================================="

# Configuration
APP_DIR="/var/www/taskflow-app"
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/taskflow-deploy.log"

# Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

error() {
    log "ERROR: $1"
    exit 1
}

success() {
    log "SUCCESS: $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    
    if ! docker compose version >/dev/null 2>&1; then
        error "Docker Compose is not available"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    if [ -d "$APP_DIR" ]; then
        log "Creating backup at $BACKUP_DIR..."
        mkdir -p $BACKUP_DIR
        cp -r $APP_DIR $BACKUP_DIR/
        success "Backup created"
    fi
}

# Pull latest code
pull_code() {
    log "Pulling latest code..."
    cd $APP_DIR
    
    if [ -d ".git" ]; then
        git pull origin main || error "Failed to pull latest code"
    else
        error "Not a git repository"
    fi
    
    success "Code updated"
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    cd $APP_DIR
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker compose down || log "No containers to stop"
    
    # Clean up old images
    log "Cleaning up old images..."
    docker image prune -f
    
    # Build and start new containers
    log "Building and starting containers..."
    docker compose up -d --build || error "Failed to start containers"
    
    success "Containers started"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check health endpoint
    for i in {1..10}; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            success "Health check passed"
            return 0
        else
            log "Health check attempt $i/10 failed, retrying..."
            sleep 10
        fi
    done
    
    error "Health check failed after 10 attempts"
}

# Show status
show_status() {
    log "Deployment status:"
    docker compose ps
    
    log "Application logs (last 20 lines):"
    docker compose logs app --tail 20
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    # Add any cleanup tasks here
}

# Trap cleanup on exit
trap cleanup EXIT

# Main deployment flow
main() {
    log "Starting TaskFlow deployment..."
    
    check_prerequisites
    create_backup
    pull_code
    deploy_app
    health_check
    show_status
    
    success "🎉 TaskFlow deployment completed successfully!"
    log "🌍 Application is live at: http://$(curl -s ifconfig.me)"
}

# Run main function
main "$@"