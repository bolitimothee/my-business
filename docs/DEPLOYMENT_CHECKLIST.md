# ✅ Checklist Déploiement Vercel

## Avant le déploiement

### Préparation du code
- [ ] Code local fonctionne : `npm run dev` sans erreurs
- [ ] Build locale réussit : `npm run build` sans erreurs
- [ ] Aucun `console.error()` ou `console.warn()` en production
- [ ] Pas de chemins absolus dans le code (tous relatifs)

### Configuration
- [ ] `package.json` a les bonnes dépendances
- [ ] `package.json` a les scripts `build` et `dev`
- [ ] `vercel.json` existe et est configuré
- [ ] `.env.example` liste toutes les variables nécessaires
- [ ] `.gitignore` exclut `node_modules/`, `.env`, `.env.local`

### Sécurité
- [ ] Pas de fichier `.env` ou `.env.local` commité
- [ ] Pas de clés API ou secrets dans le code
- [ ] `.env.example` ne contient que les noms, pas les valeurs

### Repository Git
- [ ] Tous les fichiers sont commités
- [ ] Repository est public sur GitHub
- [ ] Branche principale est `main` (ou `master`)

## Configuration sur Vercel

### 1. Connecter le repository
- [ ] Compte Vercel créé
- [ ] Repository GitHub autorisé
- [ ] Project importé dans Vercel

### 2. Variables d'environnement
- [ ] `VITE_SUPABASE_URL` configurée
- [ ] `VITE_SUPABASE_ANON_KEY` configurée
- [ ] Valeurs copiées correctement (sans espaces)

### 3. Paramètres de build
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `dist`
- [ ] Installation command : `npm ci` (automatique)

## Configuration Supabase

### Autoriser le domaine Vercel
- [ ] URL du domaine Vercel notée
- [ ] CORS configuré dans Supabase
- [ ] Policies RLS configurées correctement

### Test de connexion
- [ ] API URL accessible depuis Vercel
- [ ] Clé anonyme valide
- [ ] Authentification fonctionne

## Après le déploiement

### Tests
- [ ] L'app se charge sans erreurs
- [ ] La page de connexion s'affiche
- [ ] Connexion fonctionne
- [ ] Données se chargent correctement
- [ ] Export PDF/Email/WhatsApp fonctionne

### Monitoring
- [ ] Logs Vercel consultables
- [ ] Pas d'erreurs JavaScript dans la console
- [ ] Performance acceptable (< 3s de chargement)

### Domaine
- [ ] Domaine Vercel accessible
- [ ] SSL/HTTPS fonctionnel
- [ ] Redirection HTTP → HTTPS correcte

## Troubleshooting

Si déploiement échoue :
1. [ ] Vérifier les logs Vercel (Deployments → [déploiement] → Logs)
2. [ ] Tester `npm run build` localement
3. [ ] Vérifier les variables d'environnement
4. [ ] Vérifier les permissions GitHub

Si l'app fonctionne mais pas de données :
1. [ ] Vérifier les variables d'environnement dans Vercel
2. [ ] Vérifier les CORS Supabase
3. [ ] Vérifier les Policies RLS
4. [ ] Vérifier la console du navigateur pour les erreurs

## Documentation utile

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Guide détaillé

---

**Statut** : [ ] Prêt pour déploiement
**Date de déploiement** : _______________
**URL en production** : _______________
