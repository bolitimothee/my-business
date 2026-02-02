#!/bin/bash
# Script de vérification avant déploiement Vercel

echo "🔍 Vérification de la configuration Vercel..."
echo ""

# Vérifier package.json
echo "✓ Vérification de package.json..."
if ! grep -q '"build": "vite build"' package.json; then
  echo "❌ ERROR: package.json n'a pas le script 'build'"
  exit 1
fi
echo "  ✓ Script build trouvé"

# Vérifier vercel.json
echo ""
echo "✓ Vérification de vercel.json..."
if [ ! -f "vercel.json" ]; then
  echo "❌ ERROR: vercel.json manquant"
  exit 1
fi
echo "  ✓ vercel.json présent"

# Vérifier .env.example
echo ""
echo "✓ Vérification de .env.example..."
if [ ! -f ".env.example" ]; then
  echo "❌ ERROR: .env.example manquant"
  exit 1
fi
if ! grep -q "VITE_SUPABASE_URL" .env.example; then
  echo "❌ ERROR: .env.example ne contient pas VITE_SUPABASE_URL"
  exit 1
fi
echo "  ✓ .env.example correct"

# Vérifier node_modules n'est pas commité
echo ""
echo "✓ Vérification de .gitignore..."
if ! grep -q "node_modules/" .gitignore; then
  echo "❌ ERROR: node_modules/ manquant dans .gitignore"
  exit 1
fi
echo "  ✓ .gitignore correct"

# Vérifier la build
echo ""
echo "✓ Test de la build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Build réussie"
else
  echo "❌ ERROR: La build a échoué"
  exit 1
fi

echo ""
echo "✅ Tous les contrôles sont passés !"
echo ""
echo "Prochaines étapes :"
echo "1. Configurez les variables d'environnement dans Vercel"
echo "2. Poussez votre code : git push origin main"
echo "3. Vercel déploiera automatiquement"
