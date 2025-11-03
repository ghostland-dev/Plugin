#!/bin/bash

# Script de test pour vérifier le déploiement Vercel
# Utilisez ce script après avoir déployé sur Vercel

echo "🧪 Test du déploiement Vercel"
echo "================================"

# Vérifier si une URL est fournie
if [ -z "$1" ]; then
  echo "❌ Usage: ./vercel-test.sh https://votre-projet.vercel.app"
  exit 1
fi

VERCEL_URL=$1

echo ""
echo "📍 URL testée: $VERCEL_URL"
echo ""

# Fonction pour tester une route
test_route() {
  local method=$1
  local route=$2
  local expected_status=${3:-200}
  
  echo "🧪 Test: $method $route"
  
  if [ "$method" == "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL$route")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$VERCEL_URL$route")
  fi
  
  if [ "$status" == "$expected_status" ]; then
    echo "  ✅ OK ($status)"
  else
    echo "  ❌ ÉCHEC (attendu: $expected_status, obtenu: $status)"
  fi
  echo ""
}

# Tests
echo "1️⃣ Test du frontend (page d'accueil)"
test_route "GET" "/" 200

echo "2️⃣ Test de l'API Health Check"
test_route "GET" "/api/health" 200

echo "3️⃣ Test du sitemap"
test_route "GET" "/sitemap.xml" 200

echo "4️⃣ Test du robots.txt"
test_route "GET" "/robots.txt" 200

echo "5️⃣ Test de l'API Payment (devrait retourner 400 sans données)"
test_route "POST" "/api/payment/create-session" 400

echo "6️⃣ Test de l'API Admin Stats"
test_route "GET" "/api/admin/stats" 200

echo ""
echo "✅ Tests terminés!"
echo ""
echo "💡 Pour tester avec des données réelles, utilisez l'interface web:"
echo "   $VERCEL_URL"

