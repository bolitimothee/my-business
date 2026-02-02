# 🚀 Guide de Déploiement sur Vercel

## Prérequis

- Un compte Vercel (gratuit sur https://vercel.com)
- Un repository GitHub avec le code de l'application
- Un compte Supabase avec les clés API

## Étapes de déploiement

### 1. Préparer le repository GitHub

```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Préparation pour déploiement Vercel"
git push origin main
```

### 2. Connecter Vercel à GitHub

1. Allez sur https://vercel.com/new
2. Cliquez sur "Import Git Repository"
3. Sélectionnez votre repository GitHub
4. Cliquez sur "Import"

### 3. Configurer les variables d'environnement

1. Dans les paramètres du projet Vercel, allez à "Environment Variables"
2. Ajoutez les variables suivantes :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | Votre URL Supabase (ex: `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Votre clé anonyme Supabase |

**Comment obtenir vos clés Supabase :**
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez à "Project Settings" → "API"
4. Copiez `Project URL` et `anon public key`

### 4. Configuration du build

Les paramètres de build sont **configurés automatiquement** via le fichier `vercel.json` :
- **Build Command** : `npm run build`
- **Output Directory** : `dist`

### 5. Déployer

Une fois les variables d'environnement configurées :
1. Cliquez sur "Deploy"
2. Vercel commence la compilation et le déploiement
3. Attendez la fin du processus (généralement 2-5 minutes)
4. Votre app est live ! 🎉

## Après le déploiement

### Accédez à votre app

- URL principale : `https://<votre-project>.vercel.app`
- Domaine personnalisé : Configurez dans les paramètres Vercel

### Mise à jour automatique

Chaque `git push` sur votre branche principale déploiera automatiquement la nouvelle version.

### Logs et débogage

1. Allez sur le dashboard Vercel
2. Sélectionnez votre projet
3. Cliquez sur "Deployments"
4. Cliquez sur un déploiement pour voir les logs

## Checklist avant déploiement

- ✅ Tous les fichiers sont commités sur Git
- ✅ `.env.local` n'est PAS commité (vérifié dans `.gitignore`)
- ✅ Variables d'environnement configurées dans Vercel
- ✅ Supabase accepte les requêtes depuis votre domaine Vercel
- ✅ Build local réussit : `npm run build`
- ✅ Pas d'erreurs dans la console du navigateur

## Troubleshooting

### "Build failed"
- Vérifiez les logs dans Vercel
- Assurez-vous que `npm run build` fonctionne localement
- Vérifiez les variables d'environnement

### App fonctionne mais pas de données
- Vérifiez les variables d'environnement (typo ?)
- Vérifiez les Policies RLS dans Supabase
- Vérifiez les CORS dans Supabase (Settings → API)

### "Cannot find module"
- Vérifiez tous les imports dans le code
- Vérifiez que `package.json` a toutes les dépendances

## Support

Pour plus d'aide :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vite](https://vitejs.dev)
