# 🗂️ INDEX DU PROJET

Bienvenue dans **Gestion de Commerce** ! Voici un guide pour naviguer dans le projet.

## 🎯 Commencer par ici

1. **Je découvre le projet** → Lire [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. **Je veux le lancer localement** → Lire [docs/MISE_EN_PLACE.md](docs/MISE_EN_PLACE.md)
3. **Je veux déployer sur Vercel** → Lire [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)
4. **Je veux connaître l'architecture** → Lire [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)

## 📁 Dossiers principaux

### 📚 [`docs/`](docs/) - DOCUMENTATION
Toute la documentation du projet est ici:
- **VERCEL_DEPLOYMENT.md** - Guide complet Vercel
- **MISE_EN_PLACE.md** - Installation & configuration
- **DOCUMENTATION.md** - Documentation technique
- **DEPLOYMENT_CHECKLIST.md** - Checklist avant déploiement
- Plus...

👉 **Aller au [docs/README.md](docs/README.md)**

### 🔧 [`scripts/`](scripts/) - SCRIPTS UTILITAIRES
Scripts pour faciliter le travail:
- **verify-vercel.sh** - Vérifie la préparation Vercel
- Plus à venir...

👉 **Aller au [scripts/README.md](scripts/README.md)**

### 💻 [`src/`](src/) - CODE SOURCE
Code React/JSX de l'application:
- **CommerceApp.jsx** - Application principale
- **contexts/AuthContext.jsx** - Authentification
- **components/admin/AdminPanel.jsx** - Panel admin
- **components/auth/AuthPage.jsx** - Page connexion
- **styles/** - Tous les fichiers CSS

### 🎨 [`components/`](components/) - ANCIENS COMPOSANTS (Archive)
Anciens fichiers `.tsx` - peuvent être supprimés

### 📝 [`types/`](types/) - ANCIENS TYPES (Archive)
Types TypeScript anciens - pas utilisés

### 🛠️ [`utils/`](utils/) - UTILITAIRES (Archive)
Anciens utilitaires - archivés

## 📊 Vue d'ensemble rapide

```
Fichiers IMPORTANTS à la racine:
├── README.md              ← Page d'accueil
├── PROJECT_STRUCTURE.md   ← Vue d'ensemble du projet
├── INDEX.md               ← CE FICHIER
├── package.json           ← Dépendances
├── vite.config.js         ← Configuration Vite
├── vercel.json            ← Configuration Vercel
└── .env.example           ← Template variables
```

## ⚡ Commandes essentielles

```bash
# Développement
npm install              # Installer les dépendances
npm run dev              # Lancer le serveur local (http://localhost:5173)

# Production
npm run build            # Compiler pour la production
npm run preview          # Prévisualiser la build

# Vérification
bash scripts/verify-vercel.sh   # Vérifier la préparation Vercel
```

## 🚀 Flux de travail typique

### Pour développer localement:
```bash
npm install
npm run dev
# Ouvrir http://localhost:5173
# Modifier les fichiers dans src/
# Les changements s'appliquent en temps réel (HMR)
```

### Pour déployer sur Vercel:
```bash
# Suivre docs/VERCEL_DEPLOYMENT.md
# Résumé:
git push origin main  # Vercel détecte et déploie automatiquement
```

## 📈 Progression du projet

| Étape | Statut | Lien |
|-------|--------|------|
| ✅ Conversion TSX → JSX | Complété | [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) |
| ✅ Configuration Vite | Complété | [vite.config.js](vite.config.js) |
| ✅ Configuration Vercel | Complété | [vercel.json](vercel.json) |
| ✅ Documentation | Complété | [docs/](docs/) |
| ✅ Organisation projet | Complété | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| 🎯 Déploiement Vercel | En attente | [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) |

## 🎓 Apprendre plus

- **Vite** : https://vitejs.dev
- **React** : https://react.dev
- **Supabase** : https://supabase.com/docs
- **Vercel** : https://vercel.com/docs

## ❓ Questions fréquentes

### "Où trouver la documentation ?"
→ Dans le dossier [docs/](docs/) ou utiliser [docs/README.md](docs/README.md)

### "Comment déployer sur Vercel ?"
→ Lire [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)

### "Où est le code source ?"
→ Dans le dossier [src/](src/)

### "Comment ajouter une dépendance ?"
→ `npm install nom-package` et voir [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)

### "Comment ça marche l'authentification ?"
→ Consulter [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)

## 📞 Support

En cas de problème:
1. Consulter la documentation pertinente dans [docs/](docs/)
2. Vérifier les logs: `npm run dev` pour dev, ou Vercel Dashboard pour prod
3. Vérifier la console du navigateur (F12)

## 🎉 Prochaines étapes

1. [ ] Lire [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. [ ] Lancer `npm install`
3. [ ] Lancer `npm run dev`
4. [ ] Tester l'application localement
5. [ ] Lire [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)
6. [ ] Déployer sur Vercel

---

**Projet** : Gestion de Commerce
**Version** : 1.0.0
**Statut** : ✅ Prêt pour production
**Dernière mise à jour** : 2 février 2026
