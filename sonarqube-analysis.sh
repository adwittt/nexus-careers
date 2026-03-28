#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Nexus Careers — SonarQube Analysis Script
# ─────────────────────────────────────────────────────────────────────────────

set -e

SERVICES=("auth-service" "job-service" "application-service" "admin-service" "api-gateway" "config-server")

echo "╔═════════════════════════════════════════════════════╗"
echo "║       Nexus Careers — SonarQube Analysis            ║"
echo "╚═════════════════════════════════════════════════════╝"

# Check if SonarQube is running
if ! docker ps --format '{{.Names}}' | grep -q 'nexus-sonarqube'; then
  echo "❌ SonarQube is not running! Starting it..."
  docker compose up sonarqube -d
  echo "⏳ Waiting for SonarQube to be ready..."
  # Simple wait: usually takes longer, but we can try
  sleep 10
fi

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "▶  Analyzing service: $SERVICE..."
  cd $SERVICE
  
  # Run tests first to generate JaCoCo coverage reports
  echo "  Running tests..."
  mvn clean test -DskipTests=false
  
  # Trigger SonarQube analysis
  echo "  Triggering SonyQube analysis..."
  mvn sonar:sonar \
    -Dsonar.host.url=http://localhost:9000 \
    -Dsonar.projectKey=$SERVICE \
    -Dsonar.login=admin \
    -Dsonar.password=admin \
    -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
    
  cd ..
done

echo ""
echo "✅ Analysis complete for all services."
echo "🔗 View results: http://localhost:9000"
