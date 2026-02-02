# 📋 Fichiers à la racine - Explication

## 📍 Ce qu'il faut savoir

Les fichiers à la racine du projet sont organisés logiquement. Voici ce que chacun fait:

## 📄 Fichiers principaux

### README.md ⭐
- **Ce qu'il contient** : Présentation générale du projet
- **Quand l'utiliser** : Première chose à lire en arrivant sur GitHub
- **À modifier** : Si vous changez les fonctionnalités principales

### INDEX.md ⭐
- **Ce qu'il contient** : Index et guide de navigation du projet
- **Quand l'utiliser** : Pour naviguer rapidement vers ce que vous cherchez
- **À modifier** : Si vous ajoutez de nouveaux fichiers de documentation

### PROJECT_STRUCTURE.md
- **Ce qu'il contient** : Vue d'ensemble complète de la structure
- **Quand l'utiliser** : Pour comprendre l'organisation des dossiers
- **Utile pour** : Les nouveaux développeurs

## ⚙️ Configuration

### package.json
- **Contient** : Dépendances npm et scripts
- **Scripts** : `npm run dev`, `npm run build`
- **À modifier** : Quand vous ajoutez des dépendances

### vite.config.js
- **Contient** : Configuration du bundler Vite
- **Paramètres** : Port 5173, React plugin
- **À modifier** : Rarement (sauf pour optimisations)

### vercel.json
- **Contient** : Configuration pour Vercel
- **Paramètres** : Build command, output directory
- **À modifier** : Si vous changez les variables d'env

### tsconfig.json
- **Contient** : Configuration TypeScript/JSX
- **Paramètres** : `allowJs: true`, `strict: false`, `jsx: react-jsx`
- **À modifier** : Rarement

## 🔐 Variables d'environnement

### .env.example
- **Ce qu'il contient** : Template des variables d'environnement
- **À faire** : Copier en `.env.local` et remplir vos valeurs
- **À ne PAS commiter** : Les vraies valeurs

### .env.production
- **Ce qu'il contient** : Documentation pour la production
- **À faire** : Configurer ces variables sur Vercel
- **À ne PAS commiter** : Les vraies valeurs

### .env (local)
- **Ce qu'il contient** : Vos clés personnelles
- **À faire** : Créer basé sur `.env.example`
- **À NE JAMAIS commiter** : Protégé par .gitignore

## 🌐 Web

### index.html
- **Ce qu'il contient** : Template HTML principal
- **Point d'entrée** : Charge main.jsx
- **À modifier** : Rarement (titre, favicon, meta)

## 📚 Documentation

### docs/ (dossier)
- **Contient** : Toute la documentation
  - Guides de déploiement
  - Documentation technique
  - Instructions de configuration
- **À consulter** : Pour comprendre le projet en détail

### scripts/ (dossier)
- **Contient** : Scripts utilitaires
  - `verify-vercel.sh` : Vérifier la préparation
- **À utiliser** : Pour automatiser les tâches

## 📂 Autres dossiers importants

### src/
- **Contient** : Code source React/JSX
- **Principal** : CommerceApp.jsx (cœur de l'app)
- **À modifier** : Quotidiennement pendant le développement

### components/, types/, utils/
- **Ancien code** : Fichiers `.tsx` archivés
- **Peuvent être supprimés** : Pas utilisés en production

## 🔒 Fichiers spéciaux

### .gitignore
- **Contient** : Fichiers à ignorer dans Git
- **Protège** : node_modules/, .env, dist/
- **À modifier** : Rarement

## 📊 Résumé des fichiers à la racine

```
✅ IMPORTANT (à garder):
├── README.md                 ← Page d'accueil
├── INDEX.md                  ← Navigation
├── PROJECT_STRUCTURE.md      ← Vue d'ensemble
├── package.json              ← Dépendances
├── vite.config.js            ← Config build
├── vercel.json               ← Config Vercel
├── .env.example              ← Template variables
└── index.html                ← Template web

📚 DOCUMENTATION (dans docs/):
docs/
├── VERCEL_DEPLOYMENT.md
├── MISE_EN_PLACE.md
├── DOCUMENTATION.md
└── ... (autres fichiers de doc)

🔧 SCRIPTS (dans scripts/):
scripts/
├── verify-vercel.sh
└── README.md

💻 CODE (dans src/):
src/
├── CommerceApp.jsx
├── contexts/
├── components/
└── styles/

🗑️ ARCHIVE (à garder mais pas utiliser):
├── SUPABASE_SCHEMA.sql
├── components/
├── types/
└── utils/
```

## ✅ Checklist maintenance

- [ ] README.md à jour avec les bonnes infos
- [ ] .env.example contient les bonnes variables
- [ ] docs/ à jour avec la dernière documentation
- [ ] package.json a les bonnes versions
- [ ] vercel.json configuré correctement

## 💡 Conseils

1. **Ne modifiez PAS** : vercel.json, tsconfig.json (sauf si besoin)
2. **Modifiez souvent** : Fichiers dans src/
3. **Consultez souvent** : INDEX.md, docs/README.md
4. **Ne committez JAMAIS** : .env, .env.local, node_modules

## 🎯 Après un git clone

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local basé sur .env.example
cp .env.example .env.local

# 3. Remplir .env.local avec vos valeurs
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 4. Lancer l'app
npm run dev
```

---

**Dernière mise à jour** : 2 février 2026
