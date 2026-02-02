# 🚀 GUIDE RAPIDE - Démarrage

## ⚡ Pour Commencer (30 secondes)

### 1️⃣ Lancer le serveur de développement
```bash
npm run dev
```

L'app s'ouvre sur **http://localhost:5173/**

### 2️⃣ Créer un compte
- Cliquez sur "S'inscrire"
- Entrez email et mot de passe
- Confirmez le mot de passe
- Vous êtes prêt !

### 3️⃣ Utiliser l'application
- **Dashboard**: Vue d'ensemble des KPIs
- **Stock**: Gérer les produits
- **Ventes**: Enregistrer les ventes
- **Finances**: Voir les rapports
- **Admin** (si vous êtes admin): Gérer les utilisateurs

---

## 🔧 Commandes Utiles

| Commande | Effet |
|----------|-------|
| `npm run dev` | 🟢 Serveur de dev (HMR) |
| `npm run build` | 📦 Build production |
| `npm run preview` | 👀 Préview du build |

---

## 📂 Fichiers à Modifier

### Ajouter un composant
1. Créer `src/components/monComposant.jsx`
2. L'importer dans le composant parent
3. Vite recharge automatiquement ✨

### Modifier le style
1. Éditer les fichiers CSS dans `src/styles/`
2. HMR recharge instantanément
3. Pas besoin de redémarrer !

### Changer la config
1. Éditer `vite.config.js`, `tailwind.config.js`, etc.
2. Redémarrer le serveur (`npm run dev`)

---

## 🔐 Variables d'Environnement

Le fichier `.env` contient :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

⚠️ **Ne jamais commiter** `.env` (ajouté à `.gitignore`)

Copier `.env.example` pour les nouveaux développeurs.

---

## 🚨 Dépannage Rapide

### L'app ne démarre pas ?
```bash
# Réinstaller les dépendances
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Port 5173 déjà utilisé ?
```bash
npm run dev -- --port 3000
```

### CSS ne se charge pas ?
- Vérifier l'import CSS au bon endroit
- Redémarrer le serveur
- Vider le cache du navigateur (F12 → Application → Clear)

### Erreurs de compilation ?
```bash
npm run build
```
Affiche les erreurs réelles

---

## 📚 Documentation Complète

- `CONVERSION_COMPLETE.md` - Détails de la conversion TSX→JSX
- `VERIFICATION_COMPLETE.md` - Checklist complète
- `DOCUMENTATION.md` - Documentation détaillée
- `README.md` - Vue d'ensemble du projet

---

## 🎯 Prochaines Étapes

- [ ] Personnaliser les couleurs dans `src/styles.css`
- [ ] Ajouter plus de validations
- [ ] Connecter à votre base Supabase
- [ ] Ajouter des tests (Vitest)
- [ ] Configurer ESLint/Prettier
- [ ] Déployer sur Vercel/Netlify

---

**Bon code ! 🎉**
