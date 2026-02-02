# Gestion de Commerce

Application web de gestion de stock, ventes et finances pour un commerce, construite avec React, Vite et Supabase.

> **📖 Documentation complète disponible** → Lire [INDEX.md](INDEX.md) ou [docs/README.md](docs/README.md)

## 🚀 Fonctionnalités

- **Dashboard** : Vue d'ensemble des revenus, profits et stocks
- **Gestion des produits** : Ajouter, modifier, supprimer des produits
- **Gestion des ventes** : Enregistrer et suivre les ventes
- **Rapport financier** : Analyse des revenus, marges et bénéfices
- **Export** : Télécharger les rapports en PDF ou envoyer par email/WhatsApp
- **Panel Admin** : Gestion des utilisateurs et de leurs accès

## 📋 Prérequis

- Node.js >= 18
- npm >= 9
- Compte Supabase (gratuit sur https://supabase.com)

## 🛠️ Installation locale

1. Clonez le repository :
   ```bash
   git clone <votre-repo>
   cd management
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env.local` basé sur `.env.example` :
   ```bash
   cp .env.example .env.local
   ```

4. Remplissez les variables d'environnement :
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible sur http://localhost:5173

## 🏗️ Build pour la production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

## 🌐 Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Allez sur https://vercel.com/new
3. Importez votre repository
4. Les paramètres de build sont configurés automatiquement via `vercel.json`
5. Ajoutez vos variables d'environnement dans les paramètres du projet Vercel :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Cliquez sur "Deploy"

## 📁 Structure du projet

```
src/
├── components/
│   ├── admin/
│   │   └── AdminPanel.jsx
│   └── auth/
│       └── AuthPage.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   └── supabaseClient.js
├── styles/
│   ├── CommerceApp.css
│   ├── Dashboard.css
│   └── ...
├── AppWrapper.jsx
├── CommerceApp.jsx
└── main.jsx
```

## 🔐 Sécurité

- Les clés Supabase sont exposées dans le code (mode public) : c'est normal pour une clé anon
- Les Policies Supabase contrôlent l'accès aux données (Row Level Security)
- Configurez les variables d'environnement sur Vercel, jamais dans le code

## 📖 Scripts disponibles

- `npm run dev` : Démarrer le serveur de développement
- `npm run build` : Compiler pour la production
- `npm run preview` : Prévisualiser le build

## 🐛 Support

Pour tout problème, consultez la documentation :
- [Vite](https://vitejs.dev)
- [React](https://react.dev)
- [Supabase](https://supabase.com/docs)
