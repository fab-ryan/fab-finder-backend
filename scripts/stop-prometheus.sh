#!/bin/bash

# Stop Prometheus and Grafana
echo "Stopping Prometheus and Grafana..."
docker-compose -f docker-compose.prometheus.yml down

echo "Services stopped!"
