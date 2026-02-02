# 🔧 Scripts

Scripts utilitaires pour le projet.

## 📋 Scripts disponibles

### verify-vercel.sh
Vérifie que l'application est prête pour Vercel.

**Utilisation :**
```bash
bash scripts/verify-vercel.sh
```

**Vérifie :**
- ✅ package.json a le script build
- ✅ vercel.json existe
- ✅ .env.example est configuré
- ✅ .gitignore est correct
- ✅ La build locale fonctionne

**Résultat :**
- Affiche "✅ Tous les contrôles sont passés !" si ok
- Affiche des erreurs et quitte sinon

## 🛠️ Comment ajouter un script

1. Créer un fichier `.sh` ou `.js` dans ce dossier
2. Documenter son usage dans ce README
3. Donner des permissions d'exécution (si bash) : `chmod +x scripts/nom-script.sh`

## 📚 Scripts futurs envisagés

- `sync-env.sh` - Synchroniser les variables d'environnement
- `backup.sh` - Sauvegarder la base de données
- `setup.sh` - Setup initial du projet
- `clean.sh` - Nettoyer les fichiers temporaires

---

**Dernière mise à jour** : 2 février 2026
