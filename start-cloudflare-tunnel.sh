#!/bin/bash

# Cloudflare Tunnel Startup Script for Frohline OMS (Docker Version)
# Domain: bessar.work
# Tunnel ID: 90137fe9-7a2d-4159-a433-d1fdef193f83

echo "🚀 Starting Cloudflare Tunnel for Frohline OMS (Docker)..."

# Stop existing tunnel if running
docker stop cloudflared-tunnel 2>/dev/null
docker rm cloudflared-tunnel 2>/dev/null

# Start new tunnel container
docker run -d \
  --name cloudflared-tunnel \
  --restart unless-stopped \
  --add-host=host.docker.internal:host-gateway \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run \
  --token eyJhIjoiZWNmYWU2OGJhMWMzNGJiNDM1MjJlY2Q3Y2QwMjAzYjYiLCJ0IjoiOTAxMzdmZTktN2EyZC00MTU5LWE0MzMtZDFmZGVmMTkzZjgzIiwicyI6Ik56SXpZVGxoWmpVdFpURmxNeTAwTXpRM0xUa3dNMll0TVdRd05HVXhNRE13WXpFMCJ9

# Wait for tunnel to start
sleep 5

# Check if tunnel is running
if docker ps | grep -q cloudflared-tunnel; then
    echo "✅ Cloudflare Tunnel started successfully!"
    echo ""
    echo "📊 Your services are now available at:"
    echo "   Frontend: https://froh.bessar.work"
    echo "   Backend:  https://api1.bessar.work"
    echo ""
    echo "📝 View logs: docker logs cloudflared-tunnel --tail 50 -f"
    echo "⏹️  Stop tunnel: docker stop cloudflared-tunnel"
    echo "🔄 Restart: ./start-cloudflare-tunnel.sh"
else
    echo "❌ Failed to start Cloudflare Tunnel"
    echo "Check logs: docker logs cloudflared-tunnel"
    exit 1
fi
