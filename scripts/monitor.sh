#!/bin/bash

# TaskFlow Monitoring Script
set -e

echo "📊 TaskFlow System Monitor"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Container status
check_containers() {
    print_header "🐳 Container Status"
    
    if docker compose ps | grep -q "Up"; then
        print_success "Containers are running"
        docker compose ps
    else
        print_error "Some containers are not running"
        docker compose ps
        return 1
    fi
}

# Health checks
check_health() {
    print_header "🏥 Health Checks"
    
    # App health
    if curl -s http://localhost/health > /dev/null; then
        print_success "Application health check passed"
        echo "Health status:"
        curl -s http://localhost/health | jq . 2>/dev/null || curl -s http://localhost/health
    else
        print_error "Application health check failed"
    fi
    
    echo ""
    
    # Nginx health
    if curl -s http://localhost/nginx-health > /dev/null; then
        print_success "Nginx health check passed"
    else
        print_error "Nginx health check failed"
    fi
    
    echo ""
    
    # Database health
    if docker compose exec -T postgres pg_isready -U taskflow_user -d taskflow > /dev/null 2>&1; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
    fi
}

# System resources
check_resources() {
    print_header "📈 System Resources"
    
    echo "Container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
    echo "Host system resources:"
    echo "CPU Usage: $(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' 2>/dev/null || echo "N/A")"
    echo "Memory Usage: $(free -h 2>/dev/null | grep "Mem:" | awk '{print $3 "/" $2}' || echo "N/A")"
    echo "Disk Usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
}

# Application metrics
check_metrics() {
    print_header "📊 Application Metrics"
    
    # API response time
    if command -v curl > /dev/null; then
        response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost/health)
        echo "API Response Time: ${response_time}s"
    fi
    
    # Task statistics
    if curl -s http://localhost/api/tasks > /dev/null; then
        echo "Task Statistics:"
        curl -s http://localhost/api/tasks | jq '.total' 2>/dev/null | xargs -I {} echo "Total Tasks: {}" || echo "Unable to fetch task stats"
    fi
    
    # Container uptime
    echo ""
    echo "Container Uptime:"
    docker compose ps --format "table {{.Service}}\t{{.Status}}"
}

# Recent logs
check_logs() {
    print_header "📋 Recent Application Logs"
    
    echo "Last 10 application logs:"
    docker compose logs app --tail 10
    
    echo ""
    echo "Last 5 nginx access logs:"
    docker compose logs nginx --tail 5 | grep -E "GET|POST|PUT|DELETE" || echo "No recent access logs"
    
    echo ""
    echo "Recent error logs:"
    docker compose logs --tail 10 | grep -i error || echo "No recent errors found"
}

# Disk usage
check_disk() {
    print_header "💾 Storage Information"
    
    echo "Docker disk usage:"
    docker system df
    
    echo ""
    echo "Application directory size:"
    du -sh /var/www/taskflow-app 2>/dev/null || echo "Unable to calculate directory size"
    
    echo ""
    echo "Log files size:"
    find /var/www/taskflow-app/logs -name "*.log" -exec du -sh {} \; 2>/dev/null || echo "No log files found"
}

# Network status
check_network() {
    print_header "🌐 Network Status"
    
    echo "Docker networks:"
    docker network ls | grep taskflow || echo "No TaskFlow networks found"
    
    echo ""
    echo "Port status:"
    netstat -tlnp 2>/dev/null | grep ":80\|:443\|:3000\|:5432\|:6379" || ss -tlnp | grep ":80\|:443\|:3000\|:5432\|:6379" || echo "Unable to check ports"
}

# Main monitoring function
main() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting TaskFlow monitoring..."
    
    check_containers
    check_health
    check_resources
    check_metrics
    check_logs
    check_disk
    check_network
    
    print_header "✅ Monitoring Complete"
    echo "For real-time monitoring, run: docker compose logs -f"
    echo "For continuous stats, run: docker stats"
}

# Run monitoring
main "$@"