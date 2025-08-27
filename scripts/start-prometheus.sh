#!/bin/bash

# Start Prometheus and Grafana
echo "Starting Prometheus and Grafana..."
docker-compose -f docker-compose.prometheus.yml up -d

echo "Services started!"
echo "Prometheus will be available at: http://localhost:9090"
echo "Grafana will be available at: http://localhost:3000"
echo "Grafana default credentials: admin/admin"
echo ""
echo "Your NestJS app metrics endpoint: http://localhost:5500/api/metrics"
echo ""
echo "To stop services, run: ./scripts/stop-prometheus.sh"
