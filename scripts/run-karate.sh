#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_DELAY=2

echo "Vérification de l'API sur ${API_URL}/health ..."

for i in $(seq 1 "$MAX_RETRIES"); do
  if curl -sf "${API_URL}/health" > /dev/null; then
    echo "API disponible."
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "Erreur : l'API n'est pas accessible sur ${API_URL}"
    echo "Démarrez l'API avec : npm run dev"
    exit 1
  fi
  echo "Tentative ${i}/${MAX_RETRIES} — attente ${RETRY_DELAY}s ..."
  sleep "$RETRY_DELAY"
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/../karate-tests"

mvn test "$@"

echo ""
echo "Rapport HTML : karate-tests/target/karate-reports/karate-summary.html"
