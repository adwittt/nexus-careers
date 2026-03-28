#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Nexus Careers — Startup Script
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "╔══════════════════════════════════════════╗"
echo "║       Nexus Careers — Docker Start       ║"
echo "╚══════════════════════════════════════════╝"

# Copy .env.example to .env if not present
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠  Created .env from .env.example (update OAuth2 keys if needed)"
fi

echo ""
echo "▶  Building and starting all services..."
docker compose up --build -d

echo ""
echo "⏳  Waiting for services to become healthy..."
echo "    (This may take 2-3 minutes on first run while Maven downloads dependencies)"
echo ""
echo "📋  Service URLs once healthy:"
echo "    Frontend       → http://localhost:3000"
echo "    API Gateway    → http://localhost:8085"
echo "    Eureka         → http://localhost:8761"
echo "    RabbitMQ UI    → http://localhost:15672  (guest/guest)"
echo "    Grafana        → http://localhost:3001   (admin/admin)"
echo "    Zipkin         → http://localhost:9411"
echo "    SonarQube      → http://localhost:9000"
echo ""
echo "▶  To view logs:   docker compose logs -f"
echo "▶  To stop:        docker compose down"
echo "▶  To stop + wipe: docker compose down -v"
