#!/bin/bash
# Next.js Health Check Script
# Location: /Users/alex/Desktop/claudecodefy/peluquerias-app/scripts/health-check.sh

URL="http://localhost:3000"
TIMEOUT=5

echo "[$(date)] Performing Next.js health check..."

# Test HTTP connectivity
if curl -s --connect-timeout $TIMEOUT "$URL" > /dev/null; then
    echo "✅ HTTP connectivity: HEALTHY"
else
    echo "❌ HTTP connectivity: FAILED"
    exit 1
fi

# Check process status
if pgrep -f "next.*dev" > /dev/null; then
    echo "✅ Next.js process: RUNNING"
else
    echo "❌ Next.js process: NOT FOUND"
    exit 1
fi

# Check port binding
if lsof -i :3000 > /dev/null; then
    echo "✅ Port 3000: BOUND"
else
    echo "❌ Port 3000: NOT BOUND"
    exit 1
fi

echo "✅ All checks passed - Server is healthy"