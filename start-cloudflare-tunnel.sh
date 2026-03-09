#!/bin/bash

# Cloudflare Tunnel Startup Script for Frohline OMS
# Tunnel ID: 90137fe9-7a2d-4159-a433-d1fdef193f83
# Domain: bessar.work

echo "🚀 Starting Cloudflare Tunnel for Frohline OMS..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed. Please install it first."
    exit 1
fi

# Check if credentials exist
if [ ! -f ~/.cloudflared/cert.pem ] && [ ! -f ~/.cloudflared/90137fe9-7a2d-4159-a433-d1fdef193f83.json ]; then
    echo "❌ Cloudflare credentials not found!"
    echo "Please run: cloudflared tunnel login"
    echo "Then run: cloudflared tunnel create frohline-oms"
    exit 1
fi

# Stop any existing cloudflared processes
pkill -f cloudflared 2>/dev/null
sleep 2

# Create config directory
mkdir -p ~/.cloudflared

# Create cloudflared configuration
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 90137fe9-7a2d-4159-a433-d1fdef193f83
credentials-file: /root/.cloudflared/90137fe9-7a2d-4159-a433-d1fdef193f83.json

ingress:
  # Frontend - froh.bessar.work
  - hostname: froh.bessar.work
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
      
  # Backend - api.bessar.work
  - hostname: api.bessar.work
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true
      
  # Health check
  - path: /healthcheck
    service: http://localhost:3000
    
  # Default fallback
  - service: http://localhost:3000
EOF

echo "✅ Configuration created"

# Start cloudflared tunnel
echo "🌐 Starting tunnel..."
nohup cloudflared tunnel run 90137fe9-7a2d-4159-a433-d1fdef193f83 > /var/log/cloudflared.log 2>&1 &

# Wait for tunnel to start
sleep 5

# Check if tunnel is running
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo "✅ Cloudflare Tunnel started successfully!"
    echo ""
    echo "📊 Your services are now available at:"
    echo "   Frontend: https://froh.bessar.work"
    echo "   Backend:  https://api.bessar.work"
    echo ""
    echo "📝 View logs: tail -f /var/log/cloudflared.log"
    echo "⏹️  Stop tunnel: pkill -f cloudflared"
    echo "🔄 Restart: Run this script again"
else
    echo "❌ Failed to start Cloudflare Tunnel"
    echo "Check logs: cat /var/log/cloudflared.log"
    exit 1
fi
