# 📦 Configuration Vercel

Ce fichier explique comment l'application est configurée pour Vercel.

## Fichiers clés

### `vercel.json`
Configuration spécifique à Vercel :
- **buildCommand** : `npm run build` - Commande pour compiler l'app
- **devCommand** : `npm run dev` - Commande pour le développement local
- **outputDirectory** : `dist` - Dossier contenant les fichiers compilés
- **env** : Liste les variables d'environnement requises

### `package.json`
Contient tous les scripts et dépendances :
- **scripts.build** : `vite build` - Compile pour la production
- **scripts.dev** : `vite` - Lance le serveur de développement
- **dependencies** : Les packages nécessaires (React, Supabase, etc.)
- **devDependencies** : Les outils de build (Vite, TypeScript, etc.)

### `.env.example`
Template pour les variables d'environnement :
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Flux de déploiement

```
GitHub (git push)
    ↓
Vercel (détecte le push)
    ↓
npm install (installe les dépendances)
    ↓
npm run build (compile l'app)
    ↓
dist/ (fichiers statiques générés)
    ↓
Vercel distribue sur CDN global
    ↓
https://votre-app.vercel.app
```

## Variables d'environnement

Sur Vercel, configurez dans "Project Settings" → "Environment Variables" :

| Variable | Source |
|----------|--------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |

**Important** : Les variables `VITE_*` sont publiques et compilées dans le bundle !

## Fichiers générés au build

```
dist/
├── index.html          # HTML principal
├── assets/
│   ├── index-xxx.js    # JavaScript compilé
│   └── index-xxx.css   # CSS compilé
└── (autres fichiers statiques)
```

Seul le dossier `dist/` est déployé sur Vercel.

## Optimisations automatiques de Vercel

- **Edge caching** : Les fichiers statiques sont mis en cache globalement
- **Compression** : Gzip automatique des assets
- **Code splitting** : Les modules Vite sont optimisés
- **Image optimization** : (pas applicable ici)

## Domaines personnalisés

Pour utiliser votre propre domaine :
1. Allez à "Project Settings" → "Domains"
2. Ajoutez votre domaine
3. Suivez les instructions pour configurer DNS
4. SSL/HTTPS automatique via Let's Encrypt

## Redéploiement

Le redéploiement est **automatique** avec chaque `git push` :
```bash
git add .
git commit -m "Mise à jour"
git push origin main
```

Vercel détecte automatiquement et redéploie en 1-2 minutes.

## Prévisualisations de branche

Créez une branche, poussez-la, et Vercel créé automatiquement une URL de preview :
```
https://votre-app-<branchname>.vercel.app
```

Idéal pour les tests avant merge sur `main`.

## Logs et débogage

Consultez les logs dans le dashboard Vercel :
1. Allez à "Deployments"
2. Cliquez sur un déploiement
3. Onglet "Logs" pour les logs de build
4. Console du navigateur pour les erreurs runtime

## Performance

Vérifiez les performances :
- Vercel Analytics (optionnel)
- Chrome DevTools
- Lighthouse : `npm install -g lighthouse && lighthouse https://votre-app.vercel.app`

## Support et ressources

- [Vercel Docs - Build and Development](https://vercel.com/docs/concepts/deployments/build-step)
- [Vite - Static Deploy](https://vitejs.dev/guide/static-deploy.html)
- [React on Vercel](https://vercel.com/solutions/react)

---

**Configuration vérifiée le** : 2 février 2026
**Statut** : ✅ Prêt pour Vercel
