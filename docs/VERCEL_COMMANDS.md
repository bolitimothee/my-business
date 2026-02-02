#!/bin/bash
# 🚀 Commandes essentielles pour Vercel

## Préparation locale

# Installer les dépendances
npm install

# Vérifier la version de Node (doit être 18+)
node --version

# Vérifier la version de npm
npm --version

## Développement

# Lancer le serveur local
npm run dev
# Accessible sur http://localhost:5173

# Prévisualiser la build
npm run build && npm run preview

## Build production

# Compiler pour la production
npm run build
# Génère le dossier dist/

## Git

# Initialiser git (si nécessaire)
git init

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Application prête pour production"

# Renommer la branche en main
git branch -M main

# Ajouter l'origin (remplacer par votre repo)
# git remote add origin https://github.com/votre-username/nom-repo.git

# Pousser le code
# git push -u origin main

## Vérifications importantes

# ✅ Vérifier que la build fonctionne
npm run build

# ✅ Vérifier les variables d'environnement
cat .env.example

# ✅ Vérifier que node_modules n'est pas dans git
git status | grep node_modules  # Ne doit rien retourner

# ✅ Vérifier que .env n'est pas dans git
git status | grep .env  # Ne doit rien retourner

## Sur Vercel

# 1. Créer un compte sur https://vercel.com
# 2. Connecter votre repository GitHub
# 3. Ajouter les variables d'environnement :
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
# 4. Cliquer sur "Deploy"

## Après déploiement

# Vérifier l'URL (sera https://<projet>.vercel.app)
# Tester la connexion
# Tester les fonctionnalités principales
# Vérifier la console du navigateur (F12)

## Logs et débogage

# Voir les logs Vercel :
# 1. Allez à https://vercel.com/dashboard
# 2. Cliquez sur votre projet
# 3. Onglet "Deployments"
# 4. Cliquez sur le déploiement
# 5. Onglet "Logs"

## Mise à jour après déploiement

# Pour mettre à jour l'app :
git add .
git commit -m "Mise à jour"
git push origin main
# Vercel redéploie automatiquement !

## Problèmes courants

# Si la build échoue localement :
rm -rf node_modules
rm package-lock.json
npm install
npm run build

# Si les variables ne sont pas trouvées :
# ✅ Vérifier que les variables sont dans Vercel Settings
# ✅ Vérifier que les noms commencent par VITE_
# ✅ Attendre 1-2 minutes après la modification

# Si l'app fonctionne mais pas de données :
# ✅ Vérifier les variables d'environnement
# ✅ Vérifier les CORS dans Supabase
# ✅ Vérifier les Policies RLS dans Supabase
# ✅ Vérifier la console du navigateur (F12)
