#!/bin/bash

# Cloudflare Tunnel Startup Script for Frohline OMS
# Domain: bessar.work

echo "🚀 Starting Cloudflare Tunnel for Frohline OMS..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed. Please install it first."
    exit 1
fi

# Check if credentials exist
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ Cloudflare credentials not found!"
    echo "Please run: cloudflared tunnel login"
    exit 1
fi

# Get tunnel ID from existing credentials
TUNNEL_ID=$(ls ~/.cloudflared/*.json 2>/dev/null | head -1 | xargs -I {} basename {} .json)

if [ -z "$TUNNEL_ID" ]; then
    echo "❌ No tunnel credentials found!"
    echo "Please run: cloudflared tunnel login"
    exit 1
fi

echo "✅ Found tunnel ID: $TUNNEL_ID"

# Stop any existing cloudflared processes
pkill -f cloudflared 2>/dev/null
sleep 2

# Create config directory
mkdir -p ~/.cloudflared

# Create cloudflared configuration
cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /home/bashar/.cloudflared/${TUNNEL_ID}.json

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
nohup cloudflared tunnel run $TUNNEL_ID > ~/cloudflared.log 2>&1 &

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
    echo "📝 View logs: tail -f ~/cloudflared.log"
    echo "⏹️  Stop tunnel: pkill -f cloudflared"
    echo "🔄 Restart: Run this script again"
else
    echo "❌ Failed to start Cloudflare Tunnel"
    echo "Check logs: cat ~/cloudflared.log"
    exit 1
fi
